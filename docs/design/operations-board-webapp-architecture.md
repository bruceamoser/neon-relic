# Interactive Operations Board Web App — Architecture

**Status:** Draft | **Date:** 2025-06-21 | **Author:** Architect Mode
**Purpose:** Detailed architecture specification for the DA-facing static web app that transforms the Operations Board into the primary game-running UI.

---

## Table of Contents

1. [File/Folder Structure](#1-filefolder-structure)
2. [Component Architecture](#2-component-architecture)
3. [Data Flow](#3-data-flow)
4. [Modal/Overlay Design](#4-modaloverlay-design)
5. [Dice Roller UX](#5-dice-roller-ux)
6. [Local State Schema](#6-local-state-schema)
7. [Case File Data Format](#7-case-file-data-format)
8. [Keyboard Shortcuts & Accessibility](#8-keyboard-shortcuts--accessibility)
9. [Print Strategy](#9-print-strategy)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. File/Folder Structure

### 1.1 Directory Layout

Following the established [`docs/web-app-char-gen/`](../web-app-char-gen/index.html) pattern, the DA board app lives as a sibling directory:

```
docs/web-app-da-board/
├── index.html               # Single HTML file: embedded CSS + JS (primary delivery)
├── app.js                   # Application logic (revealing module pattern)
├── data.js                  # Static game data (rules reference, tables, stunts, etc.)
├── css/                     # (Optional split for development; merged into index.html for distribution)
│   ├── board.css            # Operations board grid styles
│   ├── modals.css           # Modal overlay system styles
│   ├── toolbar.css          # Toolbar, tab nav, quick-ref bar
│   ├── paper-theme.css      # Paper texture, watermark, stamps, color variables
│   └── print.css            # @media print overrides
├── converter/               # Utility to convert existing HTML case files → JSON
│   └── convert-case-file.html  # Drag-and-drop HTML → JSON converter page
└── data/                    # Pre-converted case file JSON packages
    ├── spear-that-went-dark.json
    ├── barbarians-cup.json
    ├── cormsil-compact.json
    └── heavenly-crucifix.json
```

**Distribution model:** The app distributes as a single self-contained `index.html` with all CSS and JS inlined (base64 fonts embedded). The `app.js`, `data.js`, and `css/` files exist for development convenience. A build step (added to [`build.ps1`](../../build.ps1)) concatenates and inlines them.

### 1.2 Rationale

| Decision | Rationale |
|----------|-----------|
| Sibling to char-gen | Consistent project organization. Both are `docs/web-app-*/`. |
| `index.html` primary | Follows char-gen pattern. Works from `file://` protocol with no server. |
| Separate `app.js` + `data.js` | Editable in any text editor. `data.js` mirrors char-gen's `data.js` pattern (large static data object). |
| `converter/` subdirectory | Tooling, not runtime. Separate concern. |
| `data/` for pre-converted cases | Ships with known good case files. Users drop their own JSON here. |
| CSS split for dev | The char-gen app has all CSS in `<style>` (1400+ lines). Splitting into files during dev avoids a single massive block; inlined for distribution. |

---

## 2. Component Architecture

### 2.1 Module Pattern

All modules use the **revealing module pattern** established by [`app.js`](../web-app-char-gen/app.js:lines 1-41):

```js
const NR = (function() {
  'use strict';
  // private vars
  // public API returned
  return { init, loadCase, saveState, /* ... */ };
})();
document.addEventListener('DOMContentLoaded', NR.init);
```

### 2.2 Module Inventory

```
NR (root namespace)
├── NR.StateManager      # localStorage persistence, undo/redo, import/export
├── NR.CaseLoader        # Loads case file JSON, validates schema, populates state
├── NR.BoardRenderer     # Renders interactive operations board grid from state
├── NR.ModalManager      # Manages all modal overlays (open, close, stack, focus trap)
├── NR.DiceRoller        # YZE dice pool logic, push, stunt spending
├── NR.AgentTracker      # Agent stats, corruption, injuries, gear tracking
├── NR.CombatTracker     # Initiative, action economy, zones
├── NR.SocialTracker     # NPC disposition, social conflict resolution
├── NR.ClockManager      # Countdown clock advancement, milestone triggers, cross-advance
├── NR.SessionLogger     # Auto-generated session log
├── NR.PrintManager      # Print views for board, cards, sheets
└── NR.ToastNotifier     # Non-blocking feedback notifications
```

### 2.3 Module Specifications

#### 2.3.1 `NR.StateManager`

**Responsibility:** Single source of truth for all mutable application state. Persists to `localStorage`. Provides undo/redo stack.

**Key Methods:**
```js
StateManager.getState()           // → CaseState (deep clone)
StateManager.update(patches)      // Apply partial updates, trigger auto-save
StateManager.subscribe(fn)        // Register change listener
StateManager.undo()               // Pop undo stack, apply previous state
StateManager.redo()               // Pop redo stack, apply next state
StateManager.exportCase()         // → JSON string of full case package
StateManager.importCase(json)     // ← Parse and validate, reset state
StateManager.resetCase()          // Clear to blank template
```

**Internal Storage:**
- `localStorage` key: `nr-da-board-state` — current session state
- `localStorage` key: `nr-da-board-library` — saved case file library (array of case metadata + JSON)
- `localStorage` key: `nr-da-board-preferences` — UI preferences, hotkeys, theme
- Undo stack: in-memory array of state snapshots (max 50 entries)
- Auto-save: debounced 500ms after last mutation

**Subscription Model:**
Components subscribe to specific state paths. On mutation, only affected subscribers fire. Example:
```js
StateManager.subscribe('organizations', BoardRenderer.renderOrgRows);
StateManager.subscribe('shiftsFilled', BoardRenderer.renderShiftRow);
StateManager.subscribe('agents', AgentTracker.onAgentsChanged);
```

#### 2.3.2 `NR.CaseLoader`

**Responsibility:** Load case file JSON, validate against schema, hydrate `StateManager`. Also handles loading from existing HTML case files (via embedded `<script type="application/json">` blocks).

**Key Methods:**
```js
CaseLoader.loadFromJSON(jsonString)    // Parse and validate JSON case file
CaseLoader.loadFromFile(fileHandle)    // File API — user selects .json file
CaseLoader.loadFromHTML(htmlString)    // Extract JSON from <script> tag in HTML
CaseLoader.loadBlank()                 // Initialize empty board template state
CaseLoader.validate(caseData)          // → { valid: boolean, errors: string[] }
CaseLoader.getCaseLibrary()            // → array of saved cases from localStorage
CaseLoader.saveToLibrary(caseData)     // Store case in localStorage library
CaseLoader.deleteFromLibrary(caseId)   // Remove from library
```

**Validation Rules:**
- `caseId` must be non-empty
- `organizations` array: 1–8 entries
- `organizations[].value` must be 1–14
- `organizations[].id` must be unique O1–O8
- `organizations[].milestones[].day` must be 1–14
- `relicMilestones[].day` must be 1–14
- `npcs[].disposition` must be 1–5
- Cross-references (L#, I#, O#) must resolve within the case data
- Agent references must match loaded agent roster

#### 2.3.3 `NR.BoardRenderer`

**Responsibility:** Renders the interactive operations board grid from `CaseState`. Handles all board-specific click interactions. This is the most complex renderer — it builds the HTML table dynamically.

**Key Methods:**
```js
BoardRenderer.render()                // Full board render
BoardRenderer.renderDayHeaders()      // 14→1 column headers
BoardRenderer.renderShiftRow()        // 14 columns × 4 quadrants
BoardRenderer.renderRelicMileRow()    // Annotation row with milestone labels
BoardRenderer.renderOrgRows()         // O1–O8 organization rows
BoardRenderer.renderLegend()          // Legend bar
BoardRenderer.highlightDay(dayNum)    // Visual highlight on a day column
BoardRenderer.pulseOrganization(orgId) // Animation pulse on an org row
BoardRenderer.updatePressureMeter()   // Aggregate countdown pressure indicator
```

**Rendering Strategy:**
- The board is built as an HTML `<table>` with `.board` class matching the existing template CSS.
- Each cell gets `data-*` attributes for click handling: `data-day`, `data-shift`, `data-org`, `data-col`.
- Event delegation: a single click handler on `<tbody>` dispatches based on `data-*` attributes.
- Shift quadrants: each of the 56 cells is a `<div class="quad" data-day="14" data-shift="M">`. CSS class `filled` toggles visual state.
- Organization squares: `<td class="sq" data-org="O1" data-col="14">`. Additional classes: `past` (pre-filled), `ms` (milestone), `consumed` (crossed out during play), `ms-triggered` (milestone has fired).
- Milestone squares: `data-ms="O1M1"` attribute for label display via `::after` pseudo-element.

**Click Handler Delegation:**
```
tbody click → check e.target.closest('[data-day][data-shift]')  → ClockManager.fillShift()
            → check e.target.closest('[data-org][data-col]')    → ClockManager.advanceOrg()
            → check e.target.closest('[data-org] .org-name-field') → edit org name
            → check e.target.closest('[data-org] .org-val-field') → edit org value
            → check e.target.closest('[data-org] .checkbox')    → toggle active/dormant
            → check e.target.closest('.day-header')             → show day detail
```

#### 2.3.4 `NR.ModalManager`

**Responsibility:** Single modal overlay system. All pop-ups share one DOM element (`#modal-overlay`). Content is swapped in. Manages z-index stacking for nested modals (e.g., dice roller opened from NPC card). Focus trap for accessibility.

**Key Methods:**
```js
ModalManager.open(modalType, data)    // Open modal with content from template
ModalManager.close()                  // Close topmost modal
ModalManager.closeAll()               // Dismiss all modals
ModalManager.isOpen()                 // → boolean
ModalManager.getStack()               // → array of open modal descriptors
```

**Modal Content Templates:**
Each modal type has a template function that generates HTML from data:
```js
ModalManager.templates = {
  npcCard(npcData),
  locationPage(locData),
  informationCard(infoData),
  relicSheet(relicData),
  caseBrief(caseData),
  organizationRef(orgData),
  diceRoller(agentState),
  combatTracker(combatState),
  agentSheet(agentState),
  rulesReference(topicKey),
  milestoneDetail(milestoneData),
  dayTimeline(dayNum, logEntries),
  sessionNotes(),
  sandboxMode(),
  infoWebMap(caseState),
  promptGenerator(caseState),
  printPreview(entityType, entityData),
};
```

**Modal Shell Structure:**
```html
<div id="modal-overlay" class="modal-overlay" role="dialog" aria-modal="true">
  <div class="modal-container">
    <div class="modal-header">
      <span class="modal-title"></span>
      <div class="modal-toolbar"><!-- context actions: print, pin, expand --></div>
      <button class="modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body"><!-- dynamic content injected here --></div>
    <div class="modal-footer"><!-- action buttons --></div>
  </div>
</div>
```

**Modal Behaviors:**
- **Pinnable:** The DA can "pin" a modal (NPC card, rules reference) to keep it visible alongside the board. Pinned modals shrink to a sidebar panel.
- **Stackable:** Opening a modal while another is open pushes to stack. Closing restores previous.
- **Click-outside-to-close:** Clicking the overlay backdrop closes the top modal (unless pinned).
- **Escape-to-close:** Esc closes topmost non-pinned modal.
- **Focus trap:** Tab cycles within modal. Shift+Tab reverses. Focus returns to trigger element on close.
- **Draggable:** Modal header can be dragged to reposition (stored per modal type in preferences).

#### 2.3.5 `NR.DiceRoller`

**Responsibility:** Complete YZE dice pool roller. Handles attribute dice, skill dice, gear dice, artifact dice. Push mechanic with auto-Corruption. Stunt point tracking and spending. Gear degradation detection.

**Key Methods:**
```js
DiceRoller.configureForAgent(agentId)  // Pre-fill roller with agent's stats
DiceRoller.roll(poolConfig)            // Execute roll, return result
DiceRoller.push()                      // Re-roll non-6 non-gear dice, +1 Corruption
DiceRoller.spendStunts(points, stunts) // Deduct from available stunt points
DiceRoller.getLastRoll()               // → RollResult (for display)
DiceRoller.rollCriticalInjury()        // d66 table lookup
DiceRoller.rollPanic()                 // d6 panic table
DiceRoller.rollCorruptionBurst(br)     // Wits-only roll with burst rating
DiceRoller.stepResourceDie(resourceKey) // d12→d10→d8→d6→d4→Depleted
DiceRoller.stepArtifactDie()           // d20→d12→d10→d8→d6→d4→Fractured
DiceRoller.rollAmmoDie()               // Roll and check for step-down
```

Full UX design in [Section 5](#5-dice-roller-ux).

#### 2.3.6 `NR.AgentTracker`

**Responsibility:** Manages agent roster. Tracks per-agent: attributes, skill ratings, attribute damage, Corruption, armor, gear items, resource dice, critical injuries, talents.

**Key Methods:**
```js
AgentTracker.loadRoster(agents)        // Import agent data (from char-gen export or manual entry)
AgentTracker.addAgent(agentData)       // Add agent to roster
AgentTracker.removeAgent(agentId)      // Remove from roster
AgentTracker.getAgent(agentId)         // → AgentState
AgentTracker.updateAgent(agentId, patch) // Partial update
AgentTracker.applyDamage(agentId, type, amount, attr) // Apply physical/mental damage
AgentTracker.applyCorruption(agentId, amount) // + Corruption, check thresholds
AgentTracker.applyHealing(agentId, type, amount) // Restore attributes
AgentTracker.checkBroken(agentId)      // → { broken: boolean, type: 'physical'|'mental' }
AgentTracker.checkCorruptionStage(agentId) // → stage number, description, penalties
AgentTracker.getEncumbrance(agentId)   // → { current, capacity, status }
AgentTracker.addCriticalInjury(agentId, injury) // Apply injury, auto-apply penalties
AgentTracker.addGearDegradation(agentId, gearName) // Reduce gear bonus
AgentTracker.exportAgent(agentId)      // → JSON (compatible with char-gen import)
```

**Agent Roster Side Panel:** Rendered as a collapsible right sidebar showing:
- Agent name (click → full sheet modal)
- Corruption gauge (current / threshold)
- Attribute damage bars (STR, AGI, WIT, EMP — color-coded green→yellow→red)
- Active critical injuries (icon indicator)
- Current gear bonus summary

#### 2.3.7 `NR.CombatTracker`

**Responsibility:** Initiative tracking, action economy, zone management. Designed as a modal overlay.

**Key Methods:**
```js
CombatTracker.startCombat(participants)  // Initialize combat
CombatTracker.drawInitiative()           // Deal initiative cards
CombatTracker.sortInitiative()           // Sort by card value
CombatTracker.nextTurn()                 // Advance to next participant
CombatTracker.logAction(actorId, action) // Record fast/slow/free action
CombatTracker.checkActionEconomy(actorId) // → { slowUsed, fastUsed, freeUsed }
CombatTracker.moveActor(actorId, zone)   // Change zone position
CombatTracker.toggleCover(actorId)       // +2 AR toggle
CombatTracker.applyDamage(targetId, amount, type)
CombatTracker.endCombat()
```

**Zone Map (Optional Enhancement):** A simple grid or list of zones (Engaged, Short range, Long range, etc.). Actors are draggable between zones.

#### 2.3.8 `NR.SocialTracker`

**Responsibility:** NPC disposition tracking and social conflict resolution.

**Key Methods:**
```js
SocialTracker.getDisposition(npcId)       // → 1–5
SocialTracker.adjustDisposition(npcId, delta) // +1 or -1
SocialTracker.getDispositionThreshold(npcId) // What's possible at current disposition
SocialTracker.canSocialRoll(npcId)        // → boolean (false if disposition=1)
SocialTracker.getRecoveryOptions(npcId)   // → checklist of ways to recover from Closed
SocialTracker.getDifficulty(npcId, action) // Auto-calculate social roll difficulty
```

#### 2.3.9 `NR.ClockManager`

**Responsibility:** The heart of the board's interactivity. Manages shift filling, organization escalation, milestone detection, cross-advance execution, relic milestone triggers.

**Key Methods:**
```js
ClockManager.fillShift(day, shiftQuadrant)    // Fill M/D/E/N quadrant
ClockManager.unfillShift(day, shiftQuadrant)  // Undo
ClockManager.advanceOrg(orgId)                // Consume next active square
ClockManager.unadvanceOrg(orgId)              // Undo
ClockManager.checkDayCompletion(day)          // Are all 4 quadrants filled?
ClockManager.checkRelicMilestones(day)        // Does a relic milestone fire?
ClockManager.checkOrgMilestone(orgId, col)    // Is this column a milestone square?
ClockManager.executeCrossAdvances(milestone)  // Apply cross-advance instructions
ClockManager.activateDormantOrg(orgId)        // Dormant → Active
ClockManager.getCurrentDay()                  // → day number based on filled shifts
ClockManager.getPressureIndex()               // → 0–1 float for pressure meter
```

**Critical Logic Flows:**

*Shift Fill Flow:*
```
DA clicks quadrant (day=D, shift=S)
→ ClockManager.fillShift(D, S)
  → BoardRenderer updates quadrant visual
  → ClockManager.checkDayCompletion(D)
    → If all 4 quadrants filled:
      → ClockManager.checkRelicMilestones(D)
        → If milestone at this day:
          → ModalManager.open('milestoneDetail', milestoneData)
          → SessionLogger.log('milestone', ...)
      → BoardRenderer.updateCurrentDayIndicator()
  → StateManager.update({ shiftsFilled: [...] })
  → SessionLogger.log('shift', { day: D, shift: S })
```

*Organization Escalation Flow:*
```
DA clicks organization square (org=O1, col=7)
→ ClockManager.advanceOrg('O1')
  → Calculates current active square (first non-past, non-consumed)
  → Marks square as 'consumed'
  → BoardRenderer updates square visual
  → ClockManager.checkOrgMilestone('O1', 7)
    → If milestone square:
      → Retrieve milestone description from org data
      → ModalManager.open('milestoneDetail', {
          orgId: 'O1',
          milestone: milestoneData,
          crossAdvances: parsedCrossAdvances
        })
      → DA sees description + "Execute" buttons for each cross-advance
      → DA clicks "Advance O3 by 1"
        → ClockManager.advanceOrg('O3')
        → (recursive — may trigger O3's milestone!)
  → StateManager.update({ organizations: [...] })
  → SessionLogger.log('escalation', { org: 'O1', col: 7 })
```

*Cross-Advance Chain Example:*
```
O2M2 fires → "Advance O3 by 2 squares. Advance O1 by 1 square."
→ Execute O3+2:
  → Square 1 consumed (col 3) → O3M3 detected! → O3M3 opens
    → O3M3 says "Activate O7 (dormant)"
    → ClockManager.activateDormantOrg('O7')
  → Square 2 consumed (col 2)
→ Execute O1+1:
  → Square consumed (col 4) → O1M2 detected! → O1M2 opens
```

**Milestone Chain Visualizer:** When a cross-advance chain fires, the `ModalManager` shows a chain diagram:
```
O2M2 ──→ O3 +2 ──→ O3M3 fires ──→ O7 activated
      ──→ O1 +1 ──→ O1M2 fires
```
Each node is clickable to jump to that milestone's detail.

#### 2.3.10 `NR.SessionLogger`

**Responsibility:** Auto-generated chronological log of all state-changing actions.

**Key Methods:**
```js
SessionLogger.log(type, description, data)  // Append entry
SessionLogger.getEntries(filter)            // → filtered LogEntry[]
SessionLogger.search(query)                 // → matching entries
SessionLogger.exportLog()                   // → plain text or JSON
SessionLogger.renderTimeline(dayNum)        // → HTML for day timeline view
```

**Log Entry Types:** `shift`, `roll`, `milestone`, `escalation`, `discovery`, `combat`, `social`, `damage`, `healing`, `corruption`, `note`, `import`, `reset`.

#### 2.3.11 `NR.PrintManager`

**Responsibility:** Print-optimized views. See [Section 9](#9-print-strategy).

#### 2.3.12 `NR.ToastNotifier`

**Responsibility:** Non-blocking transient notifications.

```js
ToastNotifier.show(message, type, duration)  // type: 'info'|'success'|'warn'|'error'
```

---

## 3. Data Flow

### 3.1 Architecture Pattern: Event-Driven with Central State

The app uses a **uni-directional data flow** pattern:

```
User Action → Component Method → StateManager.update() → Subscribers Notified → Re-render
```

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
│  (click quadrant, click square, press hotkey, edit field, etc.) │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COMPONENT HANDLER                           │
│  ClockManager.fillShift() / advanceOrg()                        │
│  AgentTracker.applyDamage()                                     │
│  DiceRoller.roll() → triggers StateManager for Corruption       │
│  (Component validates action, computes consequences)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      StateManager.update(patches)               │
│  1. Deep-clone current state                                    │
│  2. Apply patches                                               │
│  3. Push previous state to undo stack                           │
│  4. Debounced auto-save to localStorage (500ms)                 │
│  5. Notify subscribers of changed paths                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUBSCRIBERS NOTIFIED                        │
│  BoardRenderer → re-render affected rows/cells                  │
│  AgentTracker  → update agent roster panel                      │
│  ModalManager  → update open modal content if relevant          │
│  SessionLogger → append log entry                               │
│  ToastNotifier → show feedback toast                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Specific Data Flow Examples

**Example A: Clicking a countdown square**
```
1. User clicks <td class="sq" data-org="O1" data-col="7">
2. BoardRenderer delegated click handler fires
3. Handler calls ClockManager.advanceOrg('O1')
4. ClockManager determines current square → col 7
5. ClockManager calls StateManager.update({
     organizations[0].squaresConsumed: [...existing, 7]
   })
6. StateManager notifies subscribers of 'organizations' change
7. BoardRenderer.renderOrgRows() re-renders O1 row
   - Square at col 7 gets class 'consumed' + fill animation
8. ClockManager.checkOrgMilestone('O1', 7)
   → If milestone: calls ModalManager.open('milestoneDetail', {...})
9. SessionLogger.log('escalation', 'O1 advanced to column 7')
10. ToastNotifier.show('O1: Vantablack Compact escalated', 'info')
```

**Example B: Dice roll with push**
```
1. DA clicks "Roll" in DiceRoller modal
2. DiceRoller.roll(config) → RollResult { dice: [...], successes: 3, ones: 1, gearOnes: 0, stunts: 1 }
3. DiceRoller displays result with animated dice
4. DA clicks "Push"
5. DiceRoller.push()
   → StateManager.update({ agents[0].corruption: prev+1 })
   → AgentTracker subscribers fire → update roster panel Corruption gauge
   → Re-roll non-6 attribute/skill dice (NOT gear dice)
   → New RollResult with combined successes
6. If gear die showed 1 on original roll:
   → GearTracker prompts: "Gear degradation: [Item] bonus reduced by 1"
   → StateManager.update({ agents[0].gear[n].bonus: prev-1 })
```

### 3.3 Event Bus for Cross-Cutting Concerns

An internal event bus (pub/sub) handles cross-cutting notifications that don't directly mutate state:

```js
NR.Events = {
  _listeners: {},
  on(event, fn),
  off(event, fn),
  emit(event, data)
};

// Usage:
NR.Events.on('milestone:fired', (data) => {
  // Animate board, play sound, etc.
});
NR.Events.on('agent:broken', (data) => {
  // Flash agent roster, auto-open critical injury roller
});
NR.Events.on('corruption:threshold', (data) => {
  // Visual alert on corruption gauge
});
```

---

## 4. Modal/Overlay Design

### 4.1 Modal Inventory

| Modal | Trigger | Size | Pinnable | Print |
|-------|---------|------|----------|-------|
| **Dice Roller** | Toolbar button, hotkey `R`, or contextual from agent sheet | Medium (500×400px) | Yes | No |
| **NPC Card** | Click NPC name/reference `NPC#` anywhere in app | Medium (450×600px) | Yes | Yes |
| **Location Page** | Click location reference `L#` | Medium (450×550px) | Yes | Yes |
| **Information Card** | Click information reference `I#` | Small (400×300px) | Yes | Yes (player-facing side) |
| **Relic Sheet** | Toolbar button, relic reference on board | Large (600×700px) | Yes | Yes |
| **Case Brief DA** | Toolbar button | Large (600×800px) | Yes | Yes |
| **Organization Reference** | Click org row header or toolbar | Large (600×800px) | Yes | Yes |
| **Agent Sheet** | Click agent name in roster | Large (600×800px) | Yes | Yes |
| **Combat Tracker** | Toolbar button or hotkey `C` | Large (700×500px) | Yes | No |
| **Rules Reference** | Toolbar button or hotkey `?` | Medium (500×600px) | Yes | Yes |
| **Milestone Detail** | Auto-opens when milestone fires; also clickable from org rows | Medium (450×400px) | No | No |
| **Day Timeline** | Click day number header on board | Medium (500×600px) | No | Yes |
| **Session Notes** | Toolbar button or hotkey `N` | Large (600×500px) | Yes | Yes |
| **Sandbox Mode** | Toolbar toggle | Full overlay on board | No | No |
| **Information Web Map** | Toolbar button | Large (700×500px) | No | No |
| **Prompt Generator** | Toolbar button | Small (400×200px) | No | Yes |
| **Case Load/Save** | Toolbar button | Medium (500×400px) | No | No |
| **Settings/Preferences** | Toolbar gear icon | Medium (400×500px) | No | No |

### 4.2 Modal Content Specifications

#### NPC Card Modal
**Data displayed:**
- Portrait (if available, from `assets/png/` or case file bundle)
- Name, organization affiliation (clickable O#)
- Disposition slider (1–5) with current threshold description
- Secret (DA-only)
- Goal
- Artifact connection
- Starting knowledge (I# references — clickable)
- Gained knowledge (trigger condition + I# references)
- Locations (L# references — clickable)
- Positive/Negative engagement results
- DA notes (free-text, auto-saved)

**Interactions:**
- Disposition +/- buttons (with confirmation)
- Social roll button (pre-configured with NPC's disposition → auto-difficulty)
- "Reveal Knowledge" button to mark an I# as discovered
- Edit notes
- Pin to sidebar
- Print NPC card (playing-card sized for table handout)

**Dismissal:** Close button, Escape key, click-outside.

#### Location Page Modal
**Data displayed:**
- Name, location ID (L#)
- Image (if available)
- Description
- Availability type badge (Open / Clue-locked / Contact-locked / Time-locked / Packet-locked)
- Availability condition text
- NPCs present (clickable names)
- Information available (clickable I#)
- Organizations present (clickable O#)
- Positive result / Negative result
- Milestone changes
- DA notes

**Interactions:**
- "Unlock Location" button (marks as accessible)
- Click NPC to open NPC card (stacked modal)
- Click I# to open information card (stacked modal)
- Edit notes

#### Information Card Modal
**Data displayed:**
- Card ID (I#)
- **DA-facing back:** Type (Containment Truth / Supporting Intel), found at (L#), known by (NPC names), HQ fallback day, DA notes
- **Player-facing front:** Content text (what agents learn)

**Interactions:**
- "Reveal to Players" toggle — flips card to show player-facing side (for screen sharing or printing)
- "Mark as Discovered" button — updates discovery tracking in state
- Print player-facing side (for physical handout)

#### Relic Sheet Modal
**Data displayed:**
- Name, tier (1–3 badges), category, risk tag
- Corruption cost (+1/+2/+3)
- Artifact die (current value, step-down history)
- Emission type (Aura / Pulse / Burst)
- Mundane appearance
- Surface read / Operational read / Cold Archive read (progressive disclosure tiers)
- Activation condition
- Mechanical effect
- Fracture description
- Containment profile
- Containment truth checklist (trigger, appetite, quiescence, effect, proximity, missing) — checkbox per truth with I# reference

**Interactions:**
- Activate Artifact wizard (step-by-step: meet condition → declare → pay Corruption → effect → roll Artifact Die)
- Check off containment truths
- Step artifact die
- Roll artifact die
- View fracture table

#### Combat Tracker Modal
**Data displayed:**
- Sorted initiative list (card icons: ♠♥♦♣ A–10)
- Per participant: name, current action status (Slow ○/●, Fast ○/●), Armor, Cover toggle, zone position, damage summary
- Round counter
- "Next Turn" / "End Round" buttons
- Quick action buttons: Attack, Move, Take Cover, Dodge, First Aid, Reload, Use Artifact

**Interactions:**
- Click participant → expand action menu
- Drag participant to reorder (if initiative changes)
- Click zone → move participant
- Toggle cover
- Apply damage
- "Draw Initiative" reshuffles cards
- End combat → logs summary, returns to normal mode

#### Agent Sheet Modal
**Data displayed:**
- Full character sheet in the char-gen visual style
- Attributes with damage overlays (current / max)
- Skills table
- Corruption track with stage indicators
- Gear list with current bonuses
- Resource dice trackers (ammo, medical, battery, rations)
- Talents list
- Critical injuries list with effects
- Division and sub-unit info
- CL (Clearance Level)

**Interactions:**
- Apply damage (click attribute → damage dialog)
- Apply healing
- Add/remove gear
- Step resource dice
- Add critical injury (opens d66 roller)
- Roll dice (pre-configured for this agent)
- Edit notes
- Export agent JSON

### 4.3 Modal Stacking Behavior

```
Board (always visible, z-index: 1)
  └── Pinned Sidebar Panels (z-index: 10)
        ├── Agent Roster (collapsible right panel)
        ├── Pinned NPC Card (floating)
        └── Pinned Rules Reference (floating)
  └── Modal Overlay (z-index: 100)
        ├── Modal 1: NPC Card
        │     └── Modal 1b: Information Card (stacked from NPC reference click)
        └── (Modal 2 would replace Modal 1 unless stacked)
```

**Stacking rules:**
- Opening a modal while another is open pushes to a stack (max depth: 3).
- Closing returns to the previous modal.
- Stacked modals are visually offset (cascading position) so the DA can see the breadcrumb trail.
- Pinned modals move out of the stack into sidebar panels.

---

## 5. Dice Roller UX

### 5.1 YZE Dice Pool Recap

| Die Type | Color | Range | Source |
|----------|-------|-------|--------|
| **Attribute dice** | White/cream | 1–5 (d6s) | Agent's STR/AGI/WIT/EMP current value |
| **Skill dice** | Green | 0–5 (d6s) | Agent's skill rating |
| **Gear dice** | Black/dark | 0–3 (d6s) | Equipment gear bonus |
| **Artifact dice** | Red/purple | d4–d20 (single stepped die) | Active artifact |

**Success:** Each 6 = 1 success. Extra 6s beyond what's needed = Stunt Points.
**Push:** Re-roll all non-6 dice. Gear dice are NEVER re-rolled. Cost: +1 Corruption.
**Gear Degradation:** If any gear die shows 1 on the initial roll, gear bonus −1. At bonus 0, gear is broken.
**Artifact Degradation:** If artifact die shows 1, step down die size. Below d4 = Fracture.

### 5.2 Dice Roller Modal Layout

```
┌─────────────────────────────────────────────┐
│  DICE ROLLER                    [Pin] [✕]   │
├─────────────────────────────────────────────┤
│  Agent: [▼ Ingrid Skovgaard    ]  [⚙ Edit] │
│                                             │
│  ┌─ Attribute ───┐  ┌─ Skill ──────┐        │
│  │ STR ●●●◐○ (3) │  │ Force     (2)│        │
│  │ AGI ●●●●○ (4) │  │ Brawl     (1)│        │
│  │ WIT ●●●◐○ (3) │  │ Firearms  (3)│ ← sel  │
│  │ EMP ●●◐○○ (2) │  │ ...          │        │
│  └───────────────┘  └──────────────┘        │
│                                             │
│  ┌─ Gear ─────────┐                         │
│  │ ☑ Service Pistol (+2) ☐ Broken          │
│  │ ☐ Trauma Kit (+1)                       │
│  │ (max 3 gear dice from equipped items)    │
│  └───────────────┘                         │
│                                             │
│  ┌─ Artifact ────┐                          │
│  │ ☑ Spear of Destiny (d12) ← current die  │
│  └───────────────┘                         │
│                                             │
│  Pool: 3 white + 3 green + 2 black = 8 dice │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │         [ 🎲 ROLL 8 DICE ]             ││
│  └─────────────────────────────────────────┘│
│                                             │
│  ── LAST ROLL ───────────────────────────  │
│  ⚀⚁⚂⚃⚄⚅ (visual dice display)            │
│  ⚅⚅⚅⚀⚁⚂⚄⚅                                │
│                                             │
│  Successes: 3  |  Stunt Points: 1           │
│  Gear 1s: 0    |  Artifact: —               │
│                                             │
│  [PUSH (re-roll)] [+1 Corruption ⚠]         │
│  [SPEND STUNTS ▼]                           │
│    → Faster (1 SP) — act first next round   │
│    → Precise (1 SP) — +1 info from search   │
│    → Deadly Aim (2 SP) — +1 damage          │
│    → Double Tap (2 SP) — extra attack       │
│                                             │
│  Difficulty: [▼ 1] (successes needed)       │
└─────────────────────────────────────────────┘
```

### 5.3 Roll Flow

1. **Configure Pool:**
   - DA selects agent from dropdown (auto-populates attributes, skills, gear)
   - DA chooses which attribute + skill to roll (dropdowns)
   - DA toggles gear items on/off (checkboxes, max 3)
   - DA toggles artifact inclusion (if artifact is active)
   - Pool size displayed live as dice are added

2. **Roll:**
   - Click "ROLL" → animated dice appear in result area
   - Each die shows its face value (animated roll-in, settle on result)
   - Successes counted and highlighted (6s pulse green)
   - 1s on gear dice highlighted red (degradation warning)
   - 1 on artifact die highlighted red (step-down warning)
   - Stunt points = total successes − difficulty (shown as spendable currency)

3. **Post-Roll Options:**
   - **Push:** Button shows "PUSH (+1 Corruption)". Confirms with Corruption cost. Re-rolls only non-6, non-gear dice. New dice animate in. Combined successes shown.
   - **Spend Stunts:** If stunt points > 0, dropdown shows available general stunts. All stunts are available on any skill roll. Costs 1–2 SP each. Selecting a stunt deducts from SP pool and logs the effect.
   - **Accept Result:** "Done" button closes modal, logs the roll result to session log.

4. **Edge Cases:**
   - **Gear 1s on initial roll:** Show degradation warning: "Service Pistol: gear bonus reduced 2→1". Auto-applies to agent state.
   - **Artifact die 1:** Show warning: "Spear of Destiny: Artifact Die stepped d12→d10". Auto-applies.
   - **Artifact Fracture:** When die would step below d4, show full fracture description, prompt DA to execute consequences.
   - **No successes after push:** Show "Failure" state. Offer narrative suggestions.
   - **Agent has damage:** Attribute dice use CURRENT attribute value (max − damage). Damaged dice shown with strikethrough or dimmed color.

### 5.4 Dice Pool Quick-Select

For speed during play, the toolbar has a **Quick Roll** dropdown:
```
[🎲 Quick Roll ▼]
  → Ingrid: Firearms (AGI 4 + Firearms 3 + Pistol 2) = 9 dice
  → Ingrid: Investigate (WIT 3 + Investigate 2) = 5 dice
  → Nikolai: Force (STR 5 + Force 4) = 9 dice
  → Nikolai: Sneak (AGI 3 + Sneak 2) = 5 dice
  → Custom...
```

These are pre-configured per agent as "common rolls" and can be pinned.

### 5.5 Dice Visual Representation

Dice are represented as CSS-styled squares with face dots:
- **d6 faces:** Traditional pip patterns (⚀⚁⚂⚃⚄⚅) or numerical overlay
- **Attribute dice:** White background, black pips
- **Skill dice:** Green tint background, black pips
- **Gear dice:** Dark gray background, white pips
- **Artifact die:** Red/dark background, gold number showing die size

Animated roll: dice tumble (CSS `@keyframes` rotation + scale) for ~0.8s, then settle showing results.

---

## 6. Local State Schema

### 6.1 Top-Level State Object

```json
{
  "version": "1.0.0",
  "lastSaved": "2025-06-21T12:00:00.000Z",
  "case": { /* CaseState — see 6.2 */ },
  "agents": [ /* AgentState[] — see 6.3 */ ],
  "combat": { /* CombatState — see 6.4 */ },
  "sessionLog": [ /* LogEntry[] — see 6.5 */ ],
  "preferences": { /* UserPreferences — see 6.6 */ },
  "undoStack": [],
  "redoStack": []
}
```

### 6.2 `CaseState`

```json
{
  "caseId": "VC-AR-87-041",
  "caseName": "The Spear That Went Dark",
  "region": "Buenos Aires, Argentina",
  "currentDay": 14,
  "shiftsFilled": [
    { "day": 14, "shift": "M", "filled": true, "undertaking": "Arrival in Buenos Aires" },
    { "day": 14, "shift": "D", "filled": false, "undertaking": "" }
  ],
  "organizations": [
    {
      "id": "O1",
      "name": "Vantablack Compact",
      "value": 9,
      "active": true,
      "dormant": false,
      "activationCondition": "Triggered by O4M2",
      "squaresConsumed": [14, 13, 12, 11, 10],
      "milestones": [
        { "day": 7, "label": "O1M1", "description": "The Compact sends a cleaner...", "crossAdvances": [{ "targetOrg": "O5", "squares": 1 }], "triggered": false },
        { "day": 4, "label": "O1M2", "description": "Cleaner fails; Compact escalates...", "crossAdvances": [{ "targetOrg": "O3", "squares": 2 }], "triggered": false },
        { "day": 1, "label": "O1M3", "description": "Compact makes final play...", "crossAdvances": [], "triggered": false }
      ],
      "linkedEffects": "Escalation increases heat on all players in Buenos Aires underworld",
      "playerSigns": "Increased surveillance, unfamiliar faces tailing agents, vehicles parked outside safe houses",
      "notes": ""
    }
  ],
  "relicMilestones": [
    { "day": 11, "description": "The Spear emits its first pulse — all agents within 1 mile gain +1 Corruption" },
    { "day": 8, "description": "Second pulse: radius expands to 5 miles" },
    { "day": 5, "description": "Catastrophic emission: the Spear activates partially" },
    { "day": 2, "description": "Imminent catastrophe warning signs" },
    { "day": 1, "description": "CATASTROPHE: The Spear fully activates" }
  ],
  "caseBrief": {
    "mysteryStatement": "A Vatican artifact...",
    "realSituation": "The Spear was stolen by...",
    "primaryObjective": "Locate and contain the Spear of Destiny",
    "secondaryObjective": "Identify the buyer and disrupt the auction network",
    "containmentTruthsSummary": {
      "trigger": "Physical contact with blood",
      "appetite": "Seeks to be wielded in conquest",
      "quiescence": "Dormant when sealed in consecrated lead"
    },
    "keyActors": "Vantablack Compact, The Theft Crew, Buenos Aires Police...",
    "bestCase": "Spear recovered intact, auction disrupted, minimal exposure",
    "worstCase": "Spear activates in population center, mass corruption event, Covenant exposed",
    "daNotes": ""
  },
  "relicSheet": {
    "name": "Spear of Destiny",
    "tier": 3,
    "category": "Weapon / Religious Artifact",
    "riskTag": "Catastrophic",
    "corruptionCost": 3,
    "artifactDie": "d12",
    "artifactDieCurrent": "d12",
    "emissionType": "Pulse",
    "mundaneAppearance": "A Roman-era iron spearhead...",
    "surfaceRead": "Extreme holy/unholy resonance...",
    "operationalRead": "Tier 3 artifact tied to bloodline conquest...",
    "coldArchiveRead": "One of three known 'Passion Relics'...",
    "activationCondition": "Contact with blood of a conqueror (defined as one who has led armies to victory)",
    "mechanicalEffect": "Bearer gains +2 Force and +2 Command. All social rolls against the bearer are at −2 difficulty for the bearer.",
    "fracture": "Reality fracture: all within 10 miles make Corruption Burst (BR 5) check every hour",
    "containmentProfile": "Must be sealed in consecrated lead-lined container. Transport requires 2 agents with Empathy 4+. Handling requires full containment suit.",
    "containmentTruthChecklist": [
      { "id": "I1", "type": "trigger", "description": "Blood contact activates — but whose blood?", "discovered": false },
      { "id": "I3", "type": "appetite", "description": "Seeks conquest — what defines a conqueror?", "discovered": false },
      { "id": "I5", "type": "quiescence", "description": "Dormant in consecrated lead — where is such a container?", "discovered": false }
    ],
    "notes": ""
  },
  "npcs": [],
  "locations": [],
  "informationCards": [],
  "discoveredInfo": [],
  "revealedNPCs": [],
  "unlockedLocations": []
}
```

### 6.3 `AgentState`

```json
{
  "id": "agent-001",
  "name": "Ingrid Skovgaard",
  "division": "wayfinder",
  "subUnit": "research",
  "specialty": "Research Field Analyst",
  "ageGroup": "adult",
  "origin": "Copenhagen, Denmark",
  "anchor": "Her grandmother's journal",
  "attributes": {
    "strength": 3,
    "agility": 4,
    "wits": 3,
    "empathy": 2
  },
  "attributeDamage": {
    "strength": 1,
    "agility": 0,
    "wits": 0,
    "empathy": 0
  },
  "skills": {
    "force": 4,
    "brawl": 1,
    "endure": 2,
    "sneak": 1,
    "deftHands": 2,
    "firearms": 3,
    "investigate": 3,
    "tech": 1,
    "lore": 3,
    "heal": 2,
    "manipulate": 1,
    "command": 1,
    "psychoanalyze": 1
  },
  "corruption": 3,
  "corruptionThreshold": 12,
  "armorRating": 0,
  "talents": [
    { "name": "Archivist", "effect": "+1 die to Lore rolls involving written records", "cost": "—", "source": "division" },
    { "name": "Polyglot", "effect": "Speak and read 4 additional languages", "cost": "—", "source": "general" }
  ],
  "gear": [
    { "name": "Service Pistol", "bonus": 2, "enc": "1", "cl": 2, "degraded": false },
    { "name": "Trauma Kit", "bonus": 1, "enc": "2", "cl": 3, "degraded": false },
    { "name": "Forged Credentials", "bonus": 0, "enc": "—", "cl": 2, "degraded": false }
  ],
  "resourceDice": {
    "ammo": "d10",
    "medical": "d8",
    "rations": "d12"
  },
  "criticalInjuries": [
    { "roll": "41-42", "name": "Cracked Ribs", "effect": "−1 STR until healed", "lethal": false, "healing": "2 weeks rest or Trauma Kit" }
  ],
  "cl": 3,
  "standing": 2,
  "xp": 8,
  "notes": "Has a personal connection to Buenos Aires — studied abroad there in university",
  "commonRolls": [
    { "label": "Firearms (pistol)", "attribute": "agility", "skill": "firearms", "gear": ["Service Pistol"] },
    { "label": "Investigation", "attribute": "wits", "skill": "investigate", "gear": [] },
    { "label": "Lore Research", "attribute": "wits", "skill": "lore", "gear": [] }
  ]
}
```

### 6.4 `CombatState`

```json
{
  "active": false,
  "round": 0,
  "participants": [
    {
      "id": "agent-001",
      "name": "Ingrid Skovgaard",
      "type": "agent",
      "initiativeCard": { "suit": "hearts", "value": 8 },
      "slowActionUsed": false,
      "fastActionUsed": false,
      "zone": "Short",
      "coverActive": false
    }
  ],
  "currentTurnIndex": 0,
  "zoneMap": ["Engaged", "Short", "Long", "Sniper Range"],
  "notes": ""
}
```

### 6.5 `LogEntry`

```json
{
  "timestamp": "2025-06-21T14:32:00.000Z",
  "type": "milestone",
  "description": "O1M1 fired: Vantablack Compact sends a cleaner after the agents",
  "data": {
    "orgId": "O1",
    "milestone": "O1M1",
    "crossAdvances": [{ "targetOrg": "O5", "squares": 1 }]
  }
}
```

### 6.6 `UserPreferences`

```json
{
  "theme": "dossier",
  "fontSize": "medium",
  "soundEnabled": false,
  "soundVolume": 0.5,
  "autoSaveInterval": 500,
  "undoStackLimit": 50,
  "confirmMilestoneTriggers": true,
  "confirmOrgEscalation": false,
  "showPressureMeter": true,
  "showAgentRoster": true,
  "agentRosterCollapsed": false,
  "pinnedModals": [],
  "keyboardShortcuts": { /* key → action mapping */ },
  "defaultDiceAnimation": true,
  "diceAnimationSpeed": "normal",
  "boardZoom": 1.0,
  "lastCaseId": "VC-AR-87-041"
}
```

### 6.7 Schema Versioning Strategy

The `version` field at the top of the state object enables forward compatibility:

```js
const MIGRATIONS = {
  '1.0.0': (state) => state, // Initial version
  '1.1.0': (state) => {
    // Example: add new field with default
    state.case.catastropheDescription = state.case.catastropheDescription || '';
    return state;
  }
};

function migrateState(state) {
  const versions = Object.keys(MIGRATIONS).sort(semverCompare);
  const startIdx = versions.indexOf(state.version);
  if (startIdx === -1) throw new Error('Unknown state version');
  for (let i = startIdx + 1; i < versions.length; i++) {
    state = MIGRATIONS[versions[i]](state);
    state.version = versions[i];
  }
  return state;
}
```

**Version bump rules:**
- **Patch (1.0.x):** Bug fix to schema, no data transformation needed.
- **Minor (1.x.0):** New optional fields added with defaults. Migration adds defaults.
- **Major (x.0.0):** Breaking change to schema structure. Requires explicit import/export migration path.

---

## 7. Case File Data Format

### 7.1 The JSON Case File Package

A complete case file is a single `.json` file containing everything the DA board app needs:

```json
{
  "formatVersion": "1.0.0",
  "sourceFiles": ["case-brief-da.html", "operations-board.html", "npc-cards.html", "locations.html", "information-cards.html", "organization-reference.html", "relic-sheet.html"],
  "case": { /* CaseState — full case data as defined in 6.2 */ },
  "npcs": [ /* NPCCard[] — all NPCs */ ],
  "locations": [ /* Location[] — all locations */ ],
  "informationCards": [ /* InformationCard[] — all info cards */ ],
  "images": { /* optional: base64-encoded images keyed by filename */ },
  "metadata": {
    "author": "DA Name",
    "created": "2025-06-21T00:00:00.000Z",
    "modified": "2025-06-21T00:00:00.000Z",
    "description": "A Spear of Destiny goes missing in Buenos Aires...",
    "tags": ["religious", "crime", "conspiracy"],
    "intendedPlayers": "3-5",
    "playtime": "4-6 sessions"
  }
}
```

### 7.2 Conversion Strategy: HTML → JSON

Existing case files are standalone HTML files. The conversion strategy has two approaches:

#### Approach A: Manual JSON Authoring (Preferred for New Cases)

DA authors case files directly as JSON. This is the path forward for all new content. A JSON schema and documentation guide DAs through the format.

#### Approach B: HTML Extraction Converter (For Existing Cases)

A converter tool at [`docs/web-app-da-board/converter/convert-case-file.html`](../web-app-da-board/converter/convert-case-file.html) provides:

1. **Drag-and-drop interface:** DA drops existing HTML case files (or a ZIP of the case directory).
2. **HTML parsing:** The converter extracts data from the HTML structure:
   - **Operations Board:** Parse the `<table class="board">` for organization names, values, checkboxes, `data-ms` attributes, `past` classes, relic milestone annotations.
   - **NPC Cards:** Parse name, organization, secret, goal, artifact connection, knowledge, locations, results from the HTML structure. Each NPC card HTML has consistent class naming.
   - **Locations:** Parse name, description, availability, NPCs, info, organizations, results, milestone changes.
   - **Information Cards:** Parse content, type, found at, known by, HQ fallback.
   - **Relic Sheet:** Parse name, tier, category, risk tag, activation, effects, fracture, containment profile, truths.
   - **Case Brief:** Parse mystery statement, real situation, objectives, containment truths, key actors, outcomes, milestones, notes.
3. **Manual correction UI:** The converter shows extracted data in editable forms. DA reviews and corrects parsing errors.
4. **Validation:** Runs `CaseLoader.validate()` on the extracted data.
5. **Export:** Downloads a `.json` case file package, optionally with embedded base64 images.

**Parser Strategy:** Each HTML template type has known CSS class conventions (e.g., `.org-name-field`, `.org-val-field`, `.checkbox.checked`, `.sq.past`, `.sq.ms[data-ms]`). The converter uses `DOMParser` to parse each HTML file, then `querySelector`/`querySelectorAll` with these known selectors to extract data.

**Limitations of Approach B:**
- Free-text fields (like milestone descriptions) may need manual mapping since they're not always machine-parseable.
- Image references may need manual resolution.
- Some relationships (which NPC knows which I#) may be implicit in the text and need manual entry.

### 7.3 Embedding JSON in HTML (Hybrid Approach)

For backward compatibility with the existing template system, case file HTMLs can embed JSON data:

```html
<!-- At the bottom of any case file HTML: -->
<script type="application/json" id="nr-case-data">
{
  "formatVersion": "1.0.0",
  "case": { ... },
  "npcs": [ ... ]
}
</script>
```

The DA board app's `CaseLoader.loadFromHTML()` extracts this `<script>` block and hydrates the state. This allows existing HTML case files to carry their JSON payload without breaking the visual PDF output.

### 7.4 Case File Library

The `localStorage` key `nr-da-board-library` stores:

```json
[
  {
    "id": "vc-ar-87-041",
    "name": "The Spear That Went Dark",
    "description": "...",
    "tags": ["religious", "crime"],
    "lastOpened": "2025-06-21T12:00:00.000Z",
    "dateAdded": "2025-06-20T00:00:00.000Z",
    "size": 45678
  }
]
```

The actual case JSON is stored separately in `localStorage` keys like `nr-da-board-case-vc-ar-87-041` to avoid hitting the 5MB localStorage limit with multiple large cases.

---

## 8. Keyboard Shortcuts & Accessibility

### 8.1 Keyboard Shortcut Map

| Key | Context | Action |
|-----|---------|--------|
| **Global (always available)** |||
| `R` | Global | Open Dice Roller modal |
| `S` | Global | Save case state |
| `Ctrl+S` | Global | Export case JSON |
| `Ctrl+O` | Global | Open/load case file |
| `N` | Global | Open session notes |
| `?` | Global | Open rules reference |
| `C` | Global | Open combat tracker |
| `B` | Global | Jump to Board tab (primary view) |
| `F` | Global | Focus search bar (search entities: NPCs, locations, info cards) |
| `Escape` | Global | Close current modal / cancel action |
| `Ctrl+Z` | Global | Undo last action |
| `Ctrl+Y` | Global | Redo last undone action |
| `Ctrl+Shift+Z` | Global | Redo (alternative) |
| `P` | Global | Print current view |
| **Board Navigation** |||
| `1`–`8` | Board | Jump to / highlight organization O1–O8 |
| `→` | Board | Move day focus right (toward catastrophe) |
| `←` | Board | Move day focus left (away from catastrophe) |
| `Space` | Board (day focused) | Fill next available shift quadrant for focused day |
| `Enter` | Board (org focused) | Advance focused organization by 1 square |
| `Shift+Enter` | Board (org focused) | Open organization detail panel |
| `M` / `D` / `E` / `N` | Board (day focused) | Fill specific shift quadrant (Morning/Day/Evening/Night) |
| **Modal Navigation** |||
| `Escape` | Modal | Close topmost modal |
| `Tab` | Modal | Next focusable element |
| `Shift+Tab` | Modal | Previous focusable element |
| **Dice Roller** |||
| `Enter` | Dice Roller | Roll configured pool |
| `Shift+Enter` | Dice Roller | Push (re-roll) |
| `1`–`5` | Dice Roller (stunt menu) | Select stunt 1–5 |
| **Combat Tracker** |||
| `→` / `Space` | Combat | Next turn |
| `M` | Combat | Move selected actor |
| `A` | Combat | Attack action |
| `V` | Combat | Toggle cover |
| `D` | Combat | Dodge action |
| **Sandbox Mode** |||
| `Ctrl+Shift+S` | Global | Toggle sandbox mode |

### 8.2 Accessibility Considerations

**Semantic HTML:**
- The board `<table>` uses proper `<thead>`, `<tbody>`, `<th scope="col/row">` for screen reader navigation.
- Shift quadrants use `aria-label="Day 14 Morning Shift — Unfilled"` for state communication.
- Organization squares use `aria-label="O1 Vantablack Compact — Column 7 — Milestone O1M1"`.
- Modals use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title.

**Keyboard Navigation:**
- All interactive elements are reachable via Tab.
- Focus indicators are visible (`.focus-visible` outlines in the theme's green-stamp color).
- Focus trap in modals: Tab wraps within the modal. Shift+Tab wraps backward.
- Skip-to-content link at the top of the page: "Skip to Operations Board".

**Color & Contrast:**
- The paper theme (`--paper: #f0ead6`, `--ink: #1a1a18`) provides high contrast (~15:1 ratio).
- Red elements (`--red-stamp: #8b1a1a`) on paper background meet WCAG AA for large text.
- Color is never the sole indicator of state. Squares use both color AND pattern/text:
  - Consumed squares: diagonal strike-through pattern + darkened background
  - Milestone squares: red bottom border + `O#M#` label text
  - Filled quadrants: filled background + checkmark icon

**Screen Reader Announcements:**
- Use `aria-live="polite"` region for dynamic updates (milestone fired, org advanced, roll result).
- Toast notifications use `role="status"` for auto-announcement.
- Dice roll results announced: "Roll result: 3 successes, 1 stunt point. Gear die showed 1 — Service Pistol degraded."

**Reduced Motion:**
- Respect `prefers-reduced-motion` media query. Disable dice roll animations, pulse effects, and transition animations.
- All animations have CSS fallbacks for `prefers-reduced-motion: reduce`.

**Zoom & Text Sizing:**
- Board supports browser zoom (Ctrl+/Ctrl-) via CSS `rem` units and viewport-relative sizing.
- Font size preference in settings: Small (8pt), Medium (9pt default), Large (11pt).
- No maximum-scale restrictions on viewport meta tag.

**Touch/Mobile:**
- All click targets are minimum 44×44px (WCAG 2.5.5).
- Long-press on organization rows opens context menu (alternative to right-click).
- Swipe left/right on board to navigate days (touch devices).
- Pinch-to-zoom enabled on the board.

---

## 9. Print Strategy

### 9.1 Print Architecture

All print functionality routes through [`NR.PrintManager`](#2311-nrprintmanager):

```js
PrintManager.printBoard()           // Full operations board (landscape letter)
PrintManager.printNPCCard(npcId)    // Single NPC card (portrait, playing-card sized)
PrintManager.printLocation(locId)   // Single location page (portrait letter)
PrintManager.printInfoCard(infoId)  // Single information card — player-facing side
PrintManager.printAgentSheet(agentId) // Full agent dossier (portrait letter)
PrintManager.printCaseBrief()       // Case brief DA (portrait letter)
PrintManager.printRelicSheet()      // Relic sheet (portrait letter)
PrintManager.printOrgRef()          // Organization reference (portrait letter)
PrintManager.printSessionLog()      // Session log (portrait letter, paginated)
PrintManager.printHandout(imagePath) // Single handout image (fit to page)
```

### 9.2 Print CSS Strategy

The main stylesheet includes a comprehensive `@media print` block:

```css
@media print {
  /* Hide all UI chrome */
  #toolbar, #tab-nav, #quick-ref, #agent-roster,
  .modal-overlay, .toast-container, .sandbox-indicator,
  .shortcuts-hint, .tooltip { display: none !important; }

  /* Reset background */
  body { background: white; }

  /* Board-specific */
  .page {
    box-shadow: none;
    margin: 0;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* Remove interactivity indicators */
  .sq { cursor: default; }
  .quad { cursor: default; }
  [contenteditable] { outline: none !important; }

  /* Ensure stamps and watermarks print */
  .watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Board: landscape */
  @page board { size: letter landscape; }
  .page.board-print { page: board; }

  /* Cards: portrait */
  @page card { size: letter portrait; }
  .card-print { page: card; }
}
```

### 9.3 Print Workflows

**Printing the Board:**
1. DA clicks Print button in toolbar (or presses `P`).
2. Board renders in print-optimized mode:
   - All squares show current state (consumed, past, milestone triggered).
   - Organization metadata (name, Val, Active/Dormant) rendered as static text.
   - Legend and footer included.
   - "DA EYES ONLY" classification stamp included.
3. Browser print dialog opens, pre-configured to landscape letter.
4. Output: Physical operations board sheet matching the original template aesthetic.

**Printing NPC/Info Cards for Players:**
1. DA opens NPC card modal or info card modal.
2. Clicks "Print for Players" button within the modal.
3. Content renders as a clean card: player-facing side only (no DA secrets, no disposition, no notes).
4. Option: "Print 4 per page" (playing-card sized) or "Print full page".
5. Output: Physical cards to hand to players at the table.

**Printing Agent Sheets:**
1. DA opens agent sheet modal.
2. Clicks "Print Dossier" button.
3. Renders in the existing char-gen visual style (character sheet format).
4. Output: Physical agent dossier for the player.

### 9.4 Print-on-Demand Card Layout

For NPC and info cards printed at playing-card size:

```
┌─────────────────────────┐  ┌─────────────────────────┐
│  NPC CARD               │  │  NPC CARD               │
│  ┌───────────────────┐  │  │  ┌───────────────────┐  │
│  │                   │  │  │  │                   │  │
│  │    PORTRAIT       │  │  │  │    PORTRAIT       │  │
│  │                   │  │  │  │                   │  │
│  └───────────────────┘  │  │  └───────────────────┘  │
│  Name: Lucia Ferreyra   │  │  Name: Mateo Suarez     │
│  Role: Compact Liaison  │  │  Role: Homicide Det.    │
│  "She seems nervous..." │  │  "He knows more than..."│
└─────────────────────────┘  └─────────────────────────┘
┌─────────────────────────┐  ┌─────────────────────────┐
│  INFO CARD              │  │  INFO CARD              │
│  I1: Covenant Archive   │  │  I2: Church Custody     │
│  "The Spear was last    │  │  "The Church believes   │
│   documented in the     │  │   the Spear was moved   │
│   Vatican's Secret      │  │   during WWII to        │
│   Archives in 1943..."  │  │   Argentina..."         │
└─────────────────────────┘  └─────────────────────────┘
```

Layout: 2×2 grid per letter page, cut lines indicated by crop marks.

---

## 10. Implementation Phases

### Phase 0: Project Scaffolding

**Deliverables:**
- Create `docs/web-app-da-board/` directory
- Create `index.html` with embedded CSS (paper theme, CSS variables, base64 fonts, toolbar shell, tab nav shell, modal overlay shell)
- Create `app.js` with `NR` namespace and `init()` function
- Create `data.js` with empty `NR_DATA` object
- Create `css/` directory with split stylesheets (for development)
- Add build step to [`build.ps1`](../../build.ps1) for inlining

**Validation:** `index.html` opens in browser from `file://`, shows toolbar and "Operations Board" placeholder with paper texture background.

### Phase 1: Static Board Rendering (MVP Core)

**Deliverables:**
- `NR.StateManager` — state object, get/set, localStorage persistence, versioning
- `NR.BoardRenderer` — renders complete operations board grid from `CaseState` data
  - Day headers (14→1)
  - Shift row with 56 quadrants
  - Relic milestone annotation row
  - Organization rows (O1–O8) with name, Val, checkboxes, 14 squares each
  - Past squares (grayed), active squares (empty), milestone squares (labeled with red border)
  - Legend and footer
- `NR.CaseLoader` — load from JSON, validate schema, hydrate state
- Pre-converted JSON case file: "The Spear That Went Dark" in `data/`
- Toolbar: Logo, Load Case button, Save indicator

**Validation:** Board renders "Spear That Went Dark" with all 6 organizations, correct past squares (based on Val), milestone squares labeled (O1M1, O1M2, etc.), relic milestones in annotation row.

### Phase 2: Board Interactivity

**Deliverables:**
- `NR.ClockManager` — full implementation
  - Click shift quadrant → fill/unfill
  - Click org square → consume/unconsume
  - Auto-detect day completion
  - Auto-detect relic milestone triggers
  - Auto-detect org milestone triggers
- `NR.ModalManager` — overlay system
  - Open/close/stack modals
  - Focus trap
  - Escape-to-close
- `NR.SessionLogger` — auto-log all state changes
- Milestone detail modal (shows description, cross-advance execute buttons)
- Day timeline modal (click day header)
- Undo/redo (Ctrl+Z / Ctrl+Y)
- Toast notifications

**Validation:** Full interaction loop works: click shift quadrant → fills → if last of day, relic milestone pop-up opens. Click org square → consumes → if milestone, org milestone pop-up opens with execute buttons. Undo reverses both.

### Phase 3: Dice Roller

**Deliverables:**
- `NR.DiceRoller` — full YZE dice pool implementation
  - Attribute + skill + gear die selection
  - Animated roll display
  - Success counting with stunt points
  - Push mechanic with auto-Corruption increment
  - Gear degradation auto-detection
  - Artifact die integration
  - Stunt spending menu (general stunts available on any skill)
- Dice Roller modal UI
- Quick Roll toolbar dropdown (pre-configured per agent)
- Special rolls: d66 critical injury, d6 panic, Corruption burst (BR 1–5)

**Validation:** Configure roll for Ingrid (AGI 4 + Firearms 3 + Pistol 2 = 9 dice). Roll produces visual dice, counts successes. Push adds +1 Corruption, re-rolls non-6/non-gear dice. Gear 1 triggers degradation prompt.

### Phase 4: Agent Roster & Tracking

**Deliverables:**
- `NR.AgentTracker` — full implementation
  - Load agents from char-gen JSON export
  - Manual agent entry form
  - Agent roster side panel (collapsible right sidebar)
  - Per-agent: Corruption gauge, attribute damage bars, gear list, critical injuries, resource dice
  - Apply damage / healing
  - Broken state auto-detection
  - Corruption stage auto-detection and penalty application
  - Encumbrance calculation
- Agent sheet modal (full character sheet view)
- Import agent from char-gen (drag-and-drop JSON)

**Validation:** Import 3 agents from char-gen. Roster sidebar shows them. Click agent → full sheet modal. Apply 2 physical damage to STR → attribute bar shows damage, dice pool auto-reduces.

### Phase 5: Reference Modals (NPCs, Locations, Info Cards)

**Deliverables:**
- NPC card modal (full display + interactions)
- Location page modal
- Information card modal (DA side + player-facing flip)
- Relic sheet modal (with activation wizard)
- Case brief DA modal
- Organization reference modal
- Clickable references everywhere: `O#`, `L#`, `I#`, NPC names in any text auto-link to modals
- Discovery tracking: "Reveal to Players" marks info as discovered, "Unlock Location" marks location as accessible

**Validation:** Click an NPC name in a milestone description → NPC card modal opens. Click an I# reference in NPC card → info card modal opens (stacked). Flip info card to player side. Mark as discovered.

### Phase 6: Combat & Social Trackers

**Deliverables:**
- `NR.CombatTracker` — full implementation
  - Initiative card draw and sorting
  - Action economy tracking (slow/fast/free)
  - Zone movement
  - Cover toggle
  - Quick action buttons
  - Damage application
- `NR.SocialTracker` — full implementation
  - Disposition slider per NPC
  - Auto-difficulty calculation
  - Recovery from Closed checklist
  - Social roll integration with DiceRoller

**Validation:** Start combat with 3 agents and 4 NPCs. Draw initiative, sort, advance turns. Agent attacks (rolls in dice roller), damage applied to NPC. NPC moves zones. Cover toggled.

### Phase 7: Creative Features & Polish

**Deliverables:**
- **Countdown Pressure Meter:** Aggregate gauge showing overall board tension
- **Milestone Chain Visualizer:** Animated diagram showing cross-advance ripple effects
- **"What If" Sandbox Mode:** Toggle to experiment with board state, reset on exit
- **Information Web Map:** Graph visualization of I# ↔ L# ↔ NPC connections
- **"Read the Table" Prompt Generator:** Procedural scene-setting from board state
- **Audio Atmosphere:** Optional ambient sounds (toggle, no gameplay impact)
- **Keyboard shortcut overlay:** Press `?` to show full shortcut map
- **Print-on-Demand Cards:** Print NPC/info cards at playing-card size (2×2 per page)
- **Case File Import/Export:** Full JSON import/export with file picker
- **Case File Library:** Browse saved cases in localStorage, switch between them

**Validation:** Pressure meter updates as orgs escalate. Sandbox mode allows experimentation without committing. Info web map shows all entity connections. Print produces clean physical cards.

### Phase 8: Converter Tool

**Deliverables:**
- `converter/convert-case-file.html` — standalone converter page
  - Drag-and-drop HTML case files
  - DOMParser-based extraction
  - Manual correction UI
  - JSON export
- Documentation: how to convert existing case files
- Pre-converted JSON for all 4 existing case files (Spear, Barbarian's Cup, Cormsil Compact, Heavenly Crucifix)

### Phase 9: Testing, Accessibility Audit, Documentation

**Deliverables:**
- Cross-browser testing (Chrome, Firefox, Edge, Safari)
- Accessibility audit (keyboard navigation, screen reader, contrast, reduced motion)
- Performance profiling (large case files, long session logs)
- User documentation: `docs/web-app-da-board/README.md`
- DA quick-start guide
- Video walkthrough (optional)

### Phase Dependency Graph

```
Phase 0: Scaffolding
   │
   ▼
Phase 1: Static Board Rendering
   │
   ▼
Phase 2: Board Interactivity ─────────────────────┐
   │                                                │
   ├── Phase 3: Dice Roller ──────────────────────┤
   │                                                │
   ├── Phase 4: Agent Roster ─────────────────────┤
   │                                                │
   ├── Phase 5: Reference Modals ─────────────────┤
   │   (can start after Phase 2)                    │
   │                                                │
   ├── Phase 6: Combat & Social ──────────────────┤
   │   (depends on Phase 3 + Phase 4 + Phase 5)     │
   │                                                │
   └── Phase 7: Creative Features ────────────────┘
       (depends on Phase 2–6)                       │
                                                     │
   Phase 8: Converter Tool ◄────────────────────────┘
   (independent — can start anytime)

   Phase 9: Testing & Docs
   (depends on all phases)
```

---

## Appendix A: CSS Variable Reference

```css
:root {
  /* Core palette — matches existing templates */
  --ink:          #1a1a18;
  --ink-faded:    #4a4a42;
  --ink-light:    #8a8a7e;
  --paper:        #f0ead6;
  --green-stamp:  #2d5a27;
  --red-stamp:    #8b1a1a;
  --rule:         #999;
  --rule-light:   #ccc;
  --field-bg:     rgba(255,255,255,0.35);
  --font-main:    'Special Elite', 'Courier New', monospace;
  --font-fill:    'Courier Prime', 'Courier New', monospace;

  /* UI extensions — new variables for the web app */
  --ui-bg:        #2a2a28;
  --ui-text:      #d4d0c8;
  --ui-hover:     #4a4a44;
  --accent:       #3a6b35;
  --danger:       #8b1a1a;
  --warning:      #a68a1a;
  --success:      #3a6b35;

  /* Board-specific */
  --board-col-width: 1fr;
  --label-col-width: 1.65in;
  --org-row-height: 0.5in;
  --shift-row-height: 0.52in;
  --sq-size: 28px;

  /* Z-index layers */
  --z-board:      1;
  --z-sidebar:    10;
  --z-toolbar:    100;
  --z-modal-bg:   200;
  --z-modal:      300;
  --z-toast:      400;
  --z-tooltip:    500;
}
```

## Appendix B: Example Event Flow (Complex Chain)

```
Scenario: DA clicks Shift Quadrant Day 8, Evening
         → This is the 4th quadrant of Day 8
         → Day 8 has a Relic Milestone
         → Relic Milestone says "Advance O4 by 1"
         → O4 advancing hits O4M2
         → O4M2 says "Advance O3 by 1. Activate O7."
         → O3 advancing hits O3M3

Event Sequence:
1. User clicks .quad[data-day="8"][data-shift="E"]
2. BoardRenderer → ClockManager.fillShift(8, 'E')
3. StateManager.update({ shiftsFilled: [...existing, {day:8, shift:'E', filled:true}] })
4. ClockManager.checkDayCompletion(8) → true (all 4 filled)
5. ClockManager.checkRelicMilestones(8) → found: "Second pulse: radius expands to 5 miles"
6. ModalManager.open('milestoneDetail', {
     type: 'relic',
     day: 8,
     description: "Second pulse: radius expands to 5 miles",
     crossAdvances: [{ targetOrg: 'O4', squares: 1 }]
   })
7. DA clicks "Execute: Advance O4 by 1"
8. ClockManager.advanceOrg('O4')
   → O4's next active square is col 6 → consumed
   → ClockManager.checkOrgMilestone('O4', 6) → O4M2 fires!
9. ModalManager.open('milestoneDetail', {
     type: 'org',
     orgId: 'O4',
     label: 'O4M2',
     description: "Church leadership goes public...",
     crossAdvances: [
       { targetOrg: 'O3', squares: 1 },
       { targetOrg: 'O7', activate: true }
     ]
   })
10. Milestone Chain Visualizer shows:
    Day 8 Complete → Relic M2 → O4+1 → O4M2 → O3+1, O7 activate
11. DA clicks "Execute All"
12. ClockManager.advanceOrg('O3') → col 3 → O3M3 fires!
    ClockManager.activateDormantOrg('O7')
13. ModalManager.open('milestoneDetail', { orgId: 'O3', label: 'O3M3', ... })
14. StateManager.update() called for each mutation
15. BoardRenderer re-renders affected rows
16. SessionLogger logs entire chain
17. ToastNotifier: "Day 8 complete. Relic milestone: Second pulse. Chain: O4→O3→O7. 3 milestones fired."
```

---

*End of Architecture Document*
