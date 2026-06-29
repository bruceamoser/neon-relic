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
  let _initialCase = null;  // Stored initial case for reset

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
      // Store initial case for reset functionality
      if (_state.case && _state.case.caseId) {
        _initialCase = _deepClone(_state.case);
      }
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
      // Store initial case for reset
      if (_state.case && _state.case.caseId) {
        _initialCase = _deepClone(_state.case);
      } else {
        _initialCase = null;
      }
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
        _initialCase = _deepClone(caseData);
        _autoSave();
        ToastNotifier.show('Case imported: ' + (caseData.caseName || 'Unnamed'), 'success');
        BoardRenderer.render();
        PressureMeter.render();
        return true;
      } catch(e) {
        ToastNotifier.show('Import failed: ' + e.message, 'warn');
        return false;
      }
    },

    resetCase() {
      if (!confirm('Reset the board to starting values for this case? This cannot be undone.')) return;
      _pushUndo();
      if (_initialCase) {
        _state.case = _deepClone(_initialCase);
        ToastNotifier.show('Board reset to starting case values', 'info');
      } else {
        _state.case = _deepClone(NR_DATA.getDefaultState().case);
        ToastNotifier.show('Board reset to blank', 'info');
      }
      _autoSave();
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
      _initialCase = null;
      StateManager.replaceState(NR_DATA.getDefaultState());
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Blank board loaded', 'info');
    },

    loadSpearOfDestiny() {
      const newState = NR_DATA.getSpearOfDestinyState();
      _initialCase = _deepClone(newState.case);
      StateManager.replaceState(newState);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Spear That Went Dark', 'success');
    },

    loadHeavenlyCrucifix() {
      const newState = NR_DATA.getHeavenlyCrucifixState();
      _initialCase = _deepClone(newState.case);
      StateManager.replaceState(newState);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Heavenly Crucifix', 'success');
    },

    loadBarbariansCup() {
      const newState = NR_DATA.getBarbariansCupState();
      _initialCase = _deepClone(newState.case);
      StateManager.replaceState(newState);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Barbarian\'s Cup', 'success');
    },

    loadBoudicaPact() {
      const newState = NR_DATA.getBoudicaPactState();
      _initialCase = _deepClone(newState.case);
      StateManager.replaceState(newState);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Boudica Pact', 'success');
    },

    loadCormsilCompact() {
      const newState = NR_DATA.getCormsilCompactState();
      _initialCase = _deepClone(newState.case);
      StateManager.replaceState(newState);
      BoardRenderer.render();
      PressureMeter.render();
      ToastNotifier.show('Loaded: The Cormsil Compact', 'success');
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
      // Case start day: columns BEFORE this day are immutable past (blacked out).
      // This comes from the case data, not the computed current day (which changes during play).
      const caseStartDay = (typeof c.currentDay === 'number' && c.currentDay >= 1 && c.currentDay <= 14) ? c.currentDay : 14;
      let html = '';

      html += '<tr class="shift-row">';
      html += '<td class="label-col"><div class="shift-label">Shifts</div><div class="shift-sublabel">N / M / D / E per day</div></td>';
      for (let day = 14; day >= 1; day--) {
        const isPast = day > caseStartDay;
        const shiftsForDay = (c.shiftsFilled || []).filter(s => s.day === day);
        html += '<td class="' + (isPast ? 'col-past' : '') + '"><div class="quad-grid">';
        ['N', 'M', 'D', 'E'].forEach(shift => {
          const filled = shiftsForDay.some(s => s.shift === shift && s.filled);
          html += '<div class="quad' + (filled ? ' filled' : '') + (isPast ? ' col-past' : '') + '" data-day="' + day + '" data-shift="' + shift + '" title="' + (isPast ? 'Past — before case started' : 'Click to ' + (filled ? 'unfill' : 'fill') + ' Day ' + day + ' ' + shift + ' shift') + '" role="button" aria-label="Day ' + day + ' ' + shift + ' shift, ' + (filled ? 'filled' : 'empty') + (isPast ? ', immutable past' : '') + '" tabindex="' + (isPast ? '-1' : '0') + '">' + shift + '</div>';
        });
        html += '</div></td>';
      }
      html += '</tr>';

      html += '<tr class="ms-row">';
      html += '<td class="label-col">Relic Milestones</td>';
      for (let day = 14; day >= 1; day--) {
        const isPast = day > caseStartDay;
        const ms = (c.relicMilestones || []).find(m => m.day === day);
        const dayFilled = BoardRenderer._isDayComplete(day);
        html += '<td class="ms-cell' + (dayFilled ? ' ms-triggered' : '') + (ms ? ' has-ms' : '') + (isPast ? ' col-past' : '') + '" data-day="' + day + '" role="button" aria-label="Day ' + day + ' relic milestone' + (ms ? ', ' + ms.description.substring(0, 40) : '') + (isPast ? ', immutable past' : '') + '"' + (ms && !isPast ? ' title="Day ' + day + ' Relic Milestone — click for details"' : '') + '>';
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
          const isPast = col > caseStartDay;
          const consumed = (org.squaresConsumed || []).includes(col);
          const milestone = (org.milestones || []).find(m => m.day === col);
          let classes = 'sq';
          if (consumed) classes += ' consumed';
          if (milestone) classes += ' ms';
          if (col === currentDay) classes += ' col-current-day';
          if (isPast) classes += ' col-past';
          const msLabel = milestone ? milestone.label : '';
          html += '<td class="' + classes + '" data-org="' + org.id + '" data-col="' + col + '"' + (milestone ? ' data-ms="' + msLabel + '"' : '') + ' title="' + (isPast ? 'Past — before case started' : (org.name || org.id) + ' — ' + (consumed ? 'Click to undo column ' + col : 'Click to escalate to column ' + col)) + (milestone ? ' | Milestone: ' + msLabel : '') + '" role="button" aria-label="' + (org.name || org.id) + ' column ' + col + (consumed ? ' consumed' : '') + (milestone ? ' milestone ' + msLabel : '') + (isPast ? ', immutable past' : '') + '" tabindex="' + (isPast ? '-1' : '0') + '">';
          if (milestone) html += '<span class="ms-label" title="' + msLabel + ' milestone — click for details">' + msLabel + '</span>';
          html += '</td>';
        }
        html += '</tr>';
      });

      this._boardEl.innerHTML = html;
      this.renderHeader();
      this.highlightCurrentDayColumn(currentDay);
      this.highlightPastColumns(caseStartDay);
      this.renderFooter();
    },

    renderHeader() {
      const caseIdEl = document.getElementById('case-id-display');
      const caseNameEl = document.getElementById('case-name-display');
      const regionEl = document.getElementById('case-region-display');
      if (caseIdEl) caseIdEl.textContent = _state.case.caseId || '_____________';
      if (caseNameEl) caseNameEl.textContent = _state.case.caseName || 'Untitled Case';
      if (regionEl) regionEl.textContent = _state.case.region || '';
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
      document.querySelectorAll('.col-current-day-header, .shift-row .col-current-day, .ms-row .col-current-day, .sep-row .col-current-day').forEach(el => {
        el.classList.remove('col-current-day-header', 'col-current-day');
      });
      const dayHeaders = document.querySelectorAll('.day-header-clickable');
      dayHeaders.forEach(th => {
        const dayNum = parseInt(th.textContent.trim());
        if (dayNum === currentDay) {
          th.classList.add('col-current-day-header');
        }
      });
      const shiftRow = document.querySelector('.shift-row');
      if (shiftRow) {
        const cells = shiftRow.querySelectorAll('td');
        cells.forEach((cell, i) => {
          if (i > 0) {
            const day = 15 - i;
            if (day === currentDay) cell.classList.add('col-current-day');
          }
        });
      }
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

    highlightPastColumns(currentDay) {
      // Add col-past class to day header cells for days before case start
      const dayHeaders = document.querySelectorAll('.day-header-clickable');
      dayHeaders.forEach(th => {
        const dayNum = parseInt(th.textContent.trim());
        if (dayNum > currentDay) {
          th.classList.add('col-past');
        } else {
          th.classList.remove('col-past');
        }
      });
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
      const c = _state.case;
      const caseStartDay = (typeof c.currentDay === 'number' && c.currentDay >= 1 && c.currentDay <= 14) ? c.currentDay : 14;
      // Prevent modifying shifts in past-day columns (before case start)
      if (day > caseStartDay) {
        ToastNotifier.show('Day ' + day + ' is before the case started — shift cannot be changed.', 'info');
        return;
      }
      if (!c.shiftsFilled) c.shiftsFilled = [];
      const existing = c.shiftsFilled.find(s => s.day === day && s.shift === shiftQuadrant);
      if (existing && existing.filled) {
        existing.filled = false;
        StateManager.update('case.shiftsFilled', c.shiftsFilled, false);
        BoardRenderer.render();
        PressureMeter.render();
        Events.emit('shift:unfilled', { day, shift: shiftQuadrant });
        return;
      }
      if (existing) { existing.filled = true; }
      else { c.shiftsFilled.push({ day: day, shift: shiftQuadrant, filled: true, undertaking: '' }); }
      StateManager.update('case.shiftsFilled', c.shiftsFilled, false);
      BoardRenderer.render();
      PressureMeter.render();
      Events.emit('shift:filled', { day, shift: shiftQuadrant });
      if (BoardRenderer._isDayComplete(day)) { ClockManager.checkRelicMilestones(day); }
      _announceAriaLive('Day ' + day + ' ' + shiftQuadrant + ' shift filled.');
    },

    advanceOrg(orgId) {
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
      _announceAriaLive('Relic milestone triggered on day ' + day + '.');
    },

    checkOrgMilestone(orgId, col) {
      const c = _state.case;
      const org = (c.organizations || []).find(o => o.id === orgId);
      if (!org) return;
      const ms = (org.milestones || []).find(m => m.day === col);
      if (!ms) return;
      if (!ms.triggered) {
        ms.triggered = true;
        StateManager.update('case.organizations', c.organizations, false);
        Events.emit('milestone:fired', { type: 'org', orgId, label: ms.label, day: col, description: ms.description });
        _announceAriaLive('Organization milestone ' + ms.label + ' triggered.');
      }
      ModalManager.openMilestone({ type: 'org', orgId: orgId, orgName: org.name, label: ms.label, day: col, description: ms.description, title: ms.label + ' - ' + (org.name || orgId), crossAdvances: ms.crossAdvances || [] });
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
      content += '<div style="font-family:var(--font-fill); font-size:11px; color:var(--ink-light); margin-top:2px;">' + makeClickableReferences(npcData.organization || '') + '</div>';
      content += '</div></div>';

      // Discovery State Toggle
      const unlockedNPCs = (_state.case.revealedNPCs) || [];
      const isUnlocked = unlockedNPCs.includes(npcData.id);
      content += '<div style="display:flex; gap:4px; margin-bottom:10px; align-items:center;">';
      content += '<span style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--ink-faded); margin-right:4px;">State:</span>';
      content += '<button class="btn-small' + (isUnlocked ? '' : ' active') + '" onclick="NR.toggleNPCState(\'' + npcData.id + '\')" style="flex:1; background:' + (isUnlocked ? '' : '#999') + '; color:' + (isUnlocked ? '' : '#fff') + ';">Undiscovered</button>';
      content += '<button class="btn-small' + (isUnlocked ? ' active' : '') + '" onclick="NR.toggleNPCState(\'' + npcData.id + '\')" style="flex:1; background:' + (isUnlocked ? 'var(--green-stamp)' : '') + '; color:' + (isUnlocked ? '#fff' : '') + ';">Found</button>';
      content += '</div>';

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
      content += '<div style="flex:1;"><span style="font-size:9px; color:var(--red-stamp); text-transform:uppercase;">Secret</span><div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); min-height:30px;">' + makeClickableReferences(npcData.secret || '') + '</div></div>';
      content += '<div style="flex:1;"><span style="font-size:9px; color:var(--ink-faded); text-transform:uppercase;">Goal</span><div style="font-size:11px; padding:4px; background:var(--field-bg); border:1px solid var(--rule); min-height:30px;">' + makeClickableReferences(npcData.goal || '') + '</div></div>';
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
        if (npcData.gainedKnowledge && npcData.gainedKnowledge.length) {
          var gainedIds = [];
          npcData.gainedKnowledge.forEach(function(k) {
            if (k.info) { gainedIds.push(k.info); }
            else {
              var matches = (k.desc || '').match(/\bI\d+\b/g);
              if (matches) matches.forEach(function(m) { gainedIds.push(m); });
            }
          });
          var uniqueGained = gainedIds.filter(function(v, i, a) { return a.indexOf(v) === i; });
          if (uniqueGained.length) {
            content += '<div style="font-size:10px; margin-top:3px;"><strong>Gained:</strong> ';
            uniqueGained.forEach(function(id) {
              content += '<span class="ref-link" title="Open Information Card ' + id + '" onclick="NR.openInfoCardModal(\'' + id + '\')">' + id + '</span> ';
            });
            content += '</div>';
          }
        }
        content += '</div>';
      }

      if (npcData.locations && npcData.locations.length) {
        content += '<div style="margin-bottom:8px;"><span style="font-size:10px; color:var(--ink-faded); text-transform:uppercase; letter-spacing:1px;">Locations</span>';
        content += '<div style="font-size:11px; margin-top:2px;">' + makeClickableReferences(npcData.locations.join(', ')) + '</div></div>';
      }

      content += '<div style="font-size:10px; color:var(--ink-faded); margin-bottom:4px;"><strong>What They Know:</strong></div>';
      content += '<ul style="font-size:11px; margin-left:14px; margin-bottom:8px;">';
      if (npcData.startingKnowledge) {
        npcData.startingKnowledge.forEach(function(k) { content += '<li>' + k.desc + ' (' + makeClickableReferences(k.info) + ')</li>'; });
      }
      if (npcData.gainedKnowledge) {
        npcData.gainedKnowledge.forEach(function(k) {
          content += '<li>' + makeClickableReferences(k.desc);
          if (k.info) { content += ' (' + makeClickableReferences(k.info) + ')'; }
          content += ' <span style="font-size:9px; color:var(--ink-faded);">[' + (k.trigger || '—') + ']</span></li>';
        });
      }
      content += '</ul>';

      content += '<div style="font-size:11px; padding:6px; background:var(--field-bg); border:1px solid var(--rule); margin-bottom:8px;"><strong>Artifact Connection:</strong> ' + makeClickableReferences(npcData.artifactConnection || 'None') + '</div>';

      content += '<div style="display:flex; gap:8px; margin-bottom:8px;">';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--green-stamp);">+ Positive:</span> ' + makeClickableReferences(npcData.positiveResult || '') + '</div>';
      content += '<div style="flex:1; font-size:11px;"><span style="color:var(--red-stamp);">- Negative:</span> ' + makeClickableReferences(npcData.negativeResult || '') + '</div>';
      content += '</div>';

      content += '<details style="margin-bottom:8px;"><summary style="font-size:11px; color:var(--red-stamp); cursor:pointer;">DA Notes</summary>';
      content += '<textarea id="npc-da-notes-' + npcData.id + '" style="width:100%; min-height:50px; font-family:var(--font-fill); font-size:12px; background:var(--field-bg); border:1px solid var(--rule); padding:4px;" onchange="NR.updateNPCDANotes(\'' + npcData.id + '\', this.value)">' + (npcData.daNotes || '') + '</textarea>';
      content += '</details>';

      content += '</div>';

      const footer = '<button class="btn-small" onclick="NR.printNPCCards()">Print</button> <button class="btn-close-modal" onclick="NR.closeModal()">Close</button>';
      this.open(title, content, footer);
    },

    // --- Location Modal ---
    openLocationModal(locData) {
      const title = locData.id + ' - ' + locData.name;
      const unlockedLocs = (_state.case.unlockedLocations) || [];
      const isUnlocked = unlockedLocs.includes(locData.id);
      const stateLabel = isUnlocked ? 'Found' : 'Undiscovered';
      const stateColor = isUnlocked ? 'var(--green-stamp)' : '#999';

      let content = '<div class="location-modal">';

      content += '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">';
      content += '<div style="font-family:var(--font-main); font-size:20px; font-weight:bold; color:var(--green-stamp); border:2px solid var(--green-stamp); padding:4px 12px;">' + locData.id + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:17px; font-weight:bold; border-bottom:2px solid var(--ink); flex:1;">' + locData.name + '</div>';
      content += '</div>';

      // Discovery State Toggle
      content += '<div style="display:flex; gap:4px; margin-bottom:10px; align-items:center;">';
      content += '<span style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--ink-faded); margin-right:4px;">State:</span>';
      content += '<button class="btn-small' + (isUnlocked ? '' : ' active') + '" onclick="NR.toggleLocationState(\'' + locData.id + '\')" style="flex:1; background:' + (isUnlocked ? '' : '#999') + '; color:' + (isUnlocked ? '' : '#fff') + ';">Undiscovered</button>';
      content += '<button class="btn-small' + (isUnlocked ? ' active' : '') + '" onclick="NR.toggleLocationState(\'' + locData.id + '\')" style="flex:1; background:' + (isUnlocked ? 'var(--green-stamp)' : '') + '; color:' + (isUnlocked ? '#fff' : '') + ';">Found</button>';
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
      const title = (infoData.title ? infoData.title + ' (' + infoData.id + ')' : infoData.id) + ' - ' + (isTruth ? 'Containment Truth' : 'Supporting Intel');

      // Determine current discovery state
      const discovered = (_state.case.discoveredInfo || []).includes(infoData.id);
      const understood = (_state.case.understoodInfo || []).includes(infoData.id);
      const dState = discovered ? (understood ? 'understood' : 'found') : 'undiscovered';
      const stateLabel = dState === 'undiscovered' ? 'Undiscovered' : dState === 'found' ? 'Found' : 'Understood';
      const stateColor = dState === 'undiscovered' ? '#999' : dState === 'found' ? 'var(--green-stamp)' : 'var(--red-stamp)';

      let content = '<div class="infocard-modal">';

      content += '<div style="display:flex; gap:4px; margin-bottom:10px;">';
      content += '<button id="infocard-toggle-front" class="btn-small active" onclick="NR.flipInfoCard(\'front\')" style="flex:1;">Player Side</button>';
      content += '<button id="infocard-toggle-back" class="btn-small" onclick="NR.flipInfoCard(\'back\')" style="flex:1;">DA Side</button>';
      content += '</div>';

      // ── Discovery State Toggle Row ──
      content += '<div id="infocard-state-row" style="display:flex; gap:4px; margin-bottom:10px; align-items:center;">';
      content += '<span style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--ink-faded); margin-right:4px;">State:</span>';
      content += '<button id="infocard-state-undiscovered" class="btn-small' + (dState === 'undiscovered' ? ' active' : '') + '" onclick="NR.toggleInfoCardState(\'' + infoData.id + '\')" style="flex:1; background:' + (dState === 'undiscovered' ? '#999' : '') + '; color:' + (dState === 'undiscovered' ? '#fff' : '') + ';">Undiscovered</button>';
      content += '<button id="infocard-state-found" class="btn-small' + (dState === 'found' ? ' active' : '') + '" onclick="NR.toggleInfoCardState(\'' + infoData.id + '\')" style="flex:1; background:' + (dState === 'found' ? 'var(--green-stamp)' : '') + '; color:' + (dState === 'found' ? '#fff' : '') + ';">Found</button>';
      content += '<button id="infocard-state-understood" class="btn-small' + (dState === 'understood' ? ' active' : '') + '" onclick="NR.toggleInfoCardState(\'' + infoData.id + '\')" style="flex:1; background:' + (dState === 'understood' ? 'var(--red-stamp)' : '') + '; color:' + (dState === 'understood' ? '#fff' : '') + ';">Understood</button>';
      content += '</div>';

      content += '<div id="infocard-front" class="infocard-side" style="display:block;">';
      content += '<div style="border:2px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; padding:12px; background:var(--field-bg); min-height:120px;">';
      content += '<div style="font-family:var(--font-main); font-size:14px; font-weight:bold; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; border:1.5px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; display:inline-block; padding:2px 10px; margin-bottom:8px;">' + infoData.id + '</div>';
      if (infoData.title) {
        content += '<div style="font-family:var(--font-main); font-size:17px; font-weight:bold; color:var(--ink); border-bottom:1.5px solid var(--ink); padding-bottom:4px; margin-bottom:6px;">' + infoData.title + '</div>';
      }
      content += '<div style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; margin-bottom:6px;">' + (isTruth ? 'Containment Truth' : 'Supporting Intel') + '</div>';
      content += '<div style="font-family:var(--font-fill); font-size:13px; line-height:1.4;">' + (infoData.content || '') + '</div>';
      content += '</div></div>';

      content += '<div id="infocard-back" class="infocard-side" style="display:none;">';
      content += '<div style="border:2px solid var(--red-stamp); padding:12px; background:rgba(139,26,26,0.03); min-height:120px;">';
      content += '<div style="font-family:var(--font-main); font-size:12px; letter-spacing:3px; text-transform:uppercase; color:var(--red-stamp); margin-bottom:8px;">DA Eyes Only</div>';
      content += '<div style="font-family:var(--font-main); font-size:13px; font-weight:bold; color:' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; border:1.5px solid ' + (isTruth ? 'var(--red-stamp)' : 'var(--green-stamp)') + '; display:inline-block; padding:2px 10px; margin-bottom:8px;">' + infoData.id + '</div>';
      if (infoData.title) {
        content += '<div style="font-family:var(--font-main); font-size:15px; font-weight:bold; color:var(--ink); margin-bottom:6px;">' + infoData.title + '</div>';
      }
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

      if (relicMs.length > 0) {
        content += '<div style="margin-top:12px;"><span style="font-size:11px; text-transform:uppercase; color:var(--red-stamp);">Relic Milestone Schedule</span>';
        content += '<div style="font-size:11px;">';
        relicMs.forEach(ms => {
          content += '<div style="padding:3px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule);">Day ' + ms.day + ': ' + (ms.description || '') + '</div>';
        });
        content += '</div></div>';
      }

      if (containmentTruths.length > 0) {
        content += '<div style="margin-top:12px;"><span style="font-size:11px; text-transform:uppercase; color:var(--green-stamp);">Containment Truths</span>';
        content += '<div style="font-size:10px; color:var(--ink-faded); margin-bottom:6px;">Click a card to view details. Use the info card modal to toggle discovery state.</div>';
        content += '<div style="font-size:11px;">';
        containmentTruths.forEach(ct => {
          var discovered = (_state.case.discoveredInfo || []).includes(ct.id);
          var understood = (_state.case.understoodInfo || []).includes(ct.id);
          var dState = discovered ? (understood ? 'understood' : 'found') : 'undiscovered';
          var stateColor = dState === 'undiscovered' ? '#999' : dState === 'found' ? 'var(--green-stamp)' : 'var(--red-stamp)';
          var stateLabel = dState === 'undiscovered' ? 'Undisc.' : dState === 'found' ? 'Found' : 'Understood';
          content += '<div style="padding:4px; margin-bottom:2px; background:var(--field-bg); border:1px solid var(--rule); display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="NR.openInfoCardModal(\'' + ct.id + '\')">';
          content += '<span style="display:inline-block; width:10px; height:10px; border-radius:2px; background:' + stateColor + '; flex-shrink:0;" title="' + stateLabel + '"></span>';
          content += '<span style="font-size:9px; text-transform:uppercase; color:' + stateColor + '; flex-shrink:0; min-width:48px;">' + stateLabel + '</span>';
          content += '<span><strong>' + ct.id + '</strong>' + (ct.title ? ' ' + ct.title : '') + ': ' + (ct.content || '').substring(0, 80) + '...</span>';
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
    html = html.replace(/\b(O\d+)\b/g, '<span class="ref-link" title="Open Organization $1 Reference" onclick="NR.openOrgReferenceModal(\'$1\')">$1</span>');
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

  // --- INFO CARD DISCOVERY STATE TOGGLE ---
  // Cycles: Undiscovered → Found → Understood → Undiscovered
  function toggleInfoCardState(infoId) {
    if (!_state.case.discoveredInfo) _state.case.discoveredInfo = [];
    if (!_state.case.understoodInfo) _state.case.understoodInfo = [];

    var discIdx = _state.case.discoveredInfo.indexOf(infoId);
    var undIdx  = _state.case.understoodInfo.indexOf(infoId);

    if (discIdx === -1) {
      // Undiscovered → Found
      _state.case.discoveredInfo.push(infoId);
      ToastNotifier.show(infoId + ' marked as Found', 'info');
    } else if (undIdx === -1) {
      // Found → Understood
      _state.case.understoodInfo.push(infoId);
      ToastNotifier.show(infoId + ' marked as Understood', 'info');
    } else {
      // Understood → Undiscovered (reset)
      _state.case.discoveredInfo.splice(discIdx, 1);
      _state.case.understoodInfo.splice(undIdx, 1);
      ToastNotifier.show(infoId + ' reset to Undiscovered', 'info');
    }

    StateManager.update('case', _state.case);

    // Refresh the info web map if visible
    if (InfoWebMap._visible) InfoWebMap.render();

    // Re-render the current info card modal if it's open and showing this card
    _refreshInfoCardModalIfOpen(infoId);
  }

  // --- LOCATION STATE TOGGLE ---
  // Toggles a location between undiscovered and found/unlocked.
  function toggleLocationState(locId) {
    if (!_state.case.unlockedLocations) _state.case.unlockedLocations = [];

    var idx = _state.case.unlockedLocations.indexOf(locId);

    if (idx === -1) {
      // Undiscovered -> Found/Unlocked
      _state.case.unlockedLocations.push(locId);
      ToastNotifier.show(locId + ' marked as Found', 'info');
    } else {
      // Found -> Undiscovered (reset)
      _state.case.unlockedLocations.splice(idx, 1);
      ToastNotifier.show(locId + ' reset to Undiscovered', 'info');
    }

    StateManager.update('case', _state.case);

    // Refresh the info web map if visible
    if (InfoWebMap._visible) InfoWebMap.render();

    // Refresh the location list panel if visible
    if (LocationList._panelVisible) LocationList.render();

    // Re-render the current location modal if it's open and showing this location
    _refreshLocationModalIfOpen(locId);
  }

  // --- NPC STATE TOGGLE ---
  // Toggles an NPC between undiscovered and found.
  // Uses revealedNPCs to stay consistent with InfoWebMap.
  function toggleNPCState(npcId) {
    if (!_state.case.revealedNPCs) _state.case.revealedNPCs = [];

    var idx = _state.case.revealedNPCs.indexOf(npcId);

    if (idx === -1) {
      _state.case.revealedNPCs.push(npcId);
      ToastNotifier.show(npcId + ' marked as Found', 'info');
    } else {
      _state.case.revealedNPCs.splice(idx, 1);
      ToastNotifier.show(npcId + ' reset to Undiscovered', 'info');
    }

    StateManager.update('case', _state.case);

    if (InfoWebMap._visible) InfoWebMap.render();
    if (NPCRoster._panelVisible) NPCRoster.render();

    _refreshNPCModalIfOpen(npcId);
  }

  // Helper: if the NPC modal is open for the given NPC, re-render it
  function _refreshNPCModalIfOpen(npcId) {
    if (!ModalManager.isOpen()) return;
    var caseData = _getActiveCaseData();
    var npcs = caseData.npcs || [];
    var npcData = npcs.find(function(n) { return n.id === npcId; });
    if (npcData) {
      if (ModalManager._stack.length > 0) ModalManager._stack.pop();
      ModalManager.openNPCCard(npcData);
    }
  }

  // Helper: if the location modal is open for the given location, re-render it
  function _refreshLocationModalIfOpen(locId) {
    if (!ModalManager.isOpen()) return;
    var caseData = _getActiveCaseData();
    var locations = caseData.locations || [];
    var locData = locations.find(function(l) { return l.id === locId; });
    if (locData) {
      // Replace current modal instead of stacking a new one
      if (ModalManager._stack.length > 0) ModalManager._stack.pop();
      ModalManager.openLocationModal(locData);
    }
  }

  // Helper: if the info card modal is open for the given card, re-render it
  function _refreshInfoCardModalIfOpen(infoId) {
    if (!ModalManager.isOpen()) return;
    var infoEl = document.getElementById('infocard-front');
    if (!infoEl) return; // not an info card modal
    // Only refresh if the modal's title contains this card ID
    var titleEl = document.getElementById('modal-title');
    if (titleEl && titleEl.textContent.indexOf(infoId) !== -1) {
      var caseData = _getActiveCaseData();
      var info = (caseData.infoCards || []).find(function(i) { return i.id === infoId; });
      if (info) {
        // Replace current modal instead of stacking a new one
        if (ModalManager._stack.length > 0) ModalManager._stack.pop();
        ModalManager.openInfoCardModal(info);
      }
    }
  }

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

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">';
      html += '<span>NPC Roster</span>';
      if (hasCase && npcs.length > 0) {
        html += '<span class="ref-link" onclick="NR.CaseFileViewer.open(\'npcs\')" title="Open original NPC Cards HTML file" style="font-size:10px;">\uD83D\uDCC4 Open File</span>';
      }
      html += '</div>';

      if (!hasCase || npcs.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No NPCs — load a case file first.</div>';
      } else {
        const unlockedNPCs = (_state.case.revealedNPCs) || [];
        npcs.forEach(npc => {
          const isUnlocked = unlockedNPCs.includes(npc.id);
          const disp = npc.disposition || 3;
          const color = dispColors[disp] || '#888888';
          const stateColor = isUnlocked ? 'var(--green-stamp)' : 'var(--ink-light)';
          const stateLabel = isUnlocked ? 'Found' : 'Undiscovered';

          html += '<div style="padding:6px 8px; border-bottom:1px dotted var(--rule-light);">';
          html += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">';
          html += '<span onclick="NR.toggleNPCState(\'' + npc.id + '\')" title="Click to toggle ' + npc.id + ' state" style="cursor:pointer; font-family:var(--font-main); font-size:10px; text-transform:uppercase; letter-spacing:1px; color:' + stateColor + '; border:1px solid ' + stateColor + '; padding:1px 6px; border-radius:2px; user-select:none; transition:all 0.15s;">' + stateLabel + '</span>';
          html += '<div style="font-family:var(--font-fill); font-size:12px; font-weight:bold; cursor:pointer;" onclick="NR.openNPCCardModal(\'' + npc.id + '\')" title="Click for full NPC card">' + npc.name + '</div>';
          html += '</div>';
          html += '<div style="font-size:10px; color:var(--ink-faded); margin-top:2px;">' + (npc.role || '') + '</div>';
          html += '<div style="font-size:10px; color:var(--ink-faded);">' + makeClickableReferences(npc.organization || '') + '</div>';
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

      let html = '<div style="padding:8px; font-family:var(--font-main); font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--red-stamp); border-bottom:2px solid var(--red-stamp); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">';
      html += '<span>Locations</span>';
      if (hasCase && locations.length > 0) {
        html += '<span class="ref-link" onclick="NR.CaseFileViewer.open(\'locations\')" title="Open original Locations HTML file" style="font-size:10px;">\uD83D\uDCC4 Open File</span>';
      }
      html += '</div>';

      if (!hasCase || locations.length === 0) {
        html += '<div style="padding:8px; font-size:11px; color:var(--ink-light);">No locations — load a case file first.</div>';
      } else {
        const unlockedLocs = (_state.case.unlockedLocations) || [];
        locations.forEach(loc => {
          const isUnlocked = unlockedLocs.includes(loc.id);
          const briefDesc = (loc.description || '').length > 80
            ? (loc.description || '').substring(0, 80) + '...'
            : (loc.description || '');
          const availRaw = loc.availability || '';
          const availDisplay = (availRaw === 'open' || availRaw.toLowerCase().includes('always'))
            ? 'Always Available'
            : (availRaw || 'Clue-locked');
          const npcCount = (loc.npcsPresent || '').split(',').filter(function(n) { return n.trim(); }).length;

          const stateColor = isUnlocked ? 'var(--green-stamp)' : 'var(--ink-light)';
          const stateLabel = isUnlocked ? 'Found' : 'Undiscovered';

          html += '<div style="padding:6px 8px; border-bottom:1px dotted var(--rule-light);">';
          html += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">';
          html += '<span onclick="NR.toggleLocationState(\'' + loc.id + '\')" title="Click to toggle ' + loc.id + ' state" style="cursor:pointer; font-family:var(--font-main); font-size:10px; text-transform:uppercase; letter-spacing:1px; color:' + stateColor + '; border:1px solid ' + stateColor + '; padding:1px 6px; border-radius:2px; user-select:none; transition:all 0.15s;">' + stateLabel + '</span>';
          html += '<div style="font-family:var(--font-fill); font-size:12px; font-weight:bold; cursor:pointer;" onclick="NR.openLocationModal(\'' + loc.id + '\')" title="Click for full location details">' + loc.id + ' \u2014 ' + loc.name + '</div>';
          html += '</div>';
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
      const understood = (_state.case.understoodInfo) || [];

      const nodes = [];
      infoCards.forEach(info => {
        const dStatus = discovered.includes(info.id) ? (understood.includes(info.id) ? 'understood' : 'found') : 'undiscovered';
        nodes.push({ id: info.id, type: 'info', label: info.id + (info.title ? ': ' + info.title : ''), status: dStatus, data: info });
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

  // --- CASE FILE IFRAME VIEWER ---
  // Opens original case file HTML documents in an iframe overlay.
  const CaseFileViewer = {
    _overlay: null,
    _iframe: null,
    _titleEl: null,
    _btnDA: null,
    _btnPlayer: null,
    _entityType: null,
    _currentView: 'da',
    _hasPlayerVariant: true,

    init() {
      this._overlay = document.getElementById('casefile-overlay');
      this._iframe = document.getElementById('casefile-iframe');
      this._titleEl = document.getElementById('casefile-title');
      this._btnDA = document.getElementById('casefile-btn-da');
      this._btnPlayer = document.getElementById('casefile-btn-player');

      if (this._overlay) {
        this._overlay.addEventListener('click', function(e) {
          if (e.target === this._overlay) CaseFileViewer.close();
        });
      }
    },

    /** Open the case file viewer for a given entity type.
     *  @param {string} entityType — key in NR_DATA.ENTITY_FILE_MAP */
    open(entityType) {
      var caseId = (_state.case || {}).caseId || '';
      if (!caseId) {
        ToastNotifier.show('No case file loaded. Load a case first.', 'warn');
        return;
      }

      var caseData = _getActiveCaseData();
      var caseKey = caseData.caseKey;
      if (!caseKey) {
        ToastNotifier.show('No case file directory mapped.', 'warn');
        return;
      }

      var dir = NR_DATA.CASE_FILE_DIRS[caseKey];
      if (!dir) {
        ToastNotifier.show('No case file directory mapped for: ' + caseKey, 'warn');
        return;
      }

      this._entityType = entityType;
      this._currentView = 'da';

      // Determine if player variants exist for this entity type in this case
      var fileMap = NR_DATA.ENTITY_FILE_MAP[entityType];
      // Use data-driven player variant availability instead of hardcoded spear check
      this._hasPlayerVariant = (NR_DATA.PLAYER_VARIANTS_AVAILABLE && NR_DATA.PLAYER_VARIANTS_AVAILABLE[caseKey]) && fileMap && (fileMap.da !== fileMap.player);

      // Build the iframe src
      var filename = fileMap ? fileMap.da : '';
      if (filename && this._iframe) {
        this._iframe.src = dir + '/' + filename;
      }

      // Update title
      var typeLabels = {
        locations: 'Locations',
        npcs: 'NPC Cards',
        organizations: 'Organization Reference',
        relics: 'Relic Sheet',
        infoCards: 'Information Cards',
        caseBrief: 'Case Brief',
        operationsBoard: 'Operations Board',
        startHere: 'Start Here'
      };
      var label = typeLabels[entityType] || entityType;
      if (this._titleEl) {
        this._titleEl.textContent = label + ' \u2014 ' + (_state.case.caseName || 'Case File');
      }

      // Show overlay
      if (this._overlay) this._overlay.classList.add('open');

      // Update view toggle buttons
      this._updateViewToggle();
    },

    close() {
      if (this._overlay) this._overlay.classList.remove('open');
      if (this._iframe) this._iframe.src = '';
      this._entityType = null;
    },

    isOpen() {
      return this._overlay && this._overlay.classList.contains('open');
    },

    switchView(view) {
      if (view === this._currentView || !this._entityType) return;
      this._currentView = view;

      var caseKey = _getActiveCaseData().caseKey;
      var dir = NR_DATA.CASE_FILE_DIRS[caseKey];
      var fileMap = NR_DATA.ENTITY_FILE_MAP[this._entityType];
      if (!dir || !fileMap) return;

      var filename = (view === 'player') ? fileMap.player : fileMap.da;
      if (this._iframe) this._iframe.src = dir + '/' + filename;
      this._updateViewToggle();
    },

    _updateViewToggle() {
      if (this._btnDA) {
        this._btnDA.classList.toggle('active', this._currentView === 'da');
      }
      if (this._btnPlayer) {
        this._btnPlayer.classList.toggle('active', this._currentView === 'player');
        this._btnPlayer.classList.toggle('disabled', !this._hasPlayerVariant);
        this._btnPlayer.title = this._hasPlayerVariant
          ? 'Player-facing version'
          : 'No player version available for this case';
      }
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
      const infoweb = document.getElementById('infoweb-overlay');
      const savedDisplays = new Map();
      [toolbar, toasts, pressure, infoweb].forEach(el => {
        if (el) { savedDisplays.set(el, el.style.display); el.style.display = 'none'; }
      });
      panels.forEach(el => { savedDisplays.set(el, el.style.display); el.style.display = 'none'; });
      window.print();
      savedDisplays.forEach((val, el) => { el.style.display = val; });
      document.title = origTitle;
      ToastNotifier.show('Board sent to printer', 'success');
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
        PressureMeter.render();
        ToastNotifier.show('Loaded: ' + (data.name || 'Unnamed Save'), 'success');
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
        const msLabelInSq = e.target.closest('.ms-label');
        if (msLabelInSq) {
          const orgId = sq.getAttribute('data-org');
          const col = parseInt(sq.getAttribute('data-col'));
          if (orgId && col) {
            ClockManager.checkOrgMilestone(orgId, col);
          }
          return;
        }
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
      const orgNum = e.target.closest('.org-num');
      if (orgNum) {
        const orgId = orgNum.getAttribute('data-org');
        if (orgId) { ModalManager.openOrgReference(orgId); return; }
      }
      const labelCol = e.target.closest('.label-col');
      if (labelCol) {
        const orgRow = labelCol.closest('.org-row');
        if (orgRow) {
          const orgId = orgRow.getAttribute('data-org');
          if (orgId) { ModalManager.openOrgReference(orgId); return; }
        }
      }
    });

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
      else if (e.key === 'p' || e.key === 'P') {
        if (!ModalManager.isOpen()) { e.preventDefault(); PressureMeter.toggle(); }
      }
      else if (e.key === 's' || e.key === 'S') {
        if (!ModalManager.isOpen()) { e.preventDefault(); SocialTracker.togglePanel(); }
      }
      else if (e.key === 'n' || e.key === 'N') {
        if (!ModalManager.isOpen()) { e.preventDefault(); NPCRoster.toggle(); }
      }
      else if (e.key === 'L' && e.shiftKey) {
        if (!ModalManager.isOpen()) { e.preventDefault(); LocationList.toggle(); }
      }
      else if (e.key === 'w' || e.key === 'W') {
        if (!ModalManager.isOpen()) { e.preventDefault(); InfoWebMap.toggle(); }
      }
      else if (e.key === 'Escape') {
        if (InfoWebMap._visible) { e.preventDefault(); InfoWebMap.close(); }
        else if (CaseFileViewer.isOpen()) { e.preventDefault(); CaseFileViewer.close(); }
        else if (ModalManager.isOpen()) { e.preventDefault(); ModalManager.close(); }
      }
      else if (!ModalManager.isOpen() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const c = _state.case;
        let targetDay = e.key === 'ArrowRight' ? 1 : 14;
        for (let day = 14; day >= 1; day--) {
          const filled = (c.shiftsFilled || []).filter(s => s.day === day && s.filled).length;
          if (filled < 4) { targetDay = day; break; }
        }
        const header = document.querySelector('.day-header-clickable[title="Day ' + targetDay + '"]');
        if (header) header.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // --- INITIALIZATION ---
  function init() {
    StateManager.init();
    ModalManager.init();
    CaseFileViewer.init();
    PressureMeter.init();
    BoardRenderer.render();
    setupBoardInteraction();
    setupKeyboardShortcuts();
    BoardRenderer.renderHeader();
    PressureMeter.render();

    // Subscribe side panels to case state changes so they re-render
    // when a new case is loaded while the panel is already open.
    StateManager.subscribe('case', function() {
      NPCRoster.render();
      LocationList.render();
      SocialTracker.renderPanel();
    });

    const c = _state.case;
    if (c.caseId) ToastNotifier.show('Case loaded: ' + c.caseName, 'info');
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
    toggleInfoCardState: toggleInfoCardState,
    toggleLocationState: toggleLocationState,
    toggleNPCState: toggleNPCState,

    // Clock
    executeCrossAdvance: ClockManager.executeCrossAdvance.bind(ClockManager),
    highlightOrg(orgId) { BoardRenderer.highlightOrg(orgId); },

    // Chain Visualizer
    visualizeChain() {
      if (ModalManager._milestoneData) ChainVisualizer.visualize(ModalManager._milestoneData);
    },
    openChainVisualizer(data) { ChainVisualizer.visualize(data); },

    // Info Web Map
    toggleInfoWebMap: InfoWebMap.toggle.bind(InfoWebMap),
    closeInfoWebMap: InfoWebMap.close.bind(InfoWebMap),

    // Case File Viewer
    CaseFileViewer: CaseFileViewer,

    // Print
    printBoard: PrintManager.printBoard.bind(PrintManager),
    printNPCCards: PrintManager.printNPCCards.bind(PrintManager),
    printInfoCards: PrintManager.printInfoCards.bind(PrintManager),

    // Case Brief / Relic Sheet / Org Reference
    openCaseBrief: ModalManager.openCaseBrief.bind(ModalManager),
    openRelicSheet: ModalManager.openRelicSheet.bind(ModalManager),
    openOrgReferenceModal(orgId) { ModalManager.openOrgReference(orgId); },

    // Pressure Meter
    togglePressureMeter: PressureMeter.toggle.bind(PressureMeter),

    // Social
    toggleSocialPanel: SocialTracker.togglePanel.bind(SocialTracker),
    adjustDisposition: SocialTracker.adjustDisposition.bind(SocialTracker),

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
