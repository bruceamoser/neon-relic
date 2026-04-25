# Neon Relic — AI Copilot Instructions

## Project Overview

**Project Neon Relic** is a tabletop RPG (TTRPG) built on the **Year Zero Engine (YZE)** dice-pool variant. It is set in an alternate 1980s where occult artifacts threaten reality. Players are agents of **The Verdant Covenant**, a secret society that discovers, recovers, and contains supernatural artifacts.

This project is in the **core rules design phase**. There is no code yet — only game design documents and reference material.

## Designers

- **Bruce** — Lead designer and system architect
- **Stu** — Co-designer, worldbuilding and lore

## Key Files

| File | Role |
|---|---|
| `docs/neon-relic.adoc` | Master AsciiDoc document — includes all chapters to produce the full PDF. |
| `docs/chapters/*.adoc` | Individual chapter files. **The source of truth** for all game mechanics, lore, classes, equipment, and setting. Design changes go here. |
| `docs/chapters/15-case-file.adoc` | Case File system — shifts, Operations Board, Organizations, Locations, NPCs, Information Cards, packets, and HQ. |
| `docs/chapters/20-sample-case-file.adoc` | Complete worked example: *The Spear That Went Dark*. |
| `docs/case-file-instructions.adoc` | Step-by-step DA guide to building a case file from scratch. |
| `docs/design/*.md` | Design documents and issue trackers for the case file overhaul. Reference only. |
| `docs/references/*.md` | YZE reference material from Vaesen, MYZ, Forbidden Lands, etc. Read-only — do not modify. |
| `assets/*.html` | Printable HTML templates: Case File form, Case Brief, Operations Board, Organization Reference, Relic Sheet, Location Pages, NPC Cards, Information Cards. |

## Design Principles

When working on this project, follow these rules:

### 1. Core Rules Are Authoritative
- `docs/chapters/*.adoc` files are the canonical documents. If there's a conflict between stu-comments.md and the chapter files, the chapters win (unless Bruce explicitly says to use Stu's version).
- All mechanics, lore, classes, and setting details should be written into or read from the chapter files.

### 2. Year Zero Engine Consistency
- This game uses the **dice-pool variant** (d6 pools, success on 6), NOT the step-dice variant.
- Reference games for mechanical precedent: *Mutant: Year Zero*, *Forbidden Lands*, *Vaesen*, *Alien RPG*.
- The *Blade Runner RPG* and *Twilight: 2000* use step-dice — reference them for thematic inspiration only, not mechanics.
- When the `docs/` reference files are available, consult them for mechanical accuracy.

### 3. The Verdant Covenant Structure
The Covenant has **three Divisions**, each with internal sub-units (Wings, Paradigms, or Departments):

| # | Division | Notes |
|---|---|---|
| 1 | **Wayfinder** | Research and intelligence. Wings: Research, Counterintelligence. Has Verdant Codex. |
| 2 | **Recovery** | Field retrieval. Paradigms: Ex-Agency Operative, Heavy-Hitter, Acquisition Specialist. Has Verdant Satchel. |
| 3 | **The Keep** | Vault security, artifact custody, and logistics. Departments: Catalogers, Wardens, Internal CI, Stack (Logistics). Has Warden's Bracer. |

### 4. Signature Mechanic: Corruption
- **Corruption** = a single ascending number tracking cumulative psychic toll from occult exposure, pushing rolls, artifact activation, and supernatural exertion. Gained directly from its sources — there is no buffer, no cascade, and no intermediary resource.
- **Maximum Corruption Threshold** = `10 + Empathy score`. Exceeding it = permanent catatonia (character retirement).
- The economy is deliberately asymmetric: you gain Corruption faster than you heal it. The only way to stay safe is to make fewer desperate choices.
- This system is the game's unique selling point. Preserve the risk-reward tension in any mechanical changes.
- **Note:** An earlier design concept called "Resonance" (a volatile buffer that accumulated before converting to Corruption) was removed. The word "resonance" still appears in the Bestiary as creature ability and entity names (e.g., "Resonance Broadcast", "The Resonance Echo") — these are in-world supernatural phenomena, not a player-facing mechanic.

### 5. Tone and Setting
- **Late 1980s analog aesthetic** — no smartphones, no internet. Payphones, microfiche, VHS, HAM radios.
- **Occult investigation thriller** — monster-of-the-week mysteries anchored by base management.
- **Psychological horror** — the real threat is the artifacts themselves and the toll they exact on the human mind.
- Technology should feel tactile, error-prone, and atmospheric. Gear degradation is a feature, not a bug.

### 6. Document Formatting
- Use proper Markdown with a table of contents and `---` section dividers.
- Prefer tables for mechanical data (stats, talents, equipment, effects).
- Use blockquotes (`>`) for important callouts and design notes.
- Use italic for game title references (*Vaesen*, *Alien RPG*, etc.).
- Use bold for game terms on first use (**Corruption**, **Corruption Check**, **Broken**, etc.).

### 7. Incorporating Stu's Contributions
When Stu provides new content (via stu-comments.md or conversation):
1. Read the contribution carefully.
2. Identify where it fits in the core rules structure.
3. Merge it into the appropriate chapter in `docs/chapters/`.
4. Maintain mechanical consistency with existing YZE framework.
5. Preserve Stu's narrative voice and lore flavor where possible.

## Issue Workflow

When working through GitHub issues, follow this procedure **one issue at a time**:

### 1. Branch
- Create a branch from `main` named `issue/<number>-<short-description>` (e.g., `issue/705-gear-degradation`).
- Only one issue branch should be active at a time.

### 2. Assign
- Assign the issue to yourself.
- Mark the issue as an agent task (add the label or flag as appropriate).

### 3. Fix
- Read the issue description and all related issues referenced in it.
- Read the affected chapter files (`docs/chapters/*.adoc`) before making changes.
- Make the fix in the chapter files. Follow the Design Principles above — especially YZE consistency, Corruption economy preservation, and document formatting.
- For cross-chapter issues, update **every** chapter referenced in the issue. Do not leave dangling contradictions.
- Commit with a message in the format: `fix(#<number>): <short summary>`.

### 4. Pull Request
- Push the branch and create a PR targeting `main`.
- The PR description should reference the issue (`Closes #<number>`) and summarize what changed and why.
- Review the diff to confirm no unintended changes, no broken cross-references, and no new contradictions introduced.

### 5. Merge
- Merge the PR into `main` (squash merge preferred for clean history).
- Delete the issue branch after merge — both local and remote.
- Confirm `main` is clean: no uncommitted changes, no stale branches.

### 6. Next Issue
- Return to step 1 with the next issue.
- Respect dependency chains — resolve upstream issues before downstream ones. Key chains:
  1. **Gear degradation:** #705 → #451 → #529 → #531 → #588 → #602
  2. **Vehicle chases:** #706 → #589 → #591 → #593 → #678 → #680 → #681
  3. **Corruption economy:** #714 → #556 → #571 → #554 → #575 → #625 → #652
  4. **Fear checks:** #707 → #552 → #553 → #567 → #693
  5. **CL progression:** #715 → #581 → #594 → #650 → #672
  6. **Attribute recovery:** #713 → #532 → #564 → #626

## Workspace Context

This is a multi-repo workspace. The other repositories are **Foundry VTT system modules** for existing YZE games:

- `yearzero-combat-fvtt` — YZE combat module
- `twilight2000-foundry-vtt` — Twilight: 2000
- `vaesen-foundry-vtt` — Vaesen
- `blade-runner-foundry-vtt` — Blade Runner
- `morkborg-foundry-vtt` — Mörk Borg
- `mutant-year-zero` — Mutant: Year Zero

These repos serve as **code reference** for when Neon Relic eventually becomes a Foundry VTT module. Do not modify files in these repos when working on Neon Relic design.
