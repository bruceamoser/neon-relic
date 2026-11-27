#let pine = rgb("#263d32")
#let ink = rgb("#262c28")
#let red = rgb("#872e2a")
#let mute = rgb("#59675e")
#let rule = rgb("#a2ab9f")
#let paper = rgb("#f8f5ea")
#let mono(body, size: 9pt, fill: pine) = text(font: "Courier Prime", size: size, fill: fill, body)
#let current = state("file", (code: "VC-1", access: "COVENANT PERSONNEL"))

#let cover() = {
  set page(margin: 0pt, header: none, footer: none, background: image("/book/art/cover.jpg", width: 100%, height: 100%))
  place(top + center, dx: -16pt, dy: 38pt,
    mono(size: 7.5pt, fill: white)[T O P  S E C R E T   /   V E R D A N T  C O V E N A N T   /   E Y E S  O N L Y])
  place(top + left, dx: 80pt, dy: 93pt, block(stroke: 0.7pt + pine, inset: 8pt,
    mono(size: 8.7pt)[DOCUMENT CONTROL / VC–1 \
    CLASSIFICATION: TOP SECRET \
    ORIGIN: THE VERDANT COVENANT]))
  place(top + left, dx: 78pt, dy: 279pt, block(width: 408pt)[
    #mono(size: 10pt)[FIELD OPERATIONS DIVISION]
    #v(7pt)
    #text(size: 63pt, weight: "semibold", fill: pine, tracking: 0.6pt)[NEON RELIC]
    #v(-4pt)
    #line(length: 100%, stroke: 1.4pt + pine)
    #v(5pt)
    #mono(size: 15pt)[CORE OPERATIONS MANUAL]
  ])
  place(top + left, dx: 275pt, dy: 471pt, rotate(-9deg, box(stroke: 2pt + red, radius: 3pt, inset: (x: 11pt, y: 5pt),
    text(font: "Special Elite", size: 31pt, top-edge: "bounds", bottom-edge: "bounds", fill: red)[TOP SECRET])))
  place(top + left, dx: 78pt, dy: 611pt, block(width: 244pt, stroke: 0.6pt + pine, inset: 9pt,
    mono(size: 9pt)[PREPARED BY \
    #text(size: 12pt, weight: "bold")[Bruce Moser and Stewart Voit] \
    DISTRIBUTION: COVENANT PERSONNEL]))
  pagebreak()
}
#let file-open(code, access) = {
  pagebreak(weak: true)
  current.update((code: code, access: access))
  block(above: 0pt, below: 9pt, mono(size: 9pt, fill: red)[#code  /  #access])
}

#let plate(path, caption, height: 240pt) = block(width: 100%, above: 5pt, below: 10pt)[
  #image(path, width: 100%, height: height, fit: "cover", alt: caption)
  #v(-2pt)
  #mono(size: 8pt)[#caption]
]
#let band(body, color: pine) = block(width: 100%, fill: color, inset: (x: 7pt, y: 3pt),
  mono(size: 8pt, fill: white, body))
#let page-frame() = {
  // A routing rule in the outer margin leaves the type area clear.
  let odd = calc.odd(here().page())
  place(top + if odd {right} else {left}, dx: if odd {-19pt} else {19pt}, dy: 50pt,
    line(start: (0pt, 0pt), end: (0pt, 692pt), stroke: 0.35pt + rule))
  place(top + if odd {right} else {left}, dx: if odd {39pt} else {-39pt}, dy: 178pt,
    rotate(if odd {90deg} else {-90deg}, mono(size: 7.3pt, fill: mute)[VC ARCHIVE   /   EYES ONLY   /   1987]))
  place(top + if odd {right} else {left}, dx: if odd {-16pt} else {16pt}, dy: 56pt,
    rect(width: 6pt, height: 34pt, fill: red, stroke: none))
}
#let running-head(file) = block(width: 100%)[
  #grid(columns: (auto, 1fr, auto), align: horizon, gutter: 7pt,
    box(fill: red, inset: (x: 7pt, y: 3pt), mono(size: 8.4pt, fill: white)[TOP SECRET]),
    mono(size: 8.2pt)[VERDANT COVENANT / FIELD OPERATIONS], mono(size: 8pt)[#file.access])
  #v(-3pt)
  #line(length: 100%, stroke: 1pt + pine)
]
#let running-foot(file) = block(width: 100%)[
  #line(length: 100%, stroke: 0.7pt + pine)
  #v(-1pt)
  #grid(columns: (1fr, auto, 1fr), align: (left, center, right),
    mono(size: 8pt)[VC–1 / #file.code], mono(size: 7.5pt, fill: mute)[CONTROLLED COPY],
    mono(size: 8pt)[FOLIO #counter(page).display("1")])
]
#let contents() = {
  set par(leading: 0.44em, spacing: 0.55em)
  file-open("INDEX", "COVENANT PERSONNEL")
  text(size: 35pt, fill: pine, weight: "semibold")[File register]
  v(3pt)
  grid(columns: (61pt, 1fr, auto), mono(size: 8pt)[FILE NO.],
    mono(size: 8pt)[SUBJECT / OPERATIONS MANUAL], mono(size: 8pt)[FOLIO])
  v(4pt)
  context {
    let files = query(heading.where(level: 1))
    let groups = ("FILE 00": "INTAKE AND ORIENTATION", "FILE 02": "AGENT OPERATIONS",
      "FILE 14": "DIRECTOR FILES", "FILE 21": "REFERENCE AND LICENSE")
    for h in files {
      let code = current.at(h.location()).code
      if code in groups { band(groups.at(code)) }
      let code = code.replace("FILE ", "")
      link(h.location(), block(width: 100%, inset: (x: 7pt, y: 3.6pt), stroke: (bottom: 0.35pt + rule))[
        #grid(columns: (55pt, 1fr, 30pt), align: horizon,
          mono(size: 8pt)[#code], text(size: 10.9pt, h.body),
          align(right, mono(size: 9pt)[#counter(page).at(h.location()).first()]))
      ])
    }
  }
}
// The credits sleeve is centered below the two columns of publication details.
#let credits-sleeve() = context {
  let description = "A Covenant archive sleeve and microfiche"
  let room = 735pt - here().position().y
  let height = calc.min(room - 53pt, 195pt)
  let mount = block(width: 232pt, inset: (x: 6pt, y: 3pt), stroke: (top: 0.55pt + rule))[
    #mono(size: 7.4pt, fill: red)[COLLECTIONS / #current.get().code]
    #v(2pt)
    #align(center, image("/book/art/microfiche.png", height: height, width: 98%, fit: "contain", alt: description))
    #v(1pt)
    #mono(size: 8pt)[#description]
  ]
  place(center, dy: (room - height - 45pt) / 2, mount)
}

#let report-slip(rows) = block(width: 100%, stroke: 0.7pt + pine, below: 10pt)[
  #band([RECOVERY DIVISION / TRANSCRIPT CONTROL])
  #grid(columns: (1.1fr, 1fr, 1.45fr, 0.85fr), stroke: 0.35pt + rule, inset: 6pt, ..rows)
]
#let split-fields(items, w, gap: 5pt) = {
  let heights = items.map(it => measure(block(width: w, it)).height + gap)
  let split = 1
  let best = 100000pt
  for cut in range(1, items.len()) {
    let delta = calc.abs(heights.slice(0, cut).sum() - heights.slice(cut).sum())
    if delta < best { best = delta; split = cut }
  }
  let column(items) = stack(dir: ttb, spacing: gap, ..items.map(it => block(width: 100%, it)))
  grid(columns: (1fr, 1fr), column-gutter: 16pt,
    column(items.slice(0, split)), column(items.slice(split)))
}
#let specimen(title, class, scores, items, art: none, art-height: auto, identification: none) = block(width: 100%, breakable: false,
    stroke: 0.9pt + pine, fill: rgb("#fcfaf2"), inset: 0pt, above: 5pt, below: 7pt)[
  #set text(size: if identification != none {12pt} else if art in ("vessel","echo") {11.4pt} else {10.5pt})
  #set par(leading: 0.35em, spacing: 0.4em)
  #band([ADVERSARY RECORD #h(1fr) #upper(class)])
  #block(width: 100%, inset: (x: 11pt, top: 7pt, bottom: 9pt))[
    #show heading.where(level: 3): it => block(above: 0pt, below: 3pt, text(size: 19pt, weight: "semibold", fill: pine, it.body))
    #title
    #scores
    #v(3pt)
    #layout(size => {
      let fields = items
      if identification != none {
        grid(columns: (1fr, 1fr), gutter: 15pt, align: horizon,
          align(center, image("/book/art/" + art + ".png", height: 268pt, width: 100%, fit: "contain", alt: "Field sketch: " + art.replace("-", " "))),
          block(width: 100%)[#band[IDENTIFICATION] #v(5pt) #identification])
        v(8pt)
        band[OBSERVED ABILITIES AND BEHAVIOR]
        v(6pt)
      } else if art != none {
        let height = if art-height != auto {art-height} else if art in ("vessel","echo") {252pt} else {142pt}
        fields.insert(3, align(center, image("/book/art/" + art + ".png", width: 88%, height: height, fit: "contain", alt: "Field sketch: " + art.replace("-", " "))))
      }
      split-fields(fields, (size.width - 16pt) / 2, gap: if identification != none {10pt} else {5pt})
    })
  ]
]
#let surveillance(emblem) = context {
  let evidence = (
    compact: ("compact-handoff", "Ferry terminal / A broker exchanges a packet at the ticket window."),
    accord: ("accord-vigil", "Municipal gymnasium / Witnesses assemble before activation."),
    majestic: ("majestic-convoy", "Federal road closure / Unmarked vehicles escort the transport."),
    hellfire: ("hellfire-reception", "Private reception / An object from the collection changes hands."),
  ).at(emblem)
  v(8pt)
  block(width: 100%, height: 1fr, image("/book/art/" + evidence.first() + ".jpg",
    width: 100%, height: 100%, fit: "cover", alt: evidence.last()))
  block(above: 2pt, mono(size: 7.8pt)[SURVEILLANCE PRINT / #evidence.last()])
}

#let faction(file, emblem, title, brief, profile, operative, assessment, supplement) = {
  if file != "01" { pagebreak() }
  set par(leading: 0.4em, spacing: 0.6em)
  let compact = file == "03"
  let tall = if compact {128pt} else if file == "01" {115pt} else {235pt}
  let dark = (compact: rgb("#343934"), accord: rgb("#823e2e"), majestic: rgb("#28454b"), hellfire: rgb("#654637")).at(emblem)
  band(color: dark)[EXTERNAL ORGANIZATIONS #h(1fr) INTELLIGENCE DOSSIER 17 / #file]
  block(width: 100%, stroke: (bottom: 0.9pt + dark), inset: (x: 9pt, y: 6pt))[
    #grid(columns: (1fr, if file in ("02", "04") {185pt} else {145pt}), align: horizon, gutter: 12pt, [
      #mono(size: 8pt, fill: red)[SUBJECT IDENTIFICATION]
      #show heading.where(level: 2): it => block(above: 7pt, below: 7pt, text(size: 26pt, weight: "semibold", fill: dark, it.body))
      #title
      #brief
    ], align(center, image("/book/art/" + emblem + ".png", width: if file in ("02", "04") {182pt} else {133pt}, height: tall, fit: "contain", alt: "Insignia: " + emblem)))
  ]
  v(if compact {5pt} else {10pt})
  grid(columns: (1fr, 1fr), gutter: 16pt, [
    #band(color: dark)[OBSERVED BEHAVIOR]
    #profile
  ], [
    #band(color: dark)[PERSONNEL PROFILE]
    #operative
    #v(4pt)
    #block(inset: (x: 7pt, y: 4pt), stroke: (left: 2pt + dark), emph(assessment))
  ])
  if supplement.len() > 0 {
    v(5pt)
    band(color: dark)[INTELLIGENCE NOTES]
    set text(size: if compact {10.3pt} else {10.6pt})
    layout(size => split-fields(supplement, (size.width - 16pt) / 2))
  }
  surveillance(emblem)
}


#let location-print(name, standalone, caption, standalone-caption, height: 110pt) = {
  let separate = sys.inputs.at("edition") == "mission"
  let file = if separate {standalone} else {name}
  let label = if separate {standalone-caption} else {caption}
  block(width: 100%, above: 7pt, below: 6pt)[
    #image("/book/art/" + file, width: 100%, height: height,
      fit: if file.ends-with(".png") {"contain"} else {"cover"}, alt: label)
    #v(-1pt)
    #mono(size: 7.6pt, fill: mute)[#label]
  ]
}

#let reading(body) = columns(2, gutter: 22pt, body)

#let catalog-record(id, name, ratings, prose) = block(
  width: 100%, inset: (top: 6pt, bottom: 4pt), stroke: (top: 0.55pt + rule),
  above: 8pt, below: 8pt, breakable: false,
)[
  #metadata(id) #label(id)
  #text(size: 12.5pt, fill: pine, weight: "semibold", name)
  #if ratings != [] {block(above: 3pt, below: 4pt, text(size: 9.7pt, fill: mute, ratings))}
  #block(above: 4pt, prose)
]

#let lookup(title, headers, records, paired: false, injuries: false) = {
  block(sticky: true, above: 8pt, below: 4pt, band([QUICK REFERENCE  /  #upper(title)]))
  let labels = headers + ([Folio],)
  let count = labels.len()
  let cells = ()
  let fold = if paired {calc.ceil(records.len() / 2)} else {records.len()}
  for i in range(fold) {
    for side in range(if paired {2} else {1}) {
      if side > 0 { cells.push(table.cell(fill: paper, stroke: none, [])) }
      let j = i + side * fold
      if j >= records.len() { cells += ([],) * count; continue }
      let r = records.at(j)
      let dest = r.dest
      for v in r.values { cells.push(link(dest, v)) }
      cells.push(link(dest, mono(size: 8.6pt)[#context counter(page).at(dest).first()]))
    }
  }
  let widths = if title.ends-with("talents") and not paired {(2fr, 1.1fr, 1fr, 38pt)} else if injuries {(auto, 1fr, auto)} else if paired {(1.5fr, 1fr, auto)} else {
    (1.8fr,) + (auto,) * (count - 2) + (38pt,)
  }
  let headers = labels
  if paired { widths += (10pt,) + widths; headers += (table.cell(fill: paper, stroke: none, []),) + labels }
  table(columns: widths, inset: (x: 5pt, y: 3pt), table.header(..headers), ..cells)
}

#let collection-print(name, caption, height: 111pt) = block(width: 100%, inset: (x: 5pt, y: 4pt),
  stroke: (top: 0.55pt + rule))[
  #mono(size: 7.4pt, fill: red)[COLLECTIONS / FIELD EXHIBIT]
  #v(3pt)
  #align(center, image("/book/art/" + name + ".png", width: 94%, height: height, fit: "contain", alt: caption))
  #v(2pt)
  #mono(size: 8pt)[#caption]
]

#let case-profile(item, caption, body) = block(width: 100%, stroke: (bottom: 0.65pt + rule))[
  #band[PERSONNEL / COMPLETED AGENT DOSSIER]
  #grid(columns: (1fr, 148pt), gutter: 14pt, align: horizon,
    body, block(width: 100%, inset: (y: 3pt))[
      #align(center, image("/book/art/" + item + ".png", width: 90%, height: 54pt, fit: "contain", alt: caption))
      #align(center, mono(size: 7.6pt)[#caption])
    ])
]

#let spread-note(title, items) = block(width: 100%, fill: rgb("#eeefe7"),
    stroke: (left: 2pt + pine), inset: (x: 11pt, y: 8pt))[
  #title
  #v(4pt)
  #layout(size => split-fields(items, (size.width - 16pt) / 2))
]
