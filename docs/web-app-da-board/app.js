// Neon Relic — DA Operations Board
// Interactive game-running tool for the Director of Agents.
// Revealing module pattern following NRCharGen conventions.

const NR = (function() {
  'use strict';

  // --- INTERNAL EVENT BUS ---
  const Events = {
    _listeners: {},
    on(event, fn) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(fn);
    },
    off(event, fn) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    },
    emit(event, data) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(fn => { try { fn(data); } catch(e) { console.error(e); } });
    }
  };

  // --- STATE MANAGER ---
  const STORAGE_KEY = 'nr-da-board-state';
  const MAX_UNDO = 50;

  let _state = null;
  let _undoStack = [];
  let _redoStack = [];
  let _subscribers = {};
  let _saveTimeout = null;
  let _lastRoll = null;

  function _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function _getNested(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }

  function _setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  function _autoSave() {
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
      try {
        _state.lastSaved = new Date().toISOString();
        const serialized = JSON.stringify(_state);
        localStorage.setItem(STORAGE_KEY, serialized);
        const indicator = document.getElementById('save-indicator');
        if (indicator) indicator.textContent = '● Saved ' + new Date().toLocaleTimeString();
      } catch(e) {
        if (e.name === 'QuotaExceededError' || e.message.indexOf('quota') !== -1) {
          ToastNotifier.show('Storage full! Export your case and clear old data.', 'warn', 5000);
        } else {
          ToastNotifier.show('Could not save state: ' + e.message, 'warn');
        }
      }
    }, 500);
  }

  function _pushUndo() {
    _undoStack.push(_deepClone(_state.case));
    if (_undoStack.length > MAX_UNDO) _undoStack.shift();
    _redoStack = [];
  }

  const StateManager = {
    init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          _state = JSON.parse(saved);
          // Ensure new fields exist in loaded state
          if (!_state.agents) _state.agents = [];
          if (!_state.combat) _state.combat = { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged','Near','Far','Distant'], notes: '' };
          if (!_state.social) _state.social = { activeInteractions: [] };
          if (!_state.sessionLog) _state.sessionLog = [];
        } else {
          _state = NR_DATA.getDefaultState();
        }
      } catch(e) {
        // Corrupted state recovery
        console.warn('State corrupted, resetting to defaults:', e.message);
        ToastNotifier.show('Saved state was corrupted. Reset to defaults.', 'warn', 4000);
        _state = NR_DATA.getDefaultState();
      }
      _undoStack = _state.undoStack || [];
      _redoStack = _state.redoStack || [];
      _state.undoStack = _undoStack;
      _state.redoStack = _redoStack;
      _autoSave();
    },

    getState() { return _deepClone(_state); },
    getCase() { return _deepClone(_state.case); },

    getRawState() { return _state; },

    update(path, value, skipUndo) {
      if (!skipUndo) _pushUndo();
      _setNested(_state, path, value);
      _autoSave();
      _notifySubscribers(path);
    },

    updateCase(caseData, skipUndo) {
      if (!skipUndo) _pushUndo();
      _state.case = _deepClone(caseData);
      _autoSave();
      _notifySubscribers('case');
    },

    replaceState(newState, skipUndo) {
      if (!skipUndo) _pushUndo();
      _state = _deepClone(newState);
      _undoStack = _state.undoStack || [];
      _redoStack = _state.redoStack || [];
      _autoSave();
      _notifySubscribers('*');
    },

    subscribe(path, fn) {
      if (!_subscribers[path]) _subscribers[path] = [];
      _subscribers[path].push(fn);
      return () => this.unsubscribe(path, fn);
    },

    unsubscribe(path, fn) {
      if (!_subscribers[path]) return;
      _subscribers[path] = _subscribers[path].filter(f => f !== fn);
    },

    undo() {
      if (_undoStack.length === 0) { ToastNotifier.show('Nothing to undo', 'info'); return; }
      _redoStack.push(_deepClone(_state.case));
      _state.case = _undoStack.pop();
      _state.undoStack = _undoStack;
      _state.redoStack = _redoStack;
      _autoSave();
      ToastNotifier.show('Undo', 'info');
      SessionLogger.log('state', 'Undo');
      BoardRenderer.render();
      PressureMeter.render();
    },

    redo() {
      if (_redoStack.length === 0) { ToastNotifier.show('Nothing to redo', 'info'); return; }
      _undoStack.push(_deepClone(_state.case));
      _state.case = _redoStack.pop();
      _state.undoStack = _undoStack;
      _state.redoStack = _redoStack;
      _autoSave();
      ToastNotifier.show('Redo', 'info');
      SessionLogger.log('state', 'Redo');
      BoardRenderer.render();
      PressureMeter.render();
    },

    serializeState() {
      const exp = { formatVersion: '1.0.0', exportedAt: new Date().toISOString(), state: _deepClone(_state) };
      return JSON.stringify(exp, null, 2);
    },

    deserializeState(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        const fullState = parsed.state || parsed;
        if (!fullState.case || !fullState.case.organizations) throw new Error('Unrecognized format');
        return fullState;
      } catch(e) {
        throw new Error('Deserialization failed: ' + e.message);
      }
    },

    importCase(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        let caseData = parsed.case || parsed;
        if (!caseData.organizations) throw new Error('Unrecognized format');
        CaseLoader.validate(caseData);
        _pushUndo();
        _state.case = _deepClone(caseData);
        _autoSave();
        ToastNotifier.show('Case imported: ' + (caseData.caseName || 'Unnamed'), 'success');
        SessionLogger.log('state', 'Case imported: ' + (caseData.caseName || 'Unnamed'));
        BoardRenderer.render();
        PressureMeter.render();
        return true;
      } catch(e) {
        ToastNotifier.show('Import failed: ' + e.message, 'warn');
        return false;
      }
    },

    resetCase() {
      if (!confirm('Reset the entire board? This cannot be undone.')) return;
      _pushUndo();
      _state.case = _deepClone(NR_DATA.BLANK_CASE);
      _autoSave();
      ToastNotifier.show('Board reset to blank', 'info');
      SessionLogger.log('state', 'Board reset to blank');
      BoardRenderer.render();
      PressureMeter.render();
    }
  };

  function _notifySubscribers(path) {
    if (_subscribers[path]) _subscribers[path].forEach(fn => { try { fn(); } catch(e) { console.error(e); } });
    if (_subscribers['*']) _subscribers['*'].forEach(fn => { try { fn(); } catch(e) { console.error(e); } });
  }

  // --- CASE LOADER ---
  const CaseLoader = {
    loadBlank() {
      StateManager.replaceState(NR_DATA.getDefaultState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Blank board loaded', 'info');
      SessionLogger.log('state', 'Blank board loaded');
    },

    loadSpearOfDestiny() {
      StateManager.replaceState(NR_DATA.getSpearOfDestinyState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Spear That Went Dark', 'success');
      SessionLogger.log('state', 'Loaded: The Spear That Went Dark');
    },

    loadHeavenlyCrucifix() {
      StateManager.replaceState(NR_DATA.getHeavenlyCrucifixState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Heavenly Crucifix', 'success');
      SessionLogger.log('state', 'Loaded: The Heavenly Crucifix');
    },

    loadBarbariansCup() {
      StateManager.replaceState(NR_DATA.getBarbariansCupState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Barbarian\'s Cup', 'success');
      SessionLogger.log('state', 'Loaded: The Barbarian\'s Cup');
    },

    loadBoudicaPact() {
      StateManager.replaceState(NR_DATA.getBoudicaPactState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Boudica Pact', 'success');
      SessionLogger.log('state', 'Loaded: The Boudica Pact');
    },

    loadCormsilCompact() {
      StateManager.replaceState(NR_DATA.getCormsilCompactState());
      BoardRenderer.render();
      AgentTracker.renderRoster();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Cormsil Compact', 'success');
      SessionLogger.log('state', 'Loaded: The Cormsil Compact');
    },

    validate(caseData) {
      const errors = [];
      if (!caseData.organizations || !Array.isArray(caseData.organizations)) {
        errors.push('Missing organizations array');
      } else {
        if (caseData.organizations.length > 8) errors.push('Maximum 8 organizations');
        caseData.organizations.forEach((org, i) => {
          if (!org.id) errors.push('Organization ' + (i+1) + ' missing id');
          if (org.value < 0 || org.value > 14) errors.push('Organization ' + (i+1) + ' value out of range (0-14)');
        });
      }
      if (errors.length > 0) throw new Error(errors.join('; '));
      return { valid: true, errors: [] };
    }
  };

  // --- BOARD RENDERER ---
  const BoardRenderer = {
    _boardEl: null,

    render() {
      this._boardEl = document.getElementById('board-tbody');
      if (!this._boardEl) return;
      const c = _state.case;
      const currentDay = this._getCurrentDay();
      let html = '';

      html += '<tr class="shift-row">';
      html += '<td class="label-col"><div class="shift-label">Shifts</div><div class="shift-sublabel">M / D / E / N per day</div></td>';
      for (let day = 14; day >= 1; day--) {
        const shiftsForDay = (c.shiftsFilled || []).filter(s => s.day === day);
        html += '<td><div class="quad-grid">';
        ['M', 'D', 'E', 'N'].forEach(shift => {
          const filled = shiftsForDay.some(s => s.shift === shift && s.filled);
          html += '<div class="quad' + (filled ? ' filled' : '') + '" data-day="' + day + '" data-shift="' + shift + '" title="Click to ' + (filled ? 'unfill' : 'fill') + ' Day ' + day + ' ' + shift + ' shift" role="button" aria-label="Day ' + day + ' ' + shift + ' shift, ' + (filled ? 'filled' : 'empty') + '" tabindex="0">' + shift + '</div>';
        });
        html += '</div></td>';
      }
      html += '</tr>';

      html += '<tr class="ms-row">';
      html += '<td class="label-col">Relic Milestones</td>';
      for (let day = 14; day >= 1; day--) {
        const ms = (c.relicMilestones || []).find(m => m.day === day);
        const dayFilled = BoardRenderer._isDayComplete(day);
        html += '<td class="ms-cell' + (dayFilled ? ' ms-triggered' : '') + (ms ? ' has-ms' : '') + '" data-day="' + day + '" role="button" aria-label="Day ' + day + ' relic milestone' + (ms ? ', ' + ms.description.substring(0, 40) : '') + '"' + (ms ? ' title="Day ' + day + ' Relic Milestone — click for details"' : '') + '>';
        if (ms) html += '<span class="ms-badge" title="Relic Milestone D.' + day + ' — click for details">D.' + day + '</span>';
        html += '</td>';
      }
      html += '</tr>';

      html += '<tr class="sep-row"><td class="label-col"></td><td colspan="14"></td></tr>';

      (c.organizations || []).forEach(org => {
        html += '<tr class="org-row" data-org="' + org.id + '" role="row">';
        html += '<td class="label-col">';
        html += '<div class="org-info">';
        html += '<span class="org-num" title="Click for ' + org.id + ' reference" data-org="' + org.id + '">' + org.id + '</span>';
        html += '<div class="org-name-field" contenteditable="true" data-org="' + org.id + '" data-field="name" role="textbox" aria-label="Organization ' + org.id + ' name" title="Edit name (double-click for ' + org.id + ' reference)">' + (org.name || '') + '</div>';
        html += '</div>';
        html += '<div class="org-meta">';
        html += '<div class="org-val-box"><span class="org-val-label">Val</span>';
        html += '<div class="org-val-field" contenteditable="true" data-org="' + org.id + '" data-field="value" role="textbox" aria-label="Organization ' + org.id + ' value">' + (org.value || '') + '</div></div>';
        html += '<span class="status-label" title="Toggle Active/Dormant for ' + org.id + '"><span class="checkbox' + (org.active ? ' checked' : '') + '" data-org="' + org.id + '" data-toggle="active" role="checkbox" aria-checked="' + (org.active ? 'true' : 'false') + '" aria-label="Active" tabindex="0" title="' + (org.active ? 'Deactivate' : 'Activate') + ' ' + org.id + '"></span> Active</span>';
        html += '<span class="status-label" title="Toggle Dormant for ' + org.id + '"><span class="checkbox' + (org.dormant ? ' checked' : '') + '" data-org="' + org.id + '" data-toggle="dormant" role="checkbox" aria-checked="' + (org.dormant ? 'true' : 'false') + '" aria-label="Dormant" tabindex="0" title="' + (org.dormant ? 'Undormant' : 'Set dormant') + ' ' + org.id + '"></span> Dormant</span>';
        html += '</div></td>';

        for (let col = 14; col >= 1; col--) {
          const consumed = (org.squaresConsumed || []).includes(col);
          const milestone = (org.milestones || []).find(m => m.day === col);
          let classes = 'sq';
          if (consumed) classes += ' consumed';
          if (milestone) classes += ' ms';
          if (col === currentDay) classes += ' col-current-day';
          const msLabel = milestone ? milestone.label : '';
          html += '<td class="' + classes + '" data-org="' + org.id + '" data-col="' + col + '"' + (milestone ? ' data-ms="' + msLabel + '"' : '') + ' title="' + (org.name || org.id) + ' — ' + (consumed ? 'Click to undo column ' + col : 'Click to escalate to column ' + col) + (milestone ? ' | Milestone: ' + msLabel : '') + '" role="button" aria-label="' + (org.name || org.id) + ' column ' + col + (consumed ? ' consumed' : '') + (milestone ? ' milestone ' + msLabel : '') + '" tabindex="0">';
          if (milestone) html += '<span class="ms-label" title="' + msLabel + ' milestone — click for details">' + msLabel + '</span>';
          html += '</td>';
        }
        html += '</tr>';
      });

      this._boardEl.innerHTML = html;
      this.renderHeader();
      this.highlightCurrentDayColumn(currentDay);
      this.renderFooter();
    },

    renderHeader() {
      const caseIdEl = document.getElementById('case-id-display');
      const caseNameEl = document.getElementById('case-name-display');
      const regionEl = document.getElementById('case-region-display');
      if (caseIdEl) caseIdEl.textContent = _state.case.caseId || '_____________';
      if (caseNameEl) caseNameEl.textContent = _state.case.caseName || 'Untitled Case';
      if (regionEl) regionEl.textContent = _state.case.region || '';
      // Update "Days Until Catastrophe" header with current day
      const currentDay = this._getCurrentDay();
      const labelTh = document.querySelector('.board thead th.label-col');
      if (labelTh) {
        labelTh.setAttribute('title', 'Current day: ' + currentDay + '. ' + (currentDay <= 3 ? 'URGENT — catastrophe imminent!' : currentDay <= 7 ? 'Pressure building.' : 'Time remains.'));
      }
    },

    renderFooter() {
      const footerEl = document.getElementById('board-footer');
      if (footerEl) {
        footerEl.innerHTML = '<span>VC-19 - The Verdant Covenant - DA Use Only</span><span>Neon Relic &copy; 2025</span><span>Operations Board' + (_state.case.caseName ? ' - ' + _state.case.caseName : '') + '</span>';
      }
    },

    _isDayComplete(day) {
      const shifts = (_state.case.shiftsFilled || []).filter(s => s.day === day && s.filled);
      return shifts.length >= 4;
    },

    _getCurrentDay() {
      const c = _state.case;
      let maxFilledDay = 14;
      for (let day = 14; day >= 1; day--) {
        const filled = (c.shiftsFilled || []).filter(s => s.day === day && s.filled).length;
        if (filled === 4) maxFilledDay = day - 1;
        else break;
      }
      return Math.max(1, maxFilledDay);
    },

    highlightCurrentDayColumn(currentDay) {
      // Remove previous highlights
      document.querySelectorAll('.col-current-day-header, .shift-row .col-current-day, .ms-row .col-current-day, .sep-row .col-current-day').forEach(el => {
        el.classList.remove('col-current-day-header', 'col-current-day');
      });
      // Highlight header
      const dayHeaders = document.querySelectorAll('.day-header-clickable');
      dayHeaders.forEach(th => {
        const dayNum = parseInt(th.textContent.trim());
        if (dayNum === currentDay) {
          th.classList.add('col-current-day-header');
        }
      });
      // Highlight shift row cells
      const shiftRow = document.querySelector('.shift-row');
      if (shiftRow) {
        const cells = shiftRow.querySelectorAll('td');
        // Day columns are in reverse order: 14 down to 1, starting from index 1 (after label)
        cells.forEach((cell, i) => {
          if (i > 0) {
            const day = 15 - i; // index 1 = day 14, index 2 = day 13, etc.
            if (day === currentDay) cell.classList.add('col-current-day');
          }
        });
      }
      // Highlight ms row cells
      const msRow = document.querySelector('.ms-row');
      if (msRow) {
        const cells = msRow.querySelectorAll('td');
        cells.forEach((cell, i) => {
          if (i > 0) {
            const day = 15 - i;
            if (day === currentDay) cell.classList.add('col-current-day');
          }
        });
      }
    },

    highlightOrg(orgId) {
      const row = document.querySelector('.org-row[data-org="' + orgId + '"]');
      if (row) {
        row.classList.add('highlight-pulse');
        setTimeout(() => row.classList.remove('highlight-pulse'), 1500);
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // --- CLOCK MANAGER ---
  const ClockManager = {
    fillShift(day, shiftQuadrant) {
      if (SandboxMode.isActive() && SandboxMode._snapshot === null) {
        SandboxMode._snapshot = _deepClone(_state);
      }
      const c = _state.case;
      if (!c.shiftsFilled) c.shiftsFilled = [];
      const existing = c.shiftsFilled.find(s => s.day === day && s.shift === shiftQuadrant);
      if (existing && existing.filled) {
        existing.filled = false;
        StateManager.update('case.shiftsFilled', c.shiftsFilled, false);
        BoardRenderer.render();
        PressureMeter.render();
        Events.emit('shift:unfilled', { day, shift: shiftQuadrant });
        SessionLogger.log('shift', 'Day ' + day + ' ' + shiftQuadrant + ' unfilled');
        return;
      }
      if (existing) { existing.filled = true; }
      else { c.shiftsFilled.push({ day: day, shift: shiftQuadrant, filled: true, undertaking: '' }); }
      StateManager.update('case.shiftsFilled', c.shiftsFilled, false);
      BoardRenderer.render();
      PressureMeter.render();
      Events.emit('shift:filled', { day, shift: shiftQuadrant });
      SessionLogger.log('shift', 'Day ' + day + ' ' + shiftQuadrant + ' filled');
      if (BoardRenderer._isDayComplete(day)) { ClockManager.checkRelicMilestones(day); }
      _announceAriaLive('Day ' + day + ' ' + shiftQuadrant + ' shift filled.');
    },

    advanceOrg(orgId) {
      if (SandboxMode.isActive() && SandboxMode._snapshot === null) {
        SandboxMode._snapshot = _deepClone(_state);
      }
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org || (!org.active && !org.dormant)) return;
      if (org.dormant && !org.active) {
        ToastNotifier.show(orgId + ' is dormant. Activate it first.', 'warn');
        return;
      }
      if (!org.squaresConsumed) org.squaresConsumed = [];
      for (let col = 14; col >= 1; col--) {
        if (!org.squaresConsumed.includes(col)) {
          org.squaresConsumed.push(col);
          org.squaresConsumed.sort((a, b) => b - a);
          StateManager.update('case.organizations', c.organizations, false);
          BoardRenderer.render();
          PressureMeter.render();
          Events.emit('org:escalated', { orgId, col });
          SessionLogger.log('escalation', (org.name || orgId) + ' advanced to column ' + col);
          _announceAriaLive((org.name || orgId) + ' escalated to column ' + col + '.');
          ClockManager.checkOrgMilestone(orgId, col);
          return;
        }
      }
      ToastNotifier.show(orgId + ' has no remaining squares.', 'info');
    },

    unadvanceOrg(orgId) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org || !org.squaresConsumed || org.squaresConsumed.length === 0) return;
      const nonPast = org.squaresConsumed.filter(c => c <= org.value);
      if (nonPast.length === 0) { ToastNotifier.show('Cannot undo past starting value squares.', 'warn'); return; }
      const toRemove = Math.min(...nonPast);
      org.squaresConsumed = org.squaresConsumed.filter(c => c !== toRemove);
      StateManager.update('case.organizations', c.organizations, false);
      BoardRenderer.render();
      PressureMeter.render();
      Events.emit('org:unescalated', { orgId, col: toRemove });
    },

    checkDayCompletion(day) { return BoardRenderer._isDayComplete(day); },

    checkRelicMilestones(day) {
      const c = _state.case;
      const ms = (c.relicMilestones || []).find(m => m.day === day);
      if (!ms) return;
      ModalManager.openMilestone({ type: 'relic', day: day, description: ms.description, title: 'Relic Milestone - Day ' + day, crossAdvances: ms.crossAdvances || [] });
      Events.emit('milestone:fired', { type: 'relic', day, description: ms.description });
      SessionLogger.log('milestone', 'Relic Milestone fired: Day ' + day);
      _announceAriaLive('Relic milestone triggered on day ' + day + '.');
    },

    checkOrgMilestone(orgId, col) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) return;
      const ms = (org.milestones || []).find(m => m.day === col && !m.triggered);
      if (!ms) return;
      ms.triggered = true;
      StateManager.update('case.organizations', c.organizations, false);
      ModalManager.openMilestone({ type: 'org', orgId: orgId, orgName: org.name, label: ms.label, day: col, description: ms.description, title: ms.label + ' - ' + (org.name || orgId), crossAdvances: ms.crossAdvances || [] });
      Events.emit('milestone:fired', { type: 'org', orgId, label: ms.label, day: col, description: ms.description });
      SessionLogger.log('milestone', (org.name || orgId) + ' milestone ' + ms.label + ' fired at column ' + col);
      _announceAriaLive('Organization milestone ' + ms.label + ' triggered.');
    },

    executeCrossAdvance(targetOrg, squares) {
      const c = _state.case;
      for (let i = 0; i < squares; i++) {
        const org = (c.organizations || []).find(o => o.id === targetOrg);
        if (!org) continue;
        if (org.dormant && !org.active) { org.dormant = false; org.active = true; ToastNotifier.show(targetOrg + ' activated from dormant.', 'info'); }
        ClockManager.advanceOrgWithoutUndo(targetOrg);
      }
    },

    advanceOrgWithoutUndo(orgId) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) return;
      if (!org.active && !org.dormant) return;
      if (org.dormant && !org.active) { org.dormant = false; org.active = true; }
      if (!org.squaresConsumed) org.squaresConsumed = [];
      for (let col = 14; col >= 1; col--) {
        if (!org.squaresConsumed.includes(col)) {
          org.squaresConsumed.push(col);
          org.squaresConsumed.sort((a, b) => b - a);
          StateManager.update('case.organizations', c.organizations, true);
          ClockManager.checkOrgMilestone(orgId, col);
          return;
        }
      }
      ToastNotifier.show((org.name || orgId) + ' has no remaining squares.', 'info');
    },

    toggleActive(orgId) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) return;
      org.active = !org.active;
      if (org.active) org.dormant = false;
      StateManager.update('case.organizations', c.organizations, false);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show(orgId + ' ' + (org.active ? 'activated' : 'deactivated'), 'info');
    },

    toggleDormant(orgId) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) return;
      org.dormant = !org.dormant;
      if (org.dormant) org.active = false;
      StateManager.update('case.organizations', c.organizations, false);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show(orgId + ' ' + (org.dormant ? 'set to dormant' : 'no longer dormant'), 'info');
    }
  };

  // --- PRESSURE METER ---
  const PressureMeter = {
    _visible: false,
    _stripEl: null,

    init() {
      this._stripEl = document.getElementById('pressure-strip');
      this.render();
    },

    toggle() {
      this._visible = !this._visible;
      if (this._stripEl) this._stripEl.style.display = this._visible ? 'block' : 'none';
      if (this._visible) this.render();
    },

    render() {
      if (!this._stripEl) return;
      if (!this._visible) { this._stripEl.style.display = 'none'; return; }
      const c = _state.case;
      const orgs = (c.organizations || []).filter(o => o.name);
      const maxDay = 14;
      const currentDay = this._computeCurrentDay();
      const daysRemaining = currentDay;

      let pressureColor, pressureBg;
      if (daysRemaining >= 10) { pressureColor = '#2d5a27'; pressureBg = 'rgba(45,90,39,0.08)'; }
      else if (daysRemaining >= 6) { pressureColor = '#a68a1a'; pressureBg = 'rgba(166,138,26,0.08)'; }
      else if (daysRemaining >= 3) { pressureColor = '#cc6600'; pressureBg = 'rgba(204,102,0,0.08)'; }
      else { pressureColor = '#8b1a1a'; pressureBg = 'rgba(139,26,26,0.08)'; }

      let html = '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:4px 8px; background:' + pressureBg + '; border-bottom:2px solid ' + pressureColor + ';">';
      html += '<div style="font-family:var(--font-main); font-size:12px; text-transform:uppercase; letter-spacing:1px; color:' + pressureColor + '; display:flex; align-items:center; gap:6px;">';
      html += '<span>Days Until Catastrophe:</span>';
      html += '<span style="font-family:var(--font-fill); font-size:22px; font-weight:bold;">' + daysRemaining + '</span>';
      html += '<span style="font-size:10px;">/ ' + maxDay + '</span></div>';
      const pct = Math.round((daysRemaining / maxDay) * 100);
      html += '<div style="flex:1; min-width:120px; height:14px; background:rgba(0,0,0,0.08); border:1px solid var(--rule); position:relative; border-radius:2px;">';
      html += '<div style="position:absolute; left:0; top:0; height:100%; width:' + pct + '%; background:' + pressureColor + '; transition:width 0.5s ease; border-radius:1px;"></div></div>';
      html += '<span style="font-size:10px; color:var(--ink-faded);">' + pct + '%</span>';
      const activeOrgs = orgs.filter(o => o.active || o.dormant);
      if (activeOrgs.length > 0) {
        html += '<div style="display:flex; gap:4px; flex-wrap:wrap; margin-left:10px;">';
        activeOrgs.forEach(org => {
          const val = org.value || 0;
          const consumed = (org.squaresConsumed || []).length;
          const remaining = Math.max(0, 14 - consumed);
          const orgPct = val > 0 ? Math.round((remaining / val) * 100) : 100;
          const orgColor = orgPct > 80 ? '#2d5a27' : orgPct > 40 ? '#a68a1a' : '#8b1a1a';
          html += '<div style="text-align:center;" title="' + (org.name || org.id) + ': ' + remaining + ' remain">';
          html += '<div style="font-size:9px; color:var(--ink-faded);">' + org.id + '</div>';
          html += '<div style="width:24px; height:6px; background:rgba(0,0,0,0.06); border:1px solid var(--rule-light);">';
          html += '<div style="height:100%; width:' + orgPct + '%; background:' + orgColor + ';"></div></div></div>';
        });
        html += '</div>';
      }
      html += '</div>';
      this._stripEl.innerHTML = html;
      this._stripEl.style.display = 'block';
    },

    _computeCurrentDay() {
      const c = _state.case;
      let maxFilledDay = 14;
      for (let day = 14; day >= 1; day--) {
        const filled = (c.shiftsFilled || []).filter(s => s.day === day && s.filled).length;
        if (filled === 4) maxFilledDay = day - 1;
        else break;
      }
      return Math.max(1, maxFilledDay);
    }
  };

  // --- CHAIN VISUALIZER ---
  const ChainVisualizer = {
    visualize(milestoneData) {
      const title = milestoneData.title || 'Milestone Chain';
      let content = '<div class="chain-visualizer">';
      content += '<div style="font-family:var(--font-main); font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--ink); margin-bottom:10px; border-bottom:1px solid var(--rule); padding-bottom:4px;">Cascade Preview</div>';
      content += '<div style="text-align:center; margin-bottom:12px;">';
      content += '<div style="display:inline-block; border:2px solid ' + (milestoneData.type === 'relic' ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; padding:6px 14px; font-family:var(--font-main); font-size:13px; letter-spacing:1px;">';
      content += milestoneData.type === 'relic' ? ('Relic Milestone - Day ' + milestoneData.day) : (milestoneData.label || 'Milestone');
      content += '</div>';
      content += '<div style="font-size:11px; color:var(--ink-faded); margin-top:4px;">' + (milestoneData.description || '') + '</div></div>';
      if (milestoneData.crossAdvances && milestoneData.crossAdvances.length > 0) {
        content += '<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">';
        milestoneData.crossAdvances.forEach((ca, i) => {
          const targetOrg = (_state.case.organizations || []).find(o => o.id === ca.targetOrg);
          const orgName = targetOrg ? (targetOrg.name || ca.targetOrg) : ca.targetOrg;
          const consumed = targetOrg ? (targetOrg.squaresConsumed || []).length : 0;
          const currentCol = 14 - consumed;
          const newCol = Math.max(1, currentCol - ca.squares);
          content += '<div style="display:flex; align-items:center; gap:8px;">';
          if (i > 0) content += '<div style="width:20px; text-align:center; font-size:14px; color:var(--ink-light);">+</div>';
          else content += '<div style="font-size:18px; color:var(--red-stamp);">v</div>';
          content += '<div style="border:1px solid var(--rule); padding:6px 10px; background:var(--field-bg); display:flex; align-items:center; gap:8px;">';
          content += '<span style="font-family:var(--font-fill); font-size:12px; font-weight:bold;">' + orgName + '</span>';
          content += '<span style="font-size:10px; color:var(--ink-faded);">col ' + currentCol + '</span>';
          content += '<span style="font-size:12px; color:var(--red-stamp);">-></span>';
          content += '<span style="font-size:10px; color:var(--red-stamp);">col ' + newCol + '</span>';
          content += '<span style="font-size:11px; color:var(--green-stamp);">+ ' + ca.squares + ' square' + (ca.squares > 1 ? 's' : '') + '</span></div>';
          if (targetOrg && targetOrg.milestones) {
            const hitMs = targetOrg.milestones.find(m => m.day === newCol && !m.triggered);
            if (hitMs) content += '<span style="font-size:11px; color:var(--red-stamp); font-weight:bold;">' + hitMs.label + ' fires!</span>';
          }
          content += '</div>';
        });
        content += '</div>';
      }
      content += '<div style="margin-top:12px; padding:8px; background:rgba(139,26,26,0.04); border:1px dashed var(--red-stamp); font-size:10px; color:var(--ink-faded);">Preview only. Execute cross-advances from milestone detail.</div>';
      content += '</div>';
      ModalManager.open(title, content, '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>');
    }
  };

  // --- MODAL MANAGER ---
  const ModalManager = {
    _stack: [], _maxDepth: 3, _overlay: null, _container: null,
    _body: null, _title: null, _footer: null,

    init() {
      this._overlay = document.getElementById('modal-overlay');
      this._container = document.getElementById('modal-container');
      this._body = document.getElementById('modal-body');
      this._title = document.getElementById('modal-title');
      this._footer = document.getElementById('modal-footer');
      if (this._overlay) {
        this._overlay.addEventListener('click', (e) => { if (e.target === this._overlay) this.close(); });
      }
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._stack.length > 0) { e.preventDefault(); this.close(); }
        if (e.key === 'Tab' && this._stack.length > 0) this._trapFocus(e);
      });
    },

    open(title, contentHTML, footerHTML, options) {
      options = options || {};
      if (this._stack.length >= this._maxDepth) { ToastNotifier.show('Maximum modal depth reached', 'warn'); return; }
      this._stack.push({ title, content: contentHTML, footer: footerHTML, options });
      this._renderCurrent();
    },

    openMilestone(data) {
      const title = data.title || 'Milestone Triggered';
      let content = '<div class="milestone-detail">';
      content += '<div class="milestone-badge ' + (data.type === 'relic' ? 'relic' : 'org') + '">' + (data.type === 'relic' ? 'RELIC MILESTONE - Day ' + data.day : data.label) + '</div>';
      content += '<p class="milestone-desc">' + (data.description || '') + '</p>';
      if (data.crossAdvances && data.crossAdvances.length > 0) {
        content += '<div class="cross-advances"><h4>Cross-Advances</h4>';
        data.crossAdvances.forEach(ca => {
          const targetOrg = (_state.case.organizations || []).find(o => o.id === ca.targetOrg);
          const orgName = targetOrg ? targetOrg.name : ca.targetOrg;
          content += '<div class="cross-advance-item">';
          content += '<span>Advance <strong>' + ca.targetOrg + (orgName ? ' ' + orgName : '') + '</strong> by ' + ca.squares + ' square' + (ca.squares > 1 ? 's' : '') + '</span>';
          content += '<button class="btn-execute" onclick="NR.executeCrossAdvance(\'' + ca.targetOrg + '\', ' + ca.squares + ')">Execute</button>';
          content += '</div>';
        });
        content += '</div>';
      }
      content += '<button class="btn-small" onclick="NR.visualizeChain()" style="margin-top:8px;">View Chain Diagram</button>';
      content += '</div>';
      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Dismiss</button>';
      this._milestoneData = data;
      this.open(title, content, footer);
    },

    _milestoneData: null,

    // --- NPC Card Modal ---
    openNPCCard(npcData) {
      const title = npcData.name + ' - NPC Card';
      let content = '<div class="npc-modal">';

      content += '<div style="display:flex; gap:12px; margin-bottom:10px;">';
      content += '<div style="width:100px; height:110px; border:1.5px solid var(--rule); background:var(--field-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">';
      if (npcData.portrait) {
        content += '<img src="' + npcData.portrait + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display=\'none\'">';
      }
      content += '<span style="font-family:var(--font-main); font-size:9px; color:var(--ink-light);">PORTRAIT</span></div>';
      content += '<div style="flex:1;">';
      content += '<div style="font-family:var(--font-fill); font-size:17px; font-weight:bold; border-bottom:2px solid var(--ink); padding-bottom:3px; margin-bottom:6px;">' + npcData.name + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:12px; color:var(--ink-faded);">' + (npcData.role || '') + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:11px; color:var(--ink-light); margin-top:2px;">' + (npcData.organization || '') + '</div>';
      content += '</div></div>';

      if (npcData.attributes) {
        content += '<div style="display:flex; gap:6px; margin-bottom:8px;">';
        NR_DATA.ATTRIBUTES.forEach(attr => {
          const val = npcData.attributes[attr.key] || 0;
          content += '<div style="flex:1; text-align:center; border:1px solid var(--rule); padding:3px; background:var(--field-bg);"><span style="font-size:9px; color:var(--ink-faded);">' + attr.abbr + '</span><br><span style="font-family:var(--font-fill); font-size:18px; font-weight:bold;">' + val + '</span></div>';
        });
        content += '</div>';
      }
      if (npcData.skills) {
        content += '<div style="font-size:10px; color:var(--ink-faded); margin-bottom:8px;"><strong>Skills:</strong> ';
        const skillNames = [];
        for (const [k, v] of Object.entries(npcData.skills)) {
          if (v > 0) { const s = NR_DATA.SKILL_LIST.find(s => s.key === k); skillNames.push((s ? s.name : k) + ' ' + v); }
        }
        content += (skillNames.length ? skillNames.join(', ') : '-') + '</div>';
      }

      content += '<div style="margin-bottom:8px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);">';
      content += '<div style="font-size:10px; color:var(--ink-faded); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Disposition</div>';
      content += '<div style="display:flex; gap:4px; align-items:center;">';
      NR_DATA.DISPOSITION_LEVELS.forEach(level => {
        const active = (npcData.disposition || 3) === level.value;
        content += '<button onclick="NR.adjustDisposition(\'' + npcData.id + '\', ' + level.value + ')" style="flex:1; padding:4px 2px; font-size:10px; border:1px solid ' + (active ? 'var(--ink)' : 'var(--rule-light)') + '; background:' + (active ? 'var(--ink)' : 'var(--field-bg)') + '; color:' + (active ? 'var(--paper)' : 'var(--ink-faded)') + '; cursor:pointer; text-transform:uppercase; letter-spacing:1px; font-family:var(--font-main);" title="' + level.desc + '" aria-label="Set disposition to ' + level.name + '">' + level.value + '<br>' + level.name + '</button>';
      });
      content += '</div></div>';

      content += '<div style="display:flex; gap:8px; margin-bottom:8px;">';
      content += '<div style="flex:1;"><span style="font-size:9px; color:var(--red-stamp); text-transform:uppercase;">Secret</span><div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); min-height:30px;">' + (npcData.secret || '') + '</div></div>';
      content += '<div style="flex:1;"><span style="font-size:9px; color:var(--ink-faded); text-transform:uppercase;">Goal</span><div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); min-height:30px;">' + (npcData.goal || '') + '</div></div>';
      content += '</div>';

      if (npcData.startingKnowledge || npcData.gainedKnowledge) {
        content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--green-stamp); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--green-stamp);">Knowledge</span>';
        if (npcData.startingKnowledge && npcData.startingKnowledge.length) {
          content += '<div style="font-size:10px; margin-top:3px;"><strong>Starting:</strong> ';
          npcData.startingKnowledge.forEach(k => {
            content += '<span class="ref-link" title="Open Information Card ' + k.info + '" onclick="NR.openInfoCardModal(\'' + k.info + '\')">' + k.info + '</span> ';
          });
          content += '</div>';
        }
        content += '</div>';
      }

      content += '<div style="font-size:10px; color:var(--ink-faded); margin-bottom:4px;"><strong>What They Know:</strong></div>';
      content += '<ul style="font-size:11px; margin-left:14px; margin-bottom:8px;">';
      if (npcData.startingKnowledge) {
        npcData.startingKnowledge.forEach(k => { content += '<li>' + k.desc + ' (' + k.info + ')</li>'; });
      }
      content += '</ul>';

      content += '<div style="font-size:11px; padding:6px; background:var(--field-bg); border:1px solid var(--rule); margin-bottom:8px;"><strong>Artifact Connection:</strong> ' + (npcData.artifactConnection || 'None') + '</div>';

      content += '<div style="display:flex; gap:8px; margin-bottom:8px;">';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--green-stamp);">+ Positive:</span> ' + (npcData.positiveResult || '') + '</div>';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--red-stamp);">- Negative:</span> ' + (npcData.negativeResult || '') + '</div>';
      content += '</div>';

      content += '<details style="margin-bottom:8px;"><summary style="font-size:11px; color:var(--red-stamp); cursor:pointer;">DA Notes</summary>';
      content += '<textarea id="npc-da-notes-' + npcData.id + '" style="width:100%; min-height:50px; font-family:var(--font-fill); font-size:12px; background:var(--field-bg); border:1px solid var(--rule); padding:4px;" onchange="NR.updateNPCDANotes(\'' + npcData.id + '\', this.value)">' + (npcData.daNotes || '') + '</textarea>';
      content += '</details>';

      content += '</div>';

      const footer = '<button class="btn-small" onclick="NR.printNPCCard(\'' + npcData.id + '\')">Print</button> <button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Location Modal ---
    openLocationModal(locData) {
      const title = locData.id + ' - ' + locData.name;
      let content = '<div class="location-modal">';

      content += '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">';
      content += '<div style="font-family:var(--font-main); font-size:20px; font-weight:bold; color:var(--green-stamp); border:2px solid var(--green-stamp); padding:4px 12px;">' + locData.id + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:17px; font-weight:bold; border-bottom:2px solid var(--ink); flex:1;">' + locData.name + '</div>';
      content += '</div>';

      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--ink-faded); text-transform:uppercase;">Description</span>';
      content += '<div style="font-size:12px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);">' + (locData.description || '') + '</div></div>';

      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--green-stamp); text-transform:uppercase;">Availability: ' + (locData.availability || '') + '</span>';
      content += '<div style="font-size:11px; color:var(--ink-faded);">' + (locData.availabilityCondition || '') + '</div></div>';

      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--ink-faded); text-transform:uppercase;">NPCs Present</span>';
      content += '<div style="font-size:11px;">' + makeClickableReferences(locData.npcsPresent || '') + '</div></div>';

      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--green-stamp); text-transform:uppercase;">Information Available</span>';
      content += '<div style="font-size:11px;">';
      if (locData.cluesPresent) {
        locData.cluesPresent.forEach(clue => {
          content += ' <span class="ref-link" title="Open Information Card ' + clue + '" onclick="NR.openInfoCardModal(\'' + clue + '\')">' + clue + '</span>';
        });
      }
      content += '</div></div>';

      if (locData.hazards) {
        content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--red-stamp); text-transform:uppercase;">Hazards</span>';
        content += '<div style="font-size:11px; color:var(--red-stamp);">' + locData.hazards + '</div></div>';
      }

      if (locData.organizations) {
        content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--ink-faded); text-transform:uppercase;">Organizations</span>';
        content += '<div>' + makeClickableReferences((locData.organizations || []).join(', ')) + '</div></div>';
      }

      content += '<div style="display:flex; gap:8px; margin-bottom:8px;">';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--green-stamp);">+ Positive:</span> ' + (locData.positiveResult || '') + '</div>';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--red-stamp);">- Negative:</span> ' + (locData.negativeResult || '') + '</div>';
      content += '</div>';

      content += '<div style="font-size:11px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);">';
      content += '<strong>Milestone Changes:</strong> ' + (locData.milestoneChanges || '') + '</div>';

      content += '</div>';
      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Information Card Modal (Double-Sided) ---
    openInfoCardModal(infoData) {
      const isTruth = infoData.type === 'containment-truth';
      const title = infoData.id + ' - ' + (isTruth ? 'Containment Truth' : 'Supporting Intel');
      let content = '<div class="infocard-modal">';

      content += '<div style="display:flex; gap:4px; margin-bottom:10px;">';
      content += '<button id="infocard-toggle-front" class="btn-small active" onclick="NR.flipInfoCard(\'front\')" style="flex:1;">Player Side</button>';
      content += '<button id="infocard-toggle-back" class="btn-small" onclick="NR.flipInfoCard(\'back\')" style="flex:1;">DA Side</button>';
      content += '</div>';

      content += '<div id="infocard-front" class="infocard-side" style="display:block;">';
      content += '<div style="border:2px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; padding:12px; background:var(--field-bg); min-height:120px;">';
      content += '<div style="font-family:var(--font-main); font-size:14px; font-weight:bold; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; border:1.5px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; display:inline-block; padding:2px 10px; margin-bottom:8px;">' + infoData.id + '</div>';
      content += '<div style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; margin-bottom:6px;">' + (isTruth ? 'Containment Truth' : 'Supporting Intel') + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:13px; line-height:1.4;">' + (infoData.content || '') + '</div>';
      content += '</div></div>';

      content += '<div id="infocard-back" class="infocard-side" style="display:none;">';
      content += '<div style="border:2px solid var(--red-stamp); padding:12px; background:rgba(139,26,26,0.03); min-height:120px;">';
      content += '<div style="font-family:var(--font-main); font-size:12px; letter-spacing:3px; text-transform:uppercase; color:var(--red-stamp); margin-bottom:8px;">DA Eyes Only</div>';
      content += '<div style="font-family:var(--font-main); font-size:13px; font-weight:bold; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; border:1.5px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; display:inline-block; padding:2px 10px; margin-bottom:8px;">' + infoData.id + '</div>';
      content += '<div style="font-size:11px; margin-bottom:6px;">Type: <strong>' + (isTruth ? 'Containment Truth' : 'Supporting Intel') + '</strong>';
      if (infoData.truthStatus) content += ' (' + infoData.truthStatus + ')';
      content += '</div>';
      content += '<div style="font-size:11px; margin-bottom:4px;"><strong>Found At:</strong> ' + (infoData.foundAt || []).join(', ') + '</div>';
      content += '<div style="font-size:11px; margin-bottom:4px;"><strong>Known By:</strong> ' + (infoData.knownBy || []).join('; ') + '</div>';
      content += '<div style="font-size:11px; margin-bottom:6px;"><strong>HQ Fallback:</strong> ' + (infoData.hqFallback || '-') + '</div>';
      content += '<div style="font-size:11px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);"><strong>Notes:</strong> ' + (infoData.daNotes || '') + '</div>';
      content += '</div></div>';

      content += '</div>';
      const footer = '<button class="btn-small" onclick="NR.printInfoCards()">Print Player Side</button> <button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Agent Sheet Modal ---
    openAgentSheet(agent) {
      if (!agent) return;
      const title = 'Agent Dossier - ' + agent.name;
      let content = '<div class="agent-sheet-modal">';

      content += '<div style="border-bottom:2px solid var(--red-stamp); padding-bottom:8px; margin-bottom:8px;">';
      content += '<div style="font-family:var(--font-fill); font-size:18px; font-weight:bold;">' + agent.name + '</div>';
      content += '<div style="display:flex; gap:16px; font-size:11px; color:var(--ink-faded); margin-top:4px;">';
      content += '<span>Division: ' + (agent.division || '-') + '</span>';
      content += '<span>Sub-Unit: ' + (agent.subUnit || '-') + '</span>';
      content += '<span>CL: ' + (agent.cl || 1) + '</span>';
      content += '<span>Age: ' + (agent.age || '-') + '</span>';
      content += '</div></div>';

      content += '<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:10px;">';
      NR_DATA.ATTRIBUTES.forEach(attr => {
        const maxVal = agent.attributes[attr.key] || 2;
        const dmg = agent.attributeDamage[attr.key] || 0;
        const current = maxVal - dmg;
        const broken = current <= 0;
        content += '<div style="text-align:center; border:1.5px solid ' + (broken ? 'var(--red-stamp)' : 'var(--rule)') + '; padding:6px; background:' + (broken ? 'rgba(139,26,26,0.08)' : 'var(--field-bg)') + ';">';
        content += '<div style="font-size:11px; font-weight:bold;">' + attr.name + '</div>';
        content += '<div style="font-family:var(--font-fill); font-size:' + (broken ? '18px' : '24px') + '; font-weight:bold; color:' + (broken ? 'var(--red-stamp)' : 'var(--ink)') + ';">' + current + '/' + maxVal + '</div>';
        content += '<div style="font-size:9px; color:var(--ink-faded);">Damage: <input type="number" value="' + dmg + '" min="0" max="' + maxVal + '" style="width:40px; font-family:var(--font-fill); font-size:12px; text-align:center;" onchange="NR.updateAgentDamage(\'' + agent.id + '\', \'' + attr.key + '\', parseInt(this.value) || 0)"></div>';
        content += '</div>';
      });
      content += '</div>';

      content += '<div style="margin-bottom:10px;">';
      content += '<div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--ink); border-bottom:1.5px solid var(--ink); margin-bottom:5px;">Skills</div>';
      content += '<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:3px 8px;">';
      NR_DATA.SKILL_LIST.forEach(skill => {
        const rating = agent.skills[skill.key] || 0;
        const attrKey = skill.attr;
        content += '<div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:2px 4px; border-bottom:1px dotted var(--rule-light); cursor:pointer;" onclick="NR.quickRollAgentSkill(\'' + agent.id + '\', \'' + skill.key + '\', \'' + attrKey + '\')" title="Click to roll ' + skill.name + '">';
        content += '<span>' + skill.name + '</span>';
        content += '<span style="font-family:var(--font-fill); font-weight:bold;">' + rating + '</span>';
        content += '</div>';
      });
      content += '</div></div>';

      const corr = agent.corruption || 0;
      const corrThreshold = 10 + (agent.attributes.empathy || 2);
      content += '<div style="margin-bottom:10px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);">';
      content += '<div style="font-size:11px; text-transform:uppercase; color:var(--red-stamp); margin-bottom:4px;">Corruption: ' + corr + ' / ' + corrThreshold + '</div>';
      content += '<div style="display:flex; gap:2px; margin-bottom:4px;">';
      for (let i = 1; i <= 15; i++) {
        const danger = i >= corrThreshold;
        content += '<div style="width:18px; height:18px; border:1.5px solid ' + (danger ? 'var(--red-stamp)' : 'var(--rule)') + '; background:' + (i <= corr ? (danger ? 'var(--red-stamp)' : 'var(--ink)') : 'var(--field-bg)') + '; display:flex; align-items:center; justify-content:center; font-size:9px; color:' + (i <= corr ? 'var(--paper)' : 'var(--ink-light)') + ';">' + i + '</div>';
      }
      content += '</div>';
      content += '<div style="margin-top:4px;"><button class="btn-small" onclick="NR.adjustCorruption(\'' + agent.id + '\', 1)">+1 Corr</button> <button class="btn-small danger" onclick="NR.adjustCorruption(\'' + agent.id + '\', -1)">-1 Corr</button></div>';
      content += '</div>';

      content += '<div style="margin-bottom:10px;">';
      content += '<div style="font-size:10px; text-transform:uppercase; color:var(--ink-faded); margin-bottom:4px;">Conditions</div>';
      content += '<div style="display:flex; gap:8px; flex-wrap:wrap;">';
      ['starving', 'dehydrated', 'exhausted', 'freezing', 'sleepy'].forEach(cond => {
        const checked = agent.conditions && agent.conditions[cond];
        content += '<label style="font-size:11px; display:flex; align-items:center; gap:3px; cursor:pointer;" onclick="NR.toggleAgentCondition(\'' + agent.id + '\', \'' + cond + '\')">';
        content += '<span class="checkbox' + (checked ? ' checked' : '') + '"></span> ' + cond.charAt(0).toUpperCase() + cond.slice(1);
        content += '</label>';
      });
      content += '</div></div>';

      content += '<div style="margin-bottom:10px;">';
      content += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">';
      content += '<span style="font-size:11px; text-transform:uppercase; color:var(--red-stamp);">Critical Injuries</span>';
      content += '<button class="btn-small" onclick="NR.addCriticalInjury(\'' + agent.id + '\')">+ Add</button>';
      content += '</div>';
      if (agent.criticalInjuries && agent.criticalInjuries.length) {
        agent.criticalInjuries.forEach((inj, i) => {
          content += '<div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); margin-bottom:3px; display:flex; justify-content:space-between; align-items:center;">';
          content += '<span><strong>' + inj.name + '</strong>' + (inj.roll ? ' (' + inj.roll + ')' : '') + ': ' + (inj.effect || '') + (inj.lethal ? ' [LETHAL]' : '') + '</span>';
          content += '<button class="btn-small danger" onclick="NR.removeCriticalInjury(\'' + agent.id + '\', ' + i + ')" style="font-size:12px;">x</button>';
          content += '</div>';
        });
      } else {
        content += '<div style="font-size:11px; color:var(--ink-light);">None</div>';
      }
      content += '</div>';

      if (agent.gear && agent.gear.length) {
        content += '<div style="margin-bottom:10px;">';
        content += '<div style="font-size:11px; text-transform:uppercase; color:var(--green-stamp); margin-bottom:4px;">Gear</div>';
        content += '<table style="width:100%; font-size:11px; border-collapse:collapse;">';
        content += '<tr style="text-align:left; font-size:9px; text-transform:uppercase; color:var(--ink-faded);"><th>Item</th><th style="width:50px;">Bonus</th><th style="width:40px;">Enc</th></tr>';
        agent.gear.forEach(g => {
          content += '<tr style="border-bottom:1px dotted var(--rule-light);"><td>' + g.name + '</td><td style="text-align:center;">' + (g.bonus || '-') + '</td><td style="text-align:center;">' + (g.enc || '-') + '</td></tr>';
        });
        content += '</table></div>';
      }

      if (agent.talents && agent.talents.length) {
        content += '<div style="margin-bottom:10px;">';
        content += '<div style="font-size:11px; text-transform:uppercase; color:var(--green-stamp); margin-bottom:4px;">Talents</div>';
        agent.talents.forEach(t => {
          content += '<div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); margin-bottom:3px;">';
          content += '<strong>' + t.name + '</strong> <span style="color:var(--ink-light);">(' + (t.cost || '-') + ')</span><br>' + (t.effect || '');
          content += '</div>';
        });
        content += '</div>';
      }

      content += '<div><span style="font-size:10px; color:var(--ink-faded);">Notes</span>';
      content += '<textarea style="width:100%; min-height:40px; font-family:var(--font-fill); font-size:12px; background:var(--field-bg); border:1px solid var(--rule); padding:4px;" onchange="NR.updateAgentNotes(\'' + agent.id + '\', this.value)">' + (agent.notes || '') + '</textarea></div>';

      content += '</div>';
      const footer = '<button class="btn-small" onclick="NR.printAgentSheet(\'' + agent.id + '\')">Print</button> <button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Case Brief DA Modal ---
    openCaseBrief() {
      const c = _state.case;
      const title = 'Case Brief - DA Eyes Only';
      let content = '<div class="case-brief-modal">';
      content += '<div style="font-family:var(--font-main); font-size:14px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); padding-bottom:4px; margin-bottom:10px;">' + (c.caseName || 'Untitled Case') + '</div>';
      content += '<div style="font-size:11px; color:var(--ink-faded); margin-bottom:4px;">Case ID: ' + (c.caseId || '-') + ' | Region: ' + (c.region || '-') + '</div>';
      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; text-transform:uppercase; color:var(--ink-faded);">Active Organizations</span>';
      content += '<div style="font-size:11px;">';
      (c.organizations || []).filter(o => o.name).forEach(org => {
        const consumed = (org.squaresConsumed || []).length;
        const remaining = Math.max(0, 14 - consumed);
        content += '<div style="padding:4px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule); display:flex; justify-content:space-between; cursor:pointer;" onclick="NR.openOrgReferenceModal(\'' + org.id + '\')">';
        content += '<span><strong>' + org.id + ':</strong> ' + org.name + '</span>';
        content += '<span>Val: ' + (org.value || 0) + ' | Remaining: ' + remaining + ' | ' + (org.active ? 'Active' : org.dormant ? 'Dormant' : 'Inactive') + '</span>';
        content += '</div>';
      });
      content += '</div></div>';
      content += '<div style="margin-bottom:8px;"><span style="font-size:10px; text-transform:uppercase; color:var(--red-stamp);">Relic Milestones</span>';
      content += '<div style="font-size:11px;">';
      (c.relicMilestones || []).forEach(ms => {
        content += '<div style="padding:3px; margin-bottom:2px; font-size:10px;">Day ' + ms.day + ': ' + (ms.description || '') + '</div>';
      });
      content += '</div></div>';
      content += '<div style="font-size:10px; color:var(--ink-light); margin-top:8px;">For detailed organization info, click any org name on the board. For relic details, use the Relic Sheet.</div>';
      content += '</div>';
      const footer = '<button class="btn-small" onclick="NR.printBoard()">Print Board</button> <button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Relic Sheet Modal ---
    openRelicSheet() {
      const title = 'Relic Sheet';
      let content = '<div class="relic-sheet-modal">';
      content += '<div style="font-family:var(--font-main); font-size:14px; text-transform:uppercase; letter-spacing:2px; color:var(--green-stamp); border-bottom:2px solid var(--green-stamp); padding-bottom:4px; margin-bottom:10px;">Relic Information</div>';

      // Try to extract relic data from case
      const c = _state.case;
      const relicMs = c.relicMilestones || [];
      const caseData = _getActiveCaseData();
      const infoCards = caseData.infoCards || [];
      const containmentTruths = infoCards.filter(i => i.type === 'containment-truth');

      if (c.relicSheet) {
        const rs = c.relicSheet;
        content += '<div style="font-size:12px; margin-bottom:8px;"><strong>Name:</strong> ' + (rs.name || 'Unknown') + '</div>';
        content += '<div style="font-size:12px; margin-bottom:8px;"><strong>Tier:</strong> ' + (rs.tier || '?') + ' | <strong>Artifact Die:</strong> ' + (rs.artifactDie || '?') + '</div>';
        content += '<div style="font-size:11px; margin-bottom:8px;"><strong>Activation:</strong> ' + (rs.activationCondition || '-') + '</div>';
        content += '<div style="font-size:11px; margin-bottom:8px;"><strong>Effect:</strong> ' + (rs.mechanicalEffect || '-') + '</div>';
        content += '<div style="font-size:11px; margin-bottom:8px; color:var(--red-stamp);"><strong>Fracture:</strong> ' + (rs.fracture || '-') + '</div>';
      } else {
        content += '<div style="font-size:12px; color:var(--ink-faded); margin-bottom:8px;">No relic sheet data loaded. Relic milestones are embedded in the board.</div>';
      }

      // Relic Milestones quick view
      if (relicMs.length > 0) {
        content += '<div style="margin-top:12px;"><span style="font-size:11px; text-transform:uppercase; color:var(--red-stamp);">Relic Milestone Schedule</span>';
        content += '<div style="font-size:11px;">';
        relicMs.forEach(ms => {
          content += '<div style="padding:3px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule);">Day ' + ms.day + ': ' + (ms.description || '') + '</div>';
        });
        content += '</div></div>';
      }

      // Containment Truths
      if (containmentTruths.length > 0) {
        content += '<div style="margin-top:12px;"><span style="font-size:11px; text-transform:uppercase; color:var(--green-stamp);">Containment Truths</span>';
        content += '<div style="font-size:11px;">';
        containmentTruths.forEach(ct => {
          const discovered = (_state.case.discoveredInfo || []).includes(ct.id);
          content += '<div style="padding:4px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule); display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="NR.openInfoCardModal(\'' + ct.id + '\')">';
          content += '<span class="checkbox' + (discovered ? ' checked' : '') + '" style="flex-shrink:0;"></span>';
          content += '<span><strong>' + ct.id + '</strong>: ' + (ct.content || '').substring(0, 80) + '...</span>';
          content += '</div>';
        });
        content += '</div></div>';
      }

      content += '</div>';
      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Organization Reference Modal ---
    openOrgReference(orgId) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) { ToastNotifier.show('Organization not found: ' + orgId, 'warn'); return; }
      const title = orgId + ' - ' + (org.name || 'Unnamed') + ' Reference';
      let content = '<div class="org-ref-modal">';
      content += '<div style="font-family:var(--font-main); font-size:15px; font-weight:bold; margin-bottom:8px; border-bottom:2px solid var(--green-stamp); padding-bottom:4px;">' + (org.name || orgId) + '</div>';
      content += '<div style="display:flex; gap:12px; margin-bottom:8px; font-size:11px;">';
      content += '<span><strong>Value:</strong> ' + (org.value || 0) + '</span>';
      content += '<span><strong>Active:</strong> ' + (org.active ? 'Yes' : 'No') + '</span>';
      content += '<span><strong>Dormant:</strong> ' + (org.dormant ? 'Yes' : 'No') + '</span>';
      content += '<span><strong>Squares Consumed:</strong> ' + ((org.squaresConsumed || []).length) + '/14</span>';
      content += '</div>';
      if (org.activationCondition) content += '<div style="font-size:11px; margin-bottom:4px;"><strong>Activation:</strong> ' + org.activationCondition + '</div>';
      if (org.linkedEffects) content += '<div style="font-size:11px; margin-bottom:4px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);"><strong>Linked Effects:</strong> ' + org.linkedEffects + '</div>';
      if (org.playerSigns) content += '<div style="font-size:11px; margin-bottom:4px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);"><strong>Player Signs:</strong> ' + org.playerSigns + '</div>';

      // Milestones
      if (org.milestones && org.milestones.length > 0) {
        content += '<div style="margin-top:8px;"><span style="font-size:11px; text-transform:uppercase; color:var(--red-stamp);">Milestones</span>';
        org.milestones.forEach(ms => {
          content += '<div style="padding:4px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule); font-size:11px;">';
          content += '<strong>' + ms.label + '</strong> (Day ' + ms.day + ')' + (ms.triggered ? ' <span style="color:var(--red-stamp);">[TRIGGERED]</span>' : '') + '<br>';
          content += (ms.description || '') + '';
          if (ms.crossAdvances && ms.crossAdvances.length > 0) {
            content += '<div style="font-size:10px; color:var(--green-stamp); margin-top:2px;">Cross: ';
            content += ms.crossAdvances.map(ca => '-> ' + ca.targetOrg + ' +' + ca.squares).join(', ');
            content += '</div>';
          }
          content += '</div>';
        });
        content += '</div>';
      }

      if (org.notes) content += '<div style="font-size:11px; margin-top:8px; padding:6px; background:var(--field-bg); border:1px solid var(--rule);"><strong>DA Notes:</strong> ' + org.notes + '</div>';
      content += '</div>';
      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    _renderCurrent() {
      if (this._stack.length === 0) { this._overlay.classList.remove('open'); return; }
      const current = this._stack[this._stack.length - 1];
      if (this._title) this._title.textContent = current.title;
      if (this._body) this._body.innerHTML = current.content;
      if (this._footer) this._footer.innerHTML = current.footer || '';
      if (this._stack.length > 1) {
        const breadcrumb = document.getElementById('modal-breadcrumb');
        if (breadcrumb) {
          breadcrumb.innerHTML = this._stack.map((s, i) => '<span class="breadcrumb-item' + (i === this._stack.length - 1 ? ' active' : '') + '">' + s.title + '</span>').join(' &rsaquo; ');
          breadcrumb.style.display = 'block';
        }
      } else {
        const breadcrumb = document.getElementById('modal-breadcrumb');
        if (breadcrumb) {
          breadcrumb.style.display = 'none';
          breadcrumb.innerHTML = '';
        }
      }
      this._overlay.classList.add('open');
      this._container.classList.add('stacked-' + Math.min(this._stack.length, 3));
      setTimeout(() => {
        const focusable = this._container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      }, 100);
    },

    close() {
      if (this._stack.length === 0) return;
      this._stack.pop();
      if (this._stack.length === 0) this._overlay.classList.remove('open');
      else this._renderCurrent();
    },

    closeAll() { this._stack = []; this._overlay.classList.remove('open'); },
    isOpen() { return this._stack.length > 0; },

    _trapFocus(e) {
      if (!this._container) return;
      const focusable = this._container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      if (e.shiftKey) { if (document.activeElement === focusable[0]) { e.preventDefault(); focusable[focusable.length - 1].focus(); } }
      else { if (document.activeElement === focusable[focusable.length - 1]) { e.preventDefault(); focusable[0].focus(); } }
    }
  };

  // Helper: Make O#, L#, I#, NPC names clickable in text
  function makeClickableReferences(text) {
    if (!text) return '';
    let html = text;
    html = html.replace(/\b(I\d+)\b/g, '<span class="ref-link" title="Open Information Card $1" onclick="NR.openInfoCardModal(\'$1\')">$1</span>');
    html = html.replace(/\b(L\d+)\b/g, '<span class="ref-link" title="Open Location $1" onclick="NR.openLocationModal(\'$1\')">$1</span>');
    html = html.replace(/\b(O\d+)\b/g, '<span class="ref-link" title="Highlight Organization $1 on board" onclick="NR.highlightOrg(\'$1\')">$1</span>');
    return html;
  }

  // Info Card Flip
  let _infoCardSide = 'front';
  function flipInfoCard(side) {
    _infoCardSide = side;
    const frontEl = document.getElementById('infocard-front');
    const backEl = document.getElementById('infocard-back');
    const frontBtn = document.getElementById('infocard-toggle-front');
    const backBtn = document.getElementById('infocard-toggle-back');
    if (frontEl) frontEl.style.display = side === 'front' ? 'block' : 'none';
    if (backEl) backEl.style.display = side === 'back' ? 'block' : 'none';
    if (frontBtn) { frontBtn.className = side === 'front' ? 'btn-small active' : 'btn-small'; }
    if (backBtn) { backBtn.className = side === 'back' ? 'btn-small active' : 'btn-small'; }
  }

  // --- DICE ROLLER ---
  const DiceRoller = {
    configureForAgent(agentId) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) { this.openRoller(); return; }
      this.openRoller(agent);
    },

    openRoller(agent) {
      let content = '<div class="dice-roller-panel">';

      content += '<div class="dice-row"><label>Agent</label>';
      content += '<select id="dr-agent" onchange="NR.diceAgentChanged()"><option value="">- None -</option>';
      (_state.agents || []).forEach(a => {
        const sel = agent && a.id === agent.id ? ' selected' : '';
        content += '<option value="' + a.id + '"' + sel + '>' + a.name + '</option>';
      });
      content += '</select></div>';

      content += '<div class="dice-row"><label>Attribute Dice (d6)</label>';
      content += '<select id="dr-attr"><option value="0">-</option>';
      for (let i = 1; i <= 5; i++) content += '<option value="' + i + '">' + i + '</option>';
      content += '</select></div>';

      content += '<div class="dice-row"><label>Skill Dice (d6)</label>';
      content += '<select id="dr-skill"><option value="0">-</option>';
      for (let i = 1; i <= 5; i++) content += '<option value="' + i + '">' + i + '</option>';
      content += '</select></div>';

      content += '<div class="dice-row"><label>Gear Dice (d6)</label>';
      content += '<select id="dr-gear"><option value="0">-</option>';
      for (let i = 1; i <= 3; i++) content += '<option value="' + i + '">' + i + '</option>';
      content += '</select></div>';

      content += '<div class="dice-row"><label>Artifact Die</label>';
      content += '<select id="dr-artifact"><option value="">-</option>';
      ['d4','d6','d8','d10','d12','d20'].forEach(d => { content += '<option value="' + d + '">' + d + '</option>'; });
      content += '</select></div>';

      content += '<div class="dice-row"><label>Difficulty</label>';
      content += '<select id="dr-diff"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>';

      content += '<div class="dice-pool-summary" id="dr-pool-summary">Pool: 0 dice</div>';
      content += '<div class="dice-actions">';
      content += '<button class="btn-roll" onclick="NR.rollDice()">ROLL</button>';
      content += '<button class="btn-push" id="btn-push-dice" onclick="NR.pushRoll()" disabled>PUSH (+1 Corruption)</button>';
      content += '</div>';
      content += '<div class="dice-result" id="dr-result" style="display:none;"></div>';
      content += '<div class="dice-pool-display" id="dr-pool"></div>';
      content += '</div>';

      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      ModalManager.open('YZE Dice Roller', content, footer, { width: 'medium' });

      setTimeout(() => {
        ['dr-attr', 'dr-skill', 'dr-gear'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.addEventListener('change', () => DiceRoller._updatePoolSummary());
        });
        DiceRoller._updatePoolSummary();
        if (agent) DiceRoller._prefillForAgent(agent);
      }, 100);
    },

    _prefillForAgent(agent) {
      const attrEl = document.getElementById('dr-attr');
      const skillEl = document.getElementById('dr-skill');
      let bestSkill = null, bestRating = -1;
      for (const [key, val] of Object.entries(agent.skills || {})) {
        if (val > bestRating) { bestRating = val; bestSkill = key; }
      }
      if (bestSkill) {
        const skillDef = NR_DATA.SKILL_LIST.find(s => s.key === bestSkill);
        if (skillDef) {
          const attrKey = skillDef.attr;
          const attrVal = (agent.attributes[attrKey] || 2) - (agent.attributeDamage[attrKey] || 0);
          if (attrEl) attrEl.value = Math.max(1, attrVal);
          if (skillEl) skillEl.value = bestRating;
        }
      }
      DiceRoller._updatePoolSummary();
    },

    _updatePoolSummary() {
      const attr = parseInt(document.getElementById('dr-attr')?.value) || 0;
      const skill = parseInt(document.getElementById('dr-skill')?.value) || 0;
      const gear = parseInt(document.getElementById('dr-gear')?.value) || 0;
      const total = attr + skill + gear;
      const summary = document.getElementById('dr-pool-summary');
      if (summary) summary.textContent = 'Pool: ' + total + ' dice (' + attr + ' attr + ' + skill + ' skill + ' + gear + ' gear)';
    },

    rollDice() {
      const attr = parseInt(document.getElementById('dr-attr')?.value) || 0;
      const skill = parseInt(document.getElementById('dr-skill')?.value) || 0;
      const gear = parseInt(document.getElementById('dr-gear')?.value) || 0;
      const artifact = document.getElementById('dr-artifact')?.value || '';
      const diff = parseInt(document.getElementById('dr-diff')?.value) || 1;
      const totalDice = attr + skill + gear;
      if (totalDice === 0 && !artifact) { ToastNotifier.show('Add at least one die', 'warn'); return; }

      const rollD6 = () => Math.floor(Math.random() * 6) + 1;
      const results = { attribute: [], skill: [], gear: [], artifact: null, attrCount: attr, skillCount: skill, gearCount: gear, artifactDie: artifact };
      for (let i = 0; i < attr; i++) results.attribute.push(rollD6());
      for (let i = 0; i < skill; i++) results.skill.push(rollD6());
      for (let i = 0; i < gear; i++) results.gear.push(rollD6());
      if (artifact) {
        const sides = { d4:4, d6:6, d8:8, d10:10, d12:12, d20:20 };
        results.artifact = Math.floor(Math.random() * (sides[artifact] || 6)) + 1;
        results.artifactMax = sides[artifact] || 6;
      }
      const allDice = [...results.attribute, ...results.skill, ...results.gear];
      results.successes = allDice.filter(d => d === 6).length;
      results.stuntPoints = Math.max(0, results.successes - diff);
      results.gearOnes = results.gear.filter(d => d === 1).length;
      results.artifactOne = results.artifact === 1;
      results.difficulty = diff;
      results.pushed = false;
      _lastRoll = results;
      DiceRoller._displayResults(results);
      SessionLogger.log('roll', 'Dice rolled: ' + results.successes + ' success(es), ' + totalDice + ' dice');
    },

    _displayResults(results) {
      const poolEl = document.getElementById('dr-pool');
      const resultEl = document.getElementById('dr-result');
      const pushBtn = document.getElementById('btn-push-dice');
      if (!poolEl || !resultEl) return;
      let diceHTML = '';
      const renderDie = (val, type) => {
        let cls = '';
        if (val === 6) cls = 'success';
        else if (val === 1 && type === 'gear') cls = 'danger';
        return '<div class="die ' + type + ' ' + cls + '" style="animation-delay:' + Math.random() * 0.3 + 's">' + val + '</div>';
      };
      results.attribute.forEach(v => { diceHTML += renderDie(v, 'attr'); });
      results.skill.forEach(v => { diceHTML += renderDie(v, 'skill'); });
      results.gear.forEach(v => { diceHTML += renderDie(v, 'gear'); });
      if (results.artifact) {
        const cls = results.artifact === 1 ? 'danger' : '';
        diceHTML += '<div class="die artifact ' + cls + '">' + results.artifact + '</div>';
      }
      poolEl.innerHTML = diceHTML;
      poolEl.style.display = 'flex';
      resultEl.style.display = 'block';
      let html = '<div class="result-summary">';
      html += '<span class="success-count">' + results.successes + ' Success' + (results.successes !== 1 ? 'es' : '') + '</span>';
      if (results.stuntPoints > 0) html += ' | <span class="stunt-count">' + results.stuntPoints + ' Stunt Point' + (results.stuntPoints !== 1 ? 's' : '') + '</span>';
      if (results.successes < results.difficulty) html += ' | <span class="fail-count">FAILED (need ' + results.difficulty + ')</span>';
      if (results.gearOnes > 0) html += ' | <span class="gear-warn">' + results.gearOnes + ' Gear 1 - Degradation!</span>';
      if (results.artifactOne) html += ' | <span class="gear-warn">Artifact 1 - Step down die!</span>';
      html += '<br><small>' + (results.attrCount + results.skillCount + results.gearCount) + ' dice vs Difficulty ' + results.difficulty + '</small></div>';
      resultEl.innerHTML = html;
      if (pushBtn) pushBtn.disabled = false;
    },

    pushRoll() {
      if (!_lastRoll) return;
      const results = _lastRoll;
      const rollD6 = () => Math.floor(Math.random() * 6) + 1;
      results.attribute = results.attribute.map(d => d === 6 ? d : rollD6());
      results.skill = results.skill.map(d => d === 6 ? d : rollD6());
      results.pushed = true;
      const allDice = [...results.attribute, ...results.skill, ...results.gear];
      results.successes = allDice.filter(d => d === 6).length;
      results.stuntPoints = Math.max(0, results.successes - results.difficulty);
      _lastRoll = results;
      DiceRoller._displayResults(results);
      // Apply +1 Corruption to the selected agent, or warn if no agent selected
      const agentId = document.getElementById('dr-agent')?.value;
      if (agentId) {
        const agent = (_state.agents || []).find(a => a.id === agentId);
        if (agent) {
          agent.corruption = (agent.corruption || 0) + 1;
          _autoSave();
          AgentTracker.renderRoster();
          ToastNotifier.show('Push! +1 Corruption. ' + agent.name + ' now at ' + agent.corruption + ' Corruption.', 'info');
          return;
        }
      }
      ToastNotifier.show('Push! +1 Corruption. (No agent selected — add manually.)', 'info');
    }
  };

  // --- AGENT TRACKER ---
  const AgentTracker = {
    _rosterVisible: false,

    toggleRoster() {
      this._rosterVisible = !this._rosterVisible;
      const panel = document.getElementById('agent-roster-panel');
      if (panel) {
        panel.style.display = this._rosterVisible ? 'block' : 'none';
      }
      this.renderRoster();
    },

    renderRoster() {
      const panel = document.getElementById('agent-roster-panel');
      if (!panel) return;
      if (!this._rosterVisible) { panel.style.display = 'none'; return; }
      panel.style.display = 'block';

      const agents = _state.agents || [];
      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">Agent Roster</div>';

      if (agents.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No agents in roster.</div>';
      } else {
        agents.forEach(agent => {
          const corr = agent.corruption || 0;
          const corrThreshold = 10 + (agent.attributes.empathy || 2);
          html += '<div style="padding:6px 8px; border-bottom:1px dotted var(--rule-light); cursor:pointer;" onclick="NR.openAgentSheet(\'' + agent.id + '\')" title="Click for full dossier">';
          html += '<div style="font-family:var(--font-fill); font-size:12px; font-weight:bold;">' + agent.name + '</div>';
          html += '<div style="display:flex; gap:8px; font-size:9px; margin-top:3px;">';
          NR_DATA.ATTRIBUTES.forEach(attr => {
            const maxVal = agent.attributes[attr.key] || 2;
            const dmg = agent.attributeDamage[attr.key] || 0;
            const current = maxVal - dmg;
            const broken = current <= 0;
            html += '<span style="color:' + (broken ? 'var(--red-stamp)' : 'var(--ink-faded)') + ';">' + attr.abbr + ' ' + current + '/' + maxVal + '</span>';
          });
          html += '</div>';
          html += '<div style="font-size:10px; color:' + (corr > 0 ? 'var(--red-stamp)' : 'var(--ink-light)') + ';">' + corr + '/' + corrThreshold + '</div>';
          if (agent.criticalInjuries && agent.criticalInjuries.length) {
            html += '<div style="font-size:9px; color:var(--red-stamp);">' + agent.criticalInjuries.length + ' injury(s)</div>';
          }
          html += '</div>';
        });
      }

      html += '<div style="padding:8px;">';
      html += '<button class="btn-small" onclick="NR.addAgent()" style="width:100%;">+ Add Agent</button>';
      html += '</div>';
      panel.innerHTML = html;
    },

    addAgent() {
      const blank = NR_DATA.createBlankAgent();
      blank.name = 'New Agent ' + ((_state.agents || []).length + 1);
      if (!_state.agents) _state.agents = [];
      _state.agents.push(blank);
      _autoSave();
      this.renderRoster();
      ModalManager.openAgentSheet(blank);
      ToastNotifier.show('Agent added: ' + blank.name, 'success');
    },

    removeAgent(agentId) {
      if (!confirm('Remove this agent from the roster?')) return;
      _state.agents = (_state.agents || []).filter(a => a.id !== agentId);
      _autoSave();
      this.renderRoster();
      ToastNotifier.show('Agent removed', 'info');
    },

    getAgent(agentId) {
      return (_state.agents || []).find(a => a.id === agentId);
    },

    updateAgentDamage(agentId, attrKey, damage) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      const maxVal = agent.attributes[attrKey] || 2;
      damage = Math.min(maxVal, Math.max(0, damage));
      agent.attributeDamage[attrKey] = damage;
      _autoSave();
      this.renderRoster();
      ToastNotifier.show('Damage updated', 'info');
    },

    adjustCorruption(agentId, delta) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      agent.corruption = Math.max(0, (agent.corruption || 0) + delta);
      _autoSave();
      this.renderRoster();
      ToastNotifier.show('Corruption: ' + (delta > 0 ? '+' : '') + delta, 'info');
    },

    toggleAgentCondition(agentId, cond) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      if (!agent.conditions) agent.conditions = { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false };
      agent.conditions[cond] = !agent.conditions[cond];
      _autoSave();
      ToastNotifier.show(cond + ': ' + (agent.conditions[cond] ? 'ON' : 'OFF'), 'info');
    },

    addCriticalInjury(agentId) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      if (!agent.criticalInjuries) agent.criticalInjuries = [];
      agent.criticalInjuries.push({ roll: '', name: 'New Injury', effect: '', lethal: false, healing: '' });
      _autoSave();
      this.renderRoster();
      ModalManager.openAgentSheet(agent);
    },

    removeCriticalInjury(agentId, index) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent || !agent.criticalInjuries) return;
      agent.criticalInjuries.splice(index, 1);
      _autoSave();
      this.renderRoster();
      ModalManager.openAgentSheet(agent);
    },

    updateAgentNotes(agentId, notes) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      agent.notes = notes;
      _autoSave();
    },

    quickRollAgentSkill(agentId, skillKey, attrKey) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      const attrVal = (agent.attributes[attrKey] || 2) - (agent.attributeDamage[attrKey] || 0);
      const skillVal = agent.skills[skillKey] || 0;
      DiceRoller.openRoller(agent);
      setTimeout(() => {
        const attrEl = document.getElementById('dr-attr');
        const skillEl = document.getElementById('dr-skill');
        if (attrEl) attrEl.value = Math.max(0, attrVal);
        if (skillEl) skillEl.value = skillVal;
        DiceRoller._updatePoolSummary();
      }, 150);
    }
  };

  // --- COMBAT TRACKER ---
  const CombatTracker = {
    _panelVisible: false,

    togglePanel() {
      this._panelVisible = !this._panelVisible;
      const panel = document.getElementById('combat-tracker-panel');
      if (panel) panel.style.display = this._panelVisible ? 'block' : 'none';
      this.renderPanel();
    },

    renderPanel() {
      const panel = document.getElementById('combat-tracker-panel');
      if (!panel || !this._panelVisible) return;
      const combat = _state.combat || {};

      const combatants = [...(combat.combatants || [])].sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">Combat Tracker</div>';

      html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; font-size:12px; margin-bottom:6px;">';
      html += '<span>Round: <strong>' + (combat.round || 0) + '</strong></span>';
      html += '<div>';
      if (!combat.active) {
        html += '<button class="btn-small primary" onclick="NR.startCombat()" style="font-size:11px;">Start Combat</button>';
      } else {
        html += '<button class="btn-small" onclick="NR.nextCombatTurn()" style="font-size:11px;">Next Turn</button> ';
        html += '<button class="btn-small danger" onclick="NR.endCombat()" style="font-size:11px;">End Combat</button>';
      }
      html += '</div></div>';

      if (combatants.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No combatants. Add agents, NPCs, or custom entries.</div>';
      } else {
        combatants.forEach((c, i) => {
          const isCurrent = combat.active && i === combat.currentTurnIndex;
          const initSuit = c.initiativeSuit || '';
          html += '<div style="padding:5px 8px; margin-bottom:3px; border:1px solid ' + (isCurrent ? 'var(--red-stamp)' : 'var(--rule)') + '; background:' + (isCurrent ? 'rgba(139,26,26,0.08)' : 'var(--field-bg)') + '; cursor:pointer;" onclick="NR.combatantAction(\'' + c.id + '\')">';
          html += '<div style="display:flex; justify-content:space-between; align-items:center;">';
          html += '<span style="font-family:var(--font-fill); font-size:12px; font-weight:bold;">' + (isCurrent ? '> ' : '') + c.name + '</span>';
          html += '<span style="font-size:11px; color:var(--ink-faded);">Init: ' + (c.initiative || 0) + (initSuit ? ' ' + initSuit : '') + '</span>';
          html += '</div>';
          html += '<div style="display:flex; gap:6px; font-size:10px; color:var(--ink-faded); margin-top:2px;">';
          html += '<span>Zone: ' + (c.zone || 'Near') + '</span>';
          html += '<span>Slow: <span class="checkbox' + (c.slowActionUsed ? ' checked' : '') + '"></span></span>';
          html += '<span>Fast: <span class="checkbox' + (c.fastActionUsed ? ' checked' : '') + '"></span></span>';
          if (c.coverActive) html += '<span style="color:var(--green-stamp);">[Cover +2 AR]</span>';
          html += '</div>';
          html += '</div>';
        });
      }

      html += '<div style="padding:8px; display:flex; gap:4px; flex-wrap:wrap;">';
      html += '<button class="btn-small" onclick="NR.addAgentToCombat()" style="font-size:11px;">+ Agent</button>';
      html += '<button class="btn-small" onclick="NR.addNPCToCombat()" style="font-size:11px;">+ NPC</button>';
      html += '<button class="btn-small" onclick="NR.addCustomCombatant()" style="font-size:11px;">+ Custom</button>';
      if (combat.active) {
        html += '<button class="btn-small" onclick="NR.drawInitiative()" style="font-size:11px;">Draw Init</button>';
      }
      html += '</div>';

      panel.innerHTML = html;
      panel.style.display = 'block';
    },

    startCombat() {
      const combat = _state.combat;
      combat.active = true;
      combat.round = 1;
      combat.currentTurnIndex = 0;
      (combat.combatants || []).forEach(c => {
        c.initiative = Math.floor(Math.random() * 10) + 1;
        c.initiativeSuit = ['S','H','D','C'][Math.floor(Math.random() * 4)];
        c.slowActionUsed = false;
        c.fastActionUsed = false;
      });
      _autoSave();
      this.renderPanel();
      ToastNotifier.show('Combat started! Round 1', 'success');
      SessionLogger.log('combat', 'Combat started, Round 1');
    },

    endCombat() {
      if (!confirm('End combat?')) return;
      _state.combat.active = false;
      _state.combat.round = 0;
      _state.combat.currentTurnIndex = 0;
      (_state.combat.combatants || []).forEach(c => {
        c.slowActionUsed = false;
        c.fastActionUsed = false;
        c.coverActive = false;
      });
      _autoSave();
      this.renderPanel();
      ToastNotifier.show('Combat ended', 'info');
      SessionLogger.log('combat', 'Combat ended');
    },

    nextCombatTurn() {
      const combat = _state.combat;
      if (!combat.active || !combat.combatants || combat.combatants.length === 0) return;
      combat.currentTurnIndex = (combat.currentTurnIndex + 1) % combat.combatants.length;
      if (combat.currentTurnIndex === 0) {
        combat.round++;
        combat.combatants.forEach(c => { c.slowActionUsed = false; c.fastActionUsed = false; });
        ToastNotifier.show('Round ' + combat.round, 'info');
      }
      _autoSave();
      this.renderPanel();
    },

    addAgentToCombat() {
      const agents = _state.agents || [];
      if (agents.length === 0) { ToastNotifier.show('No agents in roster', 'warn'); return; }
      const combat = _state.combat;
      if (!combat.combatants) combat.combatants = [];
      const existingIds = new Set(combat.combatants.map(c => c.id));
      let added = 0;
      agents.forEach(a => {
        if (!existingIds.has(a.id)) {
          combat.combatants.push({
            id: a.id, name: a.name, type: 'agent',
            initiative: 0, initiativeSuit: '',
            slowActionUsed: false, fastActionUsed: false,
            zone: 'Near', coverActive: false
          });
          added++;
        }
      });
      if (added === 0) { ToastNotifier.show('All agents already in combat', 'info'); return; }
      _autoSave();
      this.renderPanel();
      ToastNotifier.show(added + ' agent(s) added to combat', 'success');
    },

    addNPCToCombat() {
      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs || [];
      const combat = _state.combat;
      if (!combat.combatants) combat.combatants = [];
      const existingIds = new Set(combat.combatants.map(c => c.id));
      const name = prompt('Enter NPC name (or leave blank for quick menu):');
      if (name === null) return;
      if (name) {
        const id = 'combatant-' + Date.now();
        combat.combatants.push({
          id: id, name: name, type: 'npc',
          initiative: 0, initiativeSuit: '',
          slowActionUsed: false, fastActionUsed: false,
          zone: 'Near', coverActive: false
        });
      } else {
        let added = 0;
        npcs.forEach(n => {
          if (!existingIds.has(n.id) && added < 3) {
            combat.combatants.push({
              id: n.id, name: n.name, type: 'npc',
              initiative: 0, initiativeSuit: '',
              slowActionUsed: false, fastActionUsed: false,
              zone: 'Near', coverActive: false
            });
            added++;
          }
        });
        if (added === 0) ToastNotifier.show('NPCs already in combat', 'info');
        else ToastNotifier.show(added + ' NPC(s) added', 'success');
      }
      _autoSave();
      this.renderPanel();
    },

    addCustomCombatant() {
      const name = prompt('Combatant name:');
      if (!name) return;
      const combat = _state.combat;
      if (!combat.combatants) combat.combatants = [];
      combat.combatants.push({
        id: 'combatant-' + Date.now(), name: name, type: 'custom',
        initiative: 0, initiativeSuit: '',
        slowActionUsed: false, fastActionUsed: false,
        zone: 'Near', coverActive: false
      });
      _autoSave();
      this.renderPanel();
      ToastNotifier.show('Combatant added: ' + name, 'success');
    },

    drawInitiative() {
      const combat = _state.combat;
      if (!combat.combatants) return;
      combat.combatants.forEach(c => {
        c.initiative = Math.floor(Math.random() * 10) + 1;
        c.initiativeSuit = ['S','H','D','C'][Math.floor(Math.random() * 4)];
      });
      combat.currentTurnIndex = 0;
      _autoSave();
      this.renderPanel();
      ToastNotifier.show('Initiative drawn!', 'success');
    },

    combatantAction(combatantId) {
      const combat = _state.combat;
      const c = (combat.combatants || []).find(x => x.id === combatantId);
      if (!c) return;

      let content = '<div>';
      content += '<h3>' + c.name + ' - Actions</h3>';
      content += '<div style="margin-bottom:8px;"><span style="font-size:11px;">Zone:</span> ';
      content += '<select onchange="NR.moveCombatant(\'' + c.id + '\', this.value)" style="font-family:var(--font-fill); font-size:12px;">';
      ['Engaged','Near','Far','Distant'].forEach(z => {
        content += '<option value="' + z + '"' + (c.zone === z ? ' selected' : '') + '>' + z + '</option>';
      });
      content += '</select></div>';

      content += '<div style="margin-bottom:6px;">';
      content += '<button class="btn-small' + (c.slowActionUsed ? ' danger' : '') + '" onclick="NR.toggleCombatAction(\'' + c.id + '\', \'slow\')" style="width:100%; margin-bottom:3px;">Slow Action ' + (c.slowActionUsed ? 'Used' : 'Available') + '</button>';
      content += '<button class="btn-small' + (c.fastActionUsed ? ' danger' : '') + '" onclick="NR.toggleCombatAction(\'' + c.id + '\', \'fast\')" style="width:100%; margin-bottom:3px;">Fast Action ' + (c.fastActionUsed ? 'Used' : 'Available') + '</button>';
      content += '<button class="btn-small" onclick="NR.toggleCombatCover(\'' + c.id + '\')" style="width:100%;">Cover ' + (c.coverActive ? 'Active (+2 AR)' : 'Inactive') + '</button>';
      content += '</div>';

      content += '<div style="margin-bottom:6px;">';
      content += '<span style="font-size:11px;">Quick Damage:</span> ';
      content += '<input id="dmg-amount" type="number" value="1" min="1" max="5" style="width:50px; font-family:var(--font-fill); font-size:12px;"> ';
      content += '<button class="btn-small danger" onclick="NR.applyCombatDamage(\'' + c.id + '\', parseInt(document.getElementById(\'dmg-amount\').value) || 1)">Apply Damage</button>';
      content += '</div>';

      content += '<button class="btn-small danger" onclick="NR.removeCombatant(\'' + c.id + '\')">Remove from Combat</button>';
      content += '</div>';

      const footer = '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      ModalManager.open('Combat Action - ' + c.name, content, footer);
    },

    toggleCombatAction(combatantId, actionType) {
      const c = (_state.combat.combatants || []).find(x => x.id === combatantId);
      if (!c) return;
      if (actionType === 'slow') c.slowActionUsed = !c.slowActionUsed;
      if (actionType === 'fast') c.fastActionUsed = !c.fastActionUsed;
      _autoSave();
      this.renderPanel();
      ModalManager.close();
    },

    toggleCombatCover(combatantId) {
      const c = (_state.combat.combatants || []).find(x => x.id === combatantId);
      if (!c) return;
      c.coverActive = !c.coverActive;
      _autoSave();
      this.renderPanel();
      ModalManager.close();
    },

    moveCombatant(combatantId, zone) {
      const c = (_state.combat.combatants || []).find(x => x.id === combatantId);
      if (!c) return;
      c.zone = zone;
      _autoSave();
      this.renderPanel();
    },

    applyCombatDamage(combatantId, amount) {
      const agent = (_state.agents || []).find(a => a.id === combatantId);
      if (agent) {
        const attrs = ['strength', 'agility'];
        for (const attr of attrs) {
          const curDmg = agent.attributeDamage[attr] || 0;
          const maxVal = agent.attributes[attr] || 2;
          if (curDmg < maxVal) {
            const newDmg = Math.min(maxVal, curDmg + amount);
            agent.attributeDamage[attr] = newDmg;
            _autoSave();
            AgentTracker.renderRoster();
            ToastNotifier.show(amount + ' physical damage -> ' + agent.name + ' ' + attr.toUpperCase(), 'warn');
            ModalManager.close();
            CombatTracker.renderPanel();
            return;
          }
        }
        ToastNotifier.show(agent.name + ' is already physically broken!', 'warn');
      } else {
        ToastNotifier.show(amount + ' damage noted for ' + (combatantId || 'target'), 'info');
        ModalManager.close();
      }
    },

    removeCombatant(combatantId) {
      _state.combat.combatants = (_state.combat.combatants || []).filter(c => c.id !== combatantId);
      _autoSave();
      this.renderPanel();
      ModalManager.close();
      ToastNotifier.show('Combatant removed', 'info');
    }
  };

  // --- SOCIAL TRACKER ---
  const SocialTracker = {
    _panelVisible: false,

    togglePanel() {
      this._panelVisible = !this._panelVisible;
      const panel = document.getElementById('social-tracker-panel');
      if (panel) panel.style.display = this._panelVisible ? 'block' : 'none';
      this.renderPanel();
    },

    renderPanel() {
      const panel = document.getElementById('social-tracker-panel');
      if (!panel || !this._panelVisible) return;

      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs || [];
      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">Social Tracker</div>';

      npcs.forEach(npc => {
        const disp = npc.disposition || 3;
        const dispLevel = NR_DATA.DISPOSITION_LEVELS.find(d => d.value === disp);
        html += '<div style="padding:5px 8px; margin-bottom:4px; border:1px solid var(--rule); background:var(--field-bg);">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        html += '<span style="font-family:var(--font-fill); font-size:12px; font-weight:bold; cursor:pointer;" onclick="NR.openNPCCardModal(\'' + npc.id + '\')">' + npc.name + '</span>';
        html += '<span style="font-size:11px;">' + (dispLevel ? dispLevel.name : '') + ' (' + disp + '/5)</span>';
        html += '</div>';
        html += '<div style="display:flex; gap:3px; margin-top:4px;">';
        html += '<button class="btn-small" onclick="NR.adjustDisposition(\'' + npc.id + '\', ' + Math.max(1, disp - 1) + ')" style="font-size:10px; padding:2px 6px;">-</button>';
        for (let v = 1; v <= 5; v++) {
          html += '<div style="flex:1; height:4px; background:' + (v <= disp ? '#666' : '#ddd') + ';"></div>';
        }
        html += '<button class="btn-small" onclick="NR.adjustDisposition(\'' + npc.id + '\', ' + Math.min(5, disp + 1) + ')" style="font-size:10px; padding:2px 6px;">+</button>';
        html += '</div>';

        html += '<div style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">';
        NR_DATA.SOCIAL_MANEUVERS.forEach(m => {
          html += '<button class="btn-small" onclick="NR.socialManeuver(\'' + npc.id + '\', \'' + m.key + '\')" style="font-size:10px; padding:3px 5px;">' + m.name + '</button>';
        });
        html += '</div>';

        html += '</div>';
      });

      panel.innerHTML = html;
      panel.style.display = 'block';
    },

    adjustDisposition(npcId, newVal) {
      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs;
      const npc = npcs.find(n => n.id === npcId);
      if (!npc) return;
      const oldVal = npc.disposition || 3;
      npc.disposition = Math.max(1, Math.min(5, newVal));
      this.renderPanel();
      const oldLevel = NR_DATA.DISPOSITION_LEVELS.find(d => d.value === oldVal);
      const newLevel = NR_DATA.DISPOSITION_LEVELS.find(d => d.value === npc.disposition);
      ToastNotifier.show(npc.name + ': ' + (oldLevel ? oldLevel.name : '') + ' -> ' + (newLevel ? newLevel.name : ''), 'info');
    },

    socialManeuver(npcId, maneuverKey) {
      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs;
      const npc = npcs.find(n => n.id === npcId);
      if (!npc) return;
      const maneuver = NR_DATA.SOCIAL_MANEUVERS.find(m => m.key === maneuverKey);
      if (!maneuver) return;

      const disp = npc.disposition || 3;
      const difficulty = disp >= 4 ? 1 : disp >= 3 ? 2 : disp >= 2 ? 3 : 99;

      if (difficulty === 99) {
        ToastNotifier.show(npc.name + ' is Closed - social rolls impossible', 'warn');
        return;
      }

      DiceRoller.openRoller();
      setTimeout(() => {
        const diffEl = document.getElementById('dr-diff');
        if (diffEl) diffEl.value = difficulty;
        const skillName = maneuver.skill;
        const agent = (_state.agents || []).sort((a, b) => (b.skills[skillName] || 0) - (a.skills[skillName] || 0))[0];
        if (agent) {
          const attrKey = NR_DATA.SKILL_LIST.find(s => s.key === skillName)?.attr || 'empathy';
          const attrVal = (agent.attributes[attrKey] || 2) - (agent.attributeDamage[attrKey] || 0);
          const skillVal = agent.skills[skillName] || 0;
          const attrEl = document.getElementById('dr-attr');
          const skillEl = document.getElementById('dr-skill');
          if (attrEl) attrEl.value = Math.max(0, attrVal);
          if (skillEl) skillEl.value = skillVal;
          DiceRoller._updatePoolSummary();
        }
      }, 150);

      ToastNotifier.show(maneuver.name + ' vs ' + npc.name + ' (Diff ' + difficulty + ')', 'info');
    }
  };

  // --- NPC ROSTER ---
  const NPCRoster = {
    _panelVisible: false,

    toggle() {
      this._panelVisible = !this._panelVisible;
      const panel = document.getElementById('npc-roster-panel');
      if (panel) panel.style.display = this._panelVisible ? 'block' : 'none';
      this.render();
    },

    render() {
      const panel = document.getElementById('npc-roster-panel');
      if (!panel) return;
      if (!this._panelVisible) { panel.style.display = 'none'; return; }
      panel.style.display = 'block';

      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs || [];
      const hasCase = !!(_state.case && _state.case.caseId);

      const dispColors = { 1: '#8b1a1a', 2: '#cc4400', 3: '#888888', 4: '#2d5a27', 5: '#3366cc' };
      const dispNames = { 1: 'Closed', 2: 'Hostile', 3: 'Guarded', 4: 'Cautious', 5: 'Open / Allied' };

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">NPC Roster</div>';

      if (!hasCase || npcs.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No NPCs — load a case file first.</div>';
      } else {
        npcs.forEach(npc => {
          const disp = npc.disposition || 3;
          const color = dispColors[disp] || '#888888';
          html += '<div style="padding:6px 8px; border-bottom:1px dotted var(--rule-light); cursor:pointer;" onclick="NR.openNPCCardModal(\'' + npc.id + '\')" title="Click for full NPC card">';
          html += '<div style="font-family:var(--font-fill); font-size:12px; font-weight:bold;">' + npc.name + '</div>';
          html += '<div style="font-size:10px; color:var(--ink-faded); margin-top:2px;">' + (npc.role || '') + '</div>';
          html += '<div style="font-size:10px; color:var(--ink-faded);">' + (npc.organization || '') + '</div>';
          html += '<div style="font-size:10px; margin-top:3px; font-weight:bold; color:' + color + ';">' + (dispNames[disp] || 'Guarded') + ' (' + disp + '/5)</div>';
          html += '</div>';
        });
      }
      panel.innerHTML = html;
    }
  };

  // --- LOCATION LIST ---
  const LocationList = {
    _panelVisible: false,

    toggle() {
      this._panelVisible = !this._panelVisible;
      const panel = document.getElementById('location-list-panel');
      if (panel) panel.style.display = this._panelVisible ? 'block' : 'none';
      this.render();
    },

    render() {
      const panel = document.getElementById('location-list-panel');
      if (!panel) return;
      if (!this._panelVisible) { panel.style.display = 'none'; return; }
      panel.style.display = 'block';

      const caseData = _getActiveCaseData();
      const locations = caseData.locations || [];
      const hasCase = !!(_state.case && _state.case.caseId);

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">Locations</div>';

      if (!hasCase || locations.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No locations — load a case file first.</div>';
      } else {
        locations.forEach(loc => {
          const briefDesc = (loc.description || '').length > 80
            ? (loc.description || '').substring(0, 80) + '...'
            : (loc.description || '');
          const availRaw = loc.availability || '';
          const availDisplay = (availRaw === 'open' || availRaw.toLowerCase().includes('always'))
            ? 'Always Available'
            : (availRaw || 'Clue-locked');
          const npcCount = (loc.npcsPresent || '').split(',').filter(function(n) { return n.trim(); }).length;

          html += '<div style="padding:6px 8px; border-bottom:1px dotted var(--rule-light); cursor:pointer;" onclick="NR.openLocationModal(\'' + loc.id + '\')" title="Click for full location details">';
          html += '<div style="font-family:var(--font-fill); font-size:12px; font-weight:bold;">' + loc.id + ' \u2014 ' + loc.name + '</div>';
          html += '<div style="font-size:10px; color:var(--ink-faded); margin-top:2px;">' + briefDesc + '</div>';
          html += '<div style="display:flex; gap:10px; font-size:10px; color:var(--green-stamp); margin-top:3px;">';
          html += '<span>' + availDisplay + '</span>';
          html += '<span>NPCs: ' + npcCount + '</span>';
          html += '</div></div>';
        });
      }
      panel.innerHTML = html;
    }
  };

  // --- SANDBOX MODE ---
  const SandboxMode = {
    _active: false,
    _snapshot: null,

    isActive() { return this._active; },

    toggle() {
      if (this._active) {
        this.discard();
      } else {
        this._snapshot = _deepClone(_state);
        this._active = true;
        document.body.classList.add('sandbox-mode');
        const indicator = document.getElementById('sandbox-indicator');
        if (indicator) indicator.style.display = 'block';
        ToastNotifier.show('SANDBOX MODE: Changes will not affect game state', 'info', 4000);
      }
    },

    apply() {
      if (!this._active) return;
      if (!confirm('Apply all sandbox changes to the real game state?')) return;
      this._active = false;
      this._snapshot = null;
      document.body.classList.remove('sandbox-mode');
      const indicator = document.getElementById('sandbox-indicator');
      if (indicator) indicator.style.display = 'none';
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Sandbox changes APPLIED', 'success');
      SessionLogger.log('state', 'Sandbox changes applied');
    },

    discard() {
      if (!this._active) return;
      if (this._snapshot) {
        _undoStack = this._snapshot.undoStack || [];
        _redoStack = this._snapshot.redoStack || [];
        _state = this._snapshot;
        _state.undoStack = _undoStack;
        _state.redoStack = _redoStack;
        this._snapshot = null;
        _autoSave();
      }
      this._active = false;
      document.body.classList.remove('sandbox-mode');
      const indicator = document.getElementById('sandbox-indicator');
      if (indicator) indicator.style.display = 'none';
      BoardRenderer.render();
      PressureMeter.render();
      AgentTracker.renderRoster();
      CombatTracker.renderPanel();
      SocialTracker.renderPanel();
      ToastNotifier.show('Sandbox changes DISCARDED', 'info');
      SessionLogger.log('state', 'Sandbox changes discarded');
    }
  };

  // --- INFO WEB MAP ---
  const InfoWebMap = {
    _visible: false,

    toggle() {
      this._visible = !this._visible;
      const overlay = document.getElementById('infoweb-overlay');
      if (overlay) overlay.style.display = this._visible ? 'flex' : 'none';
      if (this._visible) this.render();
    },

    render() {
      const container = document.getElementById('infoweb-content');
      if (!container) return;
      const caseData = _getActiveCaseData();
      const infoCards = caseData.infoCards || [];
      const locations = caseData.locations || [];
      const npcs = caseData.npcs || [];
      const discovered = (_state.case.discoveredInfo) || [];

      const nodes = [];
      infoCards.forEach(info => {
        const dStatus = discovered.includes(info.id) ? (info.truthStatus ? 'understood' : 'found') : 'undiscovered';
        nodes.push({ id: info.id, type: 'info', label: info.id, status: dStatus, data: info });
      });
      locations.forEach(loc => {
        const unlocked = (_state.case.unlockedLocations || []).includes(loc.id);
        nodes.push({ id: loc.id, type: 'location', label: loc.id + ' ' + loc.name, status: unlocked ? 'found' : 'undiscovered', data: loc });
      });
      npcs.forEach(npc => {
        const revealed = (_state.case.revealedNPCs || []).includes(npc.id);
        nodes.push({ id: npc.id, type: 'npc', label: npc.name, status: revealed ? 'found' : 'undiscovered', data: npc });
      });

      const edges = [];
      infoCards.forEach(info => {
        (info.foundAt || []).forEach(locId => {
          if (nodes.some(n => n.id === locId)) edges.push({ from: info.id, to: locId });
        });
        (info.knownBy || []).forEach(npcName => {
          const npc = npcs.find(n => n.id === npcName || n.name === npcName);
          if (npc) edges.push({ from: info.id, to: npc.id });
        });
      });
      npcs.forEach(npc => {
        (npc.locations || []).forEach(locId => {
          if (nodes.some(n => n.id === locId)) edges.push({ from: npc.id, to: locId });
        });
        (npc.startingKnowledge || []).forEach(k => {
          if (nodes.some(n => n.id === k.info)) edges.push({ from: npc.id, to: k.info });
        });
      });

      let html = '<div style="max-height:60vh; overflow-y:auto; padding:8px;">';
      html += '<div style="font-family:var(--font-main); font-size:12px; margin-bottom:10px; border-bottom:1px solid var(--rule); padding-bottom:4px;">Information Web Map</div>';
      html += '<div style="display:flex; gap:12px; margin-bottom:12px; font-size:10px;">';
      html += '<span style="display:flex; align-items:center; gap:3px;"><span style="display:inline-block; width:10px; height:10px; background:#999;"></span> Undiscovered</span>';
      html += '<span style="display:flex; align-items:center; gap:3px;"><span style="display:inline-block; width:10px; height:10px; background:var(--green-stamp);"></span> Found</span>';
      html += '<span style="display:flex; align-items:center; gap:3px;"><span style="display:inline-block; width:10px; height:10px; background:var(--red-stamp);"></span> Understood</span>';
      html += '</div>';
      html += '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:6px;">';
      nodes.forEach(node => {
        let bg = '#999';
        if (node.status === 'found') bg = 'var(--green-stamp)';
        if (node.status === 'understood') bg = 'var(--red-stamp)';
        const tag = node.type === 'info' ? 'I' : node.type === 'location' ? 'L' : 'N';
        const onClick = node.type === 'info' ? 'NR.openInfoCardModal(\'' + node.id + '\')' :
                        node.type === 'location' ? 'NR.openLocationModal(\'' + node.id + '\')' :
                        'NR.openNPCCardModal(\'' + node.id + '\')';
        html += '<div style="padding:6px; border:1px solid var(--rule); background:var(--field-bg); cursor:pointer; border-left:3px solid ' + bg + '; font-size:11px;" onclick="' + onClick + '" title="' + node.type + ': ' + node.label + '">';
        html += '<span style="font-family:var(--font-fill); font-weight:bold; font-size:10px; color:' + bg + ';">[' + tag + ']</span> ';
        html += '<span style="color:var(--ink);">' + node.label + '</span>';
        const connected = edges.filter(e => e.from === node.id || e.to === node.id);
        if (connected.length > 0) {
          html += '<div style="font-size:9px; color:var(--ink-light); margin-top:2px;">';
          html += 'Links: ' + connected.map(e => (e.from === node.id ? e.to : e.from)).slice(0, 3).join(', ');
          if (connected.length > 3) html += ' +' + (connected.length - 3);
          html += '</div>';
        }
        html += '</div>';
      });
      html += '</div></div>';
      container.innerHTML = html;
    },

    close() {
      this._visible = false;
      const overlay = document.getElementById('infoweb-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  };

  // --- PROMPT GENERATOR ---
  const PromptGenerator = {
    generate() {
      const c = _state.case;
      const agents = _state.agents || [];
      const templates = NR_DATA.PROMPT_TEMPLATES || [];

      const weights = {};
      templates.forEach(t => { weights[t.type] = t.weight || 1; });

      const corrTotal = agents.reduce((sum, a) => sum + (a.corruption || 0), 0);
      if (corrTotal > 3) weights.corruption = (weights.corruption || 1) * 2;
      if (corrTotal > 8) weights.corruption = (weights.corruption || 1) * 3;

      const activeOrgs = (c.organizations || []).filter(o => o.active && o.name);
      const orgsWithMilestones = activeOrgs.filter(o => (o.milestones || []).some(m => m.triggered));
      if (orgsWithMilestones.length > 0) weights.milestone = (weights.milestone || 1) * 2;

      if ((_state.combat || {}).active) weights.combat = (weights.combat || 1) * 3;

      const entries = [];
      for (const [type, w] of Object.entries(weights)) {
        for (let i = 0; i < w; i++) entries.push(type);
      }
      const chosenType = entries.length > 0 ? entries[Math.floor(Math.random() * entries.length)] : 'atmosphere';
      const typeTemplates = templates.find(t => t.type === chosenType);
      if (!typeTemplates || !typeTemplates.templates) return 'The board is quiet. Let the agents drive the scene.';

      let template = typeTemplates.templates[Math.floor(Math.random() * typeTemplates.templates.length)];

      const agent = agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)] : null;
      const activeOrg = activeOrgs.length > 0 ? activeOrgs[Math.floor(Math.random() * activeOrgs.length)] : null;
      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs || [];
      const npc = npcs.length > 0 ? npcs[Math.floor(Math.random() * npcs.length)] : null;

      if (agent) template = template.replace(/{agent}/g, agent.name);
      if (activeOrg) {
        template = template.replace(/{org_name}/g, activeOrg.name);
        const ms = (activeOrg.milestones || []).find(m => m.triggered);
        template = template.replace(/{milestone_desc}/g, ms ? ms.description : 'a milestone has fired');
      }
      if (npc) {
        template = template.replace(/{npc_name}/g, npc.name);
        const dispLevel = NR_DATA.DISPOSITION_LEVELS.find(d => d.value === (npc.disposition || 3));
        template = template.replace(/{disposition}/g, dispLevel ? dispLevel.name : 'Guarded');
      }
      template = template.replace(/{shift_name}/g, 'Morning');
      template = template.replace(/{day}/g, String(c.currentDayDisplay || PressureMeter._computeCurrentDay()));
      template = template.replace(/{chain_desc}/g, 'cross-advance chain');
      template = template.replace(/{info_id}/g, 'I1');
      template = template.replace(/{loc_name}/g, 'a location');

      return template;
    },

    showPrompt() {
      const prompt = this.generate();
      this._lastPrompt = prompt;
      let content = '<div style="text-align:center; padding:20px;">';
      content += '<div style="font-family:var(--font-main); font-size:13px; text-transform:uppercase; letter-spacing:1px; color:var(--ink); margin-bottom:16px; border-bottom:1px solid var(--rule);">Prompt Generator</div>';
      content += '<div class="prompt-display" style="font-family:var(--font-fill); font-size:15px; line-height:1.6; padding:16px; background:var(--field-bg); border:1px solid var(--rule); margin-bottom:12px; min-height:60px;">' + prompt + '</div>';
      content += '<button class="btn-small primary" onclick="NR.regeneratePrompt()" style="margin-right:8px;">Reroll</button>';
      content += '<button class="btn-small" onclick="NR.copyPrompt()">Copy</button>';
      content += '</div>';
      ModalManager.open('Read the Table', content, '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>');
    },

    _lastPrompt: null,

    regenerate() {
      const prompt = this.generate();
      this._lastPrompt = prompt;
      const modalBody = document.getElementById('modal-body');
      if (!modalBody) return;
      const displayEl = modalBody.querySelector('.prompt-display');
      if (displayEl) displayEl.textContent = prompt;
    },

    copyPrompt() {
      const text = this._lastPrompt || this.generate();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => ToastNotifier.show('Prompt copied!', 'success'));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        ToastNotifier.show('Prompt copied!', 'success');
      }
    }
  };

  // --- SESSION LOGGER ---
  const SessionLogger = {
    _entries: [],
    _panelVisible: false,

    init() {
      this._entries = _state.sessionLog || [];
      if (!_state.sessionLog) _state.sessionLog = [];
    },

    log(type, description, data) {
      const entry = {
        timestamp: new Date().toISOString(),
        type: type,
        description: description,
        data: data || {}
      };
      this._entries.push(entry);
      _state.sessionLog = this._entries;
      _autoSave();
      if (this._panelVisible) this.renderPanel();
    },

    getEntries(filter) {
      let entries = this._entries.slice().reverse();
      if (filter && filter.type) entries = entries.filter(e => e.type === filter.type);
      if (filter && filter.search) {
        const q = filter.search.toLowerCase();
        entries = entries.filter(e => e.description.toLowerCase().includes(q));
      }
      return entries;
    },

    togglePanel() {
      this._panelVisible = !this._panelVisible;
      const panel = document.getElementById('session-log-panel');
      if (panel) panel.style.display = this._panelVisible ? 'block' : 'none';
      if (this._panelVisible) this.renderPanel();
    },

    renderPanel() {
      const panel = document.getElementById('session-log-panel');
      if (!panel || !this._panelVisible) return;
      const typeEl = document.getElementById('log-filter-type');
      const searchEl = document.getElementById('log-filter-search');
      const filter = {};
      if (typeEl) filter.type = typeEl.value || null;
      if (searchEl) filter.search = searchEl.value || null;
      const entries = this.getEntries(filter);

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px;">Session Log</div>';

      html += '<div style="display:flex; gap:4px; padding:4px 8px; margin-bottom:4px;">';
      html += '<select id="log-filter-type" onchange="NR.filterSessionLog()" style="font-size:10px; flex:1; font-family:var(--font-fill); padding:2px;">';
      html += '<option value="">All Types</option>';
      html += '<option value="shift">Shift</option><option value="milestone">Milestone</option><option value="escalation">Escalation</option>';
      html += '<option value="combat">Combat</option><option value="social">Social</option><option value="note">Note</option>';
      html += '<option value="state">State</option><option value="roll">Roll</option>';
      html += '</select>';
      html += '<input id="log-filter-search" type="text" placeholder="Search..." oninput="NR.filterSessionLog()" style="font-size:10px; flex:1; font-family:var(--font-fill); padding:2px; border:1px solid var(--rule);">';
      html += '</div>';

      html += '<div style="padding:4px 8px; margin-bottom:4px;">';
      html += '<button class="btn-small" onclick="NR.exportSessionLog()" style="font-size:10px; width:100%;">Export Log (Markdown)</button>';
      html += '</div>';

      html += '<div style="max-height:400px; overflow-y:auto; padding:0 8px;">';
      if (entries.length === 0) {
        html += '<div style="font-size:11px; color:var(--ink-light); padding:8px;">No entries yet.</div>';
      } else {
        entries.forEach(entry => {
          const time = new Date(entry.timestamp).toLocaleTimeString();
          const typeColors = { shift: 'var(--green-stamp)', milestone: 'var(--red-stamp)', escalation: 'var(--red-stamp)', combat: '#cc6600', social: '#559', note: 'var(--ink-faded)', state: 'var(--ink-light)', roll: 'var(--accent)' };
          const color = typeColors[entry.type] || 'var(--ink-light)';
          html += '<div style="padding:4px 0; border-bottom:1px dotted var(--rule-light); font-size:11px;">';
          html += '<span style="font-size:9px; color:var(--ink-light);">' + time + '</span> ';
          html += '<span style="color:' + color + '; font-weight:bold; text-transform:uppercase; font-size:9px;">[' + entry.type + ']</span> ';
          html += '<span>' + entry.description + '</span>';
          html += '</div>';
        });
      }
      html += '</div>';
      panel.innerHTML = html;
      panel.style.display = 'block';
    },

    exportLog() {
      const entries = this._entries.slice().reverse();
      let md = '# Neon Relic - Session Log\n\n';
      md += '**Case:** ' + (_state.case.caseName || 'Untitled') + '\n';
      md += '**Exported:** ' + new Date().toISOString() + '\n\n';
      md += '| Time | Type | Description |\n';
      md += '|------|------|-------------|\n';
      entries.forEach(e => {
        const time = new Date(e.timestamp).toLocaleTimeString();
        md += '| ' + time + ' | ' + e.type + ' | ' + e.description + ' |\n';
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'neon-relic-session-log.md';
      a.click();
      URL.revokeObjectURL(url);
      ToastNotifier.show('Session log exported', 'success');
    }
  };

  // --- PRINT MANAGER ---
  const PrintManager = {
    printBoard() {
      const origTitle = document.title;
      document.title = 'Operations Board - ' + (_state.case.caseName || 'Neon Relic');
      const toolbar = document.getElementById('toolbar');
      const panels = document.querySelectorAll('.side-panel');
      const toasts = document.getElementById('toast');
      const pressure = document.getElementById('pressure-strip');
      const sandbox = document.getElementById('sandbox-indicator');
      const logPanel = document.getElementById('session-log-panel');
      const infoweb = document.getElementById('infoweb-overlay');
      const savedDisplays = new Map();
      [toolbar, toasts, pressure, sandbox, logPanel, infoweb].forEach(el => {
        if (el) { savedDisplays.set(el, el.style.display); el.style.display = 'none'; }
      });
      panels.forEach(el => { savedDisplays.set(el, el.style.display); el.style.display = 'none'; });
      window.print();
      savedDisplays.forEach((val, el) => { el.style.display = val; });
      document.title = origTitle;
      ToastNotifier.show('Board sent to printer', 'success');
    },

    printAgentSheet(agentId) {
      const agent = (_state.agents || []).find(a => a.id === agentId);
      if (!agent) return;
      const w = window.open('', '_blank', 'width=800,height=600');
      if (!w) { ToastNotifier.show('Pop-up blocked. Allow pop-ups for printing.', 'warn'); return; }
      let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Agent Dossier - ' + agent.name + '</title>';
      html += '<style>body{font-family:"Special Elite","Courier New",monospace;font-size:13px;background:#f0ead6;color:#1a1a18;padding:20px;max-width:800px;margin:0 auto;}';
      html += 'h1{font-size:18px;letter-spacing:3px;text-transform:uppercase;border-bottom:3px solid #8b1a1a;color:#8b1a1a;}';
      html += 'h2{font-size:14px;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #999;margin-top:16px;}';
      html += 'table{width:100%;border-collapse:collapse;margin:8px 0;}th{text-align:left;padding:3px 6px;font-size:11px;text-transform:uppercase;}td{padding:3px 6px;border-bottom:1px dotted #999;}';
      html += '.box{border:1px solid #999;padding:8px 12px;margin:8px 0;}';
      html += '@page{size:letter portrait;margin:0.5in;}@media print{body{background:#fff;}}</style></head><body>';
      html += '<h1>Agent Dossier: ' + agent.name + '</h1>';
      html += '<p><strong>Division:</strong> ' + (agent.division || '-') + ' | <strong>Sub-Unit:</strong> ' + (agent.subUnit || '-') + ' | <strong>CL:</strong> ' + (agent.cl || 1) + '</p>';
      html += '<h2>Attributes</h2><div class="box"><table><tr><th>Attribute</th><th>Current</th><th>Max</th><th>Damage</th></tr>';
      NR_DATA.ATTRIBUTES.forEach(attr => {
        const maxVal = agent.attributes[attr.key] || 2;
        const dmg = agent.attributeDamage[attr.key] || 0;
        html += '<tr><td>' + attr.name + '</td><td>' + (maxVal - dmg) + '</td><td>' + maxVal + '</td><td>' + dmg + '</td></tr>';
      });
      html += '</table></div>';
      html += '<h2>Skills</h2><div class="box"><table><tr><th>Skill</th><th>Rating</th></tr>';
      NR_DATA.SKILL_LIST.forEach(skill => {
        const rating = agent.skills[skill.key] || 0;
        if (rating > 0) html += '<tr><td>' + skill.name + '</td><td>' + rating + '</td></tr>';
      });
      html += '</table></div>';
      html += '<p><strong>Corruption:</strong> ' + (agent.corruption || 0) + '</p>';
      html += '</body></html>';
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    },

    printNPCCards() {
      const caseData = _getActiveCaseData();
      const npcs = caseData.npcs || [];
      if (npcs.length === 0) { ToastNotifier.show('No NPC data available', 'warn'); return; }
      const w = window.open('', '_blank', 'width=800,height=600');
      if (!w) { ToastNotifier.show('Pop-up blocked', 'warn'); return; }
      let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NPC Cards</title>';
      html += '<style>body{font-family:"Special Elite","Courier New",monospace;font-size:10px;background:#fff;color:#1a1a18;margin:0;padding:0;}';
      html += '.page{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;width:8.5in;height:11in;padding:0.3in;page-break-after:always;box-sizing:border-box;}';
      html += '.card{border:1.5px solid #999;padding:8px;background:#f0ead6;display:flex;flex-direction:column;overflow:hidden;}';
      html += '.card h3{font-size:12px;margin:0 0 4px 0;border-bottom:1px solid #999;padding-bottom:2px;}';
      html += '.card .role{font-size:10px;color:#4a4a42;margin-bottom:4px;}';
      html += '@page{size:letter portrait;margin:0;}@media print{body{background:#fff;}}</style></head><body>';
      for (let i = 0; i < npcs.length; i += 4) {
        html += '<div class="page">';
        for (let j = i; j < Math.min(i + 4, npcs.length); j++) {
          const npc = npcs[j];
          html += '<div class="card"><h3>' + npc.name + '</h3>';
          html += '<div class="role">' + (npc.role || '') + ' | ' + (npc.organization || '') + '</div>';
          html += '<div style="font-size:10px;line-height:1.3;"><strong>Secret:</strong> ' + (npc.secret || '') + '</div>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</body></html>';
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    },

    printInfoCards() {
      const caseData = _getActiveCaseData();
      const cards = caseData.infoCards || [];
      if (cards.length === 0) { ToastNotifier.show('No information cards available', 'warn'); return; }
      const w = window.open('', '_blank', 'width=800,height=600');
      if (!w) { ToastNotifier.show('Pop-up blocked', 'warn'); return; }
      let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Information Cards</title>';
      html += '<style>body{font-family:"Courier Prime","Courier New",monospace;font-size:10px;background:#fff;color:#1a1a18;margin:0;padding:0;}';
      html += '.page{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;width:8.5in;height:11in;padding:0.3in;page-break-after:always;box-sizing:border-box;}';
      html += '.card{border:2px solid #999;padding:10px;background:#f0ead6;display:flex;flex-direction:column;}';
      html += '.card .id{font-family:"Special Elite",monospace;font-size:14px;font-weight:bold;border-bottom:2px solid;padding-bottom:2px;margin-bottom:6px;}';
      html += '.card .id.truth{border-color:#8b1a1a;color:#8b1a1a;}';
      html += '.card .id.intel{border-color:#2d5a27;color:#2d5a27;}';
      html += '@page{size:letter portrait;margin:0;}@media print{body{background:#fff;}}</style></head><body>';
      for (let i = 0; i < cards.length; i += 4) {
        html += '<div class="page">';
        for (let j = i; j < Math.min(i + 4, cards.length); j++) {
          const card = cards[j];
          const isTruth = card.type === 'containment-truth';
          html += '<div class="card"><div class="id ' + (isTruth ? 'truth' : 'intel') + '">' + card.id + '</div>';
          html += '<div style="font-size:11px;line-height:1.4;flex:1;">' + (card.content || '') + '</div></div>';
        }
        html += '</div>';
      }
      html += '</body></html>';
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  };

  // --- TOAST NOTIFIER ---
  const ToastNotifier = {
    show(msg, type, duration) {
      type = type || 'info';
      duration = duration || 2500;
      const toast = document.getElementById('toast');
      if (!toast) return;
      if (toast._timeout) clearTimeout(toast._timeout);
      toast.textContent = msg;
      toast.className = 'toast show ' + type;
      toast._timeout = setTimeout(() => { toast.className = 'toast'; }, duration);
    }
  };

  // --- SAVE / LOAD MANAGER ---
  const SAVE_PREFIX = 'nr-da-board-save-';
  const MAX_SLOTS = 10;

  const SaveManager = {
    getSlotKey(i) { return SAVE_PREFIX + i; },

    getSlotList() {
      const slots = [];
      for (let i = 0; i < MAX_SLOTS; i++) {
        try {
          const raw = localStorage.getItem(this.getSlotKey(i));
          if (raw) {
            const data = JSON.parse(raw);
            slots.push({ index: i, name: data.name || 'Unnamed Save', timestamp: data.timestamp || '', summary: data.summary || '', filled: true });
          } else {
            slots.push({ index: i, name: '', timestamp: '', summary: '', filled: false });
          }
        } catch(e) {
          slots.push({ index: i, name: '(Corrupted)', timestamp: '', summary: '', filled: true, corrupted: true });
        }
      }
      return slots;
    },

    saveToSlot(index) {
      if (index < 0 || index >= MAX_SLOTS) return false;
      const c = _state.case;
      const savedName = (c.caseName || 'Session') + ' \u2014 ' + new Date().toLocaleDateString();
      const summary = this._buildSummary();
      const slotData = {
        name: savedName,
        timestamp: new Date().toISOString(),
        summary: summary,
        state: _deepClone(_state)
      };
      try {
        localStorage.setItem(this.getSlotKey(index), JSON.stringify(slotData));
        ToastNotifier.show('Game saved to \'' + savedName + '\'', 'success');
        SessionLogger.log('state', 'Game saved to slot ' + index + ': ' + savedName);
        return true;
      } catch(e) {
        ToastNotifier.show('Save failed: ' + e.message, 'warn');
        return false;
      }
    },

    loadFromSlot(index) {
      if (index < 0 || index >= MAX_SLOTS) return false;
      try {
        const raw = localStorage.getItem(this.getSlotKey(index));
        if (!raw) { ToastNotifier.show('Save slot ' + (index + 1) + ' is empty.', 'warn'); return false; }
        const data = JSON.parse(raw);
        if (!data.state) { ToastNotifier.show('Save slot is corrupted.', 'warn'); return false; }
        StateManager.replaceState(data.state);
        BoardRenderer.render();
        AgentTracker.renderRoster();
        PressureMeter.render();
        CombatTracker.renderPanel();
        SocialTracker.renderPanel();
        ToastNotifier.show('Loaded: ' + (data.name || 'Unnamed Save'), 'success');
        SessionLogger.log('state', 'Game loaded from slot ' + index + ': ' + (data.name || 'Unnamed'));
        return true;
      } catch(e) {
        ToastNotifier.show('Load failed: ' + e.message, 'warn');
        return false;
      }
    },

    deleteSlot(index) {
      if (index < 0 || index >= MAX_SLOTS) return;
      localStorage.removeItem(this.getSlotKey(index));
      ToastNotifier.show('Save slot ' + (index + 1) + ' deleted.', 'info');
    },

    openSaveModal() {
      const slots = this.getSlotList();
      let body = '<h3>Save Game</h3>';
      body += '<p style="font-size:11px; color:var(--ink-faded); margin-bottom:10px;">Save the current game state to a named slot. Auto-save (working state) is separate and persists automatically.</p>';
      body += '<div style="display:flex; flex-direction:column; gap:6px;">';
      slots.forEach(slot => {
        if (slot.filled) {
          body += '<div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--rule); background:var(--field-bg);">';
          body += '<div style="flex:1;"><div style="font-family:var(--font-fill); font-size:13px; font-weight:bold;">' + slot.name + '</div>';
          body += '<div style="font-size:10px; color:var(--ink-faded);">' + new Date(slot.timestamp).toLocaleString() + '</div>';
          body += '<div style="font-size:10px; color:var(--ink-light);">' + (slot.summary || '') + '</div></div>';
          body += '<button class="btn-small primary" onclick="NR.saveToSlot(' + slot.index + ')" style="flex-shrink:0;">Overwrite</button>';
          body += '</div>';
        } else {
          body += '<div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--rule-light); background:var(--field-bg);">';
          body += '<div style="flex:1; font-size:11px; color:var(--ink-light);">Slot ' + (slot.index + 1) + ' \u2014 Empty</div>';
          body += '<button class="btn-small primary" onclick="NR.saveToSlot(' + slot.index + ')" style="flex-shrink:0;">Save Here</button>';
          body += '</div>';
        }
      });
      body += '</div>';
      ModalManager.open('Save Game', body, '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>');
    },

    openLoadModal() {
      const slots = this.getSlotList();
      let body = '<h3>Load Game</h3>';
      body += '<p style="font-size:11px; color:var(--ink-faded); margin-bottom:10px;">Load a previously saved game state. This will replace your current game.</p>';
      body += '<div style="display:flex; flex-direction:column; gap:6px;">';
      let hasFilled = false;
      slots.forEach(slot => {
        if (slot.filled && !slot.corrupted) {
          hasFilled = true;
          body += '<div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--rule); background:var(--field-bg);">';
          body += '<div style="flex:1;"><div style="font-family:var(--font-fill); font-size:13px; font-weight:bold;">' + slot.name + '</div>';
          body += '<div style="font-size:10px; color:var(--ink-faded);">' + new Date(slot.timestamp).toLocaleString() + '</div>';
          body += '<div style="font-size:10px; color:var(--ink-light);">' + (slot.summary || '') + '</div></div>';
          body += '<button class="btn-small primary" onclick="NR.loadFromSlot(' + slot.index + ')" style="flex-shrink:0;">Load</button>';
          body += '<button class="btn-small danger" onclick="NR.deleteSlot(' + slot.index + ')" style="flex-shrink:0;">Delete</button>';
          body += '</div>';
        } else if (!slot.filled) {
          body += '<div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--rule-light); background:var(--field-bg);">';
          body += '<div style="flex:1; font-size:11px; color:var(--ink-light);">Slot ' + (slot.index + 1) + ' \u2014 Empty</div>';
          body += '</div>';
        } else {
          body += '<div style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid var(--red-stamp); background:rgba(139,26,26,0.04);">';
          body += '<div style="flex:1; font-size:11px; color:var(--red-stamp);">Slot ' + (slot.index + 1) + ' \u2014 Corrupted</div>';
          body += '<button class="btn-small danger" onclick="NR.deleteSlot(' + slot.index + ')" style="flex-shrink:0;">Delete</button>';
          body += '</div>';
        }
      });
      if (!hasFilled) {
        body += '<div style="padding:12px; text-align:center; font-size:11px; color:var(--ink-light);">No saved games found. Save your game first using the Save button.</div>';
      }
      body += '</div>';
      ModalManager.open('Load Game', body, '<button class="btn-close-modal" onclick="NR.closeModal()">Close</button>');
    },

    _buildSummary() {
      const c = _state.case;
      const orgNames = (c.organizations || []).filter(o => o.name).map(o => o.name).join(', ');
      const filledShifts = (c.shiftsFilled || []).filter(s => s.filled).length;
      const day = c.currentDayDisplay || 14;
      return 'Day ' + day + ', ' + filledShifts + ' shifts filled. Orgs: ' + (orgNames || 'None');
    }
  };

  // --- ARIA LIVE ANNOUNCEMENTS ---
  function _announceAriaLive(msg) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => { liveRegion.textContent = msg; }, 50);
    }
  }

  // --- ACTIVE CASE DATA HELPER ---
  function _getActiveCaseData() {
    const caseId = (_state.case || {}).caseId || '';
    if (caseId === 'VC-AR-87-041') return { npcs: NR_DATA.SPEAR_NPCS || [], locations: NR_DATA.SPEAR_LOCATIONS || [], infoCards: NR_DATA.SPEAR_INFO_CARDS || [], caseKey: 'spear' };
    if (caseId === 'VC-CZ-87-019') return { npcs: NR_DATA.CRUCIFIX_NPCS || [], locations: NR_DATA.CRUCIFIX_LOCATIONS || [], infoCards: NR_DATA.CRUCIFIX_INFO_CARDS || [], caseKey: 'crucifix' };
    if (caseId === 'VC-MO-87-004') return { npcs: NR_DATA.BARBARIANS_NPCS || [], locations: NR_DATA.BARBARIANS_LOCATIONS || [], infoCards: NR_DATA.BARBARIANS_INFO_CARDS || [], caseKey: 'barbarians' };
    if (caseId === 'VC-UK-87-007') return { npcs: NR_DATA.BOUDICA_NPCS || [], locations: NR_DATA.BOUDICA_LOCATIONS || [], infoCards: NR_DATA.BOUDICA_INFO_CARDS || [], caseKey: 'boudica' };
    if (caseId === 'VC-UK-87-012') return { npcs: NR_DATA.CORMSIL_NPCS || [], locations: NR_DATA.CORMSIL_LOCATIONS || [], infoCards: NR_DATA.CORMSIL_INFO_CARDS || [], caseKey: 'cormsil' };
    return { npcs: NR_DATA.SPEAR_NPCS || [], locations: NR_DATA.SPEAR_LOCATIONS || [], infoCards: NR_DATA.SPEAR_INFO_CARDS || [], caseKey: 'spear' };
  }

  // --- BOARD CLICK HANDLER (Event Delegation) ---
  function setupBoardInteraction() {
    const board = document.getElementById('board-tbody');
    if (!board) return;

    board.addEventListener('click', function(e) {
      const quad = e.target.closest('.quad');
      if (quad) {
        const day = parseInt(quad.getAttribute('data-day'));
        const shift = quad.getAttribute('data-shift');
        if (day && shift) ClockManager.fillShift(day, shift);
        return;
      }
      const sq = e.target.closest('.sq');
      if (sq) {
        // If clicking on the ms-label inside the square, handle milestone
        const msLabelInSq = e.target.closest('.ms-label');
        if (msLabelInSq) {
          const orgId = sq.getAttribute('data-org');
          const col = parseInt(sq.getAttribute('data-col'));
          if (orgId && col) {
            ClockManager.checkOrgMilestone(orgId, col);
          }
          return;
        }
        // Otherwise toggle square advance/unadvance
        const orgId = sq.getAttribute('data-org');
        const col = parseInt(sq.getAttribute('data-col'));
        if (orgId && col) {
          const org = (_state.case.organizations || []).find(o => o.id === orgId);
          if (org && (org.squaresConsumed || []).includes(col)) {
            ClockManager.unadvanceOrg(orgId);
          } else {
            ClockManager.advanceOrg(orgId);
          }
        }
        return;
      }
      const msBadge = e.target.closest('.ms-badge');
      if (msBadge) {
        const msCell = msBadge.closest('.ms-cell.has-ms');
        if (msCell) { const day = parseInt(msCell.getAttribute('data-day')); if (day) ClockManager.checkRelicMilestones(day); return; }
      }
      const msCell = e.target.closest('.ms-cell.has-ms');
      if (msCell) { const day = parseInt(msCell.getAttribute('data-day')); if (day) ClockManager.checkRelicMilestones(day); return; }
      const checkbox = e.target.closest('.checkbox');
      if (checkbox) {
        const orgId = checkbox.getAttribute('data-org');
        const toggle = checkbox.getAttribute('data-toggle');
        if (orgId && toggle === 'active') ClockManager.toggleActive(orgId);
        if (orgId && toggle === 'dormant') ClockManager.toggleDormant(orgId);
        return;
      }
      // Click on org-num to open org reference
      const orgNum = e.target.closest('.org-num');
      if (orgNum) {
        const orgId = orgNum.getAttribute('data-org');
        if (orgId) { ModalManager.openOrgReference(orgId); return; }
      }
      // Click on label-col (non-interactive area) to open org reference
      const labelCol = e.target.closest('.label-col');
      if (labelCol) {
        const orgRow = labelCol.closest('.org-row');
        if (orgRow) {
          const orgId = orgRow.getAttribute('data-org');
          if (orgId) { ModalManager.openOrgReference(orgId); return; }
        }
      }
    });

    // Double-click on org-name-field to open org reference
    board.addEventListener('dblclick', function(e) {
      const orgNameField = e.target.closest('.org-name-field');
      if (orgNameField) {
        const orgId = orgNameField.getAttribute('data-org');
        if (orgId) {
          ModalManager.openOrgReference(orgId);
          return;
        }
      }
    });

    // Right-click on org row opens reference
    board.addEventListener('contextmenu', function(e) {
      const orgRow = e.target.closest('.org-row');
      if (orgRow) {
        e.preventDefault();
        const orgId = orgRow.getAttribute('data-org');
        if (orgId) ModalManager.openOrgReference(orgId);
      }
    });

    board.addEventListener('blur', function(e) {
      const field = e.target.closest('[contenteditable][data-org]');
      if (field) {
        const orgId = field.getAttribute('data-org');
        const fieldName = field.getAttribute('data-field');
        const value = field.textContent.trim();
        const c = _state.case;
        const org = (c.organizations || []).find(o => o.id === orgId);
        if (org) {
          if (fieldName === 'name') org.name = value;
          if (fieldName === 'value') {
            const numVal = parseInt(value) || 0;
            org.value = Math.min(14, Math.max(0, numVal));
            org.squaresConsumed = [];
            for (let col = 14; col > org.value; col--) { org.squaresConsumed.push(col); }
          }
          StateManager.update('case.organizations', c.organizations, false);
        }
      }
    }, true);
  }

  // --- KEYBOARD SHORTCUTS ---
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); StateManager.undo(); }
      else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); StateManager.redo(); }
      else if (e.ctrlKey && e.key === 's') { e.preventDefault(); SaveManager.openSaveModal(); }
      else if (e.ctrlKey && e.key === 'o') { e.preventDefault(); SaveManager.openLoadModal(); }
      else if (e.key === 'r' || e.key === 'R') {
        if (!ModalManager.isOpen()) { e.preventDefault(); DiceRoller.openRoller(); }
      }
      else if (e.key === 'a' || e.key === 'A') {
        if (!ModalManager.isOpen()) { e.preventDefault(); AgentTracker.toggleRoster(); }
      }
      else if (e.key === 'c' || e.key === 'C') {
        if (!ModalManager.isOpen()) { e.preventDefault(); CombatTracker.togglePanel(); }
      }
      else if (e.key === 's' || e.key === 'S') {
        if (!ModalManager.isOpen()) { e.preventDefault(); SocialTracker.togglePanel(); }
      }
      else if (e.key === 'p' || e.key === 'P') {
        if (!ModalManager.isOpen()) { e.preventDefault(); PressureMeter.toggle(); }
      }
      else if (e.key === 'n' || e.key === 'N') {
        if (!ModalManager.isOpen()) { e.preventDefault(); NPCRoster.toggle(); }
      }
      else if (e.key === 'l' && !e.shiftKey) {
        if (!ModalManager.isOpen()) { e.preventDefault(); SessionLogger.togglePanel(); }
      }
      else if (e.key === 'L' && e.shiftKey) {
        if (!ModalManager.isOpen()) { e.preventDefault(); LocationList.toggle(); }
      }
      else if (e.key === 'w' || e.key === 'W') {
        if (!ModalManager.isOpen()) { e.preventDefault(); InfoWebMap.toggle(); }
      }
      else if (e.key === '!' && !ModalManager.isOpen()) { e.preventDefault(); SandboxMode.toggle(); }
      else if (e.key === '?' && !ModalManager.isOpen()) { e.preventDefault(); PromptGenerator.showPrompt(); }
      else if (e.key === 'Escape') {
        if (InfoWebMap._visible) { e.preventDefault(); InfoWebMap.close(); }
        else if (SandboxMode.isActive()) { e.preventDefault(); SandboxMode.discard(); }
        else if (ModalManager.isOpen()) { e.preventDefault(); ModalManager.close(); }
      }
      // Keyboard nav: arrow keys for day navigation
      else if (!ModalManager.isOpen() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        // Day navigation through shift rows - find first unfilled quadrant
        const c = _state.case;
        let targetDay = e.key === 'ArrowRight' ? 1 : 14;
        // Find the current "active" day
        for (let day = 14; day >= 1; day--) {
          const filled = (c.shiftsFilled || []).filter(s => s.day === day && s.filled).length;
          if (filled < 4) { targetDay = day; break; }
        }
        // Highlight the column
        const header = document.querySelector('.day-header-clickable[title="Day ' + targetDay + '"]');
        if (header) header.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // --- INITIALIZATION ---
  function init() {
    StateManager.init();
    ModalManager.init();
    PressureMeter.init();
    SessionLogger.init();
    BoardRenderer.render();
    setupBoardInteraction();
    setupKeyboardShortcuts();
    BoardRenderer.renderHeader();
    AgentTracker.renderRoster();
    CombatTracker.renderPanel();
    SocialTracker.renderPanel();
    PressureMeter.render();

    const c = _state.case;
    if (c.caseId) ToastNotifier.show('Case loaded: ' + c.caseName, 'info');

    // Auto-log session start
    SessionLogger.log('state', 'Session started - ' + (c.caseName || 'Blank board'));
  }

  // Export filter function for session log
  function filterSessionLog() {
    SessionLogger.renderPanel();
  }

  // --- PUBLIC API ---
  return {
    init: init,

    // State
    getState: StateManager.getState.bind(StateManager),
    updateState: StateManager.update.bind(StateManager),
    importCase: StateManager.importCase.bind(StateManager),
    resetCase: StateManager.resetCase.bind(StateManager),

    // Board
    undo: StateManager.undo.bind(StateManager),
    redo: StateManager.redo.bind(StateManager),

    // Case
    loadBlank: CaseLoader.loadBlank.bind(CaseLoader),
    loadSpear: CaseLoader.loadSpearOfDestiny.bind(CaseLoader),
    loadCrucifix: CaseLoader.loadHeavenlyCrucifix.bind(CaseLoader),
    loadBarbarians: CaseLoader.loadBarbariansCup.bind(CaseLoader),
    loadBoudica: CaseLoader.loadBoudicaPact.bind(CaseLoader),
    loadCormsil: CaseLoader.loadCormsilCompact.bind(CaseLoader),
    loadCaseFromDropdown(value) {
      if (value === 'blank') CaseLoader.loadBlank();
      else if (value === 'spear') CaseLoader.loadSpearOfDestiny();
      else if (value === 'crucifix') CaseLoader.loadHeavenlyCrucifix();
      else if (value === 'barbarians') CaseLoader.loadBarbariansCup();
      else if (value === 'boudica') CaseLoader.loadBoudicaPact();
      else if (value === 'cormsil') CaseLoader.loadCormsilCompact();
      const sel = document.querySelector('#toolbar select');
      if (sel) sel.value = '';
    },

    // Dice
    rollDice: DiceRoller.rollDice.bind(DiceRoller),
    pushRoll: DiceRoller.pushRoll.bind(DiceRoller),
    openDiceRoller: DiceRoller.openRoller.bind(DiceRoller),
    diceAgentChanged() {
      const agentId = document.getElementById('dr-agent')?.value;
      if (agentId) {
        const agent = (_state.agents || []).find(a => a.id === agentId);
        if (agent) DiceRoller._prefillForAgent(agent);
      }
    },

    // Modal
    closeModal: ModalManager.close.bind(ModalManager),
    openNPCCardModal(npcId) {
      const caseData = _getActiveCaseData();
      const npc = (caseData.npcs || []).find(n => n.id === npcId);
      if (npc) ModalManager.openNPCCard(npc);
      else ToastNotifier.show('NPC not found: ' + npcId, 'warn');
    },
    openLocationModal(locId) {
      const caseData = _getActiveCaseData();
      const loc = (caseData.locations || []).find(l => l.id === locId);
      if (loc) ModalManager.openLocationModal(loc);
      else ToastNotifier.show('Location not found: ' + locId, 'warn');
    },
    openInfoCardModal(infoId) {
      const caseData = _getActiveCaseData();
      const info = (caseData.infoCards || []).find(i => i.id === infoId);
      if (info) ModalManager.openInfoCardModal(info);
      else ToastNotifier.show('Information card not found: ' + infoId, 'warn');
    },
    flipInfoCard: flipInfoCard,

    // Clock
    executeCrossAdvance: ClockManager.executeCrossAdvance.bind(ClockManager),
    highlightOrg(orgId) { BoardRenderer.highlightOrg(orgId); },

    // Chain Visualizer
    visualizeChain() {
      if (ModalManager._milestoneData) ChainVisualizer.visualize(ModalManager._milestoneData);
    },
    openChainVisualizer(data) { ChainVisualizer.visualize(data); },

    // Sandbox
    toggleSandbox: SandboxMode.toggle.bind(SandboxMode),
    applySandbox: SandboxMode.apply.bind(SandboxMode),
    discardSandbox: SandboxMode.discard.bind(SandboxMode),

    // Info Web Map
    toggleInfoWebMap: InfoWebMap.toggle.bind(InfoWebMap),
    closeInfoWebMap: InfoWebMap.close.bind(InfoWebMap),

    // Prompt Generator
    generatePrompt: PromptGenerator.showPrompt.bind(PromptGenerator),
    regeneratePrompt: PromptGenerator.regenerate.bind(PromptGenerator),
    copyPrompt: PromptGenerator.copyPrompt.bind(PromptGenerator),

    // Session Logger
    toggleSessionLog: SessionLogger.togglePanel.bind(SessionLogger),
    exportSessionLog: SessionLogger.exportLog.bind(SessionLogger),
    filterSessionLog: filterSessionLog,

    // Print
    printBoard: PrintManager.printBoard.bind(PrintManager),
    printAgentSheet: PrintManager.printAgentSheet.bind(PrintManager),
    printNPCCards: PrintManager.printNPCCards.bind(PrintManager),
    printInfoCards: PrintManager.printInfoCards.bind(PrintManager),
    printNPCCard(npcId) {
      // Single NPC card print
      PrintManager.printNPCCards();
    },

    // Case Brief / Relic Sheet / Org Reference
    openCaseBrief: ModalManager.openCaseBrief.bind(ModalManager),
    openRelicSheet: ModalManager.openRelicSheet.bind(ModalManager),
    openOrgReferenceModal(orgId) { ModalManager.openOrgReference(orgId); },

    // Pressure Meter
    togglePressureMeter: PressureMeter.toggle.bind(PressureMeter),

    // Agent
    toggleAgentRoster: AgentTracker.toggleRoster.bind(AgentTracker),
    addAgent: AgentTracker.addAgent.bind(AgentTracker),
    removeAgent: AgentTracker.removeAgent.bind(AgentTracker),
    openAgentSheet(agentId) {
      const agent = AgentTracker.getAgent(agentId);
      if (agent) ModalManager.openAgentSheet(agent);
    },
    updateAgentDamage: AgentTracker.updateAgentDamage.bind(AgentTracker),
    adjustCorruption: AgentTracker.adjustCorruption.bind(AgentTracker),
    toggleAgentCondition: AgentTracker.toggleAgentCondition.bind(AgentTracker),
    addCriticalInjury: AgentTracker.addCriticalInjury.bind(AgentTracker),
    removeCriticalInjury: AgentTracker.removeCriticalInjury.bind(AgentTracker),
    updateAgentNotes: AgentTracker.updateAgentNotes.bind(AgentTracker),
    quickRollAgentSkill: AgentTracker.quickRollAgentSkill.bind(AgentTracker),

    // Combat
    toggleCombatPanel: CombatTracker.togglePanel.bind(CombatTracker),
    startCombat: CombatTracker.startCombat.bind(CombatTracker),
    endCombat: CombatTracker.endCombat.bind(CombatTracker),
    nextCombatTurn: CombatTracker.nextCombatTurn.bind(CombatTracker),
    addAgentToCombat: CombatTracker.addAgentToCombat.bind(CombatTracker),
    addNPCToCombat: CombatTracker.addNPCToCombat.bind(CombatTracker),
    addCustomCombatant: CombatTracker.addCustomCombatant.bind(CombatTracker),
    drawInitiative: CombatTracker.drawInitiative.bind(CombatTracker),
    combatantAction: CombatTracker.combatantAction.bind(CombatTracker),
    toggleCombatAction: CombatTracker.toggleCombatAction.bind(CombatTracker),
    toggleCombatCover: CombatTracker.toggleCombatCover.bind(CombatTracker),
    moveCombatant: CombatTracker.moveCombatant.bind(CombatTracker),
    applyCombatDamage: CombatTracker.applyCombatDamage.bind(CombatTracker),
    removeCombatant: CombatTracker.removeCombatant.bind(CombatTracker),

    // Social
    toggleSocialPanel: SocialTracker.togglePanel.bind(SocialTracker),
    adjustDisposition: SocialTracker.adjustDisposition.bind(SocialTracker),
    socialManeuver: SocialTracker.socialManeuver.bind(SocialTracker),

    // NPC Roster & Location List
    toggleNPCRoster: NPCRoster.toggle.bind(NPCRoster),
    toggleLocationList: LocationList.toggle.bind(LocationList),

    // Save / Load
    openSaveModal: SaveManager.openSaveModal.bind(SaveManager),
    openLoadModal: SaveManager.openLoadModal.bind(SaveManager),
    saveToSlot(index) { SaveManager.saveToSlot(index); ModalManager.close(); },
    loadFromSlot(index) {
      if (!confirm('This will replace your current game. Continue?')) return;
      if (SaveManager.loadFromSlot(index)) ModalManager.closeAll();
    },
    deleteSlot(index) {
      if (!confirm('Delete this save slot? This cannot be undone.')) return;
      SaveManager.deleteSlot(index);
      SaveManager.openLoadModal();
    },

    // NPC notes persistence
    updateNPCDANotes(npcId, notes) {
      const caseData = _getActiveCaseData();
      const npc = (caseData.npcs || []).find(n => n.id === npcId);
      if (npc) { npc.daNotes = notes; }
    }
  };

})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  NR.init();
});
