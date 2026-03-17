// ============================================================
// NEON RELIC  -  Core Rules (Typst Master Document)
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
  title: "Neon Relic  -  Core Rules",
  author: ("Bruce Amoser", "Stu"),
  keywords: ("TTRPG", "Year Zero Engine", "occult", "1980s"),
  date: auto,
)

// ── Apply brand theme ────────────────────────────────────────
#show: apply-theme

// ── Title Page ──────────────────────────────────────────────
#page(
  background: image("../assets/svg/title-page-dossier.svg", width: 100%, height: 100%),
  columns: 1,
  margin: (top: 50mm, bottom: 40mm, left: 30mm, right: 30mm),
)[
  #align(center)[
    #v(1fr)
    #text(font: font-heading, size: 14pt, fill: clr-olive-light, tracking: 3pt)[
      CORE RULES
    ]
    #v(10mm)
    #line(length: 50%, stroke: 1pt + clr-olive)
    #v(10mm)
    #text(font: font-body, size: 9pt, fill: clr-tan-text)[
      A tabletop roleplaying game powered by the Year Zero Engine
    ]
    #v(1fr)
  ]
]

// ── Table of Contents ────────────────────────────────────────
#page(columns: 1, margin: (top: 30mm, bottom: 30mm, left: 28mm, right: 28mm))[
  #align(center)[
    #text(font: font-heading, size: 20pt, weight: "bold", fill: clr-olive-deep)[CONTENTS]
    #v(8mm)
    #line(length: 60%, stroke: 1pt + clr-olive)
    #v(8mm)
  ]
  #outline(
    title: none,
    depth: 1,
    indent: auto,
  )
]

// ── Parts & Chapters ────────────────────────────────────────
#part-header("I", "Introduction", img: "../../assets/vegas-vic.png")
#include "chapters/01-introduction.typ"

#part-header("II", "Character Creation")
#include "chapters/02-character-creation.typ"

#part-header("III", "Core Mechanics")
#include "chapters/03-core-resolution.typ"
#include "chapters/04-attributes-skills.typ"
#include "chapters/05-combat.typ"
#include "chapters/06-social-conflict.typ"
#include "chapters/07-health-damage-armor.typ"
#include "chapters/08-corruption-fear-healing.typ"

#part-header("IV", "The World of Neon Relic")
#include "chapters/09-divisions.typ"
#include "chapters/10-equipment.typ"
#include "chapters/11-artifacts.typ"
#include "chapters/12-headquarters.typ"
#include "chapters/13-advancement.typ"

#part-header("V", "The Director of Agents")
#include "chapters/14-gm-guidance.typ"
#include "chapters/15-case-file.typ"
#include "chapters/16-travel.typ"
#include "chapters/17-rival-factions.typ"
#include "chapters/18-notable-members.typ"
#include "chapters/19-bestiary.typ"

#part-header("VI", "Glossary")
#include "chapters/20-glossary.typ"
