# AGENTS.md — Code Mode

This file provides coding-specific guidance for agents working in this repository.

## File Editing Rules

- **`docs/chapters/*.adoc`** is the source of truth for game mechanics. Edit AsciiDoc directly.
- **`docs/neon-relic.adoc`** is the master document. Add new chapter includes here.
- **HTML templates** (`assets/*.html`) are standalone files with base64-embedded fonts. Font inlining is done by Python3 script during build, but for new templates, embed fonts manually using the same URI pattern found in existing templates.
- **SVG files** in `assets/svg/` use inline CSS (no external dependencies).

## HTML Template Pattern (Form Interactivity)

When creating or editing HTML templates:
1. Include `<script src="../form-tools.js"></script>` before `</body>`
2. Use these CSS class names for editable fields: `field-value`, `skill-box`, `gear-table td`, `pip`, `checkbox`
3. The `pip` and `checkbox` elements toggle `class="filled"` on click — no JS needed beyond form-tools.js
4. Print stylesheets must hide `.no-print` elements and strip editing UI

## Build Scripts

- **`build.ps1`** is the primary build for Windows. It generates PDFs via asciidoctor-pdf and HTML→PDF via Chrome.
- **`build.sh`** is the Linux/macOS counterpart. Uses Chrome headless for PDF conversion.
- To add a new HTML template to the build, add a conversion step in the build script matching the existing pattern.

## Design Documents

- `docs/design/*.md` files contain discussion and proposals. Do NOT treat them as source of truth.
- Always cross-reference design docs against actual chapter content before implementing.
