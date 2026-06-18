# AGENTS.md — Architect Mode

This file provides architectural guidance for agents planning changes to this repository.

## Architectural Constraints

- **Chapters must be independently includable.** Each `docs/chapters/*.adoc` file should be self-contained enough to be included in the master document. Avoid cross-chapter dependencies where possible.
- **Asset independence.** Each HTML template in `assets/` is fully self-contained (fonts embedded as base64). There is no shared CSS or JS framework between them beyond `form-tools.js`.
- **Dual rendering model.** Content exists in two forms: (1) AsciiDoc → PDF (rulebook) and (2) standalone HTML → PDF (templates/case files). These are NOT generated from each other — they are independently maintained.
- **No runtime.** Everything is static files. There is no server, no database, no API.

## Design Patterns

- **Case file structure is standardized:** Each case in `docs/case-files/` should mirror the structure of `spear-that-went-dark/` (10 HTML files + handouts/ directory).
- **Theme-driven styling:** All PDF styling is controlled through `docs/themes/neon-relic-theme.yml`. Changing visual appearance should be done there, not in individual files.
- **Versioning strategy:** The only versioned artifact is the PDF rulebook. HTML templates are "latest" — no version tracking on individual assets.

## When Adding New Content

1. **New chapter:** Create `docs/chapters/<NN>-<slug>.adoc`, add `include::` to `docs/neon-relic.adoc` (at correct position)
2. **New HTML template:** Create in `assets/`, add build step to `build.ps1` and `build.sh`
3. **New case file:** Copy `spear-that-went-dark/` structure, rename assets
4. **New theme element:** Add to `neon-relic-theme.yml`, never hardcode styling in individual files
