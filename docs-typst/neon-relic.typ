// ============================================================
// NEON RELIC — Core Rules (Typst Master Document)
// ============================================================
// This is the root entry point. It imports the theme, component
// library, and all 20 chapter files.
//
// Build: ./build.ps1
// Or:    typst compile docs-typst/neon-relic.typ docs-typst/output/neon-relic.pdf
// ============================================================

// Theme & components (defined in INFRA-2 and INFRA-3)
#import "lib/theme.typ": *
#import "lib/components.typ": *

// ── Document metadata ───────────────────────────────────────
#set document(
  title: "Neon Relic — Core Rules",
  author: ("Bruce Amoser", "Stu"),
  keywords: ("TTRPG", "Year Zero Engine", "occult", "1980s"),
)

// ── Page setup (placeholder — full config in INFRA-2) ───────
#set page(
  paper: "us-letter",
  margin: (top: 22mm, bottom: 24mm, inside: 24mm, outside: 20mm),
)

#set text(font: "Courier New", size: 10pt)

// ── Chapters ────────────────────────────────────────────────
// Uncomment each chapter as it is converted (Phase 2 work).

// #include "chapters/01-introduction.typ"
// #include "chapters/02-character-creation.typ"
// #include "chapters/03-core-resolution.typ"
// #include "chapters/04-attributes-skills.typ"
// #include "chapters/05-combat.typ"
// #include "chapters/06-social-conflict.typ"
// #include "chapters/07-health-damage-armor.typ"
// #include "chapters/08-corruption-fear-healing.typ"
// #include "chapters/09-divisions.typ"
// #include "chapters/10-equipment.typ"
// #include "chapters/11-artifacts.typ"
// #include "chapters/12-headquarters.typ"
// #include "chapters/13-advancement.typ"
// #include "chapters/14-gm-guidance.typ"
// #include "chapters/15-case-file.typ"
// #include "chapters/16-travel.typ"
// #include "chapters/17-rival-factions.typ"
// #include "chapters/18-notable-members.typ"
// #include "chapters/19-bestiary.typ"
// #include "chapters/20-glossary.typ"

// ── Placeholder page (remove when first chapter is included) ─
#align(center + horizon)[
  #text(size: 24pt, weight: "bold")[NEON RELIC] \
  #text(size: 14pt)[Core Rules — Typst Conversion In Progress] \
  \
  #text(size: 10pt, style: "italic")[
    Phase 1 infrastructure complete. \
    Enable chapter includes above as each is converted.
  ]
]
