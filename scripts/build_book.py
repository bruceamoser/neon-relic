"""Build the current Markdown manuscript and kit using local, offline tools."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
CHAPTERS = ROOT / "docs" / "chapters"
DIST = ROOT / "dist"
BOOK = "neon-relic-core-rules.pdf"
MISSION = "the-spear-that-went-dark.pdf"

# Plates depict specific incidents. Some chapters close with an exhibit in the reading column.
PLATES = {
    "01": ("compact-handoff", "Field observation / A handoff at the ferry terminal."),
    "01b": ("holbrook", "Holbrook / Vasquez calls the dead drop from Seventh."),
    "02": ("intake", "Personnel / A new operative reports for induction."),
    "08": ("exposure", "After action / An agent takes a moment with his Anchor."),
    "09": ("dispatch", "Regional hub / A dispatch changes hands on the night shift."),
    "11": ("projection-booth", "Recovery / Inspection of an exposed film canister."),
    "14": ("vault", "The Keep / The bell is lowered into its transport case."),
    "16": ("majestic-convoy", "Transit observation / A federal convoy holds the crossing."),
    "19": ("apparition", "Field sighting / A figure persists after the last train."),
    "20": ("/assets/png/spear-location-1-estate-aftermath.png", "Buenos Aires / The Ferreyra estate after the theft."),
}
EXHIBITS = {
    "appendix": ("initiative", "Training room / Initiative cards"),
    "01b": ("watch", "Holbrook parish watch / Returned to Keep custody"),
    "07": ("vest", "Quartermaster / Ballistic vest"),
    "09": ("bracer", "The Keep / Warden’s Bracer"),
    "21": ("bracer", "Division instruments / Warden’s Bracer"),
    "12": ("keyring", "Keys to the Covenant safe house"),
    "06": ("camera", "Instant camera for recording evidence"),
    "08": ("cassette", "Portable cassette recorder"),
    "10": ("radio", "Covenant field radio"),
    "11": ("case", "The Keep / Sealed artifact transport case"),
    "15": ("case", "A sealed transport case"),
}


def raw(code):
    return '\n\n```{=typst}\n' + code + '\n```\n\n'


def manuscript(sample=False):
    chapters = sorted(CHAPTERS.glob("*.md"))
    license_file = CHAPTERS / "22-yze-license.md"
    chapters.remove(license_file)
    chapters.append(license_file)
    if sample:
        chapters = [CHAPTERS / "20-sample-case-file.md"]
    parts = [raw('#import "/book/layout.typ": *\n#import "/book/folios.typ": folio-file')]
    for path in chapters:
        key = path.stem.split("-")[0]
        director = key.isdigit() and 14 <= int(key) <= 20
        access = "DIRECTOR EYES ONLY" if director else "COVENANT PERSONNEL"
        code = "APPENDIX" if key == "appendix" else "FILE " + key.upper()
        designed = key in ("00", "17", "20")
        if designed:
            parts.append(raw(f'#file-open("{code}", "{access}")'))
        else:
            parts.append(f':::::::: {{.folios file="{key}" code="{code}" access="{access}"}}')
        title, body = path.read_text(encoding="utf-8").split("\n", 1)
        parts.append(title + "\n")
        if key in PLATES:
            asset, caption = PLATES[key]
            if not asset.startswith("/"):
                asset = "/book/art/" + asset + ".jpg"
            height = {"01": 107, "01b": 187, "02": 182, "09": 160, "11": 160, "08": 168,
                      "14": 165, "16": 160, "19": 81, "20": 175}.get(key, 240)
            parts.append(raw(f'#plate({json.dumps(asset)}, {json.dumps(caption)}, height: {height}pt)'))
        if key == "00":
            body = body.replace("## Rights and license", raw("#colbreak()") + "## Rights and license")
            parts.extend([raw("#reading["), body, raw("]"),
                          raw("#credits-sleeve()"), raw("#contents()")])
        else:
            parts.append(body)
            if key in EXHIBITS:
                name, caption = EXHIBITS[key]
                height = 185 if key == "09" else 111
                parts.append(raw(f'#collection-print({json.dumps(name)}, {json.dumps(caption)}, height: {height}pt)'))
            if not designed:
                parts.append("::::::::")
    return "\n\n".join(parts)


def compile_book(work, destination, sample=False, measure_folios=False):
    body = work / "body.typ"
    subprocess.run([os.environ.get("PANDOC", "pandoc"), "-f", "markdown", "-t", "typst",
                    "--lua-filter", str(ROOT / "book/tables.lua"), "--columns=30", "--wrap=none", "-o", str(body)],
                   input=manuscript(sample), encoding="utf-8", check=True)
    typst = os.environ.get("TYPST", "typst")
    options = ["--root", str(ROOT), "--font-path", str(ROOT / "book/fonts"),
               "--font-path", str(ROOT / "docs/themes/fonts"),
               "--input", "edition=" + ("mission" if sample else "manual"),
               "--input", "body=/" + body.relative_to(ROOT).as_posix()]
    source = str(ROOT / "book/book.typ")
    if measure_folios:
        with destination.open("w", encoding="utf-8") as output:
            subprocess.run([typst, "eval", "--in", source, *options, "--input", "folio-proof=measure",
                            "--pretty", "query(<folio-measure>).map(it => it.value)"], stdout=output, check=True)
    else:
        subprocess.run([typst, "compile", *options, source, str(destination)], check=True)


def portable_html(path):
    html = path.read_text(encoding="utf-8")
    def font(match):
        data = (path.parent / match[1]).read_bytes()
        return "url('data:font/ttf;base64," + base64.b64encode(data).decode("ascii") + "')"
    html = re.sub(r"url\('([^']+\.ttf)'\)", font, html)
    script = (ROOT / "assets/form-tools.js").read_text(encoding="utf-8")
    return html.replace('<script src="form-tools.js"></script>', '<script>' + script + '</script>')


def browser():
    if os.environ.get("CHROME"):
        return os.environ["CHROME"]
    for name in ("google-chrome", "chromium", "chromium-browser", "chrome", "msedge"):
        if found := shutil.which(name):
            return found
    for folder in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"):
        if folder in os.environ:
            for exe in ("Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe"):
                path = Path(os.environ[folder]) / exe
                if path.is_file():
                    return str(path)
    mac = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    if mac.is_file():
        return str(mac)
    raise SystemExit("Set CHROME to a Chromium browser, or use --skip-pdfs for HTML dossiers.")


def package(pdf, work, skip_pdfs):
    chrome = None if skip_pdfs else browser()
    compile_book(work, work / MISSION, sample=True)
    assets = ROOT / "assets"
    with ZipFile(work / "starter-kit.zip", "w", compression=ZIP_DEFLATED) as kit:
        kit.write(pdf, BOOK)
        kit.write(work / MISSION, "sample-case-file/" + MISSION)
        for path in [assets / "character-sheet.html", *sorted((assets / "prebuilt").glob("*.html"))]:
            folder = "prebuilt-characters/" if path.parent.name == "prebuilt" else "blank-templates/"
            html = work / path.name
            html.write_text(portable_html(path), encoding="utf-8")
            kit.write(html, folder + html.name)
            if chrome:
                printable = html.with_suffix(".pdf")
                subprocess.run([chrome, "--headless", "--disable-gpu", "--disable-extensions",
                                "--no-pdf-header-footer", "--user-data-dir=" + str(work / "browser"),
                                "--print-to-pdf=" + str(printable), html.as_uri()],
                               stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True, timeout=60)
                kit.write(printable, folder + printable.name)
        for path in sorted((assets / "png").glob("spear-*.png")):
            kit.write(path, "sample-case-file/handouts/" + path.name)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--book-only", action="store_true")
    mode.add_argument("--measure-folios", action="store_true", help="list possible page starts and their heights in points")
    mode.add_argument("--skip-rulebook", action="store_true", help="package the existing dist PDF")
    parser.add_argument("--skip-pdfs", action="store_true", help="include only HTML versions of the dossiers")
    args = parser.parse_args()
    DIST.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=DIST) as temp:
        work = Path(temp)
        if args.measure_folios:
            report = DIST / "folio-measurements.json"
            compile_book(work, work / report.name, measure_folios=True)
            (work / report.name).replace(report)
            print(report)
            return
        pdf = DIST / BOOK
        if not args.skip_rulebook:
            compile_book(work, work / BOOK)
            (work / BOOK).replace(pdf)
        if not args.book_only:
            package(pdf, work, args.skip_pdfs)
            (work / "starter-kit.zip").replace(DIST / "starter-kit.zip")
    print(pdf if args.book_only else DIST / "starter-kit.zip")


if __name__ == "__main__":
    main()
