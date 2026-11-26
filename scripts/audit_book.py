"""Check the printed playtest changes and release inventory using Poppler."""
from pathlib import Path
import re
import subprocess
from zipfile import ZipFile

from build_book import BOOK, CHAPTERS, DIST, MISSION


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def pdf_text(data):
    result = subprocess.run(["pdftotext", "-", "-"], input=data, capture_output=True, check=True)
    return result.stdout.decode("utf-8")


def audit():
    sources = "\n".join(p.read_text(encoding="utf-8") for p in CHAPTERS.glob("*.md"))
    targets = set(re.findall(r"\{#([^}]+)\}", sources))
    missing = set(re.findall(r"\]\(#([^)]+)\)", sources)) - targets
    require(not missing, f"Missing manuscript link targets: {missing}")

    manual = (DIST / BOOK).read_bytes()
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
        sample = pdf_text(kit.read("sample-case-file/" + MISSION))
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
    print(f"Verified {len(pages)} pages, manuscript links, front matter, XP, sample mission, and starter kit.")


if __name__ == "__main__":
    audit()
