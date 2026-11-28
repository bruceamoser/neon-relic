"""Preflight retailer page geometry, digital navigation, CMYK coverage and kit inventory."""
import hashlib
from pathlib import Path
import subprocess
from zipfile import ZipFile

import numpy as np
import pikepdf
from PIL import Image

from audit_book import check_printed_folios, require
from build_book import BOOK, CHAPTERS, DIST, ROOT
from prepare_submission import DIGITAL, DIGITAL_NAME, HOLD, OUT, PRESS, PRINT


def pdf_check(path):
    subprocess.run(["qpdf", "--check", str(path)], check=True, stdout=subprocess.DEVNULL)


def navigation(doc):
    return [len(p.get("/Annots", [])) for p in doc.pages]


def preflight():
    sources = "\n".join(p.read_text() for p in CHAPTERS.glob("*.md"))
    with pikepdf.open(DIST / BOOK) as master:
        page_count = len(master.pages)
        links = navigation(master)
    for path in (DIGITAL / DIGITAL_NAME, HOLD / "reader-review.pdf"):
        with pikepdf.open(path) as screen:
            require(len(screen.pages) == page_count and not screen.is_encrypted, str(path))
            require(screen.is_linearized and "/Outlines" in screen.Root, "Reader PDF navigation")
            require(navigation(screen) == links, "Reader annotation count changed")
        lookup = check_printed_folios(path, sources)
    for path, expected in [(PRINT / "interior.pdf", page_count+1),
                           (HOLD / "interior-review.pdf", page_count+2)]:
        with pikepdf.open(path) as body:
            require(len(body.pages) == expected, f"Signature in {path}")
            for n, page in enumerate(body.pages):
                left = 9 if n % 2 else 0
                require(list(page.MediaBox) == [0,0,621,810] and page.BleedBox == page.MediaBox
                        and list(page.TrimBox) == [left,9,left+612,801], f"Trim on page {n+1}")
                require(not page.get("/Annots"), "Unexpected print annotations")
    with pikepdf.open(PRINT / "wrap.pdf") as jacket:
        width = float(jacket.pages[0].MediaBox[2])
        require(abs(width - (1242+(page_count+1)*.002347*72)) < .001, "KDP spine width")
    with pikepdf.open(HOLD / "interior-review.pdf") as press:
        require(press.docinfo.GTS_PDFXConformance == "PDF/X-1a:2001", "Press target")
        require(press.Root.OutputIntents[0].DestOutputProfile.N == 4, "CMYK output intent")
        max_ink = 0
        for page in press.pages:
            image = page.Resources.XObject.Plate
            require((image.Width,image.Height) == (2588,3375) and
                    image.ColorSpace == pikepdf.Name.DeviceCMYK, "Press plate geometry")
            channels = np.frombuffer(image.read_bytes(), dtype=np.uint8).reshape(-1,4)
            max_ink = max(max_ink, int(channels.sum(axis=1,dtype=np.uint16).max()))
        require(max_ink <= 612, "CMYK exceeds 240%")
    for name, size in [("kindle-cover",(1600,2560)), ("itch-cover",(630,500)), ("drivethru-cover",(736,953))]:
        with Image.open(PRESS / (name+".jpg")) as img:
            require(img.size == size and img.mode == "RGB", f"Storefront cover {name}")
    with ZipFile(DIGITAL / "Neon-Relic-Field-Kit.zip") as kit:
        names = kit.namelist()
        require(kit.testzip() is None and BOOK not in names, "Field kit inventory")
        require(sum(n.endswith(".pdf") for n in names) == 7 and
                sum(n.endswith(".png") for n in names) == 23, "Field kit contents")
        require(b"Fria Ligan AB" in kit.read("PUBLICATION.txt"), "Field kit notice")
    for path in sorted(OUT.glob("*/*.pdf")):
        pdf_check(path)
    (OUT / "PUBLICATION.md").write_bytes((ROOT / "PUBLICATION.md").read_bytes())
    entries = []
    for path in sorted(OUT.glob("*/*")):
        if path.is_file() and path.parent in (DIGITAL, HOLD, PRINT, PRESS):
            digest = hashlib.sha256()
            with path.open("rb") as content:
                for chunk in iter(lambda: content.read(1024*1024), b""):
                    digest.update(chunk)
            entries.append(f"{digest.hexdigest()}  {path.relative_to(OUT)}")
    (OUT / "SHA256SUMS").write_text("\n".join(entries)+"\n")
    print(f"{page_count} digital pages, {lookup} linked lookup entries, {page_count+1} KDP pages, "
          f"{page_count+2} DriveThru pages, maximum press ink {max_ink*100/255:.1f}%.")


if __name__ == "__main__":
    preflight()
