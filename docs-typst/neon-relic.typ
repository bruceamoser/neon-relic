// ============================================================
// NEON RELIC — Core Rules (Typst Master Document)
// ============================================================
// This is the root entry point. It imports the theme, component
// library, and all 20 chapter files.
//
// Build: ./build.ps1
// Or:    typst compile docs-typst/neon-relic.typ docs-typst/output/neon-relic.pdf --root .
// ============================================================

// Theme & components
#import "lib/theme.typ": *
#import "lib/components.typ": *

// ── Document metadata ───────────────────────────────────────
#set document(
  title: "Neon Relic — Core Rules",
  author: ("Bruce Amoser", "Stu"),
  keywords: ("TTRPG", "Year Zero Engine", "occult", "1980s"),
)

// ── Apply brand theme ────────────────────────────────────────
#show: apply-theme

// ── Chapters ────────────────────────────────────────────────
// Uncomment each chapter as it is converted (Phase 2 work).

#include "chapters/01-introduction.typ"
#include "chapters/02-character-creation.typ"
#include "chapters/03-core-resolution.typ"
#include "chapters/04-attributes-skills.typ"
#include "chapters/05-combat.typ"
#include "chapters/06-social-conflict.typ"
#include "chapters/07-health-damage-armor.typ"
#include "chapters/08-corruption-fear-healing.typ"
#include "chapters/09-divisions.typ"
#include "chapters/10-equipment.typ"
#include "chapters/11-artifacts.typ"
#include "chapters/12-headquarters.typ"
#include "chapters/13-advancement.typ"
#include "chapters/14-gm-guidance.typ"
#include "chapters/15-case-file.typ"
#include "chapters/16-travel.typ"
// #include "chapters/17-rival-factions.typ"
// #include "chapters/18-notable-members.typ"
// #include "chapters/19-bestiary.typ"
// #include "chapters/20-glossary.typ"
