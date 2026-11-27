#import "layout.typ": *
#set document(title: if sys.inputs.at("edition") == "manual" { "Project Neon Relic: Core Operations Manual" } else { "The Spear That Went Dark" }, author: ("Bruce Moser", "Stewart Voit"), description: "An occult investigation roleplaying game set in the alternate 1980s. Published by OmniscientForge LLC.")
#set text(font: "EB Garamond", size: 11pt, fill: ink, lang: "en")
#set par(leading: 0.52em, spacing: 0.85em)
#set page(paper: "us-letter", margin: (x: 51pt, top: 52pt, bottom: 50pt), fill: paper,
  background: context page-frame(),
  header: context {
    let opening = query(heading.where(level: 1)).find(it => it.location().page() == here().page())
    running-head(if opening == none {current.get()} else {current.at(opening.location())})
  },
  footer: context running-foot(current.get()))
#set text(costs: (widow: 100%, orphan: 100%))
#show heading.where(level: 1): it => block(above: 0pt, below: 13pt, width: 100%)[
  #text(size: 33pt, weight: "semibold", fill: pine, it.body)
  #v(-3pt)
  #line(length: 100%, stroke: 1.3pt + pine)
]
#show heading.where(level: 2): it => block(above: 15pt, below: 7pt, sticky: true,
  text(size: 15.5pt, weight: "bold", fill: pine, it.body))
#show heading.where(level: 3): it => block(above: 12pt, below: 5pt, sticky: true,
  text(size: 12.8pt, weight: "bold", fill: red, it.body))
#show heading.where(level: 4): it => block(above: 9pt, below: 4pt, sticky: true, strong(it.body))
#show link: set text(fill: pine)
#show quote.where(block: true): it => block(width: 100%, fill: rgb("#eeefe7"),
  stroke: (left: 2pt + pine), inset: (x: 11pt, y: 7pt), it.body)
#set table(inset: (x: 5pt, y: 4pt), stroke: (x: none, y: 0.35pt + rule),
  fill: (_, y) => if y == 0 { pine } else if calc.odd(y) { rgb("#f0f1ea") })
#set table.cell(breakable: false)
#show table.cell: set text(size: 9.3pt)
#show table.cell.where(y: 0): set text(fill: white, weight: "bold")
#show table: set par(leading: 0.42em)
#if sys.inputs.at("edition") == "manual" { cover() }
#include sys.inputs.at("body")
