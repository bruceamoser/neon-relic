#import "layout.typ": current, mono, red, pine, mute, rule
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

// Keep each source passage intact and choose the most even reading-order split.
#let bands-for(items, gap) = {
  let bands = ()
  let reading = ()
  let band(items) = {
    if items.len() == 1 {
      (wide: block(width: page-width, items.first().body),)
    } else {
      let heights = items.map(it => it.height + gap)
      let total = heights.sum()
      let left = 0pt
      let closest = total
      let split = 1
      for i in range(1, items.len()) {
        left += heights.at(i - 1)
        let delta = calc.abs(total - 2 * left)
        if delta < closest { closest = delta; split = i }
      }
      let left = column(items.slice(0, split), column-width, gap)
      let right = column(items.slice(split), column-width, gap)
      (left: left, right: right, lh: measure(left).height, rh: measure(right).height)
    }
  }
  for item in items {
    if full(item.kind) {
      if reading.len() > 0 { bands.push(band(reading)); reading = () }
      bands.push((wide: block(width: page-width, item.body),))
    } else { reading.push(item) }
  }
  if reading.len() > 0 { bands.push(band(reading)) }
  bands
}

#let exhibit-picture(spec, width, height) = image("/book/art/" + spec.first() + ".png",
  width: width, height: height, fit: "contain", alt: spec.at(1))

#let exhibit-caption(spec, code) = block(inset: (left: 8pt), stroke: (left: 0.7pt + rule))[
  #mono(size: 7.6pt, fill: red)[COLLECTIONS / #code]
  #v(2pt)
  #text(size: 10pt, fill: pine, spec.at(1))
]

// The narrow exhibit occupies only the unprinted end of the shorter column.
#let inset-exhibit(spec, code, room) = {
  let width = column-width - 12pt
  let tall = room >= 112pt
  block(width: column-width, height: room, inset: (top: 5pt, bottom: 5pt), align(center + horizon, {
    if tall {
      let cap = block(width: width, align(center, mono(size: 7.6pt, fill: mute, spec.at(1))))
      let cap-height = measure(cap).height
      stack(dir: ttb, spacing: 4pt,
        align(center, exhibit-picture(spec, width - 10pt, calc.min(room - cap-height - 16pt, 230pt))), cap)
    } else {
      grid(columns: (1.55fr, 1fr), column-gutter: 6pt, align: horizon,
        align(center, exhibit-picture(spec, 100%, room - 15pt)), exhibit-caption(spec, code))
    }
  }))
}

#let leaf(bands, between, exhibits: (), code: "") = {
  let rows = ()
  for (i, band) in bands.enumerate() {
    if "wide" in band { rows.push(band.wide); continue }
    let left = band.left
    let right = band.right
    let slot = exhibits.find(it => it.band == i)
    if slot != none {
      let art = inset-exhibit(slot.spec, code, slot.room)
      if slot.left { left = stack(dir: ttb, left, art) }
      else { right = stack(dir: ttb, right, art) }
    }
    rows.push(grid(columns: (column-width, column-width), gutter: gutter, left, right))
  }
  stack(dir: ttb, spacing: between, ..rows)
}

#let open-columns(bands, extra) = {
  let slots = ()
  for (i, row) in bands.enumerate() {
    if "wide" in row { continue }
    let room = calc.abs(row.lh - row.rh) + if i == bands.len() - 1 {extra} else {0pt}
    slots.push((band: i, left: row.lh < row.rh, room: room))
  }
  slots.sorted(key: it => -it.room.pt())
}

// A broad shelf uses the full remaining height with its caption beside the object.
#let mounted-exhibit(spec, code, room) = {
  let natural = measure(image("/book/art/" + spec.first() + ".png", width: 100pt)).height
  if room >= 136pt and natural < 38pt {
    let caption = align(center, mono(size: 8pt, fill: mute, spec.at(1)))
    return block(width: page-width, height: room, align(center + horizon,
      stack(dir: ttb, spacing: 5pt,
        align(center, exhibit-picture(spec, page-width - 28pt, room - 30pt)), caption)))
  }
  let picture-width = calc.max(155pt, calc.min(room * 1.7, 326pt))
  let widths = (picture-width, 133pt)
  let cells = (align(center, exhibit-picture(spec, 100%, room - 14pt)), exhibit-caption(spec, code))
  if spec.at(2, default: none) == "right" { widths = widths.rev(); cells = cells.rev() }
  block(width: page-width, height: room, inset: (top: 6pt, bottom: 5pt), align(horizon + center,
    grid(columns: widths, column-gutter: 13pt, align: horizon, ..cells)))
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
      let mounts = exhibits.at("shelves").at(id, default: (:))
      let insets = exhibits.at("columns").at(id, default: (:))
      for start in mounts.keys() + insets.keys() {
        assert(keys.at(0) == start or start in starts, message: "No exhibit page at " + id + "/" + start)
      }
      for (a, b) in cuts.zip(cuts.slice(1)) {
        if a > 0 { pagebreak() }
        let spot = mounts.at(keys.at(a), default: none)
        let inset = insets.at(keys.at(a), default: none)
        let available = if spot == none {688pt} else {616pt}
        let passages = measured.slice(a, b)
        let page = none
        let bands = ()
        let separation = 0pt
        let height = 0pt
        // Add air where a folio has room, preserving its authored endpoints.
        let spacing = ((15pt, 23pt), (12pt, 18pt), (10pt, 14pt), (item-gap, band-gap))
        if passages.all(it => it.kind == "record") {
          spacing = ((25pt, 23pt), (20pt, 23pt)) + spacing
        }
        for (gap, between) in spacing {
          bands = bands-for(passages, gap)
          separation = between
          page = leaf(bands, between)
          height = measure(block(width: page-width, page)).height
          if height <= available { break }
        }
        assert(height <= 690pt, message: "Overflow in " + id + "/" + keys.at(a) + ": " + repr(height))
        let remaining = 690pt - height
        let slots = open-columns(bands, if spot == none {remaining} else {0pt})
        [#metadata((file: id, start: keys.at(a), height: height.pt(), room: remaining.pt(),
          columns: slots.map(it => it.room.pt()))) <reviewed-folio>]
        if inset != none {
          let specs = if type(inset.first()) == array {inset} else {(inset,)}
          let fits = slots.filter(it => it.room >= 61pt)
          assert(fits.len() >= specs.len(), message: "No open column at " + id + "/" + keys.at(a))
          let exhibits = fits.zip(specs).map(pair => pair.first() + (spec: pair.last(),))
          page = leaf(bands, separation, exhibits: exhibits, code: code)
        }
        block(width: page-width, breakable: false, {
          page
          if spot != none {
            let room = 690pt - height
            assert(room >= 61pt, message: "Insufficient exhibit space at " + id + "/" + keys.at(a))
            mounted-exhibit(spot, code, room)
          }
        })
      }
    }
  }
}
