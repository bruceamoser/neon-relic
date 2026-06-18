# AGENTS.md — Debug Mode

This file provides debugging-specific guidance for agents working in this repository.

## Common Issues

- **PDF generation failures:** Usually asciidoctor-pdf or Chrome headless not installed. Verify with `asciidoctor-pdf --version` and `chrome --version`.
- **Missing fonts in PDF:** The asciidoctor-pdf theme (`docs/themes/neon-relic-theme.yml`) references font paths. Ensure fonts exist at specified paths.
- **HTML template not interactive:** Ensure `form-tools.js` is included and not blocked by browser security (open via file://, not directly).
- **Chapter include errors:** Check that the include path in `docs/neon-relic.adoc` matches the actual chapter filename. Order is determined by prefix.
- **Chrome headless phantom page:** The `sed` workaround in `build.sh` (`sed -i 's/height:/min-height:/g'`) addresses a known margin bug. If seeing extra blank pages, re-verify this fix is in place.
- **Cross-reference validation:** AsciiDoc cross-refs (`<<chapter-id>>`) can break when chapters are renamed. Run a full build to validate all refs resolve.

## Build Debugging

- Build output goes to `docs/output/` for the rulebook PDF
- HTML→PDF output goes alongside the source HTML files (e.g., `character-sheet.html` → `character-sheet.pdf`)
- `starter-kit.zip` is generated in the project root
