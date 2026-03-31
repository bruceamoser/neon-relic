# Case File Overhaul — Scene Entity Model

**Status:** Agreed

## Core Concept

Scenes are not pre-authored event nodes. They are **emergent intersections** of three independent entity types:

- **Locations** — where things can happen
- **NPCs** — who can be encountered
- **Information** — what can be learned

The DA authors three entity lists and cross-links them. A "scene" emerges when players go to a location and the DA assembles the relevant NPC cards and Information cards for that point in the case.

## Entity Definitions

### Locations (Primary — the dominant form)

The DA has a **location form** in front of them. It is the entry point for every scene.

| Field | Description |
|---|---|
| **Name** | Location name |
| **Description** | What the agents see when they arrive |
| **Availability** | Open, clue-locked, contact-locked, time-locked, or packet-locked (keyword + detail) |
| **NPCs Present** | Which NPCs are here, driven by milestone state |
| **Information Available** | Information IDs discoverable here |
| **Organizations Present** | Which organizations have interest or presence (O# shorthand) |
| **Positive Result** | What the agents gain from a successful engagement → Information IDs |
| **Negative Result** | What happens if the scene goes badly → organization advances, tails, closures |
| **Milestone Changes** | How this location changes when specific organization milestones are reached (e.g., "When O4M2: Suárez pulled off case. When O4M3: station locked down.") |

### NPCs (Playing-card-sized reference cards)

| Field | Description |
|---|---|
| **Name** | NPC name |
| **Organization** | Affiliated organization (O# shorthand), faction, or independent |
| **Secret** | What they're hiding |
| **Goal** | What they're actively trying to accomplish during this case |
| **Artifact Connection** | How they encountered the artifact and what effect proximity has had |
| **Starting Knowledge** | Information IDs they know at case start |
| **Gained Knowledge** | Information they learn at specific organization milestones (e.g., "At O2M2: knows Compact handler name") |
| **Locations** | Where they can be found |
| **Positive Result** | What they share if approached well → Information IDs |
| **Negative Result** | What happens if the encounter goes badly → organization advance, tail, witness spooked |

### Information (Playing-card-sized reference cards)

| Field | Description |
|---|---|
| **ID** | Shorthand identifier (I1, I2, etc.) |
| **Content** | What the agents learn |
| **Found At** | Location IDs where this can be discovered |
| **Known By** | NPC IDs who possess this knowledge |
| **HQ Fallback** | Available from HQ at Phase X (safety valve) |
| **Type** | Containment Truth or supporting intel |

## Key Design Decisions

### Location is dominant

The DA's cognitive loop is: *"Where are the players going? What's there?"* Location is always the entry point. NPC cards and Information cards are pulled out and placed alongside the location form — like a hand of cards dealt per scene.

### Positive and negative results on both Locations and NPCs

Every interaction has pre-authored consequences:
- **Positive:** Information gained, contacts made, routes opened
- **Negative:** Organizations advanced, tails placed, witnesses spooked, routes closed

The DA doesn't improvise consequences — they read the card.

### Milestone-driven state changes (not per-phase timelines)

Entity state changes are tied to **organization milestones on the Operations Board**, not independent phase numbers. The DA only updates NPC/location state when they cross out a milestone square — which is when they're already reading milestone text.

This avoids a second layer of timeline tracking per card and keeps the Operations Board as the single source of truth for "what changed."

### HQ as universal safety valve

Every Information entry can have a "Available from HQ at Phase X" tag. If players miss it in the field, they can request it — but it costs shifts. This structurally prevents dead ends without requiring a hard "3 paths per truth" authoring rule.

### NPCs carry knowledge independently

NPCs can have information from before the case starts (a cop's knowledge from the crime scene) or gain it at milestones (an operative's ongoing investigation). Their knowledge state is part of their card, not part of a scene node.

## Physical / Digital Format

- **Location:** Full form or page (the primary document)
- **NPC:** Playing-card-sized reference card
- **Information:** Playing-card-sized reference card
- At the table: DA has the location form out, with relevant NPC and Information cards alongside

## Replaces

- The 7-field Scene Data Schema (Availability, Purpose, Key Activity, Time Cost, Risked Organizations, May Reveal, May Unlock)
- The proposed Hook / Pressure / Payoff triad
- Scene Node concept entirely — replaced by entity intersections

## Still To Discuss

- Prep minimums (Containment Truths count, path count) — likely simplified by HQ fallback
- Organization/NPC merge question — resolved (NPCs carry organization affiliation on their cards; systemic organizations like Media don't require a forced anchor NPC)
- Form VC-12 redesign to match new entity model
- Quick Case Build generator table updates
- Sample case file rewrite
