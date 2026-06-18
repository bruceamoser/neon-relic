# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build Commands (Non-Standard Build System)

This project has no package.json. Build uses **asciidoctor-pdf** (Ruby gem) and **Chrome headless**:

| Command | Platform | Description |
|---------|----------|-------------|
| `.\build.ps1` | Windows (PowerShell) | Full build: rulebook PDF, HTML templates, starter-kit.zip |
| `.\build.ps1 -SkipRulebook` | Windows | Build without rulebook PDF (faster iteration) |
| `./build.sh` | Linux/macOS (bash) | Full build counterpart. Uses Chrome headless + Python3 |
| `./build-pdfs.sh` | Linux/macOS | Standalone HTML→PDF conversion. Has hardcoded PROJECT_ROOT — edit before use |

**Prerequisites:** asciidoctor-pdf, asciidoctor-diagram (Ruby gems), Chrome/Chromium, Python3 (for font inlining). No npm/node.

**Known gotcha:** `build.sh` includes a `sed` workaround for a Chrome headless phantom-second-page margin bug. `build-pdfs.sh` has a hardcoded PROJECT_ROOT path.

## Source of Truth Hierarchy

| Layer | Path | Mutability |
|-------|------|------------|
| **Canonical rules** | `docs/chapters/*.adoc` | Read-write. Edit here for all game mechanics changes |
| **Master document** | `docs/neon-relic.adoc` | Read-write. Add new chapters via `include::` directives |
| **HTML templates** | `assets/*.html` | Read-write. Printable templates with embedded fonts (base64) |
| **Theme** | `docs/themes/neon-relic-theme.yml` | Read-write. asciidoctor-pdf "government dossier" theme |
| **Design docs** | `docs/design/*.md` | Reference only. Not source of truth |
| **YZE references** | `docs/references/*.md` | Read-only. Do not modify |
| **Foundry VTT modules** | sibling repos in workspace | Read-only reference. Do NOT modify |
| **Bruce-Stuff/** | sandbox | Personal WIP. Not part of core project |

## Architecture (Non-Obvious)

- **Chapter naming matters:** Files are included by numeric prefix (00-, 01-, 01b-, 02-...). Inserting a new chapter requires correct ordering prefix.
- **Dual rendering pipeline:** HTML templates in `assets/` are standalone (self-contained HTML with base64-embedded fonts). They are NOT generated from AsciiDoc. Edit HTML directly.
- **Case files** live in `docs/case-files/<case-name>/` with a standard set of 10 HTML files (case-brief-da, case-brief-player, locations, npc-cards, information-cards, operations-board, organization-reference, relic-sheet, start-here, handouts/).
- **SVG stamps** (`assets/svg/stamp-classified.svg`, `stamp-top-secret.svg`) are used as decorative overlays in PDF output.
- **starter-kit.zip** and `starter-kit/` are generated artifacts (gitignored).

## HTML Template Conventions

- **No JS framework.** Interactivity via `assets/form-tools.js` (self-executing, sets `contentEditable="true"` on form fields).
- **Form field CSS classes:** `field-value`, `skill-box`, `gear-table td`, `pip`, `checkbox` — these are what `form-tools.js` targets.
- **Checkbox/pip toggling** uses `classList.toggle('filled')`.
- **Print CSS** in `form-tools.js` strips `contentEditable` and focus outlines for clean PDF output.
- Fonts are embedded as base64 data URIs in each HTML file (CourierPrime, SpecialElite).

## Contribution Workflow (from CONTRIBUTING.md)

- **Branch naming:** `issue/<n>-<slug>` (e.g., `issue/42-add-corruption-rules`)
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **10-step cycle:** Assign → Branch → Work → Comment → Commit → PR → Merge → Delete branch → Next issue
- **Release:** Validate AsciiDoc cross-refs → build PDF → GitHub release with asset upload

## Critical Gotchas

- `.gitignore` ignores `.github/copilot-instructions.md` — editing it is intentional and safe
- `.gitignore` ignores `tools/`, `.venv/`, `.playwright-mcp/` — these are tooling, not project code
- Workspace file references 8 repos; only `neon-relic/` is the active project — other 7 are Foundry VTT modules for reference
- No package.json, no linting, no testing framework — this is a documentation project
