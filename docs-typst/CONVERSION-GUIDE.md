# AsciiDoc → Typst Conversion Reference Guide

This guide documents how to translate each AsciiDoc construct used in Neon Relic
chapters into the equivalent Typst markup. Use it when working through any Phase 2
chapter conversion issue.

**Import at the top of every chapter file:**
```typst
#import "../lib/theme.typ": *
#import "../lib/components.typ": *
```

---

## 1. Headings

| AsciiDoc | Typst | Notes |
|---|---|---|
| `= Chapter Title` | `= Chapter Title` | H1 — set via show rule or `chapter-header()` |
| `== Section` | `== Section` | H2 |
| `=== Sub-section` | `=== Sub-section` | H3 |
| `==== Sub-sub-section` | `==== Sub-sub-section` | H4 |

> **Prefer `chapter-header()`** for the top-level chapter title — it renders the
> full-width ruled header with the chapter number in the correct style.
> ```typst
> #chapter-header("01", "Introduction")
> ```

---

## 2. Body Text

| AsciiDoc | Typst |
|---|---|
| Plain paragraph | Plain paragraph (same — no markup) |
| `*bold*` | `*bold*` |
| `_italic_` | `_italic_` |
| `*_bold italic_*` | `*_bold italic_*` |
| `` `code` `` | `` `code` `` (inline raw) |
| `+` (hard line break) | `\` at end of line |
| `{blank}` (empty para) | `#v(0pt)` (or just blank line) |

---

## 3. Lists

**Unordered:**
```asciidoc
* Item one
** Sub-item
* Item two
```
```typst
- Item one
  - Sub-item
- Item two
```

**Ordered:**
```asciidoc
. Step one
. Step two
```
```typst
+ Step one
+ Step two
```

**Labelled / definition list:**
```asciidoc
Term:: Definition text
```
```typst
*Term* — Definition text  // (no native dl in Typst; use bold + em-dash)
```

---

## 4. Tables

AsciiDoc tables with `[cols="..."]` convert to `#nr-table()`:

```asciidoc
[cols="1,2,4", options="header"]
|===
| Column A | Column B | Column C
| cell     | cell     | cell
|===
```
```typst
#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Column A*], [*Column B*], [*Column C*],
  [cell],       [cell],       [cell],
)
```

Column width ratios map directly: `1,2,4` → `(1fr, 2fr, 4fr)`.
Fixed widths like `auto` or `2cm` are also valid.

For `frame=sides, grid=rows` style (equipment tables):
```typst
#nr-table(
  columns: (1fr, 3fr),
  stroke: (x, y) => if y == 0 { 1pt + clr-olive-dark } else { (y: 0.5pt + clr-olive-mid) },
  ...
)
```

---

## 5. Admonition / Callout Blocks

```asciidoc
[NOTE]
====
Content of the note.
====
```
```typst
#callout-block("NOTE")[
  Content of the note.
]
```

Supported labels: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`
(WARNING and CAUTION render with red border and label).

---

## 6. Sidebar Blocks

```asciidoc
.Optional Title
****
Sidebar content here.
****
```
```typst
#sidebar-box(title: "Optional Title")[
  Sidebar content here.
]

// Without title:
#sidebar-box[
  Content.
]
```

---

## 7. Example / Play Example Blocks

```asciidoc
====
_Play example:_ She rolls her Manipulate...
====
```
```typst
#example-box[
  _Play example:_ She rolls her Manipulate...
]
```

---

## 8. Design Notes

AsciiDoc design notes (typically marked `[NOTE]` with a **Design Note:** prefix):
```asciidoc
[NOTE]
====
*Design Note:* This mechanic exists because...
====
```
```typst
#design-note[
  This mechanic exists because...
]
```

---

## 9. Stat Blocks (Bestiary)

AsciiDoc literal blocks (`----`) used for stat blocks:
```asciidoc
----
NAME
[Classification / Faction / Tier]

Attributes: STR X | AGI X ...
----
```
```typst
#stat-block[
  *NAME* \
  [Classification / Faction / Tier] \
  \
  *Attributes:* STR X | AGI X ... \
  *Armor Rating:* X \
  *Fear Rating:* X \
  \
  *Skills:* Force X | Brawl X | ... \
  \
  *Special Abilities:* \
  Name — Description. \
  \
  *Broken State:* Flee / Surrender \
  *Motivation:* One sentence.
]
```

---

## 10. Artifact Cards

Named artifact entries in Chapter 11:
```typst
#artifact-card("The Broadcast Reel", "Class III — Hazardous")[
  *Appearance:* ...

  *Effect:* ...

  *Resonance Cost:* X | *Corruption Risk:* Yes/No
]
```

---

## 11. Cross-references

AsciiDoc:
```asciidoc
See xref:chapters/03-core-resolution.adoc#chapter-resolution[Core Resolution].
```
Typst (label-based):
```typst
See @chapter-resolution.
// Chapter files define labels with: <chapter-resolution>
```
To define a label target:
```typst
= Core Resolution <chapter-resolution>
```

---

## 12. Part Headers

Part divider pages between book sections:
```typst
#part-header("I", "The Verdant Covenant")
```
These go at the top of the first chapter of each Part (or in a dedicated part stub file).

---

## 13. Horizontal Rules / Section Dividers

AsciiDoc `---` dividers:
```typst
#section-rule()
```

---

## 14. Page / Column Breaks

To force a column break within 2-column layout:
```typst
#column-break()
```
To force a page break:
```typst
#pagebreak()
```

---

## 15. Images / SVG Assets

AsciiDoc:
```asciidoc
image::../../assets/svg/divider-rule.svg[width=100%]
```
Typst:
```typst
#image("../assets/svg/divider-rule.svg", width: 100%)
```

SVG asset paths (relative to `docs-typst/`):
- `../assets/svg/divider-rule.svg` — horizontal section divider
- `../assets/svg/stamp-classified.svg` — CLASSIFIED stamp
- `../assets/svg/title-page-dossier.svg` — title page background

---

## 16. File Header Template

Every chapter `.typ` file should start with:

```typst
// ============================================================
// CH-XX: Chapter Title
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

// ─────────────────────────────────────────────────────────────

#chapter-header("XX", "Chapter Title")

// Chapter content begins here...
```

---

## 17. Conversion Checklist (per chapter)

Use this checklist when working a Phase 2 issue:

- [ ] Copy adoc source content as reference side-by-side
- [ ] Apply chapter-header() at top
- [ ] Convert all `==` headings → `==` (Typst headings are identical)
- [ ] Convert all `[NOTE]====...====` → `#callout-block("NOTE")[...]`
- [ ] Convert all `****...****` sidebars → `#sidebar-box[...]`
- [ ] Convert all `====...====` examples → `#example-box[...]`
- [ ] Convert all `[cols="..."]|===...` tables → `#nr-table(...)`
- [ ] Convert all `----...----` stat blocks → `#stat-block[...]`
- [ ] Convert all artifact entries → `#artifact-card(...)[...]`
- [ ] Convert cross-refs → `@label` style and add `<label>` anchors
- [ ] Add `#section-rule()` where `---` dividers appear
- [ ] Check column balance — add `#column-break()` if needed
- [ ] Enable chapter include in `neon-relic.typ` and verify compile
- [ ] Check 5-10 pages of PDF output for visual accuracy
