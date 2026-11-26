-- Long catalogs read down a column as named entries. Comparison matrices retain
-- their horizontal axes. The range chart spans the two text columns.
local function content(cell)
  return pandoc.write(pandoc.Pandoc(cell.contents), "typst"):gsub("%s+$", "")
end

local function entry_rows(tbl, headers)
  local first = pandoc.utils.stringify(headers[1])
  local first_label = (first == "STR" or first == "D66") and (first .. " ") or ""
  local parts = {}
  for _, body in ipairs(tbl.bodies) do
    for _, row in ipairs(body.body) do
      local fields = {}
      for i, cell in ipairs(row.cells) do
        if i > 1 then
          fields[#fields + 1] = "#strong[" .. content(headers[i]) .. "] " .. content(cell)
        end
      end
      parts[#parts + 1] = "#entry([" .. (first_label .. content(row.cells[1])) .. "], ["
        .. table.concat(fields, " #linebreak() ") .. "])"
    end
  end
  return pandoc.RawBlock("typst", table.concat(parts, "\n"))
end

local function matrix(tbl, spanning)
  local headers = tbl.head.rows[1].cells
  local first = pandoc.utils.stringify(headers[1])
  local widths = {}
  for _, spec in ipairs(tbl.colspecs) do
    widths[#widths + 1] = tostring(spec[2] or 1) .. "fr"
  end
  if first == "Division" and #headers == 4 then
    widths = {"auto", "1fr", "auto", "49pt"}
  end
  if spanning then
    local layouts = {
      ["Age Group"] = {"1.3fr","1fr","1fr","1fr","1fr"},
      ["Skill"] = {"1fr","0.6fr","0.9fr","2.6fr"},
      ["Attribute"] = {"1fr","1fr","3fr"}, ["Dice Type"] = {"1fr","0.65fr","2.5fr","1fr"},
      ["Zone Range"] = {"1fr","1fr","1fr","2fr"}, ["Maneuver"] = {"1fr","1fr","3fr"},
      ["Cost"] = {"0.55fr","1.4fr","3fr"}, ["State"] = {"0.8fr","2fr","2fr"},
      ["Recovery Type"] = {"1fr","1.3fr","2.5fr"}, ["Roll"] = {"0.65fr","1.2fr","3fr"},
      ["Corruption"] = {"0.85fr","1fr","3.5fr"}, ["Method"] = {"1fr","1.4fr","2fr"},
      ["Vehicle"] = {"1.2fr","0.8fr","1fr","0.8fr","2.6fr"},
      ["Stage"] = {"0.6fr","0.9fr","4fr"}, ["Tier"] = {"0.55fr","1fr","3fr","1fr"},
      ["Condition"] = {"1.6fr","1.4fr","1fr","1fr"},
      ["Reward"] = {"1.2fr","0.85fr","3.5fr"},
    }
    if layouts[first] and #layouts[first] == #headers then widths = layouts[first] end
    if first == "Roll" and #headers == 2 then widths = {"36pt", "1fr"} end
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
  return result
end

function Table(tbl)
  local headers = tbl.head.rows[1].cells
  local first = pandoc.utils.stringify(headers[1])
  local wide = #headers >= 4
  local matrices = {["STR"]=true, ["Tier"]=true, ["Division"]=true}
  if wide and not matrices[first] then return entry_rows(tbl, headers) end
  return pandoc.RawBlock("typst", matrix(tbl))
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
    return pandoc.RawBlock("typst", "]\n" .. typ(div.content) .. "\n" .. chart .. "\n#reading["), false
  elseif kind == "wide" then
    local tbl = div.content:remove()
    assert(tbl.t == "Table", "A full-width comparison must end in a table")
    return pandoc.RawBlock("typst", "]\n" .. typ(div.content) .. "\n" .. matrix(tbl, true) .. "\n#reading["), false
  end
end

function Div(div)
  local kind = div.classes[1]
  local b = div.content
  if kind == "pair" then
    return pandoc.RawBlock("typst", "#grid(columns: (1fr, 1fr), gutter: 18pt, "
      .. arg(typ(b[1].content)) .. ", " .. arg(typ(b[2].content)) .. ")")
  elseif kind == "equipment-print" then
    local caption = string.format("%q", div.attributes.caption)
    return pandoc.RawBlock("typst", "#block(width: 100%, breakable: false, above: 7pt, below: 7pt)["
      .. "#align(center, image(" .. string.format("%q", "/book/art/" .. div.attributes.item .. ".png")
      .. ", width: 80%, height: 125pt, fit: \"contain\", alt: " .. caption .. "))"
      .. "\n#mono(size: 8pt)[" .. div.attributes.caption .. "]]")
  elseif kind == "location" then
    return pandoc.RawBlock("typst", string.format("#location-print(%q, %q, height: %dpt)",
      div.attributes.photo, div.attributes.caption, tonumber(div.attributes.height)))
  elseif kind == "new-leaf" then
    return pandoc.RawBlock("typst", "#pagebreak(weak: true)")
  elseif kind == "keep" then
    return pandoc.RawBlock("typst", "#block(width: 100%, breakable: false)[" .. typ(b) .. "]")
  elseif kind == "transcript" then
    local paragraphs = {}
    for _, para in ipairs(b) do
      paragraphs[#paragraphs+1] = "#block(width: 100%, breakable: false, below: 4pt)[" .. typ({para}) .. "]"
    end
    return pandoc.RawBlock("typst", table.concat(paragraphs, "\n"))
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
    return pandoc.RawBlock("typst", "#specimen(" .. name .. ", " .. string.format("%q",class)
      .. ", " .. strip .. ", " .. items(b) .. ", art: " .. art .. ", identification: " .. identification .. ")")
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

-- Keep a short instruction and its choices together when a column turns over.
local function keep_choices(blocks)
  local out = pandoc.List()
  for _, b in ipairs(blocks) do
    if (b.t == "BulletList" or b.t == "OrderedList") and #b.content > 1 then
      local words = 0
      for _ in pandoc.utils.stringify(b):gmatch("%S+") do words = words + 1 end
      if words < 72 then
        local group = pandoc.List({b})
        local prev = out[#out]
        if prev and prev.t == "Para" and pandoc.utils.stringify(prev):match(":$") then
          group:insert(1, out:remove())
        end
        if out[#out] and out[#out].t == "Header" and out[#out].level > 1 then
          group:insert(1, out:remove())
        end
        b = pandoc.RawBlock("typst", "#block(width: 100%, breakable: false)[" .. typ(group) .. "]")
      end
    end
    out:insert(b)
  end
  return out
end

-- Wide elements delimit the reading runs that need a balanced last column.
-- Keep the Pandoc nodes intact until this point so headings travel with text.
local function balance_before_tables(doc)
  local out, run = pandoc.List(), nil
  for _, b in ipairs(doc.blocks) do
    local raw = b.t == "RawBlock" and b.format == "typst" and b.text or ""
    local chart = raw:match("^%]\n(.*)\n#reading%[$")
    if raw == "#reading[" then
      run = pandoc.List()
    elseif run and chart then
      if #run > 0 then
        local groups, pending = {}, {}
        for _, node in ipairs(run) do
          pending[#pending+1] = node
          if node.t ~= "Header" then
            groups[#groups+1] = arg(typ(pending))
            pending = {}
          end
        end
        if #pending > 0 then groups[#groups+1] = arg(typ(pending)) end
        out:insert(pandoc.RawBlock("typst", "#before-chart((" .. table.concat(groups,",") .. ",))"))
      end
      out:insert(pandoc.RawBlock("typst", chart .. "\n#reserve-reading()"))
      run = pandoc.List()
    elseif run and raw == "]" then
      out:insert(pandoc.RawBlock("typst", "#reading["))
      out:extend(run)
      out:insert(b)
      run = nil
    elseif run then
      run:insert(b)
    else
      out:insert(b)
    end
  end
  assert(not run, "Unclosed reading columns")
  doc.blocks = out
  return doc
end

return {{Div = catalog_rows}, {traverse = "topdown", Div = print_registers}, {Table = Table, Div = Div}, {Blocks = keep_choices}, {Pandoc = balance_before_tables}}
