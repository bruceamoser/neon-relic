# Project Neon Relic

> *"What is found must be known. What is known must be contained. What is contained must be guarded."*

**Project Neon Relic** is a tabletop roleplaying game (TTRPG) built on the **Year Zero Engine** (YZE), set in a neon-drenched alternate 1980s where occult artifacts threaten to unravel reality. Players are agents of **The Verdant Covenant**, a centuries-old secret society devoted to discovering, recovering, and containing artifacts of supernatural power.

## Designers

- **Bruce Moser** — Co-designer and system architect
- **Stewart Voit** — Co-designer, worldbuilding and lore

## Concept

Neon Relic combines:

- The **investigative, base-building structure** of *Vaesen*
- The **high-stakes psychological tension** of the *Alien RPG*
- The **moral ambiguity and humanity attrition** of the *Blade Runner RPG*
- A unique **Corruption** mechanic where occult exposure and desperate choices accelerate your doom

## Project Status

**Phase: Core Rules Design** — The game is currently in the rules-writing and worldbuilding phase. No Foundry VTT module work has begun yet.

## Latest Release

- [Latest release](https://github.com/bruceamoser/neon-relic/releases/latest)
- [Download starter-kit.zip](https://github.com/bruceamoser/neon-relic/releases/latest/download/starter-kit.zip)

### Starter Kit (v2.0.0+)

Beginning with v2.0.0, each release ships a **Neon Relic Starter Kit** — a single zip containing everything players and Directors of Agents need to run a session:

```
starter-kit.zip
├── neon-relic-core-rules.pdf          ← The compiled rulebook
├── case-file-instructions.pdf         ← Step-by-step DA guide
├── blank-templates/                   ← Fillable HTML forms — open in any browser
│   ├── agent-dossier.html
│   ├── case-brief-da.html
│   ├── case-brief-player.html
│   ├── information-card.html
│   ├── location-page.html
│   ├── npc-card.html
│   ├── operations-board.html
│   ├── organization-reference.html
│   └── relic-sheet.html
├── prebuilt-characters/               ← Five ready-to-play agent dossiers
│   └── character-*.html
└── sample-case-file/                  ← The Spear That Went Dark — complete case
    ├── start-here.html
    ├── case-brief-da.html
    ├── case-brief-player.html
    ├── information-cards.html
    ├── locations.html
    ├── npc-cards.html
    ├── operations-board.html
    ├── organization-reference.html
    ├── relic-sheet.html
    └── handouts/
        └── *.png
```

All HTML forms are fully self-contained with embedded fonts — no internet connection or external files required. They can be filled out in the browser and printed to PDF via Ctrl+P.

## Repository Structure

```
neon-relic/
├── .github/                        ← GitHub repo metadata and templates
├── assets/                         ← Blank HTML form templates, prebuilt characters, SVG dividers
├── docs/
│   ├── case-file-instructions.adoc ← Step-by-step DA guide to building a case file
│   ├── case-files/                 ← Filled-in sample case file sources (The Spear That Went Dark)
│   ├── chapters/                   ← Canonical chapter source files (AsciiDoc)
│   ├── design/                     ← Design documents and issue trackers (reference only)
│   ├── references/                 ← YZE reference material from published games
│   ├── themes/                     ← Asciidoctor PDF theme files and embedded fonts
│   └── neon-relic.adoc             ← Master book file for the compiled rulebook
├── tools/                          ← Process and gap-analysis support docs
├── build.ps1                       ← PowerShell build script — generates PDFs, self-contained HTML, and starter-kit.zip
├── CONTRIBUTING.md                 ← Issue, release, and workflow SOP
└── README.md
```

### Key Files

| File | Purpose |
|---|---|
| `docs/chapters/*.adoc` | **Canonical chapter source files** for the current compiled rulebook. |
| `docs/neon-relic.adoc` | Master AsciiDoc book that assembles the full release-ready rulebook. |
| `docs/case-file-instructions.adoc` | Step-by-step guide for DAs building a case file from scratch. |
| `docs/case-files/spear-that-went-dark/` | Complete worked example case file with all filled HTML forms. |
| `build.ps1` | Build script — generates PDFs, inlines fonts into HTML templates, and packages `starter-kit.zip`. |
| `assets/*.html` | Blank printable HTML templates (Case Brief, Relic Sheet, NPC Card, etc.). |
| `docs/references/*.md` | Year Zero Engine reference material from existing YZE games. Used for mechanical consistency and inspiration. |

## Year Zero Engine References

This project draws inspiration and mechanical precedent from these existing YZE games:

- **Mutant: Year Zero** — Dice-pool foundation, base-building (The Ark)
- **Forbidden Lands** — Stronghold management, push mechanics, gear degradation
- **Vaesen** — Procedural mystery structure, episodic investigation, headquarters upgrades
- **Alien RPG** — Stress/Panic system (inspiration for Corruption's escalation design)
- **Blade Runner RPG** — Humanity attrition, moral ambiguity
- **Twilight: 2000** — Step-dice variant reference (not used, but studied)

## Future Plans

- [x] Complete core rules document (Chapters 1–22)
- [x] Case file system and sample case file (The Spear That Went Dark)
- [x] DA guide and case file instructions
- [x] Form-fillable HTML templates and starter kit build pipeline
- [ ] Playtesting and balance iteration
- [ ] Art direction and layout
- [ ] Foundry VTT system module implementation

## License

TBD — This is a private design project. Year Zero Engine is a trademark of Free League Publishing.