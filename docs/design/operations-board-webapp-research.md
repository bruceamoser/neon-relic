# Operations Board Web App — Foundation Research

**Status:** Research Complete  
**Date:** 2025-06-21  
**Purpose:** Informs architecture and implementation of a static web app that uses the Operations Board as the primary game-running UI for the Director of Agents (DA / Game Master).

---

## 1. Operations Board Anatomy

### 1.1 Physical Layout

The Operations Board is a single landscape-oriented sheet (11″ × 8.5″) organized as a grid with **14 columns** and multiple rows. All columns count down left to right: **14 → 1**. Column 14 is the first day of the case; Column 1 is the catastrophe endpoint.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER: "Operations Board" | Neon Relic — The Verdant Covenant | DA EYES ONLY │
│         Case ID: _______________                                               │
├──────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┤
│ Days │ 14  │ 13  │ 12  │ 11  │ 10  │  9  │  8  │  7  │  6  │  5  │  4  │  3  │  2  │  1  │
│ Until│     │     │     │     │     │     │     │     │     │     │     │     │     │ CATA│
│ Cat. │     │     │     │     │     │     │     │     │     │     │     │     │     │STRO │
├──────┼─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┤
│Shifts│ M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D   M│D  │
│      │ E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N   E│N  │
├──────┼─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┤
│Relic │     │     │     │D.11 │     │     │ D.8 │     │     │ D.5 │     │     │ D.2 │ D.1 │
│Mile- │     │     │     │     │     │     │     │     │     │     │     │     │     │     │
│stones│     │     │     │     │     │     │     │     │     │     │     │     │     │     │
├──────┼─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┤
│ SEP  │                                                                             │
├──────┼─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┤
│  O1  │past │past │past │past │past │  □  │  □  │O1M1│  □  │  □  │O1M2│  □  │  □  │O1M3│
│ Val:9│     │     │     │     │     │     │     │     │     │     │     │     │     │     │
├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  O2  │past │past │past │past │past │past │past │past │  □  │O2M1│  □  │O2M2│  □  │O2M3│
│ Val:6│     │     │     │     │     │     │     │     │     │     │     │     │     │     │
├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  O3  │past │past │past │past │  □  │  □  │O3M1│  □  │O3M2│  □  │  □  │O3M3│  □  │  □  │
│ Val:10│    │     │     │     │     │     │     │     │     │     │     │     │     │     │
├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │
├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ LEGEND│ ■ Pre-filled (past) │ □ Active square │ O#M# Org milestone │ M/D/E/N Shifts │
└──────┴──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Zones / Sections

| Zone | Rows | Data Held |
|------|------|-----------|
| **Header** | Top strip | Case ID, "DA EYES ONLY" classification, form reference (VC-19) |
| **Day Header** | Row 0 (thead) | 14 day numbers (14→1), column 1 highlighted as "Catastrophe" |
| **Shift Row** | Row 1 | 14 columns × 4 quadrants each (M/D/E/N = Morning/Day/Evening/Night). 56 total shift cells. Filled left-to-right as time passes. |
| **Relic Milestones** | Row 2 | Annotation row keyed to specific day numbers. Descriptions live in the Case Brief. Fires when the last quadrant of a milestone day is filled. |
| **Separator** | Row 3 | Visual break between clock zone and organization zone |
| **Organization Rows** | Rows 4–11 (O1–O8) | Up to 8 organizations. Each has: name field, Val(ue) number field, Active checkbox, Dormant checkbox, 14 countdown squares. |
| **Legend** | Below grid | Decodes symbols: pre-filled squares, active squares, milestone shorthand, shift abbreviations |
| **Footer** | Bottom strip | Form reference, copyright, case name |

### 1.3 Organization Row Anatomy

Each organization row contains:

| Element | Purpose |
|---------|---------|
| **O# label** | Fixed identifier (O1, O2… O8) |
| **Name field** | Editable text — organization name |
| **Val field** | Numeric starting value (1–14). Determines how many squares are pre-filled as "past." |
| **Active checkbox** | Checked = organization is exerting pressure |
| **Dormant checkbox** | Checked = organization is on the board but inert until activated by a milestone trigger |
| **14 squares** | Visual countdown. Squares left of the starting value are marked "past" (pre-filled). Each escalation crosses out the next square moving toward column 1. |
| **Milestone squares** | Specific squares marked with O#M# labels (e.g., O1M1, O1M2) and styled with a red bottom border. When the DA crosses out a milestone square, they read the corresponding milestone description from the Organization Reference sheet and execute its instructions. |

### 1.4 Square States

| CSS Class | Meaning | Visual |
|-----------|---------|--------|
| `sq` | Active countdown square — not yet reached | Empty bordered cell |
| `sq.past` | Pre-filled — starting value already consumed | Gray/low-opacity fill |
| `sq.ms` | Milestone square — triggers when crossed out | Labeled with O#M# via `data-ms` attribute, red bottom border |

### 1.5 Visual Design Language

- **Paper texture:** CSS `::before` with repeating linear gradient + radial gradient overlays
- **Paper grain:** CSS `::after` with radial-gradient dot pattern (3px × 3px)
- **Watermark:** Large rotated "COVENANT" text at 2.5% opacity
- **Perforation strip:** Dashed border strip with ○ characters
- **Color palette:** `--ink: #1a1a18`, `--paper: #f0ead6`, `--red-stamp: #8b1a1a`, `--green-stamp: #2d5a27`
- **Fonts:** SpecialElite (labels/headings), CourierPrime (fillable fields) — embedded as base64 in standalone templates
- **Borders:** 1.5px solid gray for grid lines, 3px red for header borders, 2px red for catastrophe column

---

## 2. Game Mechanic Integration Points

Every mechanic the DA needs at their fingertips during play, organized by rules subsystem.

### 2.1 Core Resolution (Chapter 3)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Dice Pool** | Attribute dice (white d6s, 1–5), Skill dice (green d6s, 0–5), Gear dice (black d6s, 0–3) | One-click dice roller per agent, pre-configured to the agent's stat block |
| **Success Counting** | Each 6 = 1 success. Difficulty 1–5+. Extra 6s = Stunt Points | Auto-count successes, highlight extra successes, show available stunts |
| **Push Mechanic** | Re-roll non-6 dice. Cost: +1 Corruption. Gear dice are locked (never re-rolled). Gear 1s = degradation | Push button that auto-increments Corruption, locks gear dice, re-rolls attribute+skill |
| **Gear Degradation** | Gear die showing 1 on initial roll = Gear Bonus −1. At 0 = Broken | Visual gear condition tracker; auto-apply degradation on 1s |
| **Stunt Points** | Must be spent immediately. Generic stunts (Faster, Quieter, Precise, Aid) + skill-specific stunts | Pop-up stunt menu showing available stunts by skill; deduct from total |

### 2.2 Attributes & Skills (Chapter 4)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **4 Attributes** | Strength, Agility, Wits, Empathy (2–5 each). Serve as both dice pools AND health pools | Live attribute displays with damage overlays |
| **13 Skills** | Force, Brawl, Endure, Sneak, Deft Hands, Firearms, Investigate, Tech, Lore, Heal, Manipulate, Command, Psychoanalyze (0–5) | Quick-reference skill table with descriptions |
| **Skill Stunts** | 3 stunts per skill plus 5 generic stunts, each with cost (1–2 SP) | Contextual stunt suggestions after every roll |
| **Division Key Skill** | One skill per division capped at 4 at creation, 5 during play | Highlight agent-specific key skills |
| **Attribute as Health** | Damage reduces attributes directly. STR=0 or AGI=0 → Physical Broken. WIT=0 or EMP=0 → Mental Broken | Damage trackers on each attribute; auto-detect Broken state |

### 2.3 Combat (Chapter 5)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Initiative Cards** | Draw from standard deck (Ace–10). Higher acts first. Aces low. Reshuffle each round | Digital card draw with sortable initiative tracker |
| **Action Economy** | 1 Slow Action + 1 Fast Action + any Free Actions per turn | Turn action checklist with available actions highlighted |
| **Slow Actions** | Attack, First Aid, Reload, Use Artifact, Activate Talent, Manipulate NPC, Help Ally, Barricade, Treat Broken Ally | Action menu filtered by character capabilities |
| **Fast Actions** | Move 1 zone, Draw/holster weapon, Take cover (+2 AR), Stand up, Grab item, Dodge, Use quick item | Quick-access action bar |
| **Zones & Range** | Abstract zones (Engaged, Short, Long). Move 1 zone = 1 Fast Action. Move 2 zones = whole turn | Zone map with drag-to-move |
| **Cover** | +2 Armor Rating when taking cover | One-click cover toggle |
| **Ammo Die** | Resource die (d12→d10→d8→d6→d4→Depleted) for firearms | Integrated ammo tracker with step-down button |
| **Full Auto** | Two attack rolls, two Ammo Die rolls | Auto-prompt for second roll |

### 2.4 Social Conflict (Chapter 6)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **NPC Disposition** | 5-point track: 5=Open, 4=Cautious, 3=Guarded, 2=Hostile, 1=Closed | Per-NPC disposition slider on each NPC card |
| **Disposition Shifts** | +1 for successful Psychoanalyze/Manipulate, reveals, services. −1 for failed rolls, detected deception, threats | Click +/- buttons; auto-adjust social roll difficulty |
| **Disposition Thresholds** | At 3+: truth to low-risk questions. At 2: roll required for basics. At 1: social rolls impossible | Color-coded thresholds; disable social roll button at Disposition 1 |
| **Recovery from Closed** | Non-roll actions: reveal info, show evidence, remove threat, make concession, allow time | Checklist of recovery options displayed when Disposition=1 |

### 2.5 Health, Damage & Armor (Chapter 7)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Damage Types** | Physical → STR or AGI. Mental → WIT or EMP. Corruption → Corruption track | Damage application pop-up with type selector |
| **Broken State** | Any attribute at 0 = incapacitated. No actions, no movement, can speak briefly | Auto-detect and flag; prompt for Critical Injury roll |
| **Critical Injuries** | d66 table (11–66). Lethal injuries trigger Death Checks. Various penalties | Digital d66 roller; auto-apply penalties to relevant attributes/skills |
| **Death Check** | Single d6. Death on specific results depending on injury | One-click Death Check with result lookup |
| **Armor Rating** | Reduces physical damage. Concealed Kevlar (3), Tactical Riot (6, −2 AGI) | Armor tracker; auto-subtract from incoming physical damage |
| **Healing** | Heal skill restores attributes. First Aid Kit, Trauma Kit. Recovery times vary by injury | Healing action with kit bonus auto-applied |

### 2.6 Corruption & Healing (Chapter 8)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Corruption Track** | 0–15+. Max Threshold = 10 + Empathy. Exceed = catatonia | Visual corruption track with threshold marker; stage effects displayed |
| **Corruption Stages** | 1–3 Nosebleeds, 4–6 Hallucinations, 7–9 Tremors (−1 Deft Hands/Firearms), 10–12 Reality Distortion, 13–14 Fugue States, 15–17 Collapse of Self, >Threshold Catatonic | Auto-apply stage penalties; display stage description |
| **Push Cost** | Every push = +1 Corruption | Auto-increment on push |
| **Talent Cost** | Most talents = +1 Corruption | Auto-increment on talent activation |
| **Corruption Burst** | Roll Wits only. 1s = +1 Corruption. Fail = +Burst Rating Corruption + Panic Table | Burst check roller with BR selector |
| **Panic Table** | d6: 1=Fight, 2=Flight, 3=Freeze, 4=Denial, 5=Compulsion, 6=Fugue | Auto-roll and display result |
| **Healing Corruption** | Anchor Scene (1d4), Safe Scene (1), Full Rest (Empathy). Session cap: 5 | One-click healing buttons with cap tracking |

### 2.7 Equipment (Chapter 10)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Gear Items** | Name, Gear Bonus, Encumbrance, Clearance Level, Special Traits | Searchable/filterable equipment catalog |
| **Weapons** | Gear Bonus, Damage, Type, Range, Special Traits, CL | Weapon quick-reference; add to agent sheet |
| **Armor** | Rating, Encumbrance, Special, CL | Armor quick-reference |
| **Resource Dice** | d12→d10→d8→d6→d4→Depleted. Ammo, Medical, Battery, Rations | Per-resource die tracker with step-down button |
| **Encumbrance** | Capacity = STR × 2. Encumbered: −1 STR/AGI. Overloaded (>STR×3): cannot move | Auto-calculate from gear list; warn on encumbrance |
| **Clearance Level** | CL 1–5. Determines requisition access | Filter equipment by agent's CL |

### 2.8 Artifacts (Chapter 11)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Artifact Die** | d20→d12→d10→d8→d6→d4→Fractured. Degrades on roll of 1 | Artifact die tracker with step-down |
| **Activation Procedure** | Meet condition → Declare → Pay Corruption (tier-based: +1/+2/+3) → Effect resolves → Roll Artifact Die | Step-by-step activation wizard |
| **Containment Truths** | Trigger, Appetite, Quiescence — three truths per artifact | Checklist tied to the Relic Sheet |
| **Containment Profile** | Full handling/transport requirements | Reference panel accessible from the board |
| **Fracture Table** | Catastrophic effects when Artifact Die steps below d4 | Fracture reference; auto-prompt when die reaches d4 |
| **Corruption Cost by Tier** | Tier 1: +1, Tier 2: +2, Tier 3: +3 | Auto-add to Corruption track on activation |
| **Emissions** | Aura (passive), Pulse (scheduled), Burst (triggered) | Emission tracker with Corruption radius |

### 2.9 Operations Board Mechanics (Chapter 15)

| Mechanic | What to Track | Integration Opportunity |
|----------|---------------|------------------------|
| **Shift Tracking** | 56 shifts (14 days × 4 quadrants). Fill left→right | Click to fill shift quadrants; auto-detect relic milestone triggers |
| **Relic Milestones** | Keyed to specific days. Fire when last quadrant of that day fills | Auto-alert when milestone day completes; pop up milestone description |
| **Organization Escalation** | Cross out next square moving toward column 1 | Click to escalate; auto-check if milestone square crossed |
| **Cross-Links** | Milestone text contains instructions: "Advance O3 by 1 square" | Auto-execute cross-advances; highlight affected organizations |
| **Dormant Activation** | Inert rows activate when milestone text says so | One-click "Activate" button on dormant rows |
| **Shift Procedure** | 6 steps: Set Scene → Choose Undertaking → Resolve Action → Resolve Consequences → Fill Shift Quadrant → Check Milestones | Step-by-step shift wizard |

---

## 3. Interactive Feature Opportunities

### 3.1 Shift Row Interactions

| Click Target | What Happens |
|-------------|--------------|
| **Empty shift quadrant (M/D/E/N)** | Fills the quadrant (adds `filled` class). If it's the last quadrant of the day, checks relic milestones and pops up any that fire. Advances the visual "current day" indicator. |
| **Filled shift quadrant** | Un-fills it (undo). Confirms with dialog if milestones would be un-triggered. |
| **Day number header** | Jumps to that day's section in a scrollable timeline view. Shows what happened on that day, which organizations escalated, what information was discovered. |
| **"Day 1" catastrophe column** | Opens catastrophe description from the Case Brief. Shows worst-case outcome details. |
| **Relic Milestone annotation cell** | Opens the Case Brief section for that milestone. Shows: what happens, what the agents perceive, mechanical consequences. |

### 3.2 Organization Row Interactions

| Click Target | What Happens |
|-------------|--------------|
| **Organization name field** | Editable text (click to type). Auto-saves to session/localStorage. |
| **Val (Value) field** | Click to edit numeric value. Changing it recalculates which squares are "past." |
| **Active/Dormant checkboxes** | Toggle between states. Dormant → Active triggers activation condition check. |
| **Empty countdown square** | Crosses it out (marks as consumed). Advances the organization. Checks if the square is a milestone. |
| **Milestone square (O#M#)** | Pops up the milestone description from the Organization Reference. Shows cross-link instructions. Offers one-click "Execute" buttons for each instruction (advance other orgs, fill extra shift quadrant, activate dormant org). |
| **Past square** | Un-escalates (undo). Confirms with dialog. |
| **Entire row (right-click / long-press)** | Opens organization detail panel: full milestone list, activation conditions, linked effects, player-facing signs, associated NPCs. |

### 3.3 Overlay / Pop-Up Ideas

| Overlay | Trigger | Content |
|---------|---------|---------|
| **Dice Roller** | Toolbar button or hotkey (R) | Configured per agent. Attribute + Skill + Gear selectors. Roll button → animated dice display. Push button (with Corruption warning). Stunt point spend menu. |
| **NPC Card** | Click on NPC name anywhere in the app | Full NPC card: portrait, organization, secret, goal, artifact connection, knowledge (starting + gained), locations, engagement results. Disposition slider. |
| **Location Page** | Click on location reference (L#) | Full location form: description, availability, NPCs present, information available, organizations, positive/negative results, milestone changes. |
| **Information Card** | Click on information reference (I#) | Player-facing front (what agents learn). DA-facing back (sources, HQ fallback, type). "Reveal to Players" button. |
| **Relic Sheet** | Toolbar button | Full artifact profile: tier, category, activation, effects, fracture, containment profile, containment truth checklist. |
| **Case Brief** | Toolbar button | DA-only anchor document: mystery statement, real situation, agent objectives, containment truths summary, key actors, resolution/endgame, relic milestones, DA notes. |
| **Organization Reference** | Toolbar button or click org row header | All organizations with full milestone descriptions and cross-link instructions. |
| **Agent Roster** | Side panel | Quick view of all agents: current Corruption, damage status, equipment, talents. Click agent name to open full character sheet. |
| **Rules Reference** | Toolbar button or hotkey (?) | Searchable rules compendium: core resolution, combat, social, health, corruption, equipment tables, stunts list, panic table, burst ratings. |
| **Session Log** | Auto-generated | Timeline of every shift, roll, milestone trigger, and organization escalation. Searchable, exportable. |

### 3.4 Creative / "Outside the Box" Ideas

| Idea | Description |
|------|-------------|
| **"DA Screen" Mode** | A single fullscreen view that combines: mini operations board (always visible), collapsible side panels (agent roster, rules reference, case brief), and a "quick action" dock (dice roller, NPC lookup, location lookup). Everything accessible without tab-switching. |
| **Milestone Chain Visualizer** | When a milestone fires with cross-link instructions, animate the affected organizations with a pulse/highlight and show the causal chain ("O2M2 → O3 +2, O1 +1"). This helps the DA understand ripple effects at a glance. |
| **Countdown Pressure Meter** | A visual "doomsday clock" widget that aggregates all organization progress into a single tension indicator. The more squares consumed across all rows, the more intense the visual (color shift from green → yellow → red, subtle background pulse animation). |
| **"What If" Sandbox** | Toggle a mode where clicking doesn't commit changes. The DA can experiment with "what if the agents go to the church instead of the police station?" and see how the board state would evolve, then reset. |
| **Shift Cost Calculator** | When agents plan a multi-step action, the DA can drag activities onto a timeline to see how many shifts they'll consume and which milestones will fire before they finish. |
| **Information Web Map** | A graph visualization showing how Information Cards (I#) connect to Locations (L#) and NPCs. Color-coded by discovery status. The DA sees at a glance what paths remain open. |
| **Audio Atmosphere** | Optional toggle for ambient sound (rain, radio static, distant traffic) tied to time-of-shift (morning birds, evening traffic, night silence). Pure atmosphere, no gameplay impact. |
| **"Read the Table" Prompt Generator** | A button that generates a procedural scene-setting sentence from the current board state: "The morning paper leads with [O6 milestone detail]. Detective [NPC name] has [O3 milestone consequence]. Two men in dark suits are [O1 milestone consequence]." |
| **Print-on-Demand Cards** | The DA can select an NPC or Information Card and print just that card (playing-card sized) to hand to players physically, preserving the hybrid digital/tabletop experience. |
| **Case File Import/Export** | Save/load entire case file packages as JSON. Share case files between DAs. The web app becomes a case file player/editor, not just a tracker. |

---

## 4. Data Model

### 4.1 Core Entities

```typescript
// ─── CASE STATE ───
interface CaseState {
  caseId: string;                    // e.g., "VC-AR-87-041"
  caseName: string;                  // e.g., "The Spear That Went Dark"
  region: string;                    // e.g., "Buenos Aires, Argentina"
  
  // Board state
  currentDay: number;                // 1–14, which day column is "now"
  shiftsFilled: ShiftQuadrant[];     // Which quadrants are filled
  
  // Organizations (up to 8)
  organizations: Organization[];
  
  // Discovery tracking
  discoveredInfo: string[];          // I# IDs that players have found
  revealedNPCs: string[];            // NPC IDs the players know about
  unlockedLocations: string[];       // L# IDs that are accessible
  
  // Session tracking
  sessionLog: LogEntry[];
}

interface ShiftQuadrant {
  day: number;                       // 1–14
  shift: 'M' | 'D' | 'E' | 'N';     // Morning, Day, Evening, Night
  filled: boolean;
  undertaking?: string;              // What the agents did this shift
}

interface Organization {
  id: string;                        // O1–O8
  name: string;
  value: number;                     // 1–14, starting countdown value
  active: boolean;
  dormant: boolean;
  activationCondition?: string;      // What triggers dormant→active
  currentSquare: number;             // Which column is the current active square
  milestones: Milestone[];
  linkedEffects: string;             // Description of cross-advance behavior
  playerSigns: string;               // What players perceive as this org escalates
}

interface Milestone {
  day: number;                       // Which day column (14→1)
  label: string;                     // e.g., "O1M1"
  description: string;               // What happens; includes cross-link instructions
  crossAdvances?: CrossAdvance[];    // Parsed from description
}

interface CrossAdvance {
  targetOrg: string;                 // O# to advance
  squares: number;                   // How many squares
}

// ─── CASE FILE DOCUMENTS ───
interface CaseBrief {
  mysteryStatement: string;
  realSituation: string;
  primaryObjective: string;
  secondaryObjective: string;
  containmentTruthsSummary: {
    trigger: string;
    appetite: string;
    quiescence: string;
  };
  keyActors: string;
  bestCase: string;
  worstCase: string;
  relicMilestones: RelicMilestone[];
  daNotes: string;
}

interface RelicMilestone {
  day: number;
  description: string;
}

interface RelicSheet {
  name: string;
  tier: number;                      // 1–3
  category: string;
  riskTag: string;                   // e.g., "Catastrophic"
  corruptionCost: number;            // +1/+2/+3
  artifactDie: string;               // d4–d20
  emissionType: string;
  mundaneAppearance: string;
  surfaceRead: string;
  operationalRead: string;
  coldArchiveRead: string;
  activationCondition: string;
  mechanicalEffect: string;
  fracture: string;
  containmentProfile: string;
  containmentTruthChecklist: ContainmentTruth[];
}

interface ContainmentTruth {
  id: string;                        // I# reference
  type: 'trigger' | 'appetite' | 'quiescence' | 'effect' | 'proximity' | 'missing';
  description: string;
  discovered: boolean;
}

interface Location {
  id: string;                        // L#
  name: string;
  description: string;
  availability: AvailabilityType;
  availabilityCondition: string;
  npcsPresent: string;               // NPC references with milestone conditions
  infoAvailable: string[];           // I# references
  organizationsPresent: string[];    // O# references
  positiveResult: string;
  negativeResult: string;
  milestoneChanges: string;
  image?: string;                    // Path to location image
}

type AvailabilityType = 'open' | 'clue-locked' | 'contact-locked' | 'time-locked' | 'packet-locked';

interface NPCCard {
  id: string;
  name: string;
  organization: string;              // O# or "Independent"
  secret: string;
  goal: string;
  artifactConnection: string;
  startingKnowledge: string[];       // I# references
  gainedKnowledge: GainedKnowledge[];
  locations: string[];               // L# references
  positiveResult: string;
  negativeResult: string;
  disposition: number;               // 1–5, for social conflict
  image?: string;                    // Path to portrait
}

interface GainedKnowledge {
  trigger: string;                   // e.g., "At O4M2"
  info: string[];                    // I# references
}

interface InformationCard {
  id: string;                        // I#
  content: string;                   // What agents learn (player-facing)
  type: 'containment-truth' | 'supporting-intel';
  foundAt: string[];                 // L# references
  knownBy: string[];                 // NPC references
  hqFallback: string;                // Day number or "—"
  daNotes: string;                   // DA-facing context
  revealed: boolean;                 // Has this been given to players?
}

// ─── AGENT STATE ───
interface AgentState {
  id: string;
  name: string;
  division: string;
  subUnit: string;
  attributes: {
    strength: number;                // 2–5
    agility: number;                 // 2–5
    wits: number;                    // 2–5
    empathy: number;                 // 2–5
  };
  attributeDamage: {
    strength: number;
    agility: number;
    wits: number;
    empathy: number;
  };
  skills: Record<string, number>;    // skillKey → 0–5
  corruption: number;                // 0–15+
  armorRating: number;
  talents: Talent[];
  gear: GearItem[];
  resourceDice: Record<string, string>; // resourceName → die size
  criticalInjuries: CriticalInjury[];
}

interface Talent {
  name: string;
  effect: string;
  cost: string;                      // "+1 Corruption", "—", "— (Healing)"
  source: 'division' | 'subunit' | 'general' | 'background';
}

interface GearItem {
  name: string;
  bonus: string;
  enc: string;
  cl?: number;
}

interface CriticalInjury {
  roll: string;                      // e.g., "41–42"
  name: string;
  effect: string;
  lethal: boolean;
  healing: string;
}

// ─── SESSION LOG ───
interface LogEntry {
  timestamp: string;                 // ISO 8601
  type: 'shift' | 'roll' | 'milestone' | 'escalation' | 'discovery' | 'note';
  description: string;
  data?: Record<string, any>;
}
```

### 4.2 Persistent State Strategy

| Storage Layer | What | Rationale |
|---------------|------|-----------|
| **sessionStorage** | Current case state (board, discoveries, agent statuses) | Survives page refreshes during a session. Lost on tab close — appropriate for "one session at a time" play. |
| **localStorage** | Case file library (saved/imported cases), agent roster, preferences | Persists across sessions. Build a library of prepared cases. |
| **JSON file export** | Full case state + all entities | Shareable between DAs. Backup. Version control friendly. |
| **Print CSS** | Any view can be printed as a physical reference | Hybrid digital/tabletop experience. |

### 4.3 State That Changes During Play

| State | Trigger | Frequency |
|-------|---------|-----------|
| Shift quadrants filled | DA clicks quadrant | Every shift (many times per session) |
| Organization squares consumed | DA clicks square OR cross-advance from milestone | Several times per session |
| Organization active/dormant | Milestone trigger | 1–3 times per case |
| Information revealed | Agents discover it | 5–15 times per case |
| NPC disposition | Social interaction outcomes | Many times per session |
| Agent Corruption | Pushes, talent use, exposure | Many times per session |
| Agent attribute damage | Combat, hazards | Several times per session |
| Agent gear degradation | Gear 1s on rolls | Several times per session |
| Resource dice stepped down | Scene expenditure | Several times per session |
| Critical injuries | Broken state triggered | 0–5 times per case |

---

## 5. Technical Requirements

### 5.1 Constraints from Existing Templates

| Constraint | Implication for Web App |
|------------|------------------------|
| **Self-contained HTML** | The app should be a single `index.html` with inline CSS and JS (or minimal external files). No npm, no bundler, no framework. Follows the established pattern. |
| **Base64-embedded fonts** | SpecialElite and CourierPrime must be embedded as base64 data URIs in the `<style>` block. Google Fonts CDN links are acceptable for development but base64 is required for offline/standalone use. The existing char-gen app uses Google Fonts CDN (`fonts.googleapis.com`) — this is a valid pattern. |
| **No JS framework** | Vanilla JavaScript only. The existing `app.js` uses a revealing module pattern (`const NR = (function() { ... })())` with `DOMContentLoaded` init. Follow this convention. |
| **`form-tools.js` patterns** | Checkbox/pip toggling via `classList.toggle('filled')`. `contentEditable="true"` on form fields. Print CSS strips editing UI. |
| **Paper texture CSS** | The multilayered `::before`/`::after` pseudo-elements for paper grain, watermark, and perforation strip must be preserved. These are the visual identity of Neon Relic documents. |
| **Color variables** | Must use the established CSS custom properties: `--ink`, `--paper`, `--red-stamp`, `--green-stamp`, `--rule`, `--field-bg`, `--font-main`, `--font-fill`. |
| **Print support** | `@media print` must hide toolbars, modals, and editing chrome. Sheet views must print cleanly. `@page { size: letter landscape; }` for the operations board. |

### 5.2 Opportunities (Not Constraints)

| Opportunity | Rationale |
|-------------|-----------|
| **Single-page app with tabs** | The char-gen app uses `#tab-nav` with `data-tab` buttons and `.tab-panel` divs. This pattern works well for the operations board app: tabs for Board, Case Brief, Locations, NPCs, Info Cards, Dice, Rules. |
| **Modal overlays** | The char-gen app uses `.modal-overlay` + `.modal` for pickers and detail views. Same pattern for NPC cards, location pages, milestone details. |
| **sessionStorage auto-save** | The char-gen app saves on every `input` and `blur` event. The operations board should save on every state change (quadrant fill, organization escalation, etc.). |
| **Toast notifications** | Non-blocking feedback for actions (milestone fired, organization advanced, save confirmed). Already implemented in char-gen. |
| **JSON import/export** | Save/load entire case files. The char-gen app has this for individual agents. Extend to full case packages. |
| **Dice roller with push** | Already implemented in char-gen. Extend with stunt point tracking, gear degradation auto-detection. |
| **Responsive CSS** | The char-gen app has comprehensive responsive breakpoints (900px, 480px). The operations board is landscape — needs special handling for smaller screens (horizontal scroll, zoom controls). |

### 5.3 Architecture Recommendation

Follow the existing char-gen app pattern:

```
operations-board-app/
├── index.html          # Single HTML file with embedded CSS + JS
│   ├── <style>         # All CSS (paper texture, grid layout, modals, print)
│   ├── #toolbar        # Sticky top bar: logo, save/load, print, dice roller toggle
│   ├── #tab-nav        # Tab navigation: Board | Case Brief | Locations | NPCs | Info | Dice | Rules
│   ├── #content        # Tab panels
│   │   ├── #tab-board       # The interactive operations board (primary view)
│   │   ├── #tab-brief       # Case Brief (DA reference)
│   │   ├── #tab-locations   # Location page browser
│   │   ├── #tab-npcs        # NPC card browser
│   │   ├── #tab-info        # Information card browser
│   │   ├── #tab-dice        # Dice roller
│   │   └── #tab-rules       # Quick rules reference
│   ├── #modal-overlay  # Reusable modal for detail views
│   └── <script>        # All application logic (vanilla JS, revealing module pattern)
└── (no other files required — self-contained)
```

**Key architectural decisions:**

1. **The Board tab IS the app.** It's the default view and the DA's primary screen. All other tabs are reference.
2. **Overlays, not page navigation.** Clicking an NPC name, location reference, or information ID opens a modal overlay ON TOP of the board. The DA never leaves the board.
3. **State lives in a single `CaseState` object** in `sessionStorage`, with JSON import/export for persistence across sessions.
4. **The board is rendered from data, not hand-coded HTML.** The grid is generated by JS based on the case state. This allows any case file to be loaded into the same app.

---

## 6. UI/UX Recommendations

### 6.1 The Single-Screen DA Philosophy

The Operations Board web app should follow the same design philosophy as the physical board: **one surface, everything visible, no tab-switching during play.** The DA's cognitive loop is:

1. Where are the players going? → Look at the board
2. Who's there? → Click location → NPC cards pop up
3. What do they learn? → Click information references → info cards pop up
4. What changed? → Click organization squares → milestones fire
5. How much time did that cost? → Click shift quadrant

This loop must require zero context-switching.

### 6.2 Layout Recommendation

```
┌────────────────────────────────────────────────────────────────────┐
│ TOOLBAR: [☢ Neon Relic] [Save] [Load] [Print] [Dice] [Rules] [⚙] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────┐  ┌─────────┐│
│  │                                                  │  │ AGENT   ││
│  │              OPERATIONS BOARD                    │  │ ROSTER  ││
│  │              (interactive grid)                  │  │         ││
│  │                                                  │  │ Agent 1 ││
│  │  [14][13][12]...[1]  ← day columns              │  │ ☠ 3/13  ││
│  │  [M│D][M│D]...[M│D]  ← shift quadrants          │  │ STR 3/4 ││
│  │  [E│N][E│N]...[E│N]                              │  │ ⚔ Inj..││
│  │  ─────────────────────                           │  │         ││
│  │  O1 Name [Val] [✓] [ ] [■][■][■][□][M][□]...    │  │ Agent 2 ││
│  │  O2 Name [Val] [✓] [ ] [■][■][□][□][□]...       │  │ ☠ 7/12  ││
│  │  ...                                              │  │         ││
│  │                                                  │  │ [+Add]  ││
│  └──────────────────────────────────────────────────┘  └─────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ QUICK REFERENCE BAR: [Case Brief] [Relic Sheet] [Org Ref]   │  │
│  │ [Last Roll: 3 successes | Push Available]                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 6.3 Key UX Principles

| Principle | Implementation |
|-----------|---------------|
| **Everything is a click away** | Hovering over O#, L#, I#, or NPC references shows a tooltip. Clicking opens a modal overlay with full details. |
| **The board is always visible** | Overlays are translucent or positioned to not fully obscure the board. The DA can see board state while reading NPC details. |
| **Actions are undoable** | Every click (quadrant fill, organization escalation, milestone execution) can be undone with a second click. Confirmation dialogs for cascading changes. |
| **State changes are animated** | Squares fill with a subtle animation. Organization rows pulse when cross-advanced. Milestone triggers have a distinct visual alert. |
| **Color communicates pressure** | The catastrophe column (Day 1) is always red. Squares close to being consumed shift from neutral to warm tones. The overall board gets visually "hotter" as more squares are consumed. |
| **DA notes are first-class** | Every entity (organization, location, NPC, information card) has a free-text notes field. The board has a session notes panel. Notes are saved with the case state. |
| **Keyboard shortcuts** | R = dice roller, S = save, F = search entities, 1-8 = jump to organization O1-O8, →/← = navigate days, Space = fill current shift quadrant |
| **Mobile/tablet aware** | The board is inherently landscape. On portrait screens, show a scrollable/zoomable board with a floating quick-action bar. The char-gen responsive pattern (breakpoints at 900px and 480px) should be adapted. |

### 6.4 The "Don't Make Me Think" DA Experience

The most important UX metric: **can the DA run a combat scene, a social encounter, and a milestone trigger without looking away from the board?**

| Scenario | Current (Physical) | Target (Digital) |
|----------|-------------------|------------------|
| Agent shoots a cultist | DA looks up agent's Firearms + Agility, finds weapon bonus, rolls physical dice, counts 6s, checks for gear 1s, applies damage | DA clicks agent name → dice roller pre-filled with agent's stats → one click roll → auto-counts successes, auto-checks gear degradation, auto-applies damage to target |
| Agent interrogates NPC | DA checks NPC disposition, sets difficulty, rolls Manipulate, adjusts disposition | DA clicks NPC name → sees current disposition → clicks social roll → auto-adjusts difficulty based on disposition → roll → +/- disposition buttons |
| Organization milestone fires | DA crosses out square, reads Organization Reference sheet, finds cross-link instructions, manually advances other orgs | DA clicks milestone square → pop-up shows description with "Execute" buttons → clicks "Advance O3 by 1" → O3 square automatically consumed |
| Shift passes | DA fills quadrant, checks if it's the last of the day, checks if any relic milestones fire, describes scene change | DA clicks quadrant → auto-detects day completion, auto-checks milestones, pops up any that fire, shows "Scene Setting" prompt for that day |
| Agent pushes a roll | DA reminds player of +1 Corruption, re-rolls non-6 non-gear dice | DA clicks "Push" → auto-adds +1 Corruption to agent, auto-re-rolls correct dice, shows new result |

---

## 7. Summary of Findings

### 7.1 What the Operations Board Is

The Operations Board is a **14-column × multi-row grid** that serves as the single source of truth for a Neon Relic case. It tracks:

- **Time:** 14 days × 4 shifts = 56 time units, counting down to catastrophe
- **Relic escalation:** Milestones fire on specific days
- **Organization pressure:** Up to 8 external factions, each with their own countdown toward crisis
- **Cross-link ripple effects:** Milestones trigger advances on other organizations

It is designed to be the DA's primary instrument — everything else (Locations, NPCs, Information Cards) is reference material consulted when the board indicates something has changed.

### 7.2 What the DA Needs at Their Fingertips

1. **Dice roller** pre-configured per agent (attributes, skills, gear)
2. **Corruption tracker** per agent (current value, threshold, stage effects)
3. **NPC disposition** tracker per NPC (1–5 scale)
4. **Equipment reference** (weapons, armor, gear bonuses, CL requirements)
5. **Combat quick reference** (actions, zones, cover, damage types)
6. **Critical injury tables** (d66 physical, mental)
7. **Panic table** (d6)
8. **Corruption burst** procedure (BR 1–5)
9. **Artifact activation** procedure (meet condition → pay Corruption → effect → roll Artifact Die)
10. **Healing** options (Anchor Scene, Safe Scene, Full Rest, talents)

### 7.3 What Makes the Board Interactive

Every cell on the board is a click target. The core interaction loop is:

1. **Click a shift quadrant** → fill it → auto-check for day completion and relic milestones
2. **Click an organization square** → consume it → auto-check for milestone triggers → execute cross-advances
3. **Click a milestone label** → open milestone description → offer one-click execution of instructions
4. **Click any reference (O#, L#, I#, NPC name)** → open detail overlay without leaving the board

### 7.4 Technical Foundation

The web app should be:

- **Self-contained** (single HTML file, embedded CSS/JS, base64 fonts) — matching the existing template pattern
- **Vanilla JavaScript** (no frameworks) — matching the char-gen app's module pattern
- **sessionStorage-backed** (auto-save) — matching the char-gen app's persistence strategy
- **Print-friendly** (CSS `@media print` hides UI chrome) — matching the existing template print styles
- **Data-driven** (board rendered from JSON state) — enabling case file import/export and sharing

### 7.5 Next Steps (Architecture Phase)

This research document should directly inform:

1. **Technology choice confirmation:** Vanilla JS SPA, single HTML file, sessionStorage, no build tools
2. **Component tree design:** Toolbar, TabNav, Board (ShiftRow, RelicMilestoneRow, OrgRows), SidePanel (AgentRoster), ModalOverlay, DiceRoller, QuickRef
3. **State management design:** Single `CaseState` object, event-driven updates, auto-save on mutation
4. **Data format specification:** JSON schema for case file packages (boards, locations, NPCs, information cards, relic sheets)
5. **First feature prioritization:** Interactive board grid → milestone pop-ups → dice roller → agent roster → case brief overlay → NPC/location modals
