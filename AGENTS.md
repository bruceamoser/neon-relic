# Neon Relic

## Sources

- Edit game mechanics and lore in `docs/chapters/*.md`. Numbered filenames set the reading order. The advanced combat appendix precedes the Year Zero Engine license.
- `book/book.typ`, `book/layout.typ`, and `book/tables.lua` control typography and print layout. `book/art/` contains the dossier cover, illustrations, transparent objects, and their prompts.
- `docs/missions/` contains additional Director notes. Directors may use any format for their own assignments.
- `assets/character-sheet.html`, `assets/prebuilt/`, and `assets/form-tools.js` supply the printable agent dossiers. Edit these directly. The kit builder embeds fonts and form code. Pips and checkboxes toggle the filled class.
- `docs/design/` is historical design material. `docs/references/` and sibling Foundry repositories are read-only references. Keep personal work in `Bruce-Stuff/` and temporary files in `scratch-pad/` separate from the book.

## Build and release

Use `python3 scripts/build_book.py` or the platform wrappers in `scripts/`. Build prerequisites, switches, and output paths are in README.md. Generated outputs live under `dist/`. Inspect rendered pages after layout changes and check links, tables, read order, and the ZIP inventory.

Use the issue workflow in CONTRIBUTING.md. Issue branches use `issue/<number>-<slug>` and conventional commits. Keep tooling in `scripts/`. This is a documentation project with local static player aids.
