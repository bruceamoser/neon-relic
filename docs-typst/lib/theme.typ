// ============================================================
// NEON RELIC — Brand Theme & Design System (INFRA-2)
// ============================================================
// Government dossier / classified file aesthetic.
// Palette: aged manila paper, olive/forest green ink, red stamps.
// ============================================================

// ── Color Palette ───────────────────────────────────────────
#let clr-manila        = rgb("#f0ead6")  // page background
#let clr-manila-dark   = rgb("#e8e0c8")  // title page bg
#let clr-manila-mid    = rgb("#ddd8c0")  // sidebar / admonition fill
#let clr-manila-light  = rgb("#f8f4e4")  // table row bg
#let clr-manila-stripe = rgb("#e8e4d0")  // table stripe

#let clr-olive         = rgb("#4a5a38")  // headings, borders, bullets
#let clr-olive-light   = rgb("#6a7a58")  // muted olive (header page nums)
#let clr-olive-mid     = rgb("#7a8a6a")  // table borders, h2 underlines
#let clr-olive-dark    = rgb("#3a4a2a")  // table header bg, h2 text
#let clr-olive-darker  = rgb("#2a3a1a")  // h2 text
#let clr-olive-deep    = rgb("#1a2a0e")  // h1 text, TOC title
#let clr-olive-deepest = rgb("#1e2c0e")  // heading base

#let clr-deep-red      = rgb("#7a1212")  // classification stamp, warnings
#let clr-near-black    = rgb("#1e2010")  // body text, cell text

#let clr-tan-border    = rgb("#9a9a7a")  // code borders, TOC dots
#let clr-tan-text      = rgb("#7a7a5a")  // footer muted text
#let clr-code-bg       = rgb("#e4dfc8")  // inline code block bg
#let clr-link          = rgb("#2a4a8a")  // hyperlinks

// ── Typography ──────────────────────────────────────────────
// Body: Courier New 10pt (monospaced thriller aesthetic)
// Headings: Courier New bold (same family, weight differentiates)
// All sizes in pt.

#let font-body    = "Courier New"
#let font-heading = "Courier New"

#let size-body        = 10pt
#let size-h1          = 20pt
#let size-h2          = 14pt
#let size-h3          = 11pt
#let size-h4          = 10pt
#let size-sidebar     = 8pt      // fixed from AsciiDoc v1.1.1 (was too large)
#let size-caption     = 8pt
#let size-footer      = 7pt
#let size-header-sub  = 8pt
#let size-table       = 9pt
#let size-code        = 9pt
#let size-quote       = 9pt
#let size-toc         = 10pt

#let leading-body     = 1.45em  // line-height
#let leading-sidebar  = 1.3em
#let leading-toc      = 1.6em

// ── Page Geometry ────────────────────────────────────────────
// US Letter, two-column body, 5mm gutter.
// Margins: top 22mm, bottom 24mm, inside 24mm, outside 20mm.
// (inside/outside = binding-aware recto/verso alternation)

#let page-size    = "us-letter"
#let page-margin  = (top: 22mm, bottom: 24mm, inside: 24mm, outside: 20mm)
#let col-count    = 2
#let col-gap      = 7mm

// ── Header/Footer Content ────────────────────────────────────
#let header-classification = "TOP SECRET — VERDANT COVENANT — EYES ONLY"
#let footer-form-ref       = "FORM VC-1 · REV. 1987 · INTERNAL USE ONLY"
#let footer-copy-block     = "COPY NO. ___   PAGE "  // page num appended at render time

// ── Heading Style Function ───────────────────────────────────
// Headings: uppercase, olive family, Courier bold.

#let h1-style(body) = {
  block(
    width: 100%,
    above: 6mm,
    below: 2mm,
    stroke: (bottom: 2pt + clr-olive),
    inset: (x: 0pt, top: 2mm, bottom: 2mm),
    breakable: false,
  )[
    #text(
      font: font-heading, size: size-h1, weight: "bold", fill: clr-olive-deep
    )[#upper(body)]
  ]
}

#let h2-style(body) = {
  block(
    width: 100%,
    above: 6mm,
    below: 2mm,
    stroke: (bottom: 1pt + clr-olive-mid),
    inset: (x: 0pt, top: 1mm, bottom: 1mm),
    breakable: false,
  )[
    #align(center)[
      #text(font: font-heading, size: size-h2, weight: "bold", fill: clr-olive-darker)[#upper(body)]
    ]
  ]
}

#let h3-style(body) = {
  block(above: 6mm, below: 2mm, breakable: false)[
    #text(font: font-heading, size: size-h3, weight: "bold", style: "italic", fill: clr-olive-dark)[#body]
  ]
}

#let h4-style(body) = {
  block(above: 4mm, below: 2mm, breakable: false)[
    #text(font: font-heading, size: size-h4, style: "italic", fill: clr-olive)[#body]
  ]
}

// ── apply-theme: call at top of neon-relic.typ ───────────────
// Applies all set rules so documents just #import and call this.

#let apply-theme(doc) = {
  // Page
  set page(
    paper: page-size,
    margin: page-margin,
    background: rect(width: 100%, height: 100%, fill: clr-manila),
    columns: col-count,

    // Header (recto/verso via state — simplified to centered classification)
    header: {
      set text(font: font-body, size: size-header-sub, fill: clr-olive-light)
      box(width: 100%,
        grid(
          columns: (1fr, auto, 1fr),
          align(left)[#context counter(page).display()],
          align(center, text(size: 7pt, weight: "bold", fill: clr-deep-red)[#header-classification]),
          align(right)[],  // chapter title via headings — filled in ch template
        )
      )
      line(length: 100%, stroke: 0.5pt + clr-olive)
    },

    // Footer
    footer: {
      line(length: 100%, stroke: 1pt + clr-olive)
      v(3mm)
      set text(font: font-body, size: size-footer, fill: clr-tan-text)
      grid(
        columns: (1fr, 1fr),
        align(left)[#footer-form-ref],
        align(right)[#footer-copy-block #context counter(page).display() OF #context counter(page).final().first()],
      )
    },
  )

  // Body text
  set text(
    font: font-body,
    size: size-body,
    fill: clr-near-black,
    lang: "en",
  )
  set par(leading: leading-body, justify: true)

  // Block spacing
  set block(above: 0pt, below: 3mm)
  set list(marker: ([•], [–], [·]), indent: 4mm, spacing: 2mm)
  set enum(indent: 4mm, spacing: 2mm)

  // Links
  show link: it => text(fill: clr-link)[#it]

  // Heading styles (applied here so chapters just use = / == / ===)
  show heading.where(level: 1): it => h1-style(it.body)
  show heading.where(level: 2): it => h2-style(it.body)
  show heading.where(level: 3): it => h3-style(it.body)
  show heading.where(level: 4): it => h4-style(it.body)

  doc
}
