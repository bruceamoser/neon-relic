// Neon Relic — Interactive Agent Dossier
// Application logic, session persistence, dice roller, creation wizard.
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
    divisionItem: '', gear: [], resourceDice: {},
    cl: 1, standing: 0, xp: 0,
    // Track creation state
    creationComplete: false
  };

  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  let wizardCurrentStep = 0;
  let wizardSelections = {};
  let lastRoll = null; // for push

  // ─── INIT ───────────────────────────────────────────────
  function init() {
    loadState();
    buildAttrSkillGrid();
    buildCorruptionTrack();
    buildGearTable();
    buildResourceDice();
    buildWizard();
    buildEquipmentRef();
    buildTalentsRef();
    buildRulesRef();
    renderSheet();
    setupTabNav();
    setupAutoSave();
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
        // Merge with defaults to handle new fields
        state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
        // Deep merge attributes
        if (parsed.attributes) state.attributes = Object.assign({}, DEFAULT_STATE.attributes, parsed.attributes);
        if (parsed.attributeDamage) state.attributeDamage = Object.assign({}, DEFAULT_STATE.attributeDamage, parsed.attributeDamage);
        if (parsed.skills) state.skills = Object.assign({}, parsed.skills);
        if (parsed.resourceDice) state.resourceDice = Object.assign({}, parsed.resourceDice);
      }
    } catch(e) { /* ignore */ }
  }

  function setupAutoSave() {
    // Auto-save on any contenteditable change
    document.addEventListener('input', function(e) {
      if (e.target.contentEditable === 'true' || e.target.getAttribute('contenteditable') === 'true') {
        const field = e.target.getAttribute('data-field');
        if (field) {
          state[field] = e.target.textContent.trim();
          saveState();
          document.getElementById('save-indicator').textContent = '● Saving...';
        }
      }
    });
    // Also save after blurs on editable fields
    document.addEventListener('blur', function(e) {
      if (e.target.contentEditable === 'true' || e.target.getAttribute('contenteditable') === 'true') {
        const field = e.target.getAttribute('data-field');
        if (field) {
          state[field] = e.target.textContent.trim();
          saveState();
        }
      }
    }, true);
  }

  // ─── TOAST ──────────────────────────────────────────────
  function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type === 'warn' ? ' warn' : '');
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => { t.className = 'toast'; }, 2500);
  }

  // ─── SHEET RENDERING ────────────────────────────────────
  function renderSheet() {
    // Identity
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

    // Talents
    setField('talent1name', state.talent1 ? state.talent1.name : '');
    setField('talent1desc', state.talent1 ? state.talent1.effect : '');
    setField('talent2name', state.talent2 ? state.talent2.name : '');
    setField('talent2desc', state.talent2 ? state.talent2.effect : '');
    setField('talent3name', state.talent3 ? state.talent3.name : '');
    setField('talent3desc', state.talent3 ? state.talent3.effect : '');

    // Attributes + skills
    renderAttrSkillGrid();
    renderCorruptionTrack();
    renderResourceDice();
    renderGearTable();
  }

  function setField(field, value) {
    const els = document.querySelectorAll('[data-field="' + field + '"]');
    els.forEach(el => {
      if (el.contentEditable === 'true' || el.getAttribute('contenteditable') === 'true') {
        if (!el.textContent || el.textContent.trim() === '' || el.textContent.trim() === String(value)) {
          el.textContent = value || '';
        }
      } else {
        el.textContent = value || '';
      }
    });
  }

  // ─── ATTRIBUTE/SKILL GRID ───────────────────────────────
  function buildAttrSkillGrid() {
    const grid = document.getElementById('attr-skill-grid');
    if (!grid) return;
    grid.innerHTML = '';
    NR_DATA.attributes.forEach(attr => {
      const skills = NR_DATA.skills.filter(s => s.attr === attr.key);
      const divKey = getDivKey(state.division);
      const isPrimary = divKey && NR_DATA.divisions[divKey] && NR_DATA.divisions[divKey].primaryAttribute === attr.key;

      const col = document.createElement('div');
      col.className = 'attr-skill-col';

      // Attribute box
      const attrBox = document.createElement('div');
      attrBox.className = 'attr-box' + (isPrimary ? ' primary-attr' : '');
      attrBox.innerHTML = `
        <div class="attr-name">${attr.name}</div>
        <div class="attr-score" data-field="attr-${attr.key}">${state.attributes[attr.key]}</div>
        <div class="attr-range">${attr.min} – ${attr.max}</div>
        <div class="attr-dmg-label">${attr.damageLabel}</div>
        <div class="attr-dmg-track" data-dmg="${attr.key}">
          ${Array(attr.max).fill(0).map((_, i) =>
            `<div class="pip${i < state.attributeDamage[attr.key] ? ' filled' : ''}" data-idx="${i}"></div>`
          ).join('')}
        </div>
      `;
      // Click on attribute score to edit
      attrBox.querySelector('.attr-score').addEventListener('click', function() {
        const newVal = prompt('Set ' + attr.name + ' (2–5):', state.attributes[attr.key]);
        if (newVal !== null) {
          const v = parseInt(newVal);
          if (v >= 2 && v <= 5) {
            state.attributes[attr.key] = v;
            saveState();
            renderSheet();
          }
        }
      });
      // Click on damage pips (fill left to right)
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

      // Skill area
      const skillArea = document.createElement('div');
      skillArea.className = 'skill-area';
      skillArea.innerHTML = '<div class="skill-area-header">Skills</div>';
      skills.forEach(skill => {
        const divKey2 = getDivKey(state.division);
        const isKeySkill = divKey2 && NR_DATA.divisions[divKey2] && NR_DATA.divisions[divKey2].keySkill === skill.key;
        const skillVal = state.skills[skill.key] || 0;
        const row = document.createElement('div');
        row.className = 'skill-row';
        row.innerHTML = `
          <span class="skill-name" title="${skill.desc}">${skill.name}</span>
          <div class="skill-box${isKeySkill ? ' key-skill' : ''}" data-skill="${skill.key}">${skillVal || ''}</div>
        `;
        row.querySelector('.skill-box').addEventListener('click', function() {
          const cur = state.skills[skill.key] || 0;
          const maxForSkill = (isKeySkill && state.creationComplete === false) ? 4 : (state.creationComplete ? 5 : 3);
          const next = cur >= maxForSkill ? 0 : cur + 1;
          state.skills[skill.key] = next;
          saveState();
          renderSheet();
        });
        skillArea.appendChild(row);
      });
      col.appendChild(skillArea);
      grid.appendChild(col);
    });
  }

  function renderAttrSkillGrid() {
    const grid = document.getElementById('attr-skill-grid');
    if (!grid) return;
    // Rebuild the whole thing (simpler than reactive updates)
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
        if (state.corruption === i) {
          state.corruption = i - 1; // unmark
        } else {
          state.corruption = i; // mark up to this one
        }
        saveState();
        renderCorruptionTrack();
        renderSheet();
      });
      track.appendChild(pip);
    }
  }

  function renderCorruptionTrack() {
    buildCorruptionTrack();
    // Update stage reference
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

  // ─── GEAR TABLE ─────────────────────────────────────────
  function buildGearTable() {
    const table = document.getElementById('gear-table');
    if (!table) return;
    // Keep header, rebuild body
    const oldRows = table.querySelectorAll('tr:not(:first-child)');
    oldRows.forEach(r => r.remove());

    // Add starting kit items if available
    const divKey = getDivKey(state.division);
    let kitItems = [];
    if (divKey) {
      const div = NR_DATA.divisions[divKey];
      if (state.subUnitKey === 'stack' && div.stackKit) {
        kitItems = div.stackKit;
      } else {
        kitItems = div.startingKit || [];
      }
    }

    // Show existing gear entries + empty rows
    const totalRows = Math.max(10, state.gear.length, kitItems.length);
    for (let i = 0; i < totalRows; i++) {
      const row = document.createElement('tr');
      let itemText = '';
      let bonusText = '';
      let encText = '';

      // Starting kit items first
      if (i < kitItems.length && !state.gear[i]) {
        itemText = kitItems[i];
      }
      // Then custom gear
      if (state.gear[i]) {
        itemText = state.gear[i].name || '';
        bonusText = state.gear[i].bonus || '';
        encText = state.gear[i].enc || '';
      }

      row.innerHTML = `
        <td contenteditable="true" data-gear="${i}" data-field="name">${itemText}</td>
        <td class="center" contenteditable="true" data-gear="${i}" data-field="bonus">${bonusText}</td>
        <td class="center" contenteditable="true" data-gear="${i}" data-field="enc">${encText}</td>
      `;
      table.appendChild(row);
    }

    // Attach listeners for gear edits
    table.querySelectorAll('[contenteditable][data-gear]').forEach(cell => {
      cell.addEventListener('blur', function() {
        const idx = parseInt(this.getAttribute('data-gear'));
        const field = this.getAttribute('data-field');
        if (!state.gear[idx]) state.gear[idx] = { name: '', bonus: '', enc: '' };
        state.gear[idx][field] = this.textContent.trim();
        saveState();
      });
    });
  }

  function renderGearTable() {
    buildGearTable();
  }

  // ─── RESOURCE DICE ──────────────────────────────────────
  function buildResourceDice() {
    const container = document.getElementById('resource-dice');
    if (!container) return;

    const defaults = { ammo: 'd12', medical: 'd10', battery: 'd8', rations: 'd8' };
    const labels = { ammo: 'Ammo', medical: 'Medical', battery: 'Battery', rations: 'Rations' };

    // Merge defaults with state
    Object.keys(defaults).forEach(k => { if (!state.resourceDice[k]) state.resourceDice[k] = defaults[k]; });

    container.innerHTML = '';
    Object.keys(labels).forEach(key => {
      const val = state.resourceDice[key] || defaults[key];
      const wrapper = document.createElement('div');
      wrapper.style.textAlign = 'center';
      wrapper.innerHTML = `
        <div class="corr-label" style="margin-bottom:2px;">${labels[key]}</div>
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

  function renderResourceDice() { buildResourceDice(); }

  function cycleResourceDie(key) {
    const order = ['d12', 'd10', 'd8', 'd6', 'd4', 'Depleted', 'd12'];
    const cur = state.resourceDice[key] || 'd12';
    const idx = order.indexOf(cur);
    state.resourceDice[key] = order[(idx + 1) % order.length];
    saveState();
    renderResourceDice();
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

  function getSubUnitKey(subUnitName) {
    if (!subUnitName) return null;
    const lc = subUnitName.toLowerCase();
    if (lc.includes('research')) return 'research';
    if (lc.includes('counterintel') || lc.includes('counter-intel')) return 'counterintel';
    if (lc.includes('ex-agency') || lc.includes('ex agency')) return 'exAgency';
    if (lc.includes('heavy') || lc.includes('hitter')) return 'heavyHitter';
    if (lc.includes('acquisition')) return 'acquisition';
    if (lc.includes('catalog')) return 'catalogers';
    if (lc.includes('warden')) return 'wardens';
    if (lc.includes('internal ci') || lc.includes('internal counter')) return 'internalCI';
    if (lc.includes('stack') || lc.includes('logistic') || lc.includes('queue')) return 'stack';
    return null;
  }

  function getDivCL(divKey) {
    if (!divKey || !NR_DATA.divisions[divKey]) return 1;
    return NR_DATA.divisions[divKey].baseCL;
  }

  // ─── TAB NAVIGATION ─────────────────────────────────────
  function setupTabNav() {
    const buttons = document.querySelectorAll('#tab-nav button[data-tab]');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Deactivate all
        document.querySelectorAll('#tab-nav button[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        // Activate selected
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
        // Refresh dynamic content when switching tabs
        if (tabId === 'tab-equipment') buildEquipmentRef();
        if (tabId === 'tab-talents') buildTalentsRef();
        if (tabId === 'tab-rules') buildRulesRef();
        if (tabId === 'tab-sheet') renderSheet();
      });
    });
  }

  function switchTab(tabId) {
    const btn = document.querySelector('#tab-nav button[data-tab="' + tabId + '"]');
    if (btn) btn.click();
  }

  // ─── DICE ROLLER ────────────────────────────────────────
  function rollDice(push) {
    const attrDice = parseInt(document.getElementById('dice-attr').value) || 0;
    const skillDice = parseInt(document.getElementById('dice-skill').value) || 0;
    const gearDice = parseInt(document.getElementById('dice-gear').value) || 0;
    const bonusDice = parseInt(document.getElementById('dice-bonus').value) || 0;

    const totalDice = attrDice + skillDice + gearDice + bonusDice;
    if (totalDice === 0) {
      showToast('Add at least one die to roll', 'warn');
      return;
    }

    let dice = [];
    let results = { attribute: [], skill: [], gear: [], bonus: [] };

    // If pushing, re-roll only non-6, non-1 dice (from lastRoll)
    if (push && lastRoll) {
      dice = lastRoll.dice.map(d => {
        if (d === 6 || d === 1) return d;
        return Math.floor(Math.random() * 6) + 1;
      });
      results = lastRoll.results; // keep categories
    } else {
      const rollD6 = () => Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < attrDice; i++) results.attribute.push(rollD6());
      for (let i = 0; i < skillDice; i++) results.skill.push(rollD6());
      for (let i = 0; i < gearDice; i++) results.gear.push(rollD6());
      for (let i = 0; i < bonusDice; i++) results.bonus.push(rollD6());
      dice = [...results.attribute, ...results.skill, ...results.gear, ...results.bonus];
    }

    const sixes = dice.filter(d => d === 6).length;
    const ones = dice.filter(d => d === 1).length;
    const gearOnes = results.gear.filter(d => d === 1).length;

    lastRoll = { dice, results, attrDice, skillDice, gearDice, bonusDice };

    // Display results
    const poolDisplay = document.getElementById('dice-pool-display');
    poolDisplay.innerHTML = dice.map(d => {
      let cls = '';
      if (d === 6) cls = 'success';
      else if (d === 1) cls = 'fail';
      return `<div class="die ${cls}">${d}</div>`;
    }).join('');

    const resultDisplay = document.getElementById('roll-result');
    resultDisplay.style.display = 'block';
    let resultHTML = `<span class="success-count">${sixes} success${sixes !== 1 ? 'es' : ''}</span>`;
    if (push) resultHTML += ' <span style="color:#d4a017;">(pushed)</span>';
    if (gearOnes > 0) {
      resultHTML += ` &nbsp;|&nbsp; <span class="bane-count">☠ ${gearOnes} Gear Die 1${gearOnes > 1 ? 's' : ''} — degradation risk!</span>`;
    }
    resultHTML += `<br><small>${totalDice} dice rolled | ${sixes} sixes | ${ones} ones</small>`;
    if (push) resultHTML += `<br><small style="color:var(--red-stamp);">⚠ Push cost: +1 Corruption</small>`;
    resultDisplay.innerHTML = resultHTML;

    // Enable/disable push button
    document.getElementById('btn-push').disabled = false;
  }

  function pushRoll() {
    if (!lastRoll) return;
    // Track corruption for push
    if (state.creationComplete) {
      state.corruption += 1;
      saveState();
      renderSheet();
    }
    rollDice(true);
  }

  // ─── NEW CHARACTER ──────────────────────────────────────
  function newCharacter() {
    if (state.name || state.division) {
      if (!confirm('Start a new character? Current data will be saved in session storage and overwritten.')) return;
    }
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    wizardSelections = {};
    wizardCurrentStep = 0;
    lastRoll = null;
    saveState();
    renderSheet();
    buildWizard();
    switchTab('tab-create');
    showToast('New agent dossier opened');
  }

  function resetSheet() {
    if (!confirm('Clear ALL character data? This cannot be undone.')) return;
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    wizardSelections = {};
    wizardCurrentStep = 0;
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
    a.href = url;
    a.download = `neon-relic-${agentName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Character saved to file');
  }

  function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
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
          saveState();
          renderSheet();
          showToast('Character loaded from file');
        } catch(err) {
          showToast('Invalid character file', 'warn');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  // ═════════════════════════════════════════════════════════
  // CREATION WIZARD
  // ═════════════════════════════════════════════════════════

  function buildWizard() {
    const progress = document.getElementById('wizard-progress');
    const steps = document.getElementById('wizard-steps');
    if (!progress || !steps) return;

    // Build progress dots
    const stepLabels = ['Division', 'Dept', 'Age', 'Attr', 'Skills', 'Talents', 'Gear', 'Anchor', 'Name'];
    progress.innerHTML = stepLabels.map((l, i) =>
      `<div class="step-dot${i === wizardCurrentStep ? ' active' : ''}${wizardSelections['step' + i] ? ' done' : ''}" title="${l}">${i + 1}</div>`
    ).join('');

    // Build step content
    steps.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'wizard-step' + (i === wizardCurrentStep ? ' active' : '');
      stepDiv.id = 'wiz-step-' + i;
      stepDiv.innerHTML = buildWizardStepContent(i);
      steps.appendChild(stepDiv);
    }

    updateWizardNav();
  }

  function buildWizardStepContent(step) {
    switch(step) {
      case 0: return buildStepDivision();
      case 1: return buildStepDepartment();
      case 2: return buildStepAgeGroup();
      case 3: return buildStepAttributes();
      case 4: return buildStepSkills();
      case 5: return buildStepTalents();
      case 6: return buildStepGear();
      case 7: return buildStepAnchor();
      case 8: return buildStepName();
      default: return '';
    }
  }

  function buildStepDivision() {
    let html = '<div class="wizard-step-title">Choose Your Division</div>';
    html += '<p style="font-size:8pt; margin-bottom:12px; color:var(--ink-faded);">Your Division is your character class. It defines your role within the Covenant, your primary attribute, your starting skills, and your access to supernatural Division Talents.</p>';
    html += '<div class="option-cards cols-3">';
    Object.entries(NR_DATA.divisions).forEach(([key, div]) => {
      const sel = wizardSelections.division === key ? ' selected' : '';
      html += `
        <div class="option-card${sel}" data-div="${key}" onclick="NR.wizardSelectDivision('${key}')">
          <div class="card-title">${div.name}</div>
          <div class="card-motto">"${div.motto}"</div>
          <div class="card-desc">${div.role}</div>
          <div class="card-stats">Primary: ${div.primaryAttribute.toUpperCase()} &bull; Key Skill: ${NR_DATA.skills.find(s=>s.key===div.keySkill).name} &bull; Base CL: ${div.baseCL}</div>
        </div>`;
    });
    html += '</div>';
    return html;
  }

  function buildStepDepartment() {
    const divKey = wizardSelections.division;
    if (!divKey) return '<p>Select a Division first.</p>';
    const div = NR_DATA.divisions[divKey];
    const subLabel = div.subUnits.label;
    let html = `<div class="wizard-step-title">Choose Your ${subLabel}</div>`;
    html += `<p style="font-size:8pt; margin-bottom:12px; color:var(--ink-faded);">Within the ${div.name} Division, choose your ${subLabel.toLowerCase()} and specialty.</p>`;
    html += '<div class="option-cards cols-2">';
    Object.entries(div.subUnits.options).forEach(([key, opt]) => {
      const sel = wizardSelections.subUnit === key ? ' selected' : '';
      html += `
        <div class="option-card${sel}" data-sub="${key}" onclick="NR.wizardSelectSubUnit('${key}')">
          <div class="card-title">${opt.name}</div>
          <div class="card-desc">${opt.description}</div>
          <div style="font-size:7pt; margin-top:4px; color:var(--ink-faded);">Specialties: ${opt.specialties.join(', ')}</div>
          ${opt.isStack ? '<div style="font-size:7pt; color:var(--green-stamp); margin-top:3px;">+1 requisition die for crafting materials</div>' : ''}
        </div>`;
    });
    html += '</div>';
    if (wizardSelections.subUnit) {
      const subOpt = div.subUnits.options[wizardSelections.subUnit];
      html += '<div style="margin-top:12px;"><label style="font-size:7pt; text-transform:uppercase; letter-spacing:1px;">Choose Specialty:</label>';
      html += '<select id="wiz-specialty" style="display:block; font-family:var(--font-fill); padding:4px; margin-top:4px; width:100%;" onchange="NR.wizardSelectSpecialty(this.value)">';
      html += '<option value="">— Select —</option>';
      subOpt.specialties.forEach(s => {
        html += `<option value="${s}" ${wizardSelections.specialty === s ? 'selected' : ''}>${s}</option>`;
      });
      html += '</select></div>';
    }
    return html;
  }

  function buildStepAgeGroup() {
    let html = '<div class="wizard-step-title">Choose Your Age Group</div>';
    html += '<p style="font-size:8pt; margin-bottom:12px; color:var(--ink-faded);">Younger characters are physically sharper (more attribute points); older characters are more skilled and better connected (more skill points and higher clearance).</p>';
    html += '<div class="option-cards cols-3">';
    Object.entries(NR_DATA.ageGroups).forEach(([key, ag]) => {
      const sel = wizardSelections.ageGroup === key ? ' selected' : '';
      html += `
        <div class="option-card${sel}" data-age="${key}" onclick="NR.wizardSelectAgeGroup('${key}')">
          <div class="card-title">${ag.name}</div>
          <div class="card-desc">Age: ${ag.ageRange}</div>
          <div class="card-stats">${ag.attrPoints} Attr Pts &bull; ${ag.skillPoints} Skill Pts &bull; CL ${ag.clMod >= 0 ? '+' + ag.clMod : ag.clMod}</div>
        </div>`;
    });
    html += '</div>';
    return html;
  }

  function buildStepAttributes() {
    const agKey = wizardSelections.ageGroup;
    if (!agKey) return '<p>Select an Age Group first.</p>';
    const ag = NR_DATA.ageGroups[agKey];
    const attrs = wizardSelections.attributes || { strength: 2, agility: 2, wits: 2, empathy: 2 };
    const spent = Object.values(attrs).reduce((a, b) => a + b, 0);
    const remaining = ag.attrPoints - spent;
    let html = `<div class="wizard-step-title">Distribute Attribute Points</div>`;
    html += `<p style="font-size:8pt; margin-bottom:4px; color:var(--ink-faded);">You have <strong>${ag.attrPoints} Attribute Points</strong>. Each attribute minimum: 2, maximum: 5.</p>`;
    html += `<div class="points-remaining${remaining < 0 ? ' warning' : ''}">Points remaining: <strong>${remaining}</strong></div>`;
    NR_DATA.attributes.forEach(attr => {
      const val = attrs[attr.key] || 2;
      const divKey = wizardSelections.division;
      const isPrimary = divKey && NR_DATA.divisions[divKey] && NR_DATA.divisions[divKey].primaryAttribute === attr.key;
      html += `
        <div class="stat-control">
          <span class="stat-label">${attr.name} ${isPrimary ? '★' : ''}</span>
          <button onclick="NR.wizardAdjustAttr('${attr.key}', -1)" ${val <= 2 ? 'disabled' : ''}>−</button>
          <span class="stat-val">${val}</span>
          <button onclick="NR.wizardAdjustAttr('${attr.key}', 1)" ${val >= 5 || remaining <= 0 ? 'disabled' : ''}>+</button>
          <span style="font-size:7pt; color:var(--ink-faded);">${attr.description}</span>
        </div>`;
    });
    if (isPrimary) html += '<p style="font-size:6pt; color:var(--green-stamp); margin-top:4px;">★ Division Favorite Attribute — recommended 4–5</p>';
    return html;
  }

  function buildStepSkills() {
    const agKey = wizardSelections.ageGroup;
    const divKey = wizardSelections.division;
    if (!agKey || !divKey) return '<p>Select Age Group and Division first.</p>';
    const ag = NR_DATA.ageGroups[agKey];
    const div = NR_DATA.divisions[divKey];
    const skills = wizardSelections.skills || {};
    const spent = Object.values(skills).reduce((a, b) => a + b, 0);
    const remaining = ag.skillPoints - spent;
    let html = `<div class="wizard-step-title">Distribute Skill Points</div>`;
    html += `<p style="font-size:8pt; margin-bottom:4px; color:var(--ink-faded);">You have <strong>${ag.skillPoints} Skill Points</strong>. No skill may exceed 3, except your Division Key Skill (${NR_DATA.skills.find(s=>s.key===div.keySkill).name}) which may reach 4.</p>`;
    html += `<div class="points-remaining${remaining < 0 ? ' warning' : ''}">Points remaining: <strong>${remaining}</strong></div>`;
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">';
    NR_DATA.skills.forEach(skill => {
      const isKey = skill.key === div.keySkill;
      const maxForSkill = isKey ? 4 : 3;
      const val = skills[skill.key] || 0;
      const attrName = NR_DATA.attributes.find(a => a.key === skill.attr).abbr;
      html += `
        <div class="stat-control" style="margin-bottom:2px;">
          <span class="stat-label" style="width:90px; font-size:7pt;" title="${skill.desc}">${skill.name} ${isKey ? '★' : ''} <small style="color:var(--ink-light);">${attrName}</small></span>
          <button onclick="NR.wizardAdjustSkill('${skill.key}', -1)" ${val <= 0 ? 'disabled' : ''} style="width:20px;height:20px;font-size:8pt;">−</button>
          <span class="stat-val" style="width:26px;height:22px;font-size:10pt;line-height:20px;">${val}</span>
          <button onclick="NR.wizardAdjustSkill('${skill.key}', 1)" ${val >= maxForSkill || remaining <= 0 ? 'disabled' : ''} style="width:20px;height:20px;font-size:8pt;">+</button>
        </div>`;
    });
    html += '</div>';
    html += '<p style="font-size:6pt; color:var(--green-stamp); margin-top:4px;">★ Division Key Skill — may start at 4</p>';
    return html;
  }

  function buildStepTalents() {
    const divKey = wizardSelections.division;
    const subKey = wizardSelections.subUnit;
    if (!divKey || !subKey) return '<p>Select Division and Department first.</p>';
    let html = '<div class="wizard-step-title">Choose Your Starting Talents</div>';
    html += '<p style="font-size:7pt; color:var(--ink-faded); margin-bottom:8px;">Select one talent from each category below.</p>';

    // Slot 1: Division Talent OR General Talent
    html += '<div style="margin-bottom:10px;"><strong style="font-size:8pt;">Slot 1: Division Talent — OR — General Talent</strong>';
    html += '<div style="display:flex; gap:8px; margin-top:4px;">';
    html += '<select id="wiz-talent1" style="flex:1; font-family:var(--font-fill); font-size:7pt; padding:3px;" onchange="NR.wizardSelectTalent(1, this.value)">';
    html += '<option value="">— Choose —</option>';
    html += '<optgroup label="Division Talents">';
    (NR_DATA.divisionTalents[divKey] || []).forEach((t, i) => {
      html += `<option value="div:${i}" ${wizardSelections.talent1 === 'div:'+i ? 'selected' : ''}>${t.name} [${t.cost}]</option>`;
    });
    html += '</optgroup><optgroup label="General Talents">';
    NR_DATA.generalTalents.forEach((t, i) => {
      html += `<option value="gen:${i}" ${wizardSelections.talent1 === 'gen:'+i ? 'selected' : ''}>${t.name}${t.healing ? ' (Healing)' : ''}</option>`;
    });
    html += '</optgroup></select>';
    html += '<div id="talent1-preview" style="flex:1; font-size:6.5pt; color:var(--ink-faded);"></div>';
    html += '</div></div>';

    // Slot 2: Wing/Paradigm/Department Talent
    const subTalents = NR_DATA.subUnitTalents[subKey] || [];
    html += '<div style="margin-bottom:10px;"><strong style="font-size:8pt;">Slot 2: Wing / Paradigm / Department Talent</strong>';
    html += '<select id="wiz-talent2" style="width:100%; font-family:var(--font-fill); font-size:7pt; padding:3px; margin-top:4px;" onchange="NR.wizardSelectTalent(2, this.value)">';
    html += '<option value="">— Choose —</option>';
    subTalents.forEach((t, i) => {
      html += `<option value="${i}" ${wizardSelections.talent2 === String(i) ? 'selected' : ''}>${t.name} [${t.cost}]</option>`;
    });
    html += '</select>';
    html += '<div id="talent2-preview" style="font-size:6.5pt; color:var(--ink-faded); margin-top:2px;"></div>';
    html += '</div>';

    // Slot 3: Background Talent
    html += '<div style="margin-bottom:10px;"><strong style="font-size:8pt;">Slot 3: Background Talent</strong>';
    html += '<select id="wiz-talent3" style="width:100%; font-family:var(--font-fill); font-size:7pt; padding:3px; margin-top:4px;" onchange="NR.wizardSelectTalent(3, this.value)">';
    html += '<option value="">— Choose —</option>';
    NR_DATA.backgroundTalents.forEach((t, i) => {
      const skillName = NR_DATA.skills.find(s => s.key === t.skill);
      html += `<option value="${i}" ${wizardSelections.talent3 === String(i) ? 'selected' : ''}>${t.name} (+1 ${skillName ? skillName.name : t.skill})</option>`;
    });
    html += '</select>';
    html += '<div id="talent3-preview" style="font-size:6.5pt; color:var(--ink-faded); margin-top:2px;"></div>';
    html += '</div>';

    return html;
  }

  function buildStepGear() {
    const divKey = wizardSelections.division;
    if (!divKey) return '<p>Select a Division first.</p>';
    const div = NR_DATA.divisions[divKey];
    const isStack = wizardSelections.subUnit === 'stack';
    const kit = isStack && div.stackKit ? div.stackKit : div.startingKit;
    let html = '<div class="wizard-step-title">Statistics &amp; Starting Gear</div>';

    // Calculated stats
    const agKey = wizardSelections.ageGroup;
    const ag = agKey ? NR_DATA.ageGroups[agKey] : null;
    const clMod = ag ? ag.clMod : 0;
    const baseCL = div.baseCL;
    const cl = Math.max(1, baseCL + clMod);
    const empathy = (wizardSelections.attributes && wizardSelections.attributes.empathy) || 2;
    const maxCorr = 10 + empathy;

    html += '<div style="display:flex; gap:16px; margin-bottom:12px;">';
    html += `<div class="stat-box"><div class="corr-label">Clearance Level</div><div class="stat-value">${cl}</div></div>`;
    html += `<div class="stat-box"><div class="corr-label">Corruption</div><div class="stat-value">0</div></div>`;
    html += `<div class="stat-box corruption-threshold"><div class="corr-label">Max Corruption</div><div class="stat-value">${maxCorr}</div></div>`;
    html += `<div class="stat-box"><div class="corr-label">Division Item</div><div style="font-size:7pt; margin-top:2px; font-weight:bold;">${div.divisionItem.name}</div></div>`;
    html += '</div>';

    html += '<div style="font-size:8pt; margin-bottom:6px;"><strong>Starting Kit:</strong></div>';
    html += '<ul style="font-size:7pt; color:var(--ink-faded); padding-left:16px; margin-bottom:12px;">';
    kit.forEach(item => { html += `<li>${item}</li>`; });
    html += '</ul>';

    if (isStack) {
      html += '<p style="font-size:6pt; color:var(--green-stamp); margin-bottom:8px;">★ Stack Department Variant: Replaces standard Keep kit with logistics/engineering gear. +1 requisition die for crafting materials during Equipping Phase.</p>';
    }

    return html;
  }

  function buildStepAnchor() {
    let html = '<div class="wizard-step-title">Choose Your Anchor</div>';
    html += '<p style="font-size:8pt; margin-bottom:8px; color:var(--ink-faded);">Your Anchor is a personal source of solace — a practice, habit, or connection that grounds you against the psychological toll of Covenant work. Once per session, dedicate a scene to your Anchor to heal 1d4 Corruption.</p>';
    html += '<p style="font-size:7pt; margin-bottom:8px;">Choose from the list below or invent your own:</p>';
    html += '<div style="max-height:300px; overflow-y:auto; border:1px solid var(--rule); margin-bottom:12px;">';
    NR_DATA.anchorSources.forEach(src => {
      const sel = wizardSelections.anchor === src.category ? ' selected' : '';
      html += `
        <div class="talent-item${sel}" onclick="NR.wizardSelectAnchor('${src.category.replace(/'/g, "\\'")}')">
          <strong>${src.roll}</strong> — ${src.category}<br>
          <span style="color:var(--ink-faded);">${src.examples}</span>
        </div>`;
    });
    html += '</div>';
    html += '<div class="field" style="margin-top:8px;">';
    html += '<div class="field-label">Or write your own Anchor:</div>';
    html += `<input type="text" id="wiz-custom-anchor" value="${wizardSelections.customAnchor || ''}" placeholder="Describe your source of solace..." style="width:100%; font-family:var(--font-fill); padding:4px; border:1px solid var(--rule);" onchange="NR.wizardCustomAnchor(this.value)">`;
    html += '</div>';
    return html;
  }

  function buildStepName() {
    let html = '<div class="wizard-step-title">Name, Origin &amp; Biography</div>';
    html += '<div class="field" style="margin-bottom:10px;">';
    html += '<div class="field-label">Agent Name (Surname, First)</div>';
    html += `<input type="text" id="wiz-name" value="${wizardSelections.agentName || ''}" placeholder="e.g., Vasquez, Petra" style="width:100%; font-family:var(--font-fill); padding:6px; border:1px solid var(--rule); font-size:11pt;">`;
    html += '</div>';
    html += '<div class="field" style="margin-bottom:10px;">';
    html += '<div class="field-label">Country of Origin</div>';
    html += `<input type="text" id="wiz-origin" value="${wizardSelections.origin || ''}" placeholder="e.g., Colombia" style="width:100%; font-family:var(--font-fill); padding:6px; border:1px solid var(--rule); font-size:11pt;">`;
    html += '</div>';
    html += '<div class="field">';
    html += '<div class="field-label">Biography — Who were you before the Covenant? What incident drew their attention?</div>';
    html += `<textarea id="wiz-bio" rows="3" style="width:100%; font-family:var(--font-fill); padding:6px; border:1px solid var(--rule); font-size:9pt; resize:vertical;">${wizardSelections.bio || ''}</textarea>`;
    html += '</div>';
    html += '<p style="font-size:6pt; color:var(--green-stamp); margin-top:10px;">★ Completion: Click "Finish" below to save your agent and view the character sheet.</p>';
    return html;
  }

  // ─── WIZARD SELECTIONS ──────────────────────────────────
  function wizardSelectDivision(key) {
    if (wizardSelections.division === key) return; // no-op if same
    wizardSelections.division = key;
    wizardSelections.subUnit = null;
    wizardSelections.specialty = null;
    wizardSelections.talent1 = null;
    wizardSelections.talent2 = null;
    // Pre-fill skills/attributes
    wizardSelections.attributes = { strength: 2, agility: 2, wits: 2, empathy: 2 };
    wizardSelections.skills = {};
    buildWizard();
  }

  function wizardSelectSubUnit(key) {
    wizardSelections.subUnit = key;
    wizardSelections.specialty = null;
    wizardSelections.talent2 = null;
    buildWizard();
  }

  function wizardSelectSpecialty(val) {
    wizardSelections.specialty = val;
  }

  function wizardSelectAgeGroup(key) {
    if (wizardSelections.ageGroup === key) return; // no-op if same
    wizardSelections.ageGroup = key;
    wizardSelections.attributes = { strength: 2, agility: 2, wits: 2, empathy: 2 };
    wizardSelections.skills = {};
    buildWizard();
  }

  function wizardAdjustAttr(attrKey, delta) {
    if (!wizardSelections.attributes) wizardSelections.attributes = { strength: 2, agility: 2, wits: 2, empathy: 2 };
    const agKey = wizardSelections.ageGroup;
    if (!agKey) return;
    const ag = NR_DATA.ageGroups[agKey];
    const current = wizardSelections.attributes[attrKey] || 2;
    const newVal = current + delta;
    if (newVal < 2 || newVal > 5) return;
    const spent = Object.values(wizardSelections.attributes).reduce((a, b) => a + b, 0) + delta;
    if (spent > ag.attrPoints) return;
    wizardSelections.attributes[attrKey] = newVal;
    buildWizard();
  }

  function wizardAdjustSkill(skillKey, delta) {
    if (!wizardSelections.skills) wizardSelections.skills = {};
    const agKey = wizardSelections.ageGroup;
    const divKey = wizardSelections.division;
    if (!agKey || !divKey) return;
    const ag = NR_DATA.ageGroups[agKey];
    const div = NR_DATA.divisions[divKey];
    const skill = NR_DATA.skills.find(s => s.key === skillKey);
    const isKey = skill.key === div.keySkill;
    const maxForSkill = isKey ? 4 : 3;
    const current = wizardSelections.skills[skillKey] || 0;
    const newVal = current + delta;
    if (newVal < 0 || newVal > maxForSkill) return;
    const spent = Object.values(wizardSelections.skills).reduce((a, b) => a + b, 0) + delta;
    if (spent > ag.skillPoints) return;
    wizardSelections.skills[skillKey] = newVal;
    buildWizard();
  }

  function wizardSelectTalent(slot, value) {
    wizardSelections['talent' + slot] = value;
    // Update preview
    const divKey = wizardSelections.division;
    const subKey = wizardSelections.subUnit;
    setTimeout(() => {
      if (slot === 1 && value) {
        const [type, idx] = value.split(':');
        let talent;
        if (type === 'div') talent = (NR_DATA.divisionTalents[divKey] || [])[parseInt(idx)];
        else talent = NR_DATA.generalTalents[parseInt(idx)];
        const preview = document.getElementById('talent1-preview');
        if (preview && talent) preview.innerHTML = `<em>${talent.effect}</em> <span class="talent-cost${talent.cost === '—' || talent.cost.includes('Healing') ? ' free' : ''}">${talent.cost}</span>`;
      }
      if (slot === 2 && value && subKey) {
        const talent = (NR_DATA.subUnitTalents[subKey] || [])[parseInt(value)];
        const preview = document.getElementById('talent2-preview');
        if (preview && talent) preview.innerHTML = `<em>${talent.effect}</em> <span class="talent-cost${talent.cost === '—' || talent.cost.includes('Healing') ? ' free' : ''}">${talent.cost}</span>`;
      }
      if (slot === 3 && value) {
        const talent = NR_DATA.backgroundTalents[parseInt(value)];
        const preview = document.getElementById('talent3-preview');
        if (preview && talent) {
          const skillName = NR_DATA.skills.find(s => s.key === talent.skill);
          preview.innerHTML = `+1 ${skillName ? skillName.name : talent.skill}. <em>${talent.desc}</em>`;
        }
      }
    }, 50);
  }

  function wizardSelectAnchor(category) {
    wizardSelections.anchor = category;
    wizardSelections.customAnchor = '';
    buildWizard();
  }

  function wizardCustomAnchor(val) {
    wizardSelections.customAnchor = val;
    if (val) wizardSelections.anchor = val;
  }

  // ─── WIZARD NAVIGATION ──────────────────────────────────
  function wizardPrev() {
    if (wizardCurrentStep > 0) {
      wizardCurrentStep--;
      buildWizard();
    }
  }

  function wizardNext() {
    if (wizardCurrentStep < 8) {
      wizardCurrentStep++;
      buildWizard();
    } else {
      finishWizard();
    }
  }

  function finishWizard() {
    // Commit wizard selections to state
    const divKey = wizardSelections.division;
    if (!divKey) { showToast('Select a Division first', 'warn'); return; }
    const div = NR_DATA.divisions[divKey];
    const subKey = wizardSelections.subUnit;
    if (!subKey) { showToast('Select a Department/Paradigm/Wing first', 'warn'); return; }
    const subOpt = div.subUnits.options[subKey];
    const agKey = wizardSelections.ageGroup;
    if (!agKey) { showToast('Select an Age Group first', 'warn'); return; }
    const ag = NR_DATA.ageGroups[agKey];

    // Name from inputs
    const nameEl = document.getElementById('wiz-name');
    const originEl = document.getElementById('wiz-origin');
    const bioEl = document.getElementById('wiz-bio');
    const name = nameEl ? nameEl.value.trim() : '';
    const origin = originEl ? originEl.value.trim() : '';
    const bio = bioEl ? bioEl.value.trim() : '';

    // Set state
    state.name = name || 'Unnamed Agent';
    state.division = div.name;
    state.subUnit = subOpt.name;
    state.subUnitKey = subKey;
    state.specialty = wizardSelections.specialty || '';
    state.ageGroup = ag.name;
    state.age = '';
    state.origin = origin;
    state.bio = bio;
    state.attributes = wizardSelections.attributes || { strength: 2, agility: 2, wits: 2, empathy: 2 };
    state.attributeDamage = { strength: 0, agility: 0, wits: 0, empathy: 0 };
    state.skills = wizardSelections.skills || {};
    state.corruption = 0;
    state.cl = Math.max(1, div.baseCL + ag.clMod);
    state.divisionItem = div.divisionItem.name;
    state.anchor = wizardSelections.customAnchor || wizardSelections.anchor || '';
    state.armorRating = divKey === 'keep' ? 1 : 0; // Warden's Bracer gives +1

    // Resolve talents
    if (wizardSelections.talent1) {
      const [type, idx] = wizardSelections.talent1.split(':');
      if (type === 'div') {
        state.talent1 = (NR_DATA.divisionTalents[divKey] || [])[parseInt(idx)] || null;
      } else {
        state.talent1 = NR_DATA.generalTalents[parseInt(idx)] || null;
      }
    }
    if (wizardSelections.talent2 && subKey) {
      state.talent2 = (NR_DATA.subUnitTalents[subKey] || [])[parseInt(wizardSelections.talent2)] || null;
    }
    if (wizardSelections.talent3) {
      state.talent3 = NR_DATA.backgroundTalents[parseInt(wizardSelections.talent3)] || null;
    }

    // Set gear from starting kit
    const isStack = subKey === 'stack';
    const kit = isStack && div.stackKit ? div.stackKit : div.startingKit;
    state.gear = kit.map(item => ({ name: item, bonus: '', enc: '' }));
    state.resourceDice = { ammo: 'd12', medical: 'd10', battery: 'd8', rations: 'd8' };
    state.creationComplete = true;

    saveState();
    renderSheet();
    switchTab('tab-sheet');
    showToast('Agent dossier complete! ✦');
  }

  function updateWizardNav() {
    const prevBtn = document.getElementById('wiz-prev');
    const nextBtn = document.getElementById('wiz-next');
    const label = document.getElementById('wiz-step-label');
    if (prevBtn) prevBtn.disabled = wizardCurrentStep === 0;
    if (nextBtn) {
      if (wizardCurrentStep === 8) {
        nextBtn.textContent = '✓ Finish';
      } else {
        nextBtn.textContent = 'Next →';
      }
    }
    if (label) label.textContent = `Step ${wizardCurrentStep + 1} of 9`;
  }

  // ═════════════════════════════════════════════════════════
  // EQUIPMENT REFERENCE TAB
  // ═════════════════════════════════════════════════════════
  function buildEquipmentRef() {
    const container = document.getElementById('equipment-ref');
    if (!container) return;

    let html = '';

    // Investigative & Paranormal Tech
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Investigative &amp; Paranormal Tech</h3>';
    html += '<table><tr><th>Item</th><th>Gear Bonus</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.investigative.forEach(item => {
      html += `<tr><td><strong>${item.name}</strong></td><td>${item.bonus}</td><td>${item.enc}</td><td>${item.cl}</td><td>${item.notes || ''}</td></tr>`;
    });
    html += '</table>';

    // Tools & Survival
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Standard Tools &amp; Survival Gear</h3>';
    html += '<table><tr><th>Item</th><th>Gear Bonus</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.tools.forEach(item => {
      html += `<tr><td><strong>${item.name}</strong></td><td>${item.bonus}</td><td>${item.enc}</td><td>${item.cl}</td><td>${item.notes || ''}</td></tr>`;
    });
    html += '</table>';

    // Weapons
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Weapons</h3>';
    html += '<table><tr><th>Weapon</th><th>Bonus</th><th>Dmg</th><th>Range</th><th>CL</th><th>Traits</th></tr>';
    NR_DATA.equipment.weapons.forEach(item => {
      html += `<tr><td><strong>${item.name}</strong></td><td>${item.bonus}</td><td>${item.damage}</td><td>${item.range}</td><td>${item.cl}</td><td>${item.traits}</td></tr>`;
    });
    html += '</table>';

    // Armor
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Armor</h3>';
    html += '<table><tr><th>Armor</th><th>Rating</th><th>Enc.</th><th>CL</th><th>Notes</th></tr>';
    NR_DATA.equipment.armor.forEach(item => {
      html += `<tr><td><strong>${item.name}</strong></td><td>${item.rating}</td><td>${item.enc}</td><td>${item.cl}</td><td>${item.notes}</td></tr>`;
    });
    html += '</table>';

    // Clearance Levels
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Clearance Levels</h3>';
    html += '<table><tr><th>CL</th><th>Access</th></tr>';
    NR_DATA.clearanceLevels.forEach(cl => {
      html += `<tr><td><strong>CL ${cl.cl}</strong></td><td>${cl.desc}</td></tr>`;
    });
    html += '</table>';

    container.innerHTML = html;

    // Vehicles
    const vContainer = document.getElementById('vehicles-ref');
    if (vContainer) {
      let vhtml = '<table><tr><th>Vehicle</th><th>Speed</th><th>AR</th><th>Rel.</th><th>Handling</th><th>Capacity</th></tr>';
      NR_DATA.equipment.vehicles.forEach(v => {
        vhtml += `<tr><td><strong>${v.name}</strong></td><td>${v.speed}</td><td>${v.ar}</td><td>${v.reliability}</td><td>${v.handling}</td><td>${v.capacity}</td></tr>`;
      });
      vhtml += '</table>';
      vContainer.innerHTML = vhtml;
    }
  }

  // ═════════════════════════════════════════════════════════
  // TALENTS REFERENCE TAB
  // ═════════════════════════════════════════════════════════
  function buildTalentsRef() {
    const container = document.getElementById('talents-ref');
    if (!container) return;

    let html = '';

    // Division Talents
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Division Talents</h3>';
    Object.entries(NR_DATA.divisionTalents).forEach(([key, talents]) => {
      const divName = key === 'wayfinder' ? 'Wayfinder' : key === 'recovery' ? 'Recovery' : 'The Keep';
      html += `<h4 style="font-size:8pt; color:var(--green-stamp); margin:8px 0 4px;">${divName}</h4>`;
      html += '<table><tr><th>Talent</th><th>Cost</th><th>Effect</th></tr>';
      talents.forEach(t => {
        html += `<tr><td><strong>${t.name}</strong></td><td>${t.cost}</td><td>${t.effect}</td></tr>`;
      });
      html += '</table>';
    });

    // Sub-Unit Talents
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Wing / Paradigm / Department Talents</h3>';
    const subLabels = {
      research: 'Wayfinder — Research Wing',
      counterintel: 'Wayfinder — Counterintelligence Wing',
      exAgency: 'Recovery — Ex-Agency Operative',
      heavyHitter: 'Recovery — Heavy-Hitter',
      acquisition: 'Recovery — Acquisition Specialist',
      catalogers: 'The Keep — Catalogers',
      wardens: 'The Keep — Wardens',
      internalCI: 'The Keep — Internal CI',
      stack: 'The Keep — Stack (Logistics)'
    };
    Object.entries(NR_DATA.subUnitTalents).forEach(([key, talents]) => {
      html += `<h4 style="font-size:8pt; color:var(--green-stamp); margin:8px 0 4px;">${subLabels[key] || key}</h4>`;
      html += '<table><tr><th>Talent</th><th>Cost</th><th>Effect</th></tr>';
      talents.forEach(t => {
        html += `<tr><td><strong>${t.name}</strong></td><td>${t.cost}</td><td>${t.effect}</td></tr>`;
      });
      html += '</table>';
    });

    // General Talents
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">General Talents</h3>';
    html += '<table><tr><th>Talent</th><th>Effect</th></tr>';
    NR_DATA.generalTalents.forEach(t => {
      html += `<tr><td><strong>${t.name}</strong>${t.healing ? ' <span style="color:var(--green-stamp); font-size:6pt;">(Healing)</span>' : ''}</td><td>${t.effect}</td></tr>`;
    });
    html += '</table>';

    // Background Talents
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Background Talents (+1 bonus die on listed skill)</h3>';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:7pt;">';
    NR_DATA.backgroundTalents.forEach(t => {
      const skillName = NR_DATA.skills.find(s => s.key === t.skill);
      html += `<div style="padding:3px 6px; border-bottom:1px dotted var(--rule-light);"><strong>${t.name}</strong> — +1 ${skillName ? skillName.name : t.skill}<br><span style="color:var(--ink-faded);">${t.desc}</span></div>`;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // ═════════════════════════════════════════════════════════
  // RULES REFERENCE TAB
  // ═════════════════════════════════════════════════════════
  function buildRulesRef() {
    const container = document.getElementById('rules-ref');
    if (!container) return;
    let html = '';

    // Core Resolution
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:8px 0 6px;">Core Resolution</h3>';
    html += '<p style="font-size:7.5pt;">Roll <strong>Attribute Dice + Skill Dice + Gear Dice</strong> (all d6s). <strong>6s = Success.</strong> You need successes ≥ Difficulty (typically 1). Extra 6s become <strong>Stunt Points</strong>. <strong>1s on Gear Dice</strong> = gear degradation. Push to reroll non-6, non-1 dice at cost of +1 Corruption.</p>';

    // Corruption
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Corruption Stages</h3>';
    html += '<table><tr><th>Range</th><th>Stage</th><th>Effect</th></tr>';
    NR_DATA.corruptionStages.forEach(s => {
      const range = s.min === 99 ? '>Max' : `${s.min}–${s.max}`;
      html += `<tr><td>${range}</td><td><strong>${s.name}</strong></td><td>${s.effect}</td></tr>`;
    });
    html += '</table>';

    // Burst Ratings
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Corruption Burst Ratings</h3>';
    html += '<p style="font-size:7pt;">Roll <strong>Wits dice only</strong>. 6s = success, 1s = +1 Corruption. Fail = +Burst Rating Corruption + Panic Table.</p>';
    html += '<table><tr><th>BR</th><th>Threat</th><th>Examples</th></tr>';
    NR_DATA.burstRatings.forEach(br => {
      html += `<tr><td><strong>${br.rating}</strong></td><td>${br.threat}</td><td>${br.examples}</td></tr>`;
    });
    html += '</table>';

    // Panic Table
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Panic Table (d6 on failed Burst)</h3>';
    html += '<table><tr><th>d6</th><th>Response</th><th>Effect</th></tr>';
    NR_DATA.panicTable.forEach(p => {
      html += `<tr><td><strong>${p.roll}</strong></td><td>${p.response}</td><td>${p.effect}</td></tr>`;
    });
    html += '</table>';

    // Healing
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Healing Corruption</h3>';
    html += '<table><tr><th>Method</th><th>Effect</th><th>Requirements</th></tr>';
    html += '<tr><td><strong>Anchor Scene</strong></td><td>Heal 1d4 Corruption</td><td>Once/session. Active engagement with Anchor in safe scene.</td></tr>';
    html += '<tr><td><strong>Safe Scene Recovery</strong></td><td>Heal 1 Corruption</td><td>Once/session. Quiet scene with no threats. Must be different scene than Anchor.</td></tr>';
    html += '<tr><td><strong>Full Rest (24 hrs)</strong></td><td>Heal Corruption = Empathy</td><td>24-hour cycle in secure, non-anomalous location. Between Case Files typically.</td></tr>';
    html += '<tr><td><strong>Healing Talents</strong></td><td>Varies</td><td>See talent descriptions.</td></tr>';
    html += '<tr><td colspan="3"><strong>Session Healing Cap:</strong> Maximum 5 Corruption healed from active in-session sources combined. Full Rest not subject to cap.</td></tr>';
    html += '</table>';

    // Skill Stunts
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Skill Stunts (selected)</h3>';
    html += '<p style="font-size:7pt;"><strong>Generic Stunts:</strong> Faster (1), Quieter (1), Precise (1), Aid (1), Extended Effect (2), Additional Target (2) — available on any skill.</p>';
    Object.entries(NR_DATA.stunts).forEach(([skill, stunts]) => {
      const skillName = NR_DATA.skills.find(s => s.key === skill);
      html += `<h4 style="font-size:8pt; margin:6px 0 2px;">${skillName ? skillName.name : skill}</h4>`;
      html += '<table><tr><th>Cost</th><th>Stunt</th><th>Effect</th></tr>';
      stunts.forEach(st => {
        html += `<tr><td>${st.cost}</td><td><strong>${st.name}</strong></td><td>${st.effect}</td></tr>`;
      });
      html += '</table>';
    });

    // Encumbrance
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Encumbrance</h3>';
    html += '<p style="font-size:7pt;">Carry Capacity = <strong>Strength × 2</strong> Enc. points. Encumbered (> capacity): −1 die on STR/AGI rolls, moving zones costs Slow Action. Overloaded (> Strength × 3): cannot move to different zone.</p>';

    // Resource Dice
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">Resource Dice</h3>';
    html += '<table><tr><th>Die</th><th>Supply Level</th></tr>';
    NR_DATA.resourceDieScale.forEach(r => {
      html += `<tr><td><strong>${r.die}</strong></td><td>${r.desc}</td></tr>`;
    });
    html += '</table>';
    html += '<p style="font-size:7pt;">After each scene of meaningful use, roll Resource Die. Result 1–2 = step down (d12→d10→d8→d6→d4→Depleted).</p>';

    // XP
    html += '<h3 style="font-family:var(--font-main); font-size:9pt; border-bottom:1px solid var(--rule); padding-bottom:2px; margin:16px 0 6px;">XP & Advancement</h3>';
    html += '<p style="font-size:7pt;"><strong>Session Debrief:</strong> 5 questions, +1 XP per "yes" (max 5 XP/session).</p>';
    html += '<table><tr><th>Purchase</th><th>XP Cost</th><th>Limit</th></tr>';
    html += '<tr><td>Increase Skill by 1</td><td>5 XP</td><td>Max rating 5</td></tr>';
    html += '<tr><td>New Talent</td><td>6 XP</td><td>General, Division, or Sub-Unit</td></tr>';
    html += '<tr><td>Requisition Authority talent</td><td>6 XP</td><td>Repeatable; +1 personal CL (max 5)</td></tr>';
    html += '</table>';

    container.innerHTML = html;
  }

  // ═════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════
  return {
    init,
    saveState,
    newCharacter,
    resetSheet,
    saveToFile,
    loadFromFile,
    rollDice,
    pushRoll,
    // Wizard
    wizardPrev,
    wizardNext,
    wizardSelectDivision,
    wizardSelectSubUnit,
    wizardSelectSpecialty,
    wizardSelectAgeGroup,
    wizardAdjustAttr,
    wizardAdjustSkill,
    wizardSelectTalent,
    wizardSelectAnchor,
    wizardCustomAnchor,
    switchTab
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', function() { NR.init(); });
