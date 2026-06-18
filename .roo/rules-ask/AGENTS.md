# AGENTS.md — Ask Mode

This file provides context for agents answering questions about this repository.

## Counterintuitive Structure

- **This is not a software project.** There are no package.json, no source code files, no tests. It's a game design documentation project.
- **"Build" means document generation** (PDFs from AsciiDoc), not compiling code.
- **The `assets/` directory** contains printable game aids (character sheets, NPC cards, etc.), not traditional web assets like CSS/JS libs.
- **`.github/copilot-instructions.md` is gitignored** — it's explicitly designed to be edited without version control tracking.
- **`Bruce-Stuff/`** is a personal sandbox with experimental content. Not part of the published game.

## Documentation Organization

- **AsciiDoc chapters** in `docs/chapters/` are the authoritative rules. Each chapter covers one game system (combat, character creation, etc.).
- **Case files** (`docs/case-files/`) are published adventures. Each case file has its own directory with HTML files and handouts.
- **Design documents** (`docs/design/`) capture design discussions and proposals. These may contain ideas not yet implemented in chapters.
- **Reference materials** (`docs/references/`) are imported YZE rulebooks for comparison/reference. Never modify these.

## Workspace Notes

- The `.code-workspace` file defines a multi-root workspace linking 8 repos. Only `neon-relic` is the active project — the other 7 are Foundry VTT system modules included for reference when designing game systems that integrate with Foundry.
