// ============================================================
// NEON RELIC — Component Library (INFRA-3)
// ============================================================
// Reusable layout components for chapter conversion.
// Import alongside theme.typ:
//   #import "lib/components.typ": *
//
// Components defined here:
//   chapter-header(num, title)
//   part-header(num, title)
//   callout-block(label, body)
//   design-note(body)
//   sidebar-box(title, body)
//   example-box(body)
//   stat-block(content)
//   artifact-card(name, classification, body)
//   nr-table(columns, ..rows)
//   column-break()
//   section-rule()
// ============================================================

#import "theme.typ": *

// ─────────────────────────────────────────────────────────────
// CHAPTER HEADER
// Renders a full-width chapter title with the chapter number
// in large olive type above the chapter name.
//
// Usage: #chapter-header("01", "Introduction")
// ─────────────────────────────────────────────────────────────
#let chapter-header(num, title) = {
  // Each chapter begins on a new page (weak = no blank page if already at top)
  pagebreak(weak: true)
  // Place header spanning both columns at the top of the current page
  place(
    scope: "parent",
    top + left,
    float: true,
    block(
      width: 100%,
      fill: clr-manila-dark,
      stroke: (bottom: 2pt + clr-olive),
      inset: (x: 8mm, top: 6mm, bottom: 4mm),
    )[
      #set text(font: font-heading, fill: clr-olive-light, size: 9pt)
      CHAPTER #num
      #v(1mm)
      #set text(font: font-heading, fill: clr-olive-deep, size: 22pt, weight: "bold")
      #upper(title)
    ]
  )
  v(28mm)  // reserve space for the placed header block
}

// ─────────────────────────────────────────────────────────────
// PART HEADER PAGE
// Full page divider between book Parts. Renders a "CLASSIFIED"
// stamp graphic + part number + title.
//
// Usage: #part-header("I", "The Verdant Covenant")
// ─────────────────────────────────────────────────────────────
#let part-header(roman, title) = {
  pagebreak(to: "odd")
  page(
    background: rect(width: 100%, height: 100%, fill: clr-manila-dark),
    columns: 1,  // override to single column for this page
    margin: (top: 60mm, bottom: 40mm, left: 30mm, right: 30mm),
  )[
    #align(center)[
      // CLASSIFIED stamp
      #block(
        stroke: 3pt + clr-deep-red,
        inset: (x: 8mm, y: 4mm),
      )[
        #text(font: font-heading, size: 28pt, weight: "bold", fill: clr-deep-red,
              tracking: 6pt)[CLASSIFIED]
      ]
      #v(12mm)

      // Part number
      #text(font: font-heading, size: 13pt, fill: clr-olive-light, tracking: 3pt)[PART #roman]
      #v(4mm)

      // Part title
      #text(font: font-heading, size: 28pt, weight: "bold", fill: clr-olive-deep)[
        #upper(title)
      ]

      #v(16mm)
      #line(length: 60%, stroke: 1pt + clr-olive)
      #v(6mm)
      #text(font: font-body, size: 8pt, fill: clr-tan-text, style: "italic")[
        TOP SECRET — VERDANT COVENANT — EYES ONLY
      ]
    ]
  ]
}

// ─────────────────────────────────────────────────────────────
// CALLOUT BLOCK (NOTE / TIP / WARNING / IMPORTANT)
// Equivalent to AsciiDoc [NOTE] blocks.
// label: "NOTE", "TIP", "WARNING", "CAUTION", "IMPORTANT"
//
// Usage: #callout-block("NOTE")[Content...]
// ─────────────────────────────────────────────────────────────
#let callout-block(label, body) = {
  let (fill-clr, label-clr, border-clr) = if label == "WARNING" or label == "CAUTION" {
    (clr-manila-mid, clr-deep-red, clr-deep-red)
  } else {
    (clr-manila-mid, clr-olive-deep, clr-olive)
  }

  block(
    width: 100%,
    fill: fill-clr,
    stroke: (left: 3pt + border-clr, rest: 1pt + border-clr),
    inset: (left: 4mm, right: 3mm, top: 3mm, bottom: 3mm),
    above: 4mm,
    below: 4mm,
  )[
    #set text(font: font-body, size: size-body, fill: clr-near-black)
    #text(weight: "bold", fill: label-clr, size: size-sidebar)[#label] \
    #body
  ]
}

// ─────────────────────────────────────────────────────────────
// DESIGN NOTE
// Internal authorial callout — marks a design rationale.
// Styled differently from gameplay NOTE blocks.
//
// Usage: #design-note[Content...]
// ─────────────────────────────────────────────────────────────
#let design-note(body) = {
  block(
    width: 100%,
    fill: clr-manila-mid,
    stroke: (left: 3pt + clr-olive-mid),
    inset: (left: 4mm, right: 3mm, top: 2mm, bottom: 2mm),
    above: 4mm,
    below: 4mm,
  )[
    #set text(font: font-body, size: size-sidebar, fill: clr-near-black, style: "italic")
    #text(weight: "bold", fill: clr-olive, style: "normal")[DESIGN NOTE] \
    #body
  ]
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR BOX
// Equivalent to AsciiDoc [sidebar] blocks — supplementary
// content in a shaded box with optional title.
//
// Usage: #sidebar-box("Optional Title")[Content...]
// ─────────────────────────────────────────────────────────────
#let sidebar-box(title: none, body) = {
  block(
    width: 100%,
    fill: clr-manila-mid,
    stroke: 1pt + clr-olive,
    inset: (x: 4mm, y: 3mm),
    above: 4mm,
    below: 4mm,
  )[
    #if title != none {
      text(
        font: font-heading, size: size-sidebar, weight: "bold", fill: clr-olive-deep,
      )[#upper(title)]
      v(2mm)
    }
    #set text(font: font-body, size: size-sidebar, leading: leading-sidebar)
    #body
  ]
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE BOX
// Italicised play example block — indented and slightly shaded.
//
// Usage: #example-box[Dialogue / example text...]
// ─────────────────────────────────────────────────────────────
#let example-box(body) = {
  block(
    width: 100%,
    fill: clr-manila-light,
    stroke: (left: 2pt + clr-olive-mid),
    inset: (left: 5mm, right: 3mm, top: 2mm, bottom: 2mm),
    above: 3mm,
    below: 3mm,
  )[
    #set text(font: font-body, size: size-body, style: "italic", fill: clr-near-black)
    #body
  ]
}

// ─────────────────────────────────────────────────────────────
// STAT BLOCK
// Pre-formatted adversary stat block. Preserves monospace
// alignment — pass content as a raw block or formatted text.
//
// Usage: #stat-block[
//   NAME\n
//   Attributes: STR 3 | AGI 2 ...\n
//   ...
// ]
// ─────────────────────────────────────────────────────────────
#let stat-block(body) = {
  block(
    width: 100%,
    fill: clr-manila-mid,
    stroke: (top: 2pt + clr-olive, bottom: 2pt + clr-olive, rest: 1pt + clr-olive-mid),
    inset: (x: 4mm, y: 3mm),
    above: 4mm,
    below: 4mm,
  )[
    #set text(font: font-body, size: size-sidebar, fill: clr-near-black)
    #set par(leading: 1.3em)
    #body
  ]
}

// ─────────────────────────────────────────────────────────────
// ARTIFACT CARD
// Structured entry block for an artifact description.
// name: artifact name (string)
// classification: e.g. "Class III — Hazardous" (string)
// body: artifact description + mechanics content
//
// Usage: #artifact-card("The Broadcast Reel", "Class III — Hazardous")[
//   *Appearance:* ...
//   *Effect:* ...
// ]
// ─────────────────────────────────────────────────────────────
#let artifact-card(name, classification, body) = {
  block(
    width: 100%,
    fill: clr-manila-mid,
    stroke: 1pt + clr-olive,
    inset: 0pt,
    above: 5mm,
    below: 5mm,
  )[
    // Header bar
    #block(
      width: 100%,
      fill: clr-olive-dark,
      inset: (x: 4mm, y: 2mm),
    )[
      #set text(font: font-heading, weight: "bold", fill: clr-manila)
      #grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        upper(name),
        text(size: size-sidebar, style: "italic")[#classification],
      )
    ]
    // Body
    #block(inset: (x: 4mm, y: 3mm))[
      #set text(font: font-body, size: size-body, fill: clr-near-black)
      #body
    ]
  ]
}

// ─────────────────────────────────────────────────────────────
// TABLE HELPER
// Styled table matching the AsciiDoc theme: olive header,
// manila background, olive borders, striped rows.
//
// Usage: #nr-table(
//   columns: (auto, 1fr, 2fr),
//   [*Header 1*], [*Header 2*], [*Header 3*],
//   [Cell 1],     [Cell 2],     [Cell 3],
// )
// ─────────────────────────────────────────────────────────────
#let nr-table(columns: auto, ..cells) = {
  set text(size: size-table)
  show table.cell.where(y: 0): it => {
    set text(fill: clr-manila, weight: "bold")
    set table.cell(fill: clr-olive-dark)
    it
  }
  table(
    columns: columns,
    fill: (_, y) => if calc.odd(y) { clr-manila-stripe } else { clr-manila-light },
    stroke: 1pt + clr-olive-mid,
    inset: (x: 2mm, y: 2mm),
    ..cells,
  )
}

// ─────────────────────────────────────────────────────────────
// WIDE TABLE HELPER
// Like nr-table() but floated to span both columns.
// Use for very wide tables (many columns, or wide content).
// The table floats to the top of the current page in the
// parent (full-page-width) scope.
//
// Usage: #nr-table-wide(
//   columns: (1fr, 1fr, 2fr, 1fr, 1fr),
//   [*H1*], [*H2*], ...,
//   [Cell], ...,
// )
// ─────────────────────────────────────────────────────────────
#let nr-table-wide(columns: auto, ..cells) = {
  place(
    scope: "parent",
    top + left,
    float: true,
    block(width: 100%)[
      #nr-table(columns: columns, ..cells)
    ]
  )
}

// ─────────────────────────────────────────────────────────────
// COLUMN BREAK
// Forces a column break in the 2-column layout.
// Use sparingly — Typst handles most breaks automatically.
//
// Usage: #column-break()
// ─────────────────────────────────────────────────────────────
#let column-break() = colbreak()

// ─────────────────────────────────────────────────────────────
// SECTION RULE
// Horizontal olive rule for major section dividers.
// Equivalent to AsciiDoc "---" dividers.
//
// Usage: #section-rule()
// ─────────────────────────────────────────────────────────────
#let section-rule() = {
  v(3mm)
  line(length: 100%, stroke: 1pt + clr-olive-mid)
  v(3mm)
}
