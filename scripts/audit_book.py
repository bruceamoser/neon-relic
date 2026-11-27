"""Check the printed playtest changes and release inventory using Poppler."""
from collections import Counter
import hashlib
from pathlib import Path
import re
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from build_book import BOOK, CHAPTERS, DIST, MISSION


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def pdf_text(data):
    result = subprocess.run(["pdftotext", "-", "-"], input=data, capture_output=True, check=True)
    return result.stdout.decode("utf-8")


def check_illustrations(pdf, edition, seen):
    """Compare the printed pictures, including transparency, across both editions."""
    listing = subprocess.check_output(["pdfimages", "-list", "-"], input=pdf).decode()
    rows = [line.split() for line in listing.splitlines()[2:]]
    total = 0
    with TemporaryDirectory() as directory:
        prefix = Path(directory) / "art"
        subprocess.run(["pdfimages", "-all", "-", str(prefix)], input=pdf, check=True)
        files = {int(p.stem.rsplit("-", 1)[-1]): p for p in prefix.parent.glob("art-*")}
        for i, row in enumerate(rows):
            if row[2] != "image":
                continue
            n = int(row[1])
            picture = hashlib.sha256(files[n].read_bytes()).digest()
            mask = b""
            if i + 1 < len(rows) and rows[i + 1][2] in ("smask", "mask"):
                mask = hashlib.sha256(files[int(rows[i + 1][1])].read_bytes()).digest()
            key = (picture, mask)
            position = f"{edition} page {row[0]}"
            require(key not in seen, f"Repeated artwork on {position} and {seen.get(key)}")
            seen[key] = position
            total += 1
    require(total > 0, f"No illustrations found in {edition}")
    return total


def check_printed_folios(path, sources):
    """Check the printed destinations and that every lookup fits on its own folio."""
    counts = Counter()
    for register, table in re.findall(r'::: \{\.catalog register="([^"]+)"\}\n(.*?)\n:::', sources, re.S):
        counts[register] += sum(line.startswith("|") for line in table.splitlines()) - 2
    titles = {title.upper(): register for register, title in re.findall(
        r'\.lookup register="([^"]+)" [^}]*?title="([^"]+)"', sources)}
    xml = subprocess.check_output(["pdftohtml", "-xml", "-i", "-stdout", str(path)])
    document = ET.fromstring(xml)
    fonts = {font.get("id"): font.get("family", "") for font in document.iter("fontspec")}
    printed = Counter()
    file_register = 0
    for page in document.findall("page"):
        register = None
        folio_x = None
        for entry in page.findall("text"):
            value = "".join(entry.itertext()).strip()
            if page.get("number") == "3" and value == "FOLIO":
                folio_x = int(entry.get("left"))
            if value.startswith("QUICK REFERENCE / "):
                register = titles[value.removeprefix("QUICK REFERENCE / ")]
                require(register not in printed, f"Table {register} starts more than once")
                printed[register] = 0
            at_register_number = folio_x is not None and int(entry.get("left")) >= folio_x - 2
            if not (at_register_number or register) or "CourierPrime" not in fonts[entry.get("font")]:
                continue
            for anchor in entry.iter("a"):
                number = "".join(anchor.itertext()).strip()
                if number.isdigit():
                    destination = anchor.get("href").rpartition("#")[2]
                    require(destination == number, f"Folio {number} on page {page.get('number')} links to {destination}")
                    if at_register_number:
                        file_register += 1
                    else:
                        printed[register] += 1
    require(file_register == len(list(CHAPTERS.glob("*.md"))), "Missing printed chapter destination")
    require(printed == counts, f"Missing or split lookup rows: expected {counts}, found {printed}")
    return sum(printed.values())


def audit():
    sources = "\n".join(p.read_text(encoding="utf-8") for p in CHAPTERS.glob("*.md"))
    targets = set(re.findall(r"\{#([^}]+)\}", sources))
    missing = set(re.findall(r"\]\(#([^)]+)\)", sources)) - targets
    require(not missing, f"Missing manuscript link targets: {missing}")

    folios = check_printed_folios(DIST / BOOK, sources)
    manual = (DIST / BOOK).read_bytes()
    illustrations = {}
    manual_art = check_illustrations(manual, "manual", illustrations)
    pages = pdf_text(manual).rstrip().split("\f")
    require("Published by OmniscientForge LLC" in pages[1], "Missing publisher on the credits page")
    require("Bruce Moser and Stewart Voit" in pages[1], "Missing author credit")
    require("Illustrator: TBD" in pages[1], "Missing illustrator credit")
    text = "\n".join(pages)
    require("\u2014" not in text, "Em dash in the printed manual")
    require("File register" in pages[2] and "REFERENCE AND LICENSE" in pages[2],
            "Incomplete file register")
    for title in re.findall(r'\.lookup [^}]*title="([^"]+)"', sources):
        require(("QUICK REFERENCE / " + title.upper()) in " ".join(text.split()),
                f"Missing printed lookup for {title}")
    for roll in [f"{a}{b}" for a in range(1, 7) for b in range(1, 7)]:
        require(text.count(f"D66 {roll} /") == 2, f"Missing injury description for D66 {roll}")
    faction_pages = [i for i, p in enumerate(pages) if "INTELLIGENCE DOSSIER" in p]
    require(len(faction_pages) == 4 and faction_pages == list(range(faction_pages[0], faction_pages[0] + 4)),
            "Expected four consecutive faction dossiers")
    for i in faction_pages:
        require(all(label in pages[i] for label in ("SUBJECT IDENTIFICATION", "PERSONNEL PROFILE", "SURVEILLANCE PRINT")),
                f"Incomplete faction dossier on folio {i + 1}")
    bestiary = (CHAPTERS / "19-bestiary.md").read_text(encoding="utf-8")
    count = len(re.findall(r"^:::: \{\.specimen", bestiary, re.M))
    require(count >= 14 and text.count("ADVERSARY RECORD") == count, "Missing rendered adversary record")
    department = next((p for p in pages if "Step 2: Choose Your Department" in p), "")
    require("Operational Paradigm" in department and "Internal Counterintelligence" in department,
            "The division choices split across a page turn")
    require(text.count("Did you push a roll?") == 2, "Check both XP debrief tables")
    require("10. MISCELLANEOUS." in pages[-1], "Incomplete Year Zero Engine license")
    retired = re.compile(r"dark\s+secret|operations\s+board|NPC\s+cards?|information\s+cards?|Vaesen", re.I)
    require(not retired.search(text), "Retired material in the rendered rulebook")
    require(not re.search(r"\{#|xref:|\|===|\[NOTE\]|\ufffd", text), "Unrendered manuscript markup")

    with ZipFile(DIST / "starter-kit.zip") as kit:
        names = kit.namelist()
        require(kit.testzip() is None, "Damaged ZIP member")
        require(kit.read(BOOK) == manual, "The starter kit contains a different rulebook")
        mission = kit.read("sample-case-file/" + MISSION)
        mission_art = check_illustrations(mission, "standalone assignment", illustrations)
        sample = pdf_text(mission)
        require("At the Shrine" in sample and "\u2014" not in sample and not retired.search(sample), "Check the standalone mission")
        require(sum(n.startswith("prebuilt-characters/") and n.endswith(".html") for n in names) == 5,
                "Expected five ready-to-play agents")
        require(not any(re.search(r"operations-board|npc-card|information-card|relic-sheet|case-file-instructions", n)
                        for n in names), "Retired form in the kit")
        for name in names:
            if name.endswith(".html"):
                html = kit.read(name).decode("utf-8")
                require("data:font/ttf;base64," in html and 'src="form-tools.js"' not in html,
                        f"External dossier dependency in {name}")
    print(f"Verified {len(pages)} pages, {folios} linked lookup rows, {manual_art} unique manual illustrations "
          f"and {mission_art} separate assignment illustrations, manuscript links, front matter, XP, and starter kit.")


if __name__ == "__main__":
    audit()
