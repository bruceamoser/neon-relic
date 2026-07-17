// Neon Relic — Interactive Agent Dossier
// Application logic, session persistence, dice roller, inline sheet editing.
const NR = (function() {
  'use strict';

  // ─── STATE ──────────────────────────────────────────────
  const DEFAULT_STATE = {
    name: '', division: '', subUnit: '', subUnitKey: '', specialty: '',
    ageGroup: '', age: '', origin: '', anchor: '', bio: '',
    attributes: { strength: 2, agility: 2, wits: 2, empathy: 2 },
    attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
    skills: {},
    corruption: 0, armorRating: 0,
    talent1: null, talent2: null, talent3: null,
    extraTalents: [],
    divisionItem: '', gear: [], resourceDice: {},
    criticalInjuries: [],
    cl: 1, standing: 0, xp: { current: 0, total: 0, spent: 0 },
    creationComplete: false
  };

  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  let lastRoll = null;

  // ─── INIT ───────────────────────────────────────────────
  function init() {
    loadState();
    buildAttrSkillGrid();
    buildCorruptionTrack();
    buildGearTable();
    buildResourceDice();
    buildExtraTalents();
    buildCriticalInjuries();
    buildEquipmentRef();
    buildTalentsRef();
    buildRulesRef();
    renderSheet();
    setupTabNav();
    setupAutoSave();
    setupModalClose();
  }

  // ─── SESSION STORAGE ────────────────────────────────────
  function saveState() {
    try {
      sessionStorage.setItem('nr-character', JSON.stringify(state));
      const indicator = document.getElementById('save-indicator');
      if (indicator) indicator.textContent = '● Auto-saved';
    } catch(e) {
      showToast('Could not save to session storage', 'warn');
    }
  }

  function loadState() {
    try {
      const saved = sessionStorage.getItem('nr-character');
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
        if (parsed.attributes) state.attributes = Object.assign({}, DEFAULT_STATE.attributes, parsed.attributes);
        if (parsed.attributeDamage) state.attributeDamage = Object.assign({}, DEFAULT_STATE.attributeDamage, parsed.attributeDamage);
        if (parsed.skills) state.skills = Object.assign({}, parsed.skills);
        if (parsed.resourceDice) state.resourceDice = Object.assign({}, parsed.resourceDice);
        if (parsed.extraTalents) state.extraTalents = parsed.extraTalents.slice();
        if (parsed.criticalInjuries) state.criticalInjuries = parsed.criticalInjuries.slice();
        if (!state.gear) state.gear = [];
        // Migrate old scalar xp to three-value object
        if (typeof state.xp === 'number') {
          state.xp = { current: state.xp, total: state.xp, spent: 0 };
        }
        detectResourceDice();
      }
    } catch(e) { /* ignore */ }
  }

  function setupAutoSave() {
    document.addEventListener('input', function(e) {
      if (e.target.contentEditable === 'true' || e.target.getAttribute('contenteditable') === 'true') {
        const field = e.target.getAttribute('data-field');
        if (field) {
          state[field] = e.target.textContent.trim();
          if (field === 'age') detectAgeGroup();
          saveState();
          const indicator = document.getElementById('save-indicator');
          if (indicator) indicator.textContent = '● Saving...';
        }
      }
    });
    document.addEventListener('blur', function(e) {
      if (e.target.contentEditable === 'true' || e.target.getAttribute('contenteditable') === 'true') {
        const field = e.target.getAttribute('data-field');
        if (field) {
          state[field] = e.target.textContent.trim();
          if (field === 'age') detectAgeGroup();
          saveState();
        }
      }
    }, true);
  }

  // ─── TOAST ──────────────────────────────────────────────
  function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show' + (type === 'warn' ? ' warn' : '');
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => { t.className = 'toast'; }, 2500);
  }

  // ─── MODAL ──────────────────────────────────────────────
  function openModal(html) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = html;
    overlay.classList.add('open');
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function setupModalClose() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
      });
    }
  }

  // ─── DIVISION PICKER ────────────────────────────────────
  function pickDivision() {
    let html = '<h3>Select Division</h3>';
    html += '<div class="option-cards cols-3" style="margin-top:12px;">';
    Object.entries(NR_DATA.divisions).forEach(([key, div]) => {
      html += `
        <div class="option-card" onclick="NR.selectDivision('${key}')">
          <div class="card-title">${div.name}</div>
          <div class="card-motto">"${div.motto}"</div>
          <div class="card-desc">${div.role}</div>
          <div class="card-stats">Primary: ${div.primaryAttribute.toUpperCase()} &bull; Key Skill: ${NR_DATA.skills.find(s=>s.key===div.keySkill).name} &bull; Base CL: ${div.baseCL}</div>
          <div style="font-size:6pt; color:var(--ink-faded); margin-top:4px;"><strong>Item:</strong> ${div.divisionItem.name} — ${div.divisionItem.description.substring(0,100)}…</div>
        </div>`;
    });
    html += '</div>';
    openModal(html);
  }

  function selectDivision(key) {
    const div = NR_DATA.divisions[key];
    state.division = div.name;
    state.subUnit = '';
    state.subUnitKey = '';
    state.specialty = '';
    state.cl = div.baseCL;
    state.talent1 = null; state.talent2 = null;
    state.armorRating = key === 'keep' ? 1 : 0;
    applyDivisionGear();
    saveState();
    renderSheet();
    closeModal();
    showToast('Division: ' + div.name);
  }

  // ─── SUB-UNIT PICKER ────────────────────────────────────
  function pickSubUnit() {
    const divKey = getDivKey(state.division);
    if (!divKey) { showToast('Choose a Division first', 'warn'); return; }
    const div = NR_DATA.divisions[divKey];
    const subLabel = div.subUnits.label;
    let html = `<h3>Select ${subLabel}</h3>`;
    html += `<p style="font-size:7pt; color:var(--ink-faded); margin-bottom:8px;">Division: <strong>${div.name}</strong></p>`;
    html += '<div class="option-cards cols-2">';
    Object.entries(div.subUnits.options).forEach(([key, opt]) => {
      html += `
        <div class="option-card" onclick="NR.selectSubUnit('${key}')">
          <div class="card-title">${opt.name}</div>
          <div class="card-desc">${opt.description}</div>
          <div style="font-size:7pt; margin-top:4px; color:var(--ink-faded);">Specialties: ${opt.specialties.join(', ')}</div>
          ${opt.isStack ? '<div style="font-size:7pt; color:var(--green-stamp); margin-top:3px;">+1 requisition die for crafting materials</div>' : ''}
        </div>`;
    });
    html += '</div>';
    openModal(html);
  }

  function selectSubUnit(key) {
    const divKey = getDivKey(state.division);
    if (!divKey) return;
    const div = NR_DATA.divisions[divKey];
    const opt = div.subUnits.options[key];
    state.subUnit = opt.name;
    state.subUnitKey = key;
    state.talent2 = null;
    applyDivisionGear();
    saveState();
    renderSheet();
    closeModal();
    showToast('Department: ' + opt.name);
  }

  function applyDivisionGear() {
    const divKey = getDivKey(state.division);
    if (!divKey) return;
    const div = NR_DATA.divisions[divKey];
    state.divisionItem = div.divisionItem.name;
    // Remove old auto-gear, keep manual additions
    state.gear = state.gear.filter(g => !g._auto);
    const isStack = state.subUnitKey === 'stack';
    const kit = isStack && div.stackKit ? div.stackKit : div.startingKit;
    kit.forEach(item => {
      state.gear.push({ name: item, bonus: '', enc: '', _auto: true });
    });
    detectResourceDice();
  }

  function showDivisionItemInfo() {
    const divKey = getDivKey(state.division);
    if (!divKey) { showToast('Choose a Division first', 'warn'); return; }
    const div = NR_DATA.divisions[divKey];
    let html = `<h3>${div.divisionItem.name}</h3>`;
    html += `<p style="font-size:7.5pt; margin-bottom:8px;">${div.divisionItem.description}</p>`;
    html += '<p style="font-size:7pt; color:var(--green-stamp);"><strong>Mechanics:</strong></p><ul style="font-size:7pt; padding-left:16px;">';
    div.divisionItem.mechanics.forEach(m => { html += `<li>${m}</li>`; });
    html += '</ul>';
    openModal(html);
  }

  // ─── ATTRIBUTE ADJUST ───────────────────────────────────
  function adjustAttr(attrKey, delta) {
    const val = state.attributes[attrKey] || 2;
    const newVal = val + delta;
    if (newVal < 2) return;
    const divKey = getDivKey(state.division);
    const div = divKey ? NR_DATA.divisions[divKey] : null;
    const isPrimary = div && div.primaryAttribute === attrKey;
    const max = isPrimary ? 5 : 4;
    if (newVal > max) return;
    state.attributes[attrKey] = newVal;
    saveState();
    renderSheet();
  }

  // ─── SKILL ADJUST ───────────────────────────────────────
  function adjustSkill(skillKey, delta) {
    const cur = state.skills[skillKey] || 0;
    const newVal = cur + delta;
    if (newVal < 0 || newVal > 5) return;
    const divKey = getDivKey(state.division);
    const div = divKey ? NR_DATA.divisions[divKey] : null;
    const isKeySkill = div && div.keySkill === skillKey;
    // During character creation: key skill max 4, others max 3
    // After creation (or if no division): all max 5
    if (!state.creationComplete && div) {
      const maxForSkill = isKeySkill ? 4 : 3;
      if (newVal > maxForSkill) return;
    }
    state.skills[skillKey] = newVal;
    saveState();
    renderSheet();
  }

  // ─── TALENT PICKER ──────────────────────────────────────
  function pickTalent(slot) {
    const divKey = getDivKey(state.division);
    const subKey = state.subUnitKey;

    if (slot === 1) {
      if (!divKey) { showToast('Choose a Division first', 'warn'); return; }
      let html = '<h3>Select Talent — Slot 1</h3>';
      html += '<div style="display:flex; gap:4px; margin-bottom:8px;">';
      html += '<button class="sheet-edit-btn active" id="talent-tab-div" onclick="NR.switchTalentTab(\'div\')">Division</button>';
      html += '<button class="sheet-edit-btn" id="talent-tab-gen" onclick="NR.switchTalentTab(\'gen\')">General</button>';
      html += '</div>';
      html += '<div id="talent-list-div" class="talent-list">';
      (NR_DATA.divisionTalents[divKey] || []).forEach((t, i) => {
        html += `<div class="talent-item" onclick="NR.selectTalent(1,'div',${i})"><strong>${t.name}</strong> <span class="talent-cost${t.cost==='—'||t.cost.includes('Healing')?' free':''}">${t.cost}</span><br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
      });
      html += '</div>';
      html += '<div id="talent-list-gen" class="talent-list" style="display:none;">';
      NR_DATA.generalTalents.forEach((t, i) => {
        html += `<div class="talent-item" onclick="NR.selectTalent(1,'gen',${i})"><strong>${t.name}</strong>${t.healing?' <span style="color:var(--green-stamp);font-size:6pt;">(Healing)</span>':''}<br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
      });
      html += '</div>';
      openModal(html);
    } else if (slot === 2) {
      if (!subKey) { showToast('Choose a Department/Paradigm/Wing first', 'warn'); return; }
      const talents = NR_DATA.subUnitTalents[subKey] || [];
      let html = '<h3>Select Wing / Paradigm / Dept Talent</h3>';
      html += '<div class="talent-list">';
      talents.forEach((t, i) => {
        html += `<div class="talent-item" onclick="NR.selectTalent(2,'sub',${i})"><strong>${t.name}</strong> <span class="talent-cost${t.cost==='—'||t.cost.includes('Healing')?' free':''}">${t.cost}</span><br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
      });
      html += '</div>';
      openModal(html);
    } else if (slot === 3) {
      let html = '<h3>Select Background Talent</h3>';
      html += '<p style="font-size:7pt; color:var(--ink-faded);">+1 bonus die on listed skill. Always passive — no activation cost.</p>';
      html += '<div class="talent-list">';
      NR_DATA.backgroundTalents.forEach((t, i) => {
        const skillName = NR_DATA.skills.find(s => s.key === t.skill);
        html += `<div class="talent-item" onclick="NR.selectTalent(3,'bg',${i})"><strong>${t.name}</strong> — +1 ${skillName?skillName.name:t.skill}<br><span style="color:var(--ink-faded);">${t.desc}</span></div>`;
      });
      html += '</div>';
      openModal(html);
    }
  }

  function switchTalentTab(tab) {
    document.getElementById('talent-tab-div').classList.toggle('active', tab === 'div');
    document.getElementById('talent-tab-gen').classList.toggle('active', tab === 'gen');
    document.getElementById('talent-list-div').style.display = tab === 'div' ? 'block' : 'none';
    document.getElementById('talent-list-gen').style.display = tab === 'gen' ? 'block' : 'none';
  }

  function selectTalent(slot, source, index) {
    let talent = null;
    if (source === 'div') talent = (NR_DATA.divisionTalents[getDivKey(state.division)] || [])[index];
    else if (source === 'gen') talent = NR_DATA.generalTalents[index];
    else if (source === 'sub') talent = (NR_DATA.subUnitTalents[state.subUnitKey] || [])[index];
    else if (source === 'bg') talent = NR_DATA.backgroundTalents[index];
    if (!talent) return;

    if (slot === 1) state.talent1 = talent;
    else if (slot === 2) state.talent2 = talent;
    else if (slot === 3) state.talent3 = talent;

    saveState();
    renderSheet();
    closeModal();
    showToast('Talent: ' + talent.name);
  }

  function addExtraTalent() {
    const divKey = getDivKey(state.division);
    let html = '<h3>Add Talent (6 XP)</h3>';
    html += '<p style="font-size:7pt; color:var(--ink-faded); margin-bottom:8px;">Purchasing a new talent costs 6 XP. Select from any available list.</p>';

    if (divKey) {
      html += '<h4>Division Talents — ' + NR_DATA.divisions[divKey].name + '</h4>';
      html += '<div class="talent-list">';
      (NR_DATA.divisionTalents[divKey] || []).forEach((t, i) => {
        html += `<div class="talent-item" onclick="NR.addExtraTalentConfirm('div',${i})"><strong>${t.name}</strong> <span class="talent-cost${t.cost==='—'||t.cost.includes('Healing')?' free':''}">${t.cost}</span><br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
      });
      html += '</div>';
    }
    if (state.subUnitKey) {
      html += '<h4>Wing / Paradigm / Department Talents</h4>';
      html += '<div class="talent-list">';
      (NR_DATA.subUnitTalents[state.subUnitKey] || []).forEach((t, i) => {
        html += `<div class="talent-item" onclick="NR.addExtraTalentConfirm('sub',${i})"><strong>${t.name}</strong> <span class="talent-cost${t.cost==='—'||t.cost.includes('Healing')?' free':''}">${t.cost}</span><br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
      });
      html += '</div>';
    }
    html += '<h4>General Talents</h4>';
    html += '<div class="talent-list">';
    NR_DATA.generalTalents.forEach((t, i) => {
      html += `<div class="talent-item" onclick="NR.addExtraTalentConfirm('gen',${i})"><strong>${t.name}</strong>${t.healing?' <span style="color:var(--green-stamp);font-size:6pt;">(Healing)</span>':''}<br><span style="color:var(--ink-faded);">${t.effect}</span></div>`;
    });
    html += '</div>';
    openModal(html);
  }

  function addExtraTalentConfirm(source, index) {
    let talent = null;
    if (source === 'div') talent = (NR_DATA.divisionTalents[getDivKey(state.division)] || [])[index];
    else if (source === 'sub') talent = (NR_DATA.subUnitTalents[state.subUnitKey] || [])[index];
    else if (source === 'gen') talent = NR_DATA.generalTalents[index];
    if (!talent) return;

    if (!state.extraTalents) state.extraTalents = [];
    state.extraTalents.push(talent);
    // Deduct from current XP, increment spent
    if (typeof state.xp === 'number') { state.xp = { current: state.xp, total: state.xp, spent: 0 }; }
    state.xp.current = Math.max(0, (state.xp.current || 0) - 6);
    state.xp.spent = (state.xp.spent || 0) + 6;
    saveState();
    renderSheet();
    closeModal();
    showToast('Added: ' + talent.name + ' (6 XP)');
  }

  function removeExtraTalent(index) {
    if (!state.extraTalents) return;
    const removed = state.extraTalents[index];
    state.extraTalents.splice(index, 1);
    // Refund to current XP, decrement spent
    if (typeof state.xp === 'number') { state.xp = { current: state.xp, total: state.xp, spent: 0 }; }
    state.xp.current = (state.xp.current || 0) + 6;
    state.xp.spent = Math.max(0, (state.xp.spent || 0) - 6);
    saveState();
    renderSheet();
    showToast('Removed: ' + removed.name + ' (XP refunded)');
  }

  function buildExtraTalents() {
    const container = document.getElementById('extra-talents');
    if (!container) return;
    if (!state.extraTalents || state.extraTalents.length === 0) {
      container.innerHTML = '';
      return;
    }
    let html = '<div style="margin-top:8px;">';
    html += '<div class="corr-label" style="margin-bottom:4px;">Additional Talents (XP Purchased)</div>';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">';
    state.extraTalents.forEach((t, i) => {
      html += `
        <div class="talent-block" style="position:relative;">
          <button class="sheet-edit-btn" style="position:absolute; top:2px; right:2px; font-size:5pt;" onclick="NR.removeExtraTalent(${i})" title="Remove (refunds XP)">✕</button>
          <div class="talent-name">${t.name}</div>
          <div class="talent-desc">${t.effect || ''}</div>
        </div>`;
    });
    html += '</div></div>';
    container.innerHTML = html;
  }

  // ─── CRITICAL INJURIES ──────────────────────────────────
  function pickCriticalInjury() {
    let html = '<h3>Critical Injuries</h3>';
    html += '<p style="font-size:7pt; color:var(--ink-faded); margin-bottom:8px;">Select an injury to add to your sheet. Roll d66 during play to determine randomly.</p>';
    html += '<div class="talent-list" style="max-height:50vh;">';
    NR_DATA.criticalInjuries.forEach((ci, i) => {
      html += `<div class="talent-item" onclick="NR.addCriticalInjury(${i})"><strong>${ci.roll} — ${ci.name}</strong>${ci.lethal?' <span style="color:var(--red-stamp);font-size:6pt;">LETHAL</span>':''}<br><span style="color:var(--ink-faded);">${ci.effect}</span><br><span style="font-size:6pt; color:var(--green-stamp);">Healing: ${ci.healing}</span></div>`;
    });
    html += '</div>';
    openModal(html);
  }

  function addCriticalInjury(index) {
    const ci = NR_DATA.criticalInjuries[index];
    if (!ci) return;
    if (!state.criticalInjuries) state.criticalInjuries = [];
    // Don't add duplicates
    if (state.criticalInjuries.find(i => i.name === ci.name)) {
      showToast('Injury already recorded', 'warn');
      closeModal();
      return;
    }
    state.criticalInjuries.push(ci);
    saveState();
    renderSheet();
    closeModal();
    showToast('Added: ' + ci.name);
  }

  function removeCriticalInjury(index) {
    if (!state.criticalInjuries) return;
    state.criticalInjuries.splice(index, 1);
    saveState();
    renderSheet();
  }

  function buildCriticalInjuries() {
    const container = document.getElementById('critical-injuries');
    if (!container) return;
    if (!state.criticalInjuries || state.criticalInjuries.length === 0) {
      container.innerHTML = `<div class="notes-lines">
        <div class="notes-line"></div><div class="notes-line"></div>
        <div class="notes-line"></div><div class="notes-line"></div>
      </div>`;
      return;
    }
    let html = '';
    state.criticalInjuries.forEach((ci, i) => {
      html += `<div style="display:flex; align-items:flex-start; gap:6px; padding:2px 0; border-bottom:1px dotted var(--rule-light); font-size:7pt;">
        <button class="sheet-edit-btn" onclick="NR.removeCriticalInjury(${i})" title="Remove" style="flex-shrink:0; font-size:6pt; padding:0 4px;">✕</button>
        <div>
          <strong>${ci.name}</strong>${ci.lethal?' <span style="color:var(--red-stamp);">[LETHAL]</span>':''}
          <span style="color:var(--ink-faded);"> — ${ci.effect}</span>
          <div style="font-size:6pt; color:var(--green-stamp);">Healing: ${ci.healing}</div>
        </div>
      </div>`;
    });
    container.innerHTML = html;
  }

  // ─── GEAR / ENCUMBRANCE ─────────────────────────────────
  function addGearItem() {
    state.gear.push({ name: '', bonus: '', enc: '' });
    saveState();
    renderSheet();
    setTimeout(() => {
      const table = document.getElementById('gear-table');
      if (table) {
        const rows = table.querySelectorAll('tr[data-gear]');
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const firstCell = lastRow.querySelector('td[contenteditable]');
          if (firstCell) firstCell.focus();
        }
      }
    }, 100);
  }

  function removeGearItem(index) {
    state.gear.splice(index, 1);
    detectResourceDice();
    saveState();
    renderSheet();
  }

  function buildGearTable() {
    const table = document.getElementById('gear-table');
    if (!table) return;
    table.querySelectorAll('tr[data-gear]').forEach(r => r.remove());

    if (!state.gear) state.gear = [];
    state.gear.forEach((item, i) => {
      // Auto-fill encumbrance and bonus for items without explicit values
      if (!item.enc && item.name) {
        const autoEnc = getItemEncumbrance(item.name);
        if (autoEnc) item.enc = autoEnc;
      }
      if (!item.bonus && item.name) {
        const autoBonus = getItemBonus(item.name);
        if (autoBonus) item.bonus = autoBonus;
      }
      const tooltip = item.name ? getItemTooltip(item.name) : '';
      const row = document.createElement('tr');
      row.setAttribute('data-gear', i);
      row.innerHTML = `
        <td contenteditable="true" data-gear="${i}" data-field="name" title="${tooltip.replace(/"/g,'&quot;')}">${item.name || ''}</td>
        <td class="center" contenteditable="true" data-gear="${i}" data-field="bonus">${item.bonus || ''}</td>
        <td class="center" contenteditable="true" data-gear="${i}" data-field="enc">${item.enc || ''}</td>
        <td class="center" style="width:28px; padding:0;"><button class="sheet-edit-btn" onclick="NR.removeGearItem(${i})" title="Remove item" style="font-size:7pt;">✕</button></td>
      `;
      table.appendChild(row);
    });

    table.querySelectorAll('[contenteditable][data-gear]').forEach(cell => {
      cell.addEventListener('blur', function() {
        const idx = parseInt(this.getAttribute('data-gear'));
        const field = this.getAttribute('data-field');
        if (!state.gear[idx]) state.gear[idx] = { name: '', bonus: '', enc: '' };
        state.gear[idx][field] = this.textContent.trim();
        detectResourceDice();
        recalcEncumbrance();
        saveState();
      });
    });

    recalcEncumbrance();
  }

  function recalcEncumbrance() {
    let totalEnc = 0;
    (state.gear || []).forEach(item => {
      const encStr = (item.enc || '').toString().trim();
      if (encStr === '½' || encStr === '1/2') totalEnc += 0.5;
      else {
        const num = parseFloat(encStr);
        if (!isNaN(num)) totalEnc += num;
      }
    });
    const capacity = (state.attributes.strength || 2) * 2;
    setField('totalEnc', totalEnc % 1 === 0 ? totalEnc : totalEnc.toFixed(1));
    setField('encCapacity', capacity);
  }

  // ─── RESOURCE DICE ──────────────────────────────────────
  function detectResourceDice() {
    const keywords = {
      ammo: ['revolver', 'pistol', 'shotgun', 'rifle', 'assault rifle', 'firearm'],
      medical: ['heal', 'first aid', 'medical', 'surgical', 'trauma', 'bandage'],
      battery: ['battery', 'electronic', 'radio', 'camera', 'recorder', 'modem', 'maglite', 'flashlight', 'walkie', 'spirit box', 'thermal', 'infrared', 'jammer', 'multimeter'],
      rations: ['ration', 'food']
    };
    (state.gear || []).forEach(item => {
      const name = (item.name || '').toLowerCase();
      Object.entries(keywords).forEach(([key, words]) => {
        if (words.some(w => name.includes(w))) {
          if (!state.resourceDice[key]) {
            const defaults = { ammo: 'd12', medical: 'd10', battery: 'd8', rations: 'd8' };
            state.resourceDice[key] = defaults[key];
          }
        }
      });
    });
  }

  function buildResourceDice() {
    const container = document.getElementById('resource-dice');
    if (!container) return;
    if (!state.resourceDice) state.resourceDice = {};

    const labels = { ammo: 'Ammo', medical: 'Medical', battery: 'Battery', rations: 'Rations' };
    const activeDice = Object.keys(state.resourceDice).filter(k => state.resourceDice[k]);

    container.innerHTML = '';
    activeDice.forEach(key => {
      const val = state.resourceDice[key];
      const displayLabel = labels[key] || key;
      const wrapper = document.createElement('div');
      wrapper.style.textAlign = 'center';
      wrapper.innerHTML = `
        <div class="corr-label" style="margin-bottom:2px;">${displayLabel}</div>
        <div style="border:1.5px solid var(--rule); width:46px; height:22px; background:var(--field-bg);
                    font-family:var(--font-fill); font-size:8pt; line-height:20px; cursor:pointer;"
             data-rd="${key}">${val}</div>
      `;
      wrapper.querySelector('[data-rd]').addEventListener('click', function() {
        cycleResourceDie(key);
      });
      container.appendChild(wrapper);
    });
  }

  function cycleResourceDie(key) {
    const order = ['d12', 'd10', 'd8', 'd6', 'd4', 'Depleted', 'd12'];
    const cur = state.resourceDice[key] || 'd12';
    const idx = order.indexOf(cur);
    state.resourceDice[key] = order[(idx + 1) % order.length];
    saveState();
    buildResourceDice();
  }

  function addResourceDie() {
    const name = prompt('Resource name (e.g., "Ammo", "Battery", "C4"):');
    if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    state.resourceDice[key] = 'd6';
    saveState();
    buildResourceDice();
    showToast('Added resource: ' + name);
  }

  // ─── SHEET RENDERING ────────────────────────────────────
  function renderSheet() {
    setField('name', state.name);
    setField('division', state.division);
    setField('subUnit', state.subUnit);
    setField('ageGroup', state.ageGroup);
    setField('age', state.age);
    setField('cl', state.cl);
    setField('origin', state.origin);
    setField('anchor', state.anchor);
    setField('bio', state.bio);
    setField('divisionItem', state.divisionItem);
    setField('maxCorruption', 10 + state.attributes.empathy);
    setField('armorRating', state.armorRating);
    setField('armorRating2', state.armorRating);
    setField('talent1name', state.talent1 ? state.talent1.name : '');
    setField('talent1desc', state.talent1 ? state.talent1.effect : '');
    setField('talent2name', state.talent2 ? state.talent2.name : '');
    setField('talent2desc', state.talent2 ? state.talent2.effect : '');
    setField('talent3name', state.talent3 ? state.talent3.name : '');
    setField('talent3desc', state.talent3 ? state.talent3.effect : '');
    renderAttrSkillGrid();
    renderCorruptionTrack();
    buildGearTable();
    buildResourceDice();
    buildExtraTalents();
    buildCriticalInjuries();
  }

  function setField(field, value) {
    const els = document.querySelectorAll('[data-field="' + field + '"]');
    els.forEach(el => {
      if (el.contentEditable === 'true' || el.getAttribute('contenteditable') === 'true') {
        const current = el.textContent ? el.textContent.trim() : '';
        if (current === '' || current === String(value) || document.activeElement !== el) {
          el.textContent = value != null ? value : '';
        }
      } else {
        el.textContent = value != null ? value : '';
      }
    });
  }

  // ─── ATTRIBUTE/SKILL GRID ───────────────────────────────
  function buildAttrSkillGrid() {
    const grid = document.getElementById('attr-skill-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const divKey = getDivKey(state.division);
    const div = divKey ? NR_DATA.divisions[divKey] : null;

    // Calculate point totals for header
    let attrSpent = 0, attrTotal = getAttrPointCap() || '?';
    let skillSpent = 0, skillTotal = getSkillPointCap() || '?';
    Object.values(state.attributes).forEach(v => { attrSpent += v || 0; });
    Object.values(state.skills).forEach(v => { skillSpent += v || 0; });
    const countsEl = document.getElementById('attr-skill-counts');
    if (countsEl) {
      countsEl.textContent = ` (Attrs: ${attrSpent}/${attrTotal} | Skills: ${skillSpent}/${skillTotal})`;
    }

    NR_DATA.attributes.forEach(attr => {
      const skills = NR_DATA.skills.filter(s => s.attr === attr.key);
      const isPrimary = div && div.primaryAttribute === attr.key;
      const attrVal = state.attributes[attr.key] || 2;
      const dmg = state.attributeDamage[attr.key] || 0;
      const attrMax = isPrimary ? 5 : 4;

      const col = document.createElement('div');
      col.className = 'attr-skill-col';

      const attrBox = document.createElement('div');
      attrBox.className = 'attr-box' + (isPrimary ? ' primary-attr' : '');
      attrBox.innerHTML = `
        <div class="attr-name" style="color:${isPrimary ? 'var(--red-stamp)' : 'var(--ink)'}">${attr.name}${isPrimary ? ' ★' : ''}</div>
        <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
          <button class="sheet-edit-btn" onclick="NR.adjustAttr('${attr.key}', -1)" ${attrVal <= 2 ? 'disabled' : ''} style="font-size:10pt; padding:2px 8px;">−</button>
          <div class="attr-score" style="min-width:20px;">${attrVal}</div>
          <button class="sheet-edit-btn" onclick="NR.adjustAttr('${attr.key}', 1)" ${attrVal >= attrMax ? 'disabled' : ''} style="font-size:10pt; padding:2px 8px;">+</button>
        </div>
        <div class="attr-range">2 – ${attrMax}</div>
        <div class="attr-dmg-label">${attr.damageLabel}</div>
        <div class="attr-dmg-track" data-dmg="${attr.key}">
          ${Array(attr.max).fill(0).map((_, i) =>
            `<div class="pip${i < dmg ? ' filled' : ''}" data-idx="${i}"></div>`
          ).join('')}
        </div>
      `;
      attrBox.querySelectorAll('.pip').forEach(pip => {
        pip.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-idx'));
          const newDmg = idx + 1;
          state.attributeDamage[attr.key] = (state.attributeDamage[attr.key] === newDmg) ? newDmg - 1 : newDmg;
          if (state.attributeDamage[attr.key] < 0) state.attributeDamage[attr.key] = 0;
          if (state.attributeDamage[attr.key] > attr.max) state.attributeDamage[attr.key] = attr.max;
          saveState();
          renderSheet();
        });
      });
      col.appendChild(attrBox);

      const skillArea = document.createElement('div');
      skillArea.className = 'skill-area';
      skillArea.innerHTML = '<div class="skill-area-header">Skills</div>';
      skills.forEach(skill => {
        const isKeySkill = div && div.keySkill === skill.key;
        const skillVal = state.skills[skill.key] || 0;
        const row = document.createElement('div');
        row.className = 'skill-row';
        row.innerHTML = `
          <span class="skill-name" title="${skill.desc}" style="color:${isKeySkill ? 'var(--red-stamp)' : 'var(--ink)'}">${skill.name}${isKeySkill ? ' ★' : ''}</span>
          <button class="sheet-edit-btn" onclick="NR.adjustSkill('${skill.key}', -1)" ${skillVal <= 0 ? 'disabled' : ''} style="font-size:7pt; padding:0 4px; min-width:16px;">−</button>
          <span class="skill-box${isKeySkill ? ' key-skill' : ''}" style="margin:0 2px;">${skillVal || '0'}</span>
          <button class="sheet-edit-btn" onclick="NR.adjustSkill('${skill.key}', 1)" ${skillVal >= 5 ? 'disabled' : ''} style="font-size:7pt; padding:0 4px; min-width:16px;">+</button>
        `;
        skillArea.appendChild(row);
      });
      col.appendChild(skillArea);
      grid.appendChild(col);
    });
  }

  function renderAttrSkillGrid() {
    buildAttrSkillGrid();
  }

  // ─── CORRUPTION TRACK ───────────────────────────────────
  function buildCorruptionTrack() {
    const track = document.getElementById('corruption-track');
    if (!track) return;
    track.innerHTML = '';
    const threshold = 10 + state.attributes.empathy;
    for (let i = 1; i <= 15; i++) {
      const pip = document.createElement('span');
      pip.className = 'cpip';
      if (i > threshold) pip.classList.add('danger');
      if (i <= state.corruption) pip.classList.add('filled');
      pip.textContent = i;
      pip.addEventListener('click', function() {
        if (state.corruption === i) state.corruption = i - 1;
        else state.corruption = i;
        saveState();
        renderCorruptionTrack();
        renderSheet();
      });
      track.appendChild(pip);
    }
  }

  function renderCorruptionTrack() {
    buildCorruptionTrack();
    const ref = document.getElementById('corruption-stage-ref');
    if (!ref) return;
    const stage = getCorruptionStage(state.corruption);
    let html = '';
    NR_DATA.corruptionStages.forEach(s => {
      const isActive = s === stage;
      html += `<div class="${isActive ? 'active-stage' : ''}"><b>${s.min === 99 ? '> Max' : s.min + '–' + s.max}</b> ${s.name}</div>`;
    });
    ref.innerHTML = html;
    setField('maxCorruption', 10 + state.attributes.empathy);
  }

  function getCorruptionStage(val) {
    if (val === 0) return null;
    const threshold = 10 + state.attributes.empathy;
    if (val > threshold) return NR_DATA.corruptionStages.find(s => s.min === 99);
    for (const s of NR_DATA.corruptionStages) {
      if (val >= s.min && val <= s.max) return s;
    }
    return null;
  }

  // ─── HELPERS ────────────────────────────────────────────
  function getDivKey(divName) {
    if (!divName) return null;
    const lc = divName.toLowerCase();
    if (lc.includes('wayfinder')) return 'wayfinder';
    if (lc.includes('recovery')) return 'recovery';
    if (lc.includes('keep')) return 'keep';
    return null;
  }

  function detectAgeGroup() {
    const age = parseInt(state.age);
    if (isNaN(age)) return;
    if (age >= 22 && age <= 28) state.ageGroup = 'Young';
    else if (age >= 29 && age <= 38) state.ageGroup = 'Experienced';
    else if (age >= 39 && age <= 52) state.ageGroup = 'Senior';
    else state.ageGroup = '';
    setField('ageGroup', state.ageGroup);
  }

  function getAgeGroupKey() {
    const ag = (state.ageGroup || '').toLowerCase();
    if (ag.includes('young')) return 'young';
    if (ag.includes('experienced')) return 'experienced';
    if (ag.includes('senior')) return 'senior';
    return null;
  }

  function getAttrPointCap() {
    const agKey = getAgeGroupKey();
    if (!agKey || !NR_DATA.ageGroups[agKey]) return null;
    return NR_DATA.ageGroups[agKey].attrPoints;
  }

  function getSkillPointCap() {
    const agKey = getAgeGroupKey();
    if (!agKey || !NR_DATA.ageGroups[agKey]) return null;
    return NR_DATA.ageGroups[agKey].skillPoints;
  }

  // Look up an item in equipment tables for encumbrance and description
  function lookupEquipmentItem(itemName) {
    if (!itemName) return null;
    const name = itemName.toLowerCase();
    const allCats = [
      ...NR_DATA.equipment.investigative,
      ...NR_DATA.equipment.tools,
      ...NR_DATA.equipment.weapons,
      ...NR_DATA.equipment.armor
    ];
    for (const item of allCats) {
      const itemNameLow = item.name.toLowerCase();
      if (name.includes(itemNameLow) || itemNameLow.includes(name)) {
        return item;
      }
    }
    return null;
  }

  function getItemEncumbrance(itemName) {
    if (!itemName) return '';
    // Try equipment table lookup first
    const eq = lookupEquipmentItem(itemName);
    if (eq && eq.enc) return eq.enc;
    // Division signature items
    const name = itemName.toLowerCase();
    if (name.includes('verdant codex')) return '1';
    if (name.includes('verdant satchel')) return '1';
    if (name.includes("warden's bracer") || name.includes('warden bracer')) return '½';
    // Starting kit items — parse by keyword
    if (name.includes('briefcase')) return '1';
    if (name.includes('camera') && name.includes('35mm')) return '1';
    if (name.includes('forged credential') || name.includes('press pass')) return '½';
    if (name.includes('civilian clothing') || name.includes('coverall') || name.includes('utility vest')) return '1';
    if (name.includes('derringer')) return '½';
    if (name.includes('pocket knife') || name.includes('pocket knife')) return '½';
    if (name.includes('sidearm') || name.includes('revolver') || name.includes('pistol')) return '1';
    if (name.includes('flashlight') || name.includes('maglite')) return '½';
    if (name.includes('rope')) return '1';
    if (name.includes('zip tie')) return '½';
    if (name.includes('chalk')) return '½';
    if (name.includes('crowbar')) return '1';
    if (name.includes('field jacket') || name.includes('holster')) return '1';
    if (name.includes('containment kit') || name.includes('salt') || name.includes('copper wire')) return '2';
    if (name.includes('lore reference binder') || name.includes('binder')) return '1';
    if (name.includes('formal attire') || name.includes('tactical jacket')) return '1';
    if (name.includes('personal toolkit') || name.includes('screwdriver') || name.includes('soldering')) return '2';
    if (name.includes('signal jammer')) return '1';
    if (name.includes('walkie-talkie') || name.includes('walkie talkie')) return '½';
    if (name.includes('duct tape') || name.includes('wd-40')) return '½';
    if (name.includes('shotgun')) return '2';
    if (name.includes('rifle') || name.includes('m16') || name.includes('assault')) return '2';
    if (name.includes('thermal') || name.includes('infrared')) return '2';
    if (name.includes('riot armor') || name.includes('tactical riot')) return '3';
    if (name.includes('kevlar') || name.includes('concealed vest')) return '1';
    if (name.includes('camera')) return '1';
    if (name.includes('lockpick')) return '½';
    if (name.includes('first aid') || name.includes('trauma') || name.includes('surgical')) return name.includes('trauma') || name.includes('surgical') ? '2' : '1';
    return '';
  }

  function getItemBonus(itemName) {
    if (!itemName) return '';
    // Try equipment table lookup first
    const eq = lookupEquipmentItem(itemName);
    if (eq && eq.bonus) return eq.bonus;
    // Parse from description strings like "Gear Die d6"
    const name = itemName.toLowerCase();
    const gearDieMatch = itemName.match(/gear die\s*(d\d+)/i);
    if (gearDieMatch) return gearDieMatch[1];
    if (name.includes('signal jammer')) return 'd6';
    return '';
  }

  function getItemTooltip(itemName) {
    if (!itemName) return itemName;
    const eq = lookupEquipmentItem(itemName);
    if (eq) {
      let tip = eq.name;
      if (eq.bonus) tip += '\nBonus: ' + eq.bonus;
      if (eq.damage) tip += '\nDamage: ' + eq.damage;
      if (eq.range) tip += '\nRange: ' + eq.range;
      if (eq.traits) tip += '\nTraits: ' + eq.traits;
      if (eq.notes) tip += '\n' + eq.notes;
      tip += '\nCL: ' + eq.cl + ' | Enc: ' + eq.enc;
      return tip;
    }
    // For division/kit items, generate a simplified tooltip
    const enc = getItemEncumbrance(itemName);
    if (enc) return itemName + '\nEnc: ' + enc;
    return itemName;
  }

  // ─── TAB NAVIGATION ─────────────────────────────────────
  function setupTabNav() {
    document.querySelectorAll('#tab-nav button[data-tab]').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#tab-nav button[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
        if (tabId === 'tab-equipment') buildEquipmentRef();
        if (tabId === 'tab-talents') buildTalentsRef();
        if (tabId === 'tab-rules') buildRulesRef();
        if (tabId === 'tab-sheet') renderSheet();
      });
    });
  }

  // ─── DICE ROLLER ────────────────────────────────────────
  function rollDice(push) {
    const attrDice = parseInt(document.getElementById('dice-attr').value) || 0;
    const skillDice = parseInt(document.getElementById('dice-skill').value) || 0;
    const gearDice = parseInt(document.getElementById('dice-gear').value) || 0;
    const bonusDice = parseInt(document.getElementById('dice-bonus').value) || 0;
    const totalDice = attrDice + skillDice + gearDice + bonusDice;
    if (totalDice === 0) { showToast('Add at least one die', 'warn'); return; }

    let dice = [];
    let results = { attribute: [], skill: [], gear: [], bonus: [] };

    if (push && lastRoll) {
      dice = lastRoll.dice.map(d => (d === 6 || d === 1) ? d : Math.floor(Math.random() * 6) + 1);
      results = lastRoll.results;
    } else {
      const rollD6 = () => Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < attrDice; i++) results.attribute.push(rollD6());
      for (let i = 0; i < skillDice; i++) results.skill.push(rollD6());
      for (let i = 0; i < gearDice; i++) results.gear.push(rollD6());
      for (let i = 0; i < bonusDice; i++) results.bonus.push(rollD6());
      dice = [...results.attribute, ...results.skill, ...results.gear, ...results.bonus];
    }

    const sixes = dice.filter(d => d === 6).length;
    const gearOnes = results.gear.filter(d => d === 1).length;
    lastRoll = { dice, results, attrDice, skillDice, gearDice, bonusDice };

    document.getElementById('dice-pool-display').innerHTML = dice.map(d => {
      let cls = d === 6 ? 'success' : d === 1 ? 'fail' : '';
      return `<div class="die ${cls}">${d}</div>`;
    }).join('');

    const resultDisplay = document.getElementById('roll-result');
    resultDisplay.style.display = 'block';
    let html = `<span class="success-count">${sixes} success${sixes !== 1 ? 'es' : ''}</span>`;
    if (push) html += ' <span style="color:#d4a017;">(pushed)</span>';
    if (gearOnes > 0) html += ` &nbsp;|&nbsp; <span class="bane-count">☠ ${gearOnes} Gear Die 1${gearOnes > 1 ? 's' : ''}</span>`;
    html += `<br><small>${totalDice} dice | ${sixes} sixes</small>`;
    if (push) html += `<br><small style="color:var(--red-stamp);">⚠ Push cost: +1 Corruption</small>`;
    resultDisplay.innerHTML = html;
    document.getElementById('btn-push').disabled = false;
  }

  function pushRoll() {
    if (!lastRoll) return;
    if (state.creationComplete || state.name) { state.corruption += 1; saveState(); renderSheet(); }
    rollDice(true);
  }

  // ─── NEW / RESET ────────────────────────────────────────
  function newCharacter() {
    if (state.name || state.division) {
      if (!confirm('Start a new character? Current data will be overwritten.')) return;
    }
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    lastRoll = null;
    saveState();
    renderSheet();
    showToast('New agent dossier opened');
  }

  function resetSheet() {
    if (!confirm('Clear ALL character data?')) return;
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    lastRoll = null;
    saveState();
    renderSheet();
    showToast('Sheet cleared');
  }

  // ─── SAVE/LOAD FILES ────────────────────────────────────
  function saveToFile() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const agentName = state.name ? state.name.replace(/[^a-zA-Z0-9]/g, '_') : 'agent';
    a.href = url; a.download = `neon-relic-${agentName}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('Character saved to file');
  }

  function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const loaded = JSON.parse(e.target.result);
          state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), loaded);
          if (loaded.attributes) state.attributes = Object.assign({}, DEFAULT_STATE.attributes, loaded.attributes);
          if (loaded.attributeDamage) state.attributeDamage = Object.assign({}, DEFAULT_STATE.attributeDamage, loaded.attributeDamage);
          if (loaded.skills) state.skills = Object.assign({}, loaded.skills);
          if (loaded.resourceDice) state.resourceDice = Object.assign({}, loaded.resourceDice);
          if (loaded.extraTalents) state.extraTalents = loaded.extraTalents.slice();
          if (!state.gear) state.gear = [];
          detectResourceDice();
          saveState(); renderSheet();
          showToast('Character loaded from file');
        } catch(err) { showToast('Invalid character file', 'warn'); }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  // ─── REFERENCE TAB PRINT ────────────────────────────────
  function printRef(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // Clone the content into a temporary printable window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) { window.print(); return; }
    printWindow.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title>');
    // Copy styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(s => { printWindow.document.write(s.outerHTML); });
    printWindow.document.write('<style>');
    printWindow.document.write('body { background: #f0ead6; font-family: "Special Elite", "Courier New", monospace; padding: 20px; color: #1a1a18; }');
    printWindow.document.write('table { width:100%; border-collapse:collapse; font-size:7.5pt; }');
    printWindow.document.write('th { text-align:left; background:rgba(0,0,0,0.06); padding:3px 6px; border-bottom:1.5px solid #1a1a18; font-size:6pt; text-transform:uppercase; }');
    printWindow.document.write('td { padding:3px 6px; border-bottom:1px dotted #ccc; }');
    printWindow.document.write('h2 { border-bottom:2px solid #1a1a18; padding-bottom:4px; font-size:12pt; }');
    printWindow.document.write('h3 { font-size:9pt; color:#2d5a27; border-bottom:1px solid #999; }');
    printWindow.document.write('h4 { font-size:8pt; color:#2d5a27; }');
    printWindow.document.write('p { font-size:7.5pt; }');
    printWindow.document.write('@media print { @page { size: letter; margin: 0.5in; } }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(container.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  }

  // ═════════════════════════════════════════════════════════
  // EQUIPMENT REFERENCE TAB
  // ═════════════════════════════════════════════════════════
  function buildEquipmentRef() {
    const container = document.getElementById('equipment-ref');
    if (!container) return;
    let html = '';
    html += '<h3>Investigative &amp; Paranormal Tech</h3><table><tr><th>Item</th><th>Gear Bonus</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.investigative.forEach(i => { html += `<tr><td><strong>${i.name}</strong></td><td>${i.bonus}</td><td>${i.enc}</td><td>${i.cl}</td><td>${i.notes||''}</td></tr>`; });
    html += '</table>';
    html += '<h3>Standard Tools &amp; Survival Gear</h3><table><tr><th>Item</th><th>Gear Bonus</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.tools.forEach(i => { html += `<tr><td><strong>${i.name}</strong></td><td>${i.bonus}</td><td>${i.enc}</td><td>${i.cl}</td><td>${i.notes||''}</td></tr>`; });
    html += '</table>';
    html += '<h3>Weapons</h3><table><tr><th>Weapon</th><th>Bonus</th><th>Dmg</th><th>Range</th><th>CL</th><th>Traits</th></tr>';
    NR_DATA.equipment.weapons.forEach(i => { html += `<tr><td><strong>${i.name}</strong></td><td>${i.bonus}</td><td>${i.damage}</td><td>${i.range}</td><td>${i.cl}</td><td>${i.traits}</td></tr>`; });
    html += '</table>';
    html += '<h3>Armor</h3><table><tr><th>Armor</th><th>Rating</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.armor.forEach(i => { html += `<tr><td><strong>${i.name}</strong></td><td>${i.rating}</td><td>${i.enc}</td><td>${i.cl}</td><td>${i.notes}</td></tr>`; });
    html += '</table>';
    html += '<h3>Clearance Levels</h3><table><tr><th>CL</th><th>Access</th></tr>';
    NR_DATA.clearanceLevels.forEach(cl => { html += `<tr><td><strong>CL ${cl.cl}</strong></td><td>${cl.desc}</td></tr>`; });
    html += '</table>';
    container.innerHTML = html;

    const vContainer = document.getElementById('vehicles-ref');
    if (vContainer) {
      let vhtml = '<table><tr><th>Vehicle</th><th>Speed</th><th>AR</th><th>Rel.</th><th>Handling</th><th>Capacity</th></tr>';
      NR_DATA.equipment.vehicles.forEach(v => { vhtml += `<tr><td><strong>${v.name}</strong></td><td>${v.speed}</td><td>${v.ar}</td><td>${v.reliability}</td><td>${v.handling}</td><td>${v.capacity}</td></tr>`; });
      vhtml += '</table>';
      vContainer.innerHTML = vhtml;
    }
  }

  function buildTalentsRef() {
    const container = document.getElementById('talents-ref');
    if (!container) return;
    let html = '<h3>Division Talents</h3>';
    Object.entries(NR_DATA.divisionTalents).forEach(([key, talents]) => {
      const dn = key === 'wayfinder' ? 'Wayfinder' : key === 'recovery' ? 'Recovery' : 'The Keep';
      html += `<h4>${dn}</h4><table><tr><th>Talent</th><th>Cost</th><th>Effect</th></tr>`;
      talents.forEach(t => { html += `<tr><td><strong>${t.name}</strong></td><td>${t.cost}</td><td>${t.effect}</td></tr>`; });
      html += '</table>';
    });
    html += '<h3>Wing / Paradigm / Department Talents</h3>';
    const subLabels = { research:'Wayfinder — Research Wing', counterintel:'Wayfinder — Counterintelligence Wing', exAgency:'Recovery — Ex-Agency Operative', heavyHitter:'Recovery — Heavy-Hitter', acquisition:'Recovery — Acquisition Specialist', catalogers:'The Keep — Catalogers', wardens:'The Keep — Wardens', internalCI:'The Keep — Internal CI', stack:'The Keep — Stack (Logistics)' };
    Object.entries(NR_DATA.subUnitTalents).forEach(([key, talents]) => {
      html += `<h4>${subLabels[key]||key}</h4><table><tr><th>Talent</th><th>Cost</th><th>Effect</th></tr>`;
      talents.forEach(t => { html += `<tr><td><strong>${t.name}</strong></td><td>${t.cost}</td><td>${t.effect}</td></tr>`; });
      html += '</table>';
    });
    html += '<h3>General Talents</h3><table><tr><th>Talent</th><th>Effect</th></tr>';
    NR_DATA.generalTalents.forEach(t => { html += `<tr><td><strong>${t.name}</strong>${t.healing?' <span style="color:var(--green-stamp);font-size:6pt;">(Healing)</span>':''}</td><td>${t.effect}</td></tr>`; });
    html += '</table>';
    html += '<h3>Background Talents (+1 bonus die on listed skill)</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:7pt;">';
    NR_DATA.backgroundTalents.forEach(t => {
      const sn = NR_DATA.skills.find(s=>s.key===t.skill);
      html += `<div style="padding:3px 6px;border-bottom:1px dotted var(--rule-light);"><strong>${t.name}</strong> — +1 ${sn?sn.name:t.skill}<br><span style="color:var(--ink-faded);">${t.desc}</span></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function buildRulesRef() {
    const container = document.getElementById('rules-ref');
    if (!container) return;
    let html = '<h3>Core Resolution</h3><p>Roll <strong>Attribute + Skill + Gear dice</strong> (all d6s). <strong>6s = Success.</strong> Need successes ≥ Difficulty (typically 1). Extra 6s = Stunt Points. <strong>1s on Gear Dice</strong> = gear degradation. Push to reroll non-6, non-1 dice at cost of +1 Corruption.</p>';
    html += '<h3>Corruption Stages</h3><table><tr><th>Range</th><th>Stage</th><th>Effect</th></tr>';
    NR_DATA.corruptionStages.forEach(s => { html += `<tr><td>${s.min===99?'>Max':s.min+'–'+s.max}</td><td><strong>${s.name}</strong></td><td>${s.effect}</td></tr>`; });
    html += '</table>';
    html += '<h3>Burst Ratings</h3><p>Roll <strong>Wits dice only</strong>. 6s = success, 1s = +1 Corruption. Fail = +Burst Rating Corruption + Panic Table.</p><table><tr><th>BR</th><th>Threat</th><th>Examples</th></tr>';
    NR_DATA.burstRatings.forEach(br => { html += `<tr><td><strong>${br.rating}</strong></td><td>${br.threat}</td><td>${br.examples}</td></tr>`; });
    html += '</table>';
    html += '<h3>Panic Table (d6 on failed Burst)</h3><table><tr><th>d6</th><th>Response</th><th>Effect</th></tr>';
    NR_DATA.panicTable.forEach(p => { html += `<tr><td><strong>${p.roll}</strong></td><td>${p.response}</td><td>${p.effect}</td></tr>`; });
    html += '</table>';
    html += '<h3>Healing Corruption</h3><table><tr><th>Method</th><th>Effect</th><th>Requirements</th></tr>';
    html += '<tr><td><strong>Anchor Scene</strong></td><td>Heal 1d4 Corruption</td><td>Once/session. Safe scene.</td></tr>';
    html += '<tr><td><strong>Safe Scene</strong></td><td>Heal 1 Corruption</td><td>Once/session. No threats.</td></tr>';
    html += '<tr><td><strong>Full Rest (24h)</strong></td><td>Heal = Empathy</td><td>Secure location, between Case Files.</td></tr>';
    html += '<tr><td colspan="3"><strong>Session Healing Cap:</strong> Max 5 Corruption from active sources combined.</td></tr>';
    html += '</table>';
    html += '<h3>Encumbrance</h3><p>Carry Capacity = <strong>Strength × 2</strong> Enc. Encumbered: −1 die STR/AGI, Slow Action to move zones. Overloaded (> Strength × 3): cannot move.</p>';
    html += '<h3>Resource Dice</h3><table><tr><th>Die</th><th>Supply Level</th></tr>';
    NR_DATA.resourceDieScale.forEach(r => { html += `<tr><td><strong>${r.die}</strong></td><td>${r.desc}</td></tr>`; });
    html += '</table><p>Roll after each scene of meaningful use. 1–2 = step down.</p>';
    html += '<h3>XP & Advancement</h3><p><strong>Session Debrief:</strong> 5 questions, +1 XP per "yes" (max 5/session). XP is tracked as <strong>Total</strong> (lifetime earned), <strong>Spent</strong> (cumulative purchases), and <strong>Current</strong> (Total − Spent).</p>';
    html += '<table><tr><th>Purchase</th><th>XP Cost</th><th>Limit</th></tr>';
    html += '<tr><td>Increase Skill by 1</td><td>5 XP</td><td>Max rating 5</td></tr>';
    html += '<tr><td>New Talent</td><td>6 XP</td><td>General, Division, or Sub-Unit</td></tr></table>';
    container.innerHTML = html;
  }

  // ═════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════
  return {
    init, saveState, newCharacter, resetSheet, saveToFile, loadFromFile,
    rollDice, pushRoll,
    pickDivision, selectDivision,
    pickSubUnit, selectSubUnit,
    showDivisionItemInfo,
    adjustAttr, adjustSkill,
    pickTalent, selectTalent, switchTalentTab,
    addExtraTalent, addExtraTalentConfirm, removeExtraTalent,
    addGearItem, removeGearItem,
    addResourceDie,
    pickCriticalInjury, addCriticalInjury, removeCriticalInjury,
    printRef
  };
})();

document.addEventListener('DOMContentLoaded', function() { NR.init(); });
