# Case File Overhaul — GitHub Issues Breakdown

This document lists every discrete issue needed to implement the case file overhaul.
Issues are grouped by category. Each issue should be small enough for a single PR.

---

## Category 1: Terminology — Rename "Front" to "Organization"

Every file containing the game-mechanic term "Front" (not the English word "front" in
unrelated context) needs updating. Each file is a separate issue.

### CH-TERM-01: Rename Front → Organization in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Replace all game-mechanic uses of "Front/Fronts" with "Organization/Organizations." Update section headers (e.g., "Fronts and Relic Timeline" → "Organizations"), table entries ("Risked Fronts" → "Risked Organizations"), and body text.
- **Lines affected:** ~15+ instances (lines 11, 36, 88, 165, 179, 188, 193, 197, 199, 207, 229, 327, 328, 356, 508, 537)
- **Exclude:** English word "front" in non-game-mechanic context (e.g., "in front of")

### CH-TERM-02: Rename Front → Organization in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Replace all game-mechanic uses. Update section headers ("Authoring Fronts" → "Authoring Organizations"), design rules ("Front Design Rule" → "Organization Design Rule"), and body text.
- **Lines affected:** ~20+ instances (lines 60, 69, 77, 83, 85, 87, 95, 114, 116, 147, 162, 223, 230, 231, 240, 357, 383, 391)

### CH-TERM-03: Rename Front → Organization in `20-sample-case-file.adoc`
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Replace "Active Fronts" → "Active Organizations," "Dormant Fronts" → "Dormant Organizations," "Risked Fronts" fields on all scene nodes, "Front Tracker" tables, and all body-text references.
- **Lines affected:** ~25+ instances (lines 4, 111, 137, 197, 320, 345, 370, 394, 418, 442, 464, 654, 661, 675, 678, 705, 708, 780, 800, 828, 872, 879, 913)

### CH-TERM-04: Rename Front → Organization in `17-rival-factions.adoc`
- **File:** `docs/chapters/17-rival-factions.adoc`
- **Scope:** Replace "fronts" → "organizations" in all game-mechanic context. Update section headers ("Using Factions as Fronts" → "Using Factions as Organizations"), table headers ("Compact Front Behavior" → "Compact Organization Behavior," etc.).
- **Lines affected:** ~12+ instances (lines 7, 11, 13, 37, 57, 77, 97, 111, 120)

### CH-TERM-05: Rename Front → Organization in `16-travel.adoc`
- **File:** `docs/chapters/16-travel.adoc`
- **Scope:** Replace game-mechanic "front" references.
- **Lines affected:** ~4 instances (lines 47, 76, 172, 201)

### CH-TERM-06: Rename Front → Organization in `21-glossary.adoc`
- **File:** `docs/chapters/21-glossary.adoc`
- **Scope:** Update the "Front" glossary entry to "Organization." Update all cross-references in other entries that mention fronts (Case File, DA, Relic Timeline entries).
- **Lines affected:** ~5 instances (lines 31, 50, 73, 133)

### CH-TERM-07: Rename Front → Organization in `12-headquarters.adoc`
- **File:** `docs/chapters/12-headquarters.adoc`
- **Scope:** Update game-mechanic reference to front/relic timeline.
- **Lines affected:** ~1 instance (line 27). Note: line 11 ("front" as cover business) and line 126 ("business fronts") are English usage, not game terms — leave them.

### CH-TERM-08: Rename Front → Organization in `11-artifacts.adoc`
- **File:** `docs/chapters/11-artifacts.adoc`
- **Scope:** Update "time-locked front" reference.
- **Lines affected:** ~1 instance (line 587)

### CH-TERM-09: Rename Front → Organization in `case-file-instructions.adoc`
- **File:** `docs/case-file-instructions.adoc`
- **Scope:** Update all references: "Front 1 / Front 2," "Create Your Fronts," "Active Fronts," "Dormant Fronts," and all body text.
- **Lines affected:** ~12+ instances (lines 56, 99, 101, 103, 108, 109, 113, 114, 118)

### CH-TERM-10: Rename Front → Organization in `case-file-form.html`
- **File:** `assets/case-file-form.html`
- **Scope:** Update CSS class names (`.front-block`, `.front-header`, `.front-name-field`, `.front-value-field`), section titles ("Active Fronts"), field labels ("Front Name"), and comments.
- **Lines affected:** ~20+ instances (lines 279, 280, 286, 290, 297, 684, 729, 734, 735, 737–762+)

### CH-TERM-11: Rename Front → Organization in `.github/copilot-instructions.md`
- **File:** `.github/copilot-instructions.md`
- **Scope:** Review and update any references to fronts in the copilot instructions. (May have no game-mechanic front references — verify.)

### CH-TERM-12: Verify terminology rename is complete
- **Task:** Run a workspace-wide search for the word "front" (case-insensitive) and verify every remaining instance is either English usage (not game-mechanic) or has been properly updated to "Organization."
- **Known English-usage exceptions to confirm (not rename):**
  - `18-notable-members.adoc` line 35: "Used the excavation of Troy as a front to extract…" (cover/disguise, not game mechanic)
  - `12-headquarters.adoc` lines 11, 126: "front" as cover business (English usage)
  - Any instance of "confrontation," "in front of," or similar in `08-corruption-fear-healing.adoc`
- **Acceptance criteria:** No game-mechanic uses of "Front" remain in any `.adoc`, `.html`, or `.md` file. Every remaining instance is documented as intentional English usage.

---

## Category 2: Operations Board — Replace Shift Timeline, Relic Timeline, and Front Tracking

### CH-OPS-01: Rewrite shift timeline section in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Replace the "Shift Timeline" section with the new Operations Board description. 14-column countdown (14→1, days until catastrophe), phases row with quartered cells for Morning/Day/Evening/Night, relic milestones keyed to phase numbers.
- **Replaces:** Current "The Shift Timeline" section and "Timeline Handout Guidance" section.

### CH-OPS-02: Rewrite fronts/relic timeline section in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Replace "Fronts and Relic Timeline" section with the new Organization Rows description. O#M# shorthand, countdown rows with Active checkbox, milestone-driven cross-links, dormant organization handling.
- **Replaces:** Current "Fronts and Relic Timeline" section (including separate Fronts and Relic Timeline subsections).

### CH-OPS-03: Merge relic timeline into phases row in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Remove the relic timeline as a separate concept. Relic escalation milestones are phase-keyed events on the phases row. Update the "Case Board Anatomy" table to reflect this.

### CH-OPS-04: Update shift procedure in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Update Step 5 of the shift procedure ("Advance consequences") to reference the Operations Board: "Advance any organization rows triggered by time passage, loud action, or missed opportunities. Check the phases row for relic milestones crossed this shift."

### CH-OPS-05: Rewrite relic timeline authoring guidance in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Replace "Authoring the Relic Timeline" section. Relic milestones are now keyed to phase numbers on the Operations Board phases row, not tracked as a separate countdown.

### CH-OPS-06: Rewrite front authoring guidance in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Replace "Authoring Fronts" section with "Authoring Organizations." O#M# labeling, cross-link instructions in milestone text, Active checkbox for dormant orgs.

### CH-OPS-07: Update Operations Board section in `20-sample-case-file.adoc`
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Rewrite the "Case Board" section. Convert separate Relic Timeline and Active/Dormant Fronts into the new Operations Board format: phases row with relic milestones, organization countdown rows with O#M# labels.

### CH-OPS-08: Update relic timeline glossary entry in `21-glossary.adoc`
- **File:** `docs/chapters/21-glossary.adoc`
- **Scope:** Update the "Relic Timeline" entry to reflect merge into the phases row. Update "Case File" entry to reference Operations Board instead of separate shift timeline + fronts + relic timeline.

### CH-OPS-09: Update travel chapter references in `16-travel.adoc`
- **File:** `docs/chapters/16-travel.adoc`
- **Scope:** Update references to "front or relic-timeline" to refer to the Operations Board organizations and phases row. Also update "scene node" vocabulary: line 170 ("a later crisis node") and line 180 ("a later node, or the crisis branch") should use Location-based language instead of node-based language.
- **Lines affected:** ~7 instances (lines 47, 76, 99, 170, 172, 180, 201)

### CH-OPS-10: Update `case-file-instructions.adoc` for Operations Board
- **File:** `docs/case-file-instructions.adoc`
- **Scope:** Rewrite Steps 4 ("Build the Relic Timeline") and 5 ("Create Your Fronts") into the new Operations Board authoring flow.

### CH-OPS-11: Update "Player-Facing Signs vs. DA Tracking" section in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Update lines 240–253: "The DA may track fronts and relic timeline numerically" → update to reference Operations Board organizations and phases row. Terminology rename plus conceptual alignment with the Operations Board as the single tracking surface.

### CH-OPS-12: Verify Operations Board changes are consistent
- **Task:** Read all updated files and verify: (a) no references to standalone "Relic Timeline" tracking remain, (b) no references to standalone "Shift Timeline" handout remain, (c) all cross-references point to the Operations Board concept, (d) no references to separate "front tracking" or "relic timeline tracking" survive — all tracking references point to the Operations Board.

---

## Category 3: Scene Entity Model — Replace Scene Nodes with Locations/NPCs/Information

### CH-ENT-01: Replace scene node schema in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Remove the "Scene Data Schema" section (7-field schema: Availability, Purpose, Key Activity, Time Cost, Risked Fronts, May Reveal, May Unlock). Replace with the new entity model description: Locations (primary form), NPC Cards, Information Cards. Define all fields per entity type.

### CH-ENT-02: Add Location entity definition to `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** New section defining Location fields: name, description, availability (with keyword taxonomy: open, clue-locked, contact-locked, time-locked, packet-locked), NPCs present, information available, organizations present, positive/negative results, milestone changes.

### CH-ENT-03: Add NPC Card entity definition to `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** New section defining NPC Card fields: name, organization affiliation (O#), secret, goal, artifact connection, starting knowledge (I# refs), gained knowledge (milestone-driven), locations, positive/negative results.

### CH-ENT-04: Add Information Card entity definition to `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** New section defining Information Card fields: ID (I#), content, found-at (L# refs), known-by (NPC refs), HQ fallback (phase number), type (containment truth vs. supporting intel). Include note about double-sided design (player front / DA back).

### CH-ENT-05: Add HQ safety valve rule to `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** New subsection explaining the HQ fallback mechanism: every Information entry can have "Available from HQ at Phase X." This structurally prevents dead ends. Cost is time (shifts consumed).

### CH-ENT-06: Replace scene authoring guidance in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Replace "Authoring Scene Networks" section (lines 138–165) with new entity authoring guidance: how to write Locations, NPC Cards, and Information Cards as independent entities with cross-links. Include guidance on milestone-driven state changes. Also update two adjacent sections that reference scene-node vocabulary:
  - **"Keeping the Board Manageable"** (lines 218–234): references "inactive scene nodes," "2–4 active scene options." Rewrite for the Location/NPC/Information model (e.g., "2–4 accessible locations").
  - **"Running Containment Missions"** (line 359): "seed three discoverable facts into the scene network" → rewrite for entity model (seed facts across Locations, NPC Cards, and Information Cards).

### CH-ENT-07: Update NPC motivation section in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Align "NPC Motivation Design" section with the new NPC Card schema. Add fields for starting knowledge, gained knowledge, positive/negative results. Keep Secret/Goal/Artifact Connection.

### CH-ENT-08: Update scene resolution bundle in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Review "Scene Resolution Bundle" section (lines 125–190). Steps 1-5 describe play procedure and mostly survive, but specific vocabulary changes are required:
  - **Step 2** (line 137): "DA States the Key Activity" — decide whether Key Activity survives as a concept or is replaced by the Location form's positive/negative result framing. If it survives, clarify it now comes from the Location page, not a "scene node."
  - **Step 4** (line 167): "worsen a front" → "worsen an organization."
  - **Step 5** "Breach" band (line 188): "A front or relic timeline worsens" → "An organization row or relic milestone worsens."
  - Ensure the bundle references the Location/NPC/Information model (DA has a location page with NPC and Information cards alongside).

### CH-ENT-09: Rewrite `case-file-instructions.adoc` scene authoring steps
- **File:** `docs/case-file-instructions.adoc`
- **Scope:** Replace Step 6 ("Design Scene Nodes") with entity authoring: write Locations, write NPC Cards, write Information Cards, cross-link them.

### CH-ENT-10: Fold "Contact" into NPC Card model
- **Files:** `docs/chapters/15-case-file.adoc`, `docs/chapters/14-gm-guidance.adoc`, `docs/chapters/21-glossary.adoc`
- **Scope:** The current Case Board Anatomy table in `15-case-file.adoc` (line 34) defines "Contact" as a standalone case-board element. In the new model, contacts fold into NPC Cards (NPCs carry organization affiliation, access-granting role, and knowledge). Remove "Contact" as a separate row from the Case Board Anatomy table. Update `14-gm-guidance.adoc` line 60 ("scenes, contacts, fronts, a relic timeline") to reference the new entity model. Update the "Contact" glossary entry in `21-glossary.adoc` (line 33) to redirect to NPC Cards or merge the concept.

### CH-ENT-11: Update glossary entries for entity model
- **File:** `docs/chapters/21-glossary.adoc`
- **Scope:** Rewrite or update the following glossary entries to reflect the new entity model:
  - **"Scene"** (line 142): Remove "node-based" language. Redefine as an emergent intersection of Location, NPC, and Information entities.
  - **"Key Activity"** (line 103): If the concept survives (see CH-ENT-08), update to reference Location pages instead of "scene metadata." If retired, remove the entry.
  - **"Contact"** (line 33): Fold into NPC Card reference or remove as standalone entry (see CH-ENT-10).
  - **"Case File"** (line 31): Update from "shifts, scenes, contacts, fronts, a relic timeline" to "shifts, locations, NPCs, information, organizations, an operations board."
  - **"Director of Agents"** (line 50): Update "tracks fronts and relic timelines" to "tracks the Operations Board."
  - **"Containment Truth"** (line 34): Verify still accurate (likely no change needed).

### CH-ENT-12: Verify scene node references are fully removed
- **Task:** Search for "scene node," "scene data schema," "Key Activity," "May Reveal," "May Unlock," "Risked Fronts," "scene network," and "crisis node" across all files. Verify all are either removed or updated to the new entity model. Also verify the "Contact" concept no longer appears as a standalone case-board element distinct from NPC Cards.

---

## Category 4: Solvability Rules Update

### CH-SOL-01: Update solvability rules in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Replace "3 paths per truth" hard rule with: "Every Containment Truth must be available from at least two field sources (any combination of Locations and NPCs) plus an HQ fallback." Remove the mandatory 3-path requirement.

### CH-SOL-02: Update solvability constraints in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Update "Solvability Constraints" section. Replace the "three paths" rule. Update the Dead End Test to reference the new entity model and HQ fallback. Keep the spirit: cases must survive misses.

### CH-SOL-03: Update solvability checklist in `case-file-instructions.adoc`
- **File:** `docs/case-file-instructions.adoc`
- **Scope:** Update the solvability guidance to reference the new minimum: 2 field sources + HQ fallback per Containment Truth.

### CH-SOL-04: Verify no "three paths" references remain
- **Task:** Search for "three paths," "three different paths," "at least three," "3 paths" across all files. Verify all solvability references use the new standard.

---

## Category 5: Document Package Structure

### CH-PKG-01: Define case file package in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Add a new section describing the complete case file package: Case File (player brief), Case Brief (DA), Operations Board, Organization Reference, Relic Sheet, Location Pages, NPC Cards, Information Cards.

### CH-PKG-02: Update `case-file-instructions.adoc` to describe package
- **File:** `docs/case-file-instructions.adoc`
- **Scope:** Update the authoring workflow to produce the new document package instead of the old VC-12 form.

### CH-PKG-03: Add pre-made faction dossier concept to `17-rival-factions.adoc`
- **File:** `docs/chapters/17-rival-factions.adoc`
- **Scope:** Add guidance that each faction section can serve as a reusable Organization Reference template. DAs customize with case-specific milestones. Link to Organization Reference sheet concept.

### CH-PKG-04: Verify document package structure is complete
- **Task:** Verify that all 8 document types from the agreed package (Case File brief, Case Brief, Operations Board, Organization Reference, Relic Sheet, Location Pages, NPC Cards, Information Cards) are described in `15-case-file.adoc`, referenced in `case-file-instructions.adoc`, and have corresponding HTML templates in `assets/`. Verify the pre-made faction dossier concept is linked from `17-rival-factions.adoc`.

---

## Category 6: Quick Case Build Generator Update

### CH-GEN-01: Update Quick Case Build procedure in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Rewrite the "Quick Case Build (15-Minute Prep Guide)" to output the new entity format: Locations, NPC Cards, Information Cards, and Operations Board setup instead of scene nodes and fronts.

### CH-GEN-02: Review generator tables and worked example for compatibility
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Review d66 Artifact Type, d6 Inciting Incident, d6 Location, d6 Complication, d6 Named Threat tables. These may need minimal changes (they generate story seeds, not structure). Verify output language matches new terminology (Organization, not Front; Location, not Scene). Also verify the **worked example** ("The Holbrook Frequency," lines 520–540) uses new terminology: "Relic Timeline" → phase milestones on the Operations Board, "Front" → Organization, "scene" references → Location-based language.

### CH-GEN-03: Verify generator output matches new structure
- **Task:** Walk through the Quick Case Build procedure end-to-end using the worked example. Verify: (a) each step produces output compatible with the new document package, (b) the worked example uses correct terminology throughout, (c) the procedure references Operations Board setup instead of separate front/relic-timeline authoring.

---

## Category 7: Sample Case File Rewrite

### CH-SAMPLE-01: Convert sample case board to Operations Board format
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Convert the Relic Timeline + Active Fronts + Dormant Fronts sections into a single Operations Board specification. Phases row with Lance milestones, Organization rows with O#M# labels.

### CH-SAMPLE-02: Convert sample scene nodes to Location entities
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Rewrite all scene nodes (Estate Aftermath, Police Station, Church Archive, Currency Exchange, Illicit Clinic, Port/Export Route, Hidden Shrine) as Location entities with the new field schema.

### CH-SAMPLE-03: Create sample NPC Cards
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Convert the Key NPCs section into NPC Card format. Add starting knowledge, gained knowledge (milestone-driven), positive/negative results, and location references for each NPC.

### CH-SAMPLE-04: Create sample Information Cards
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Extract all discoverable information from the current scene nodes and Critical Revelations. Create discrete Information Card entries with I# IDs, cross-linked to Locations and NPCs, with HQ fallbacks.

### CH-SAMPLE-05: Update sample DA tracking worksheets
- **File:** `docs/chapters/20-sample-case-file.adoc`
- **Scope:** Replace the Active Front Tracker and Dormant Front Tracker tables with Operations Board reference. Update the shift-by-shift DA checklist to reference the new Operations Board procedure.

### CH-SAMPLE-06: Update standalone case file materials
- **Directory:** `docs/case-files/spear-that-went-dark/`
- **Scope:** These files are image-generation prompts, not structured data. Review each prompt to ensure visual and textual content aligns with the new entity model:
  - **Location prompts** (`location-1` through `location-7`): Verify prompt text doesn't reference old scene-node fields ("Purpose," "Key Activity," "Risked Fronts"). If prompts describe structured content that appears in the generated image, update field names to match new Location schema.
  - **NPC prompts** (`npc-1` through `npc-8`): Verify no old terminology appears in visible text areas of the prompt.
  - **Relic prompt** (`relic-spear-of-destiny.md`): Add containment truth checklist if the generated image should display it.
  - **README.md**: Update to describe the new document package structure and file purposes.

### CH-SAMPLE-07: Verify sample case is internally consistent
- **Task:** Read the fully converted sample case end-to-end. Verify: (a) every Information Card has at least 2 field sources + HQ fallback, (b) every NPC Card references valid Location IDs, (c) every Organization milestone uses valid O#M# labels, (d) Operations Board phases row milestones match the Relic Sheet, (e) all cross-references resolve.

---

## Category 8: Form and Asset Redesign

### CH-FORM-01: Redesign `case-file-form.html` — Operations Board
- **File:** `assets/case-file-form.html`
- **Scope:** Replace the existing Relic Timeline and Fronts pages with the new Operations Board layout: 14-column grid, phases row with quartered cells, organization countdown rows with Active checkbox.

### CH-FORM-02: Redesign `case-file-form.html` — remove scene node sections
- **File:** `assets/case-file-form.html`
- **Scope:** Remove any scene node sections from the form. The old form may have scene-related fields that no longer apply.

### CH-FORM-03: Create Location Page template (HTML)
- **File:** `assets/location-page.html` (new file)
- **Scope:** Printable one-page location template with all agreed fields: name, description, availability, NPCs present, information available, organizations present, positive/negative results, milestone changes.

### CH-FORM-04: Create NPC Card template (HTML)
- **File:** `assets/npc-card.html` (new file)
- **Scope:** Playing-card-sized printable NPC card with all agreed fields.

### CH-FORM-05: Create Information Card template (HTML)
- **File:** `assets/information-card.html` (new file)
- **Scope:** Playing-card-sized printable double-sided information card. Front: player-facing content. Back: DA reference (sources, HQ fallback, type).

### CH-FORM-06: Create Relic Sheet template (HTML)
- **File:** `assets/relic-sheet.html` (new file)
- **Scope:** One-page printable relic sheet with all fields: tier, category, effects, activation, fracture, containment profile, containment truth checklist, phase-keyed relic milestones.

### CH-FORM-07: Create Case Brief template (HTML)
- **File:** `assets/case-brief.html` (new file)
- **Scope:** DA-only one-page case brief: mystery statement, real situation summary, agent objectives, case-specific notes.

### CH-FORM-08: Create Organization Reference template (HTML)
- **File:** `assets/organization-reference.html` (new file)
- **Scope:** Single-sheet printable organization reference: all organizations listed with O#M# milestone descriptions, cross-link instructions, Active/Dormant status.

### CH-FORM-09: Update starter-kit case file form
- **File:** `starter-kit/case-file-form-blank.html`
- **Scope:** Apply same redesign as CH-FORM-01/02 to the starter kit version, or replace with the new document package templates.

### CH-FORM-10: Verify all HTML templates render and print correctly
- **Task:** Open all new and updated HTML templates in a browser. Verify print layout, page breaks, card sizing, and visual consistency with the existing Neon Relic design language.

---

## Category 9: Cross-References and Consistency

### CH-XREF-01: Update cross-references in `15-case-file.adoc`
- **File:** `docs/chapters/15-case-file.adoc`
- **Scope:** Update the "Cross-References" section at the bottom. Remove references to DA guidance for "fronts, relic timelines, and scene networks." Replace with references to Operations Board, Organizations, and entity authoring.

### CH-XREF-02: Update cross-references in `14-gm-guidance.adoc`
- **File:** `docs/chapters/14-gm-guidance.adoc`
- **Scope:** Update the "Cross-References" section. Update internal references to scene schema, front tracking, etc.

### CH-XREF-03: Update `08-corruption-fear-healing.adoc` if needed
- **File:** `docs/chapters/08-corruption-fear-healing.adoc`
- **Scope:** Verify no game-mechanic "front" references exist. (Current matches are English usage — "confrontation," "in front of." Likely no changes needed, but verify.)

### CH-XREF-04: Update `neon-relic.adoc` master document if needed
- **File:** `docs/neon-relic.adoc`
- **Scope:** Verify chapter includes and part structure are unaffected by the changes. No content changes expected, but confirm.

### CH-XREF-05: Update copilot instructions
- **File:** `.github/copilot-instructions.md`
- **Scope:** Review and update any references to case file structure, fronts, scene nodes, or relic timeline to match the new system.

### CH-XREF-06: Final consistency audit
- **Task:** Full read-through of all chapters that reference the case file system (11, 12, 14, 15, 16, 17, 20, 21, case-file-instructions). Verify all terminology, cross-references, and mechanical descriptions are internally consistent with the new design.

---

## Summary

| Category | Issues | Verification Tasks |
|---|---|---|
| 1. Terminology (Front → Organization) | 11 | 1 |
| 2. Operations Board | 11 | 1 |
| 3. Scene Entity Model | 11 | 1 |
| 4. Solvability Rules | 3 | 1 |
| 5. Document Package Structure | 3 | 1 |
| 6. Quick Case Build Generator | 2 | 1 |
| 7. Sample Case File Rewrite | 6 | 1 |
| 8. Form and Asset Redesign | 9 | 1 |
| 9. Cross-References and Consistency | 5 | 1 |
| **Total** | **61** | **9** |

### Recommended Execution Order

1. **Category 1 (Terminology)** — do first, mechanical find-replace, unblocks everything else
2. **Category 2 (Operations Board)** — core structural change to rules
3. **Category 3 (Scene Entity Model)** — second structural change
4. **Category 4 (Solvability)** — small, depends on entity model
5. **Category 5 (Document Package)** — describes the new output format
6. **Category 6 (Generator Tables)** — small, depends on terminology + entity model
7. **Category 7 (Sample Case)** — large, depends on all above
8. **Category 8 (Forms/Assets)** — can run in parallel with Category 7
9. **Category 9 (Cross-References)** — final cleanup pass
