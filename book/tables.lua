local function content(cell)
  return pandoc.write(pandoc.Pandoc(cell.contents), "typst"):gsub("%s+$", "")
end

local function matrix(tbl, spanning)
  local headers = tbl.head.rows[1].cells
  local first = pandoc.utils.stringify(headers[1])
  local widths = {}
  for _, spec in ipairs(tbl.colspecs) do
    widths[#widths + 1] = tostring(spec[2] or 1) .. "fr"
  end
  if first == "Division" and #headers == 4 then
    widths = {"1fr", "3fr", "35pt", "1fr"}
  end
  if spanning then
    local layouts = {
      ["Classification"] = {"1fr","1fr","4fr"}, ["Standing"] = {"0.75fr","4fr"},
      ["Division"] = {"1.2fr","2fr","3fr"}, ["Slot"] = {"1fr","1.6fr","2.2fr"},
      ["Trigger"] = {"1.5fr","1fr","3fr"},
      ["Age Group"] = {"1.3fr","1fr","1fr","1fr","1fr"},
      ["Skill"] = {"1fr","0.6fr","0.9fr","2.6fr"},
      ["Attribute"] = {"1fr","1fr","3fr"}, ["Dice Type"] = {"1fr","0.65fr","2.5fr","1fr"},
      ["Zone Range"] = {"1fr","1fr","1fr","2fr"}, ["Maneuver"] = {"1fr","1fr","3fr"},
      ["Cost"] = {"0.55fr","1.4fr","3fr"}, ["State"] = {"0.8fr","2fr","2fr"},
      ["Recovery Type"] = {"1fr","1.3fr","2.5fr"}, ["Roll"] = {"0.65fr","1.2fr","3fr"},
      ["Corruption"] = {"0.85fr","1fr","3.5fr"}, ["Method"] = {"1fr","1.1fr","3.9fr"},
      ["Vehicle"] = {"1.2fr","0.8fr","1fr","0.8fr","2.6fr"},
      ["Stage"] = {"0.6fr","0.9fr","4fr"}, ["Tier"] = {"0.55fr","1fr","3fr","1fr"},
      ["Condition"] = {"1.6fr","1.4fr","1fr","1fr"},
      ["Reward"] = {"1.2fr","0.85fr","3.5fr"},
    }
    if layouts[first] and #layouts[first] == #headers then widths = layouts[first] end
    if first == "Roll" and #headers == 2 then widths = {"36pt", "1fr"} end
  end
  if #headers == 3 and pandoc.utils.stringify(headers[3]) == "Reasoning" then
    widths = {"0.95fr", "35pt", "1.85fr"}
  end
  local parts = {"#table(columns: (" .. table.concat(widths, ", ") .. "),"}
  local function row(r, header)
    if header then parts[#parts + 1] = "table.header(" end
    for _, cell in ipairs(r.cells) do parts[#parts + 1] = "[" .. content(cell) .. "]," end
    if header then parts[#parts + 1] = ")," end
  end
  for _, r in ipairs(tbl.head.rows) do row(r, true) end
  for _, body in ipairs(tbl.bodies) do
    for _, r in ipairs(body.body) do row(r, false) end
  end
  parts[#parts + 1] = ")"
  local result = table.concat(parts, "\n")
  if first == "Classification" or (first == "Division" and pandoc.utils.stringify(headers[2]) == "Motto Segment") then
    result = "#set table(inset: (x: 6pt, y: 6pt))\n" .. result
  end
  if first == "Zone" and pandoc.utils.stringify(headers[2]) == "Distance" then
    result = "#set table(inset: (x: 5pt, y: 3pt))\n" .. result
  end
  return result
end

-- The marker is an inert Typst comment in nested panels such as a specimen.
local function panel(kind, title, code)
  return pandoc.RawBlock("typst", "// folio " .. kind .. " " .. title .. "\n" .. code)
end

function Table(tbl)
  local cells = tbl.head.rows[1].cells
  local first = pandoc.utils.stringify(cells[1])
  local second = pandoc.utils.stringify(cells[2])
  local full = #cells >= 3 and first ~= "STR"
  local long = {["Assignment Quality"]=true, ["Complication"]=true, ["Event"]=true,
    ["Breakdown Type"]=true, ["Compromise Type"]=true, ["Debriefing Question"]=true}
  return panel((full or long[second]) and "wide" or "table",
    first .. " " .. second, matrix(tbl, full))
end

local function typ(blocks)
  return pandoc.write(pandoc.Pandoc(blocks), "typst"):gsub("%s+$", "")
end

local function arg(value)
  return "[" .. value .. "]"
end

local function items(blocks)
  local result = {}
  for _, b in ipairs(blocks) do result[#result+1] = arg(typ({b})) end
  return "(" .. table.concat(result, ",") .. ",)"
end

-- Each lookup and its descriptions share the same Markdown table rows. Each
-- row publishes a location so that printed folios also work as PDF links.
local catalogs = {
  D66 = {columns={1,2}, paired=true, name=2},
  Talent = {columns={1,2,3}},
  Background = {columns={1,2}, paired=true},
  Item = {columns={1,3,4}},
  Weapon = {columns={1,2,3,4,5,7}},
  Supply = {columns={1,2,3}},
  Vehicle = {columns={1,2,3,4,5}},
  ["Improvised Item"] = {columns={1,2,3}},
  Artifact = {columns={1,2,3}},
  Member = {columns={1,2,3}},
}

local registers = {}

local function catalog_rows(div)
  if div.classes[1] ~= "catalog" then return end
  local id = div.attributes.register
  local records = registers[id] or {}
  registers[id] = records
  local tbl = div.content[1]
  local headers = tbl.head.rows[1].cells
  local kind = pandoc.utils.stringify(headers[1])
  local spec = assert(catalogs[kind], "Unknown catalog type: " .. kind)
  local name_col = spec.name or 1
  local result = {}
  for _, body in ipairs(tbl.bodies) do
    for _, row in ipairs(body.body) do
      local summary, labels, details, ratings = {}, {}, {}, {}
      local indexed = {}
      for _, col in ipairs(spec.columns) do
        indexed[col] = true
        local value, label = content(row.cells[col]), content(headers[col])
        if kind == "Background" and col == 2 then
          label = "Skill bonus"
          local bonus = row.cells[col].contents[1].content[1]
          assert(bonus.t == "Strong", "Expected a bold background skill bonus")
          value = typ({pandoc.Plain(bonus.content)}):gsub("%.$", "")
        end
        summary[#summary+1] = arg(value)
        labels[#labels+1] = arg(label)
        if col ~= name_col and kind ~= "D66" and kind ~= "Background" then
          ratings[#ratings+1] = "#strong[" .. label .. "] " .. value
        end
      end
      for col, cell in ipairs(row.cells) do
        if not indexed[col] or (kind == "Background" and col == 2) then
          local field = content(cell)
          if #headers - #spec.columns > 1 then field = "#strong[" .. content(headers[col]) .. "] " .. field end
          details[#details+1] = field
        end
      end
      local title = content(row.cells[name_col])
      if kind == "D66" then title = "D66 " .. content(row.cells[1]) .. "  /  " .. title end
      local key = pandoc.utils.stringify(row.cells[1]):lower()
      local dest = "record-" .. id .. "-" .. (#records + 1)
      records[#records+1] = {key=key, dest=dest, headers=labels, values=summary}
      result[#result+1] = string.format("#catalog-record(%q, %s, %s, %s)",
        dest, arg(title), arg(table.concat(ratings,"   ·   ")), arg(table.concat(details,"\n\n")))

    end
  end
  local blocks = pandoc.List()
  for _, code in ipairs(result) do blocks:insert(pandoc.RawBlock("typst", code)) end
  return blocks
end

local function print_registers(div)
  local kind = div.classes[1]
  if kind == "lookup" then
    local spec = assert(catalogs[div.attributes.kind])
    local records = assert(registers[div.attributes.register], "No entries for " .. div.attributes.register)
    table.sort(records, function(a,b) return a.key < b.key end)
    local rows = {}
    for _, r in ipairs(records) do
      rows[#rows+1] = string.format("(dest: label(%q), values: (%s,))", r.dest, table.concat(r.values,","))
    end
    local chart = string.format("#lookup(%q, (%s,), (%s,), paired: %s, injuries: %s)",
      div.attributes.title, table.concat(records[1].headers,","), table.concat(rows,","),
      spec.paired and "true" or "false", div.attributes.kind == "D66" and "true" or "false")
    return pandoc.RawBlock("typst", "// folio lookup " .. div.attributes.register .. "\n" .. typ(div.content) .. "\n" .. chart), false
  elseif kind == "wide" then
    local tbl = div.content:remove()
    assert(tbl.t == "Table", "A full-width comparison must end in a table")
    return pandoc.RawBlock("typst", "// folio wide " .. pandoc.utils.stringify(tbl.head.rows[1].cells[1]) .. " " .. pandoc.utils.stringify(tbl.head.rows[1].cells[2]) .. "\n" .. typ(div.content) .. "\n" .. matrix(tbl, true)), false
  end
end

function Div(div)
  local kind = div.classes[1]
  local b = div.content
  if kind == "pair" then
    return pandoc.RawBlock("typst", "#grid(columns: (1fr, 1fr), gutter: 18pt, "
      .. arg(typ(b[1].content)) .. ", " .. arg(typ(b[2].content)) .. ")")
  elseif kind == "spread-note" then
    local quote = b[1].content
    local title = typ({quote:remove(1)})
    local fields = pandoc.List()
    for _, field in ipairs(quote) do
      if field.t == "BulletList" then
        for _, item in ipairs(field.content) do fields:insert(pandoc.BulletList({item})) end
      else fields:insert(field) end
    end
    return panel("wide", pandoc.utils.stringify(b[1]):sub(1,48),
      "#spread-note(" .. arg(title) .. ", " .. items(fields) .. ")")
  elseif kind == "case-profile" then
    return panel("wide", b[1].identifier, string.format("#case-profile(%q, %q, %s)",
      div.attributes.item, div.attributes.caption, arg(typ(b))))
  elseif kind == "chart-note" then
    return panel("table", "Worked " .. pandoc.utils.stringify(b[1]):sub(1,45), typ(b))
  elseif kind == "equipment-print" then
    local caption = string.format("%q", div.attributes.caption)
    return pandoc.RawBlock("typst", "#block(width: 100%, breakable: false, above: 7pt, below: 7pt)["
      .. "#align(center, image(" .. string.format("%q", "/book/art/" .. div.attributes.item .. ".png")
      .. ", width: 80%, height: " .. (tonumber(div.attributes.height) or 125) .. "pt, fit: \"contain\", alt: " .. caption .. "))"
      .. "\n#mono(size: 8pt)[" .. div.attributes.caption .. "]]")
  elseif kind == "location" then
    return pandoc.RawBlock("typst", string.format("#location-print(%q, %q, %q, %q, height: %dpt)",
      div.attributes.photo, div.attributes.standalone, div.attributes.caption,
      div.attributes["standalone-caption"] or div.attributes.caption, tonumber(div.attributes.height)))
  elseif kind == "new-leaf" then
    return pandoc.RawBlock("typst", "#pagebreak(weak: true)")
  elseif kind == "keep" then
    return panel("keep", pandoc.utils.stringify(b[1]), typ(b))
  elseif kind == "transcript" then
    return b
  elseif kind == "report-slip" then
    local cells = {}
    for _, p in ipairs(b) do
      local name = pandoc.utils.stringify(p.content:remove(1))
      cells[#cells+1] = "[#mono(size: 7.8pt, fill: red)[" .. name:upper() ..
        "] #linebreak() " .. typ({p}) .. "]"
    end
    return pandoc.RawBlock("typst", "#report-slip((" .. table.concat(cells,",") .. ",))")
  elseif kind == "specimen" then
    local name = arg(typ({b:remove(1)}))
    local class = pandoc.utils.stringify(b:remove(1))
    local strip = arg(typ({b:remove(1)}))
    local identification = "none"
    if div.attributes.portrait == "full" then
      identification = arg(typ(b:remove(1).content))
    end
    local art = div.attributes.art and string.format("%q", div.attributes.art) or "none"
    local art_height = tonumber(div.attributes["art-height"])
    return pandoc.RawBlock("typst", "#specimen(" .. name .. ", " .. string.format("%q",class)
      .. ", " .. strip .. ", " .. items(b) .. ", art: " .. art
      .. (art_height and ", art-height: " .. art_height .. "pt" or "")
      .. ", identification: " .. identification .. ")")
  elseif kind == "faction" then
    local title = arg(typ({b:remove(1)}))
    local brief = {}
    while b[1].t ~= "Div" do brief[#brief+1] = b:remove(1) end
    local profile = b:remove(1).content
    local operative = b:remove(1).content
    local extra = "()"
    if b[1].t == "Div" then
      local supplement = b:remove(1).content
      if div.attributes.file == "01" then
        local context = supplement:remove(1)
        local closing = supplement:remove()
        extra = "(" .. arg(typ({context, closing})) .. "," .. arg(typ(supplement)) .. ",)"
      else
        extra = items(supplement)
      end
    end
    local args = {string.format("%q",div.attributes.file), string.format("%q",div.attributes.emblem),
      title, arg(typ(brief)), arg(typ(profile)), arg(typ(operative)), arg(typ(b)), extra}
    return pandoc.RawBlock("typst", "#faction(" .. table.concat(args,", ") .. ")")
  end
end

-- A key identifies the first passage on an edited page. Headings already
-- have manuscript IDs. Use a few opening words for passages without one.
local function slug(text)
  local words = {}
  for word in text:lower():gmatch("[a-z0-9]+") do
    words[#words+1] = word
    if #words == 7 then break end
  end
  return table.concat(words, "-")
end

local function folios(div)
  if div.classes[1] ~= "folios" then return end
  local nodes = div.content
  local units, named = {}, {}
  local function add(kind, key, body)
    local base = key
    named[base] = (named[base] or 0) + 1
    if named[base] > 1 then key = base .. "-" .. named[base] end
    units[#units+1] = string.format("(key: %q, kind: %q, body: [%s])", key, kind, body)
  end
  local function raw(node)
    return node and node.t == "RawBlock" and node.text or ""
  end
  local function marker(node)
    return raw(node):match("^// folio (%w+) ([^\n]+)")
  end
  local function chart(node)
    local kind = marker(node)
    return kind == "wide" or kind == "table" or kind == "lookup"
  end

  local opener = {nodes:remove(1)}
  while raw(nodes[1]):match("^#plate%(") or raw(nodes[1]):match("^#report%-slip%(") do
    opener[#opener+1] = nodes:remove(1)
  end
  add("open", "opening", typ(opener))
  local i, dossier = 1, false
  while i <= #nodes do
    local group, heading = {}, nil
    while nodes[i] and nodes[i].t == "Header" do
      if nodes[i].level <= 2 then dossier = false end
      heading = heading or nodes[i].identifier
      group[#group+1] = nodes[i]
      i = i + 1
    end
    local node = assert(nodes[i], "Heading without text in file " .. div.attributes.file)
    local following = nodes[i+1]
    if node.t == "Para" and following then
      local words = pandoc.utils.stringify(node)
      local choices = following.t == "OrderedList" or following.t == "BulletList"
      local first = node.content[1]
      local label = #node.content == 1 and (first.t == "Strong" or first.t == "Emph") and #words < 72
      local next_code = raw(following)
      local explains_label = following.t == "Para" or next_code:match("^#catalog%-record")
        or (following.t == "BlockQuote" and words:lower():find("talents"))
      local ends_in_colon = words:match(":$")
      local introduces_chart = chart(following) and not next_code:match("\n=+ ") and (heading or ends_in_colon)
      if (label and explains_label) or introduces_chart or (choices and ends_in_colon)
          or (heading and next_code:match("^#specimen")) then
        group[#group+1] = node
        i, node = i+1, following
      end
    end
    group[#group+1] = node
    local kind, caption = marker(node)
    local code = raw(node)
    local key = heading or (caption and slug(caption))
    if code:match("^#catalog%-record") then
      kind = "record"
      key = key or code:match('^#catalog%-record%("([^"]+)"')
    elseif code:match("^#specimen") then
      kind = "specimen"
      key = key or code:match("<([^<>]+)>")
    elseif code:match("^#collection%-print") or code:find("/book/art/", 1, true) and code:match("^#block") then
      kind = "art"
      key = key or slug(code:match('/book/art/([^.]+)') or "exhibit")
    end
    key = key or slug(pandoc.utils.stringify(node))
    assert(key ~= "", "Empty page key for " .. typ(group))
    local body = typ(group)
    if code:find("#case-profile(", 1, true) then dossier = true end
    if dossier then body = "#set par(leading: 0.42em, spacing: 0.7em)\n" .. body end
    add(kind or "text", key, body)
    i = i + 1
  end
  return pandoc.RawBlock("typst", string.format("#folio-file(%q, %q, %q, (\n%s,\n))",
    div.attributes.file, div.attributes.code, div.attributes.access, table.concat(units,",\n")))
end

return {{Div = catalog_rows}, {traverse = "topdown", Div = print_registers},
        {Table = Table, Div = Div}, {Div = folios}}
