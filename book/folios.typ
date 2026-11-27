#import "layout.typ": current, mono, red, pine, rule
#let turns = yaml("folios.yml")
#let exhibits = yaml("folio-art.yml")
#let page-width = 510pt
#let gutter = 22pt
#let column-width = (page-width - gutter) / 2
#let item-gap = 8pt
#let band-gap = 11pt
#let full(kind) = kind in ("open", "wide", "lookup", "specimen")

#let column(items, width, gap) = stack(dir: ttb, spacing: gap,
  ..items.map(it => block(width: width, it.body)))

#let reading-band(items, gap) = {
  if items.len() == 1 {
    // Between full-width charts a lone lead or note can use the entire measure.
    block(width: page-width, items.first().body)
  } else {
    let total = items.map(it => it.height + gap).sum()
    let left = 0pt
    let closest = total
    let split = 1
    for i in range(1, items.len()) {
      left += items.at(i - 1).height + gap
      let delta = calc.abs(total - 2 * left)
      if delta < closest { closest = delta; split = i }
    }
    grid(columns: (column-width, column-width), gutter: gutter,
      column(items.slice(0, split), column-width, gap), column(items.slice(split), column-width, gap))
  }
}

#let leaf(items, gap: item-gap, between: band-gap) = {
  let bands = ()
  let reading = ()
  for item in items {
    if full(item.kind) {
      if reading.len() > 0 { bands.push(reading-band(reading, gap)); reading = () }
      bands.push(block(width: page-width, item.body))
    } else { reading.push(item) }
  }
  if reading.len() > 0 { bands.push(reading-band(reading, gap)) }
  stack(dir: ttb, spacing: between, ..bands)
}

// Mount an object in the space deliberately left below the last reading band.
#let mounted-exhibit(spec, code, room) = {
  let height = calc.min(room - 19pt, 214pt)
  let picture = align(center, image("/book/art/" + spec.first() + ".png", width: 96%,
    height: height, fit: "contain", alt: spec.last()))
  let caption = block(inset: (x: 9pt), stroke: (left: 0.8pt + rule))[
    #mono(size: 7.8pt, fill: red)[COLLECTIONS / #code]
    #v(3pt)
    #text(size: 11pt, fill: pine, spec.last())
  ]
  v(8pt)
  align(center, grid(columns: (calc.max(108pt, calc.min(room * 1.5, 243pt)), 155pt), column-gutter: 10pt, align: horizon, picture, caption))
}

#let folio-file(id, code, access, items) = {
  pagebreak(weak: true)
  current.update((code: code, access: access))
  set par(leading: 0.44em) if id == "22"
  let opening = items.first()
  opening.body = [
    #block(above: 0pt, below: 9pt, mono(size: 9pt, fill: red)[#code  /  #access])
    #opening.body
  ]
  items.first() = opening
  context {
    let measured = items.map(it => it + (height: measure(block(width: column-width, it.body)).height,))
    if sys.inputs.at("folio-proof", default: "") == "measure" {
      let sizes = measured.map(it => (key: it.key, kind: it.kind, narrow: it.height.pt(),
        wide: measure(block(width: page-width, it.body)).height.pt()))
      [#metadata((file: id, items: sizes)) <folio-measure>]
      for it in items { block(width: page-width, it.body) }
    } else {
      let starts = turns.at(id, default: ())
      let keys = measured.map(it => it.key)
      let cuts = (0,)
      for start in starts {
        let cut = keys.position(it => it == start)
        assert(cut != none and cut > cuts.last(), message: "Check the page starting at " + id + "/" + start)
        cuts.push(cut)
      }
      cuts.push(items.len())
      let mounts = exhibits.at(id, default: (:))
      for start in mounts.keys() {
        assert(keys.at(0) == start or start in starts, message: "No exhibit page at " + id + "/" + start)
      }
      for (a, b) in cuts.zip(cuts.slice(1)) {
        if a > 0 { pagebreak() }
        let spot = mounts.at(keys.at(a), default: none)
        let available = if spot == none {688pt} else {616pt}
        let passages = measured.slice(a, b)
        let page = none
        let height = 0pt
        // Add air where a folio has room, preserving its authored endpoints.
        let spacing = ((15pt, 23pt), (12pt, 18pt), (10pt, 14pt), (item-gap, band-gap))
        if passages.all(it => it.kind == "record") {
          spacing = ((25pt, 23pt), (20pt, 23pt)) + spacing
        }
        for (gap, between) in spacing {
          page = leaf(passages, gap: gap, between: between)
          height = measure(block(width: page-width, page)).height
          if height <= available { break }
        }
        assert(height <= 690pt, message: "Overflow in " + id + "/" + keys.at(a) + ": " + repr(height))
        [#metadata((file: id, start: keys.at(a), height: height.pt())) <reviewed-folio>]
        block(width: page-width, breakable: false, {
          page
          if spot != none {
            let room = 690pt - height
            assert(room >= 64pt, message: "Insufficient exhibit space at " + id + "/" + keys.at(a))
            mounted-exhibit(spot, code, room)
          }
        })
      }
    }
  }
}
