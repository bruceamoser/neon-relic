# Project Neon Relic

*What is found must be known. What is known must be contained. What is contained must be guarded.*

The Verdant Covenant investigates occult incidents in an alternate 1980s. The agents have payphones, paper archives, and one another. They can push a roll when the stakes warrant it. The Corruption they take follows them home.

Written and designed by **Bruce Moser and Stewart Voit**. Published by **OmniscientForge LLC**.

## Read and play

- The [core manuscript](docs/chapters/) contains agent creation, Year Zero Engine rules, equipment, the Covenant, and Director material.
- [The Spear That Went Dark](docs/chapters/20-sample-case-file.md) is a complete mission set in Buenos Aires. Four further [field assignments](docs/missions/) are available for Directors.
- Directors prepare the artifact, timeline, people, factions, and locations in whatever format works at their table.
- The [starter kit](https://github.com/bruceamoser/neon-relic/releases/latest/download/starter-kit.zip) is the latest **published** version. Build this checkout to play the current revision.

## Build

Use Python 3.9+, Pandoc 3.7.0.2, and Typst 0.15.1. A full kit also uses Chrome, Chromium, or Edge to print the agent dossiers. Fonts and illustrations are local. Set `PANDOC`, `TYPST`, or `CHROME` to select a specific executable.

```sh
python3 scripts/build_book.py
```

Use `./scripts/build.sh` on Linux/macOS or `.\scripts\build.ps1` on Windows. For the book alone, pass `--book-only` to Python or the shell wrapper. For a kit with HTML dossiers only, pass `--skip-pdfs` (PowerShell `-SkipPdfs`). To reuse a previously compiled manual, use `--skip-rulebook` (PowerShell `-SkipRulebook`).

With Poppler installed, run `python3 scripts/audit_book.py` after a full build to check the printed rules, front matter, links, and kit inventory. The audit also compares every printed illustration in the manual and standalone assignment for reuse.

The build writes **dist/neon-relic-core-rules.pdf** and **dist/starter-kit.zip**. The kit contains the rulebook, a blank agent dossier, five prebuilt agents, a standalone PDF of the Buenos Aires mission, and its illustrated handouts. Dossiers can also be opened and printed offline from HTML.

## Edit

Edit the numbered Markdown files in [docs/chapters](docs/chapters/) for rules and setting. [The builder](scripts/build_book.py) orders them and adds art. [The book design](book/) controls the cover, clearance markings, columns, and tables. Catalog tables marked `.catalog` supply both the linked quick-reference rows and the full descriptions. A matching `.lookup` places the reference by register name. Mark a comparison table with `.wide` to span both columns. The [folio plan](book/folios.yml) names the first passage on each subsequent page of a file. To edit a page turn, run `python3 scripts/build_book.py --measure-folios` and look up the passage key in `dist/folio-measurements.json`. [Exhibit placements](book/folio-art.yml) use the same keys. Put a unique transparent illustration under `shelves` for a full-width opening or `columns` for the free end of a shorter column. The layout measures that space before placing the object and its caption. A build reports the first passage of any page that overflows. Artwork and generation prompts live in [book/art](book/art/). The HTML dossier sources are in [assets](assets/).

## License

This game is not affiliated with, sponsored, or endorsed by Fria Ligan AB. The Year Zero Engine System Reference Document is used under Fria Ligan AB’s Free Tabletop License. See the [publication credits](docs/chapters/00-front-matter.md) and [full license](docs/chapters/22-yze-license.md).
