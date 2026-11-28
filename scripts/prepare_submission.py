"""Build retailer files from the audited US Letter edition. See PUBLICATION.md."""
import argparse
import math
from datetime import datetime, timezone
import io
from pathlib import Path
import subprocess
import tempfile
import zlib
from zipfile import ZipFile, ZIP_DEFLATED

import numpy as np
import pikepdf as pdf
from PIL import Image, ImageCms, ImageOps
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

from build_book import ROOT, DIST, BOOK, MISSION

OUT = DIST / "submission"
DIGITAL = OUT / "digital"
PRINT = OUT / "amazon-paperback"
HOLD = OUT / "drivethru-review"
PRESS = OUT / "storefront"
PAPER = "#f8f5ea"
PINE = "#263d32"
RED = "#872e2a"
CREAM = "#eee5cb"
FTL = "https://freeleaguepublishing.com/wp-content/uploads/2026/03/Year-Zero-Engine-License-Agreement-version-1.1.pdf"
NOTICE = "Fria Ligan AB neither sponsors nor endorses this game. The Year Zero Engine SRD is used under its Free Tabletop License."
AI = "Contains AI-generated artwork and text."
DIGITAL_NAME = "OmniscientForge-Neon-Relic.pdf"
SCALE = 0.96


def run(*args):
    subprocess.run(list(map(str, args)), check=True)


def ink(c, color):
    c.setFillColor(HexColor(color))
    c.setStrokeColor(HexColor(color))


def label(c, x, y, words, size=11, font="CourierPrime", color=PINE):
    ink(c, color)
    c.setFont(font, size)
    c.drawString(x, y, words)


def band(c, x, y, w, words):
    ink(c, RED)
    c.rect(x, y, w, 23, fill=1, stroke=0)
    label(c, x + 10, y + 7, words, 10, color="#ffffff")


def canvas(path, size):
    return Canvas(str(path), pagesize=size, initialFontName="CourierPrime",
                  pageCompression=1, invariant=1)


def dossier(c, x, y, w, h):
    # Paper edges, divider tabs, an embossed seal and a plotting scale are vector artwork.
    ink(c, "#ab9877")
    for tab_y in (193, 322, 527):
        c.roundRect(x+w-13, y+tab_y, 21, 55, 4, fill=1, stroke=0)
    for dx, dy, color in [(0, 0, "#ab9877"), (6, 5, "#c3b590"), (12, 10, CREAM)]:
        ink(c, color)
        c.roundRect(x + dx, y + dy, w - 12, h - 10, 5, fill=1, stroke=0)
    ink(c, PINE)
    c.setLineWidth(.7)
    c.rect(x + 24, y + 22, w - 50, h - 45)
    # Brass file fastener.
    for radius, color in [(7, "#564933"), (5, "#a98e5e"), (2.4, "#d8c194")]:
        ink(c, color)
        c.circle(x+26,y+h-24,radius,fill=1,stroke=0)
    # Faint Covenant archive seal on the lower leaf.
    cx, cy = x+w-103, y+146
    ink(c, "#c2bb9d")
    for radius in (38,41,45):
        c.circle(cx,cy,radius)
    c.line(cx,cy-28,cx,cy+27)
    for j in range(4):
        for direction in (-1,1):
            c.saveState()
            c.translate(cx+direction*5,cy-15+j*10)
            c.rotate(direction*29)
            c.ellipse(-4,-2,4,8,fill=1,stroke=0)
            c.restoreState()
    # Surveyor's construction diagram beside the routing field.
    cx, cy = x+w-85, y+h-164
    ink(c, "#a7a489")
    c.setLineWidth(.5)
    for radius in (5,19,32):
        c.circle(cx,cy,radius)
    c.line(cx-47,cy,cx+47,cy)
    c.line(cx,cy-52,cx,cy+52)
    for angle in range(0,360,30):
        a = math.radians(angle)
        c.line(cx+32*math.cos(a),cy+32*math.sin(a),cx+36*math.cos(a),cy+36*math.sin(a))
    ink(c, PINE)
    for i in range(7):
        c.line(x + 25, y + 77 + 7*i, x + 36, y + 77 + 7*i)


def make_extras(work):
    for name, f in [("CourierPrime", ROOT / "docs/themes/fonts/CourierPrime-Regular.ttf"),
                    ("Garamond", ROOT / "book/fonts/EBGaramond[wght].ttf")]:
        pdfmetrics.registerFont(TTFont(name, str(f)))
    c = canvas(work / "extra.pdf", (612, 792))
    ink(c, PAPER)
    c.rect(0, 0, 612, 792, fill=1, stroke=0)
    band(c, 50, 711, 512, "TOP SECRET     /     VERDANT COVENANT     /     VC-1")
    label(c, 50, 507, "FIELD OPERATIONS DIVISION")
    label(c, 47, 439, "Project Neon Relic", 60, "Garamond")
    c.line(50, 422, 562, 422)
    label(c, 50, 394, "CORE OPERATIONS MANUAL", 19)
    label(c, 50, 182, "Bruce Moser and Stewart Voit", 19, "Garamond")
    label(c, 50, 155, "OmniscientForge LLC")
    c.showPage()
    for title, fields in [("Field observation log", ["CASE", "LOCATION", "OBSERVING AGENT", "DATE / TIME"]),
                          ("Evidence custody record", ["CASE", "ITEM", "RECEIVED BY", "DATE / TIME"])]:
        ink(c, PAPER)
        c.rect(0, 0, 612, 792, fill=1, stroke=0)
        band(c, 50, 711, 512, "VERDANT COVENANT     /     FIELD OPERATIONS")
        label(c, 50, 641, title, 40, "Garamond")
        for i, field in enumerate(fields):
            x = 50 + 260*(i % 2)
            y = 585 - 51*(i // 2)
            label(c, x, y, field, 9)
            c.line(x, y-20, x+246, y-20)
        for y in range(475, 83, -25):
            ink(c, "#b2b6a8")
            c.line(50, y, 562, y)
        label(c, 50, 51, "VC-1   /   INTERNAL RECORD", 9)
        c.showPage()
    c.save()


def back_panel(c):
    # Back panel with a separate barcode reserve in the bottom right.
    band(c, 47, 714, 515, "VERDANT COVENANT    /    RECORDS DIVISION")
    label(c, 47, 598, "Project Neon Relic", 42, "Garamond", CREAM)
    label(c, 49, 567, "CORE OPERATIONS MANUAL", 14, color=CREAM)
    lines = ["In an alternate 1980s, the Verdant Covenant sends its",
             "agents to recover objects that ordinary evidence cannot",
             "explain. Every pushed roll and every use of an artifact",
             "can leave its mark on the people sent to contain it."]
    for i, line in enumerate(lines):
        label(c, 49, 488-22*i, line, 18, "Garamond", CREAM)
    for i, line in enumerate(["Agent creation and advancement", "Field equipment, rival factions and occult adversaries",
                              "Director's rules and a complete Buenos Aires assignment"]):
        label(c, 49, 343-22*i, line, 11, color=CREAM)
    for i, line in enumerate(["OmniscientForge LLC", AI,
                              "Fria Ligan AB neither sponsors nor endorses this game.",
                              "The Year Zero Engine SRD is used under its Free Tabletop License."]):
        label(c, 49, 210-15*i, line, 10, color=CREAM)


def front_panel(c):
    dossier(c, 18, 18, 576, 754)
    band(c, 57, 698, 490, "TOP SECRET     /     VERDANT COVENANT     /     EYES ONLY")
    label(c, 67, 651, "DOCUMENT CONTROL", 13)
    label(c, 67, 630, "FILE VC-1   /   ARCHIVE 1987", 10)
    label(c, 67, 486, "FIELD OPERATIONS DIVISION", 11)
    label(c, 63, 432, "Project Neon Relic", 61, "Garamond")
    c.line(67, 412, 542, 412)
    label(c, 67, 379, "CORE OPERATIONS MANUAL", 19)
    c.saveState()
    c.translate(290, 259)
    c.rotate(8)
    ink(c, RED)
    c.setLineWidth(2)
    c.rect(-8, -8, 210, 39)
    label(c, 0, 0, "TOP SECRET", 32, color=RED)
    c.restoreState()
    label(c, 67, 155, "PREPARED BY", 10)
    label(c, 67, 129, "Bruce Moser and Stewart Voit", 20, "Garamond")
    label(c, 67, 84, "OmniscientForge LLC", 11)


def cover(page_count):
    spine = page_count * .002347 * 72
    width = 1242 + spine
    c = canvas(PRINT / "wrap.pdf", (width, 810))
    c.setTitle("Project Neon Relic: Core Operations Manual")
    c.setAuthor("Bruce Moser and Stewart Voit")
    c.setCreator("OmniscientForge LLC")
    ink(c, PINE)
    c.rect(0, 0, width, 810, fill=1, stroke=0)
    back_panel(c)
    ink(c, "#ffffff")
    c.rect(621-18-144, 27, 144, 86.4, fill=1, stroke=0)
    c.saveState()
    c.translate(621 + spine/2 + 3, 265)
    c.rotate(90)
    label(c, 0, 0, "PROJECT NEON RELIC   /   VC-1", 12, color=CREAM)
    c.restoreState()
    c.saveState()
    c.translate(621 + spine, 9)
    front_panel(c)
    c.restoreState()
    c.showPage()
    c.save()
    for name in ("back", "front"):
        c = canvas(HOLD / (name + "-panel.pdf"), (630,810))
        ink(c, PINE)
        c.rect(0, 0, 630, 810, fill=1, stroke=0)
        if name == "back":
            back_panel(c)
        else:
            c.translate(9,9)
            front_panel(c)
        c.showPage()
        c.save()


def image_list(path):
    listing = subprocess.check_output(["pdfimages", "-list", str(path)], text=True)
    return [line.split() for line in listing.splitlines()[2:] if line.split()[2] == "image"]


def downsample(src, dest):
    # Change image data in place so bookmarks, live text, tags and link destinations survive.
    with pdf.open(src) as doc:
        for r in image_list(src):
            density = min(int(r[12]), int(r[13]))
            if density <= 155:
                continue
            obj = doc.get_object((int(r[10]), int(r[11])))
            size = tuple(max(1, round(int(v)*150/density)) for v in r[3:5])
            img = pdf.PdfImage(obj).as_pil_image().convert("RGB").resize(size, Image.Resampling.LANCZOS)
            data = io.BytesIO()
            img.save(data, "JPEG", quality=88, subsampling=0)
            obj.write(data.getvalue(), filter=pdf.Name.DCTDecode)
            obj.ColorSpace = pdf.Name.DeviceRGB
            obj.Width, obj.Height = size
            if "/SMask" in obj:
                mask = obj.SMask
                gray = pdf.PdfImage(mask).as_pil_image().convert("L").resize(size, Image.Resampling.LANCZOS)
                mask.write(zlib.compress(gray.tobytes()), filter=pdf.Name.FlateDecode)
                mask.Width, mask.Height = size
        doc.save(dest, linearize=True)


def digital(work, src):
    downsample(src, DIGITAL / DIGITAL_NAME)
    screen = DIGITAL / DIGITAL_NAME
    with pdf.open(screen) as doc:
        # Mount the original cover at native screen resolution in an archive-green surround.
        page = doc.pages[0]
        page.contents_add(b"q 0.149 0.239 0.196 rg 0 0 612 792 re f 0.85 0 0 0.85 45.9 59.4 cm", prepend=True)
        page.contents_add(b"Q")
        fit_images(doc, screen, 1.0, 150)
        doc.save(HOLD / "reader-review.pdf", linearize=True)
    with ZipFile(DIST / "starter-kit.zip") as old, ZipFile(DIGITAL / "Neon-Relic-Field-Kit.zip", "w", ZIP_DEFLATED) as new:
        if old.read(BOOK) != src.read_bytes():
            raise ValueError("Rebuild the starter kit and manual together.")
        for item in old.namelist():
            if item == BOOK or item.endswith(".html"):
                continue
            data = old.read(item)
            if item.endswith("/" + MISSION):
                mission = work / MISSION
                mission.write_bytes(data)
                downsample(mission, work / "mission-screen.pdf")
                data = (work / "mission-screen.pdf").read_bytes()
            new.writestr(item, data)
        new.writestr("PUBLICATION.txt", f"Project Neon Relic | Bruce Moser and Stewart Voit\nOmniscientForge LLC\n{AI}\n{NOTICE}\n{FTL}\n")
        for p in sorted((ROOT / "book/fonts").glob("*.txt")):
            new.write(p, "font-licenses/" + p.name)


def render_jpg(src, page, longest, target):
    run("pdftoppm", "-f", page, "-l", page, "-scale-to", longest, "-singlefile", "-jpeg", "-jpegopt",
        "quality=92", src, target.with_suffix(""))


def store_images(src, work):
    temp = work / "cover.jpg"
    render_jpg(src, 1, 2560, temp)
    with Image.open(temp) as img:
        for name, size in [("itch-cover", (630,500)), ("kindle-cover", (1600,2560))]:
            ImageOps.pad(img, size, Image.Resampling.LANCZOS, color=PINE).save(
                PRESS / (name+".jpg"), quality=94, dpi=(300,300))
    render_jpg(HOLD / "reader-review.pdf", 1, 953, temp)
    with Image.open(temp) as img:
        ImageOps.pad(img, (736,953), color=PINE).save(PRESS / "drivethru-cover.jpg", quality=88)
    for page in (10, 94, 128):
        render_jpg(src, page, 1280, PRESS / f"folio-{page}.jpg")


def fit_images(doc, src, scale, target):
    # A smaller native image inside the original box keeps the chapter folios fixed.
    # The form paints on the local page background, including tinted specimen panels.
    forms = {}
    for row in image_list(src):
        page = int(row[0])
        if page == 1:
            continue
        ppi = min(int(row[12]), int(row[13])) / scale
        if ppi >= target-1:
            continue
        key = (int(row[10]), int(row[11]))
        image = doc.get_object(key)
        ratio = ppi/target
        offset = (1-ratio)/2
        form = doc.make_stream(f"q {ratio:.8f} 0 0 {ratio:.8f} {offset:.8f} {offset:.8f} cm /Photo Do Q".encode())
        form.update(pdf.Dictionary(Type=pdf.Name.XObject, Subtype=pdf.Name.Form, BBox=[0,0,1,1],
                                   Resources=pdf.Dictionary(XObject=pdf.Dictionary(Photo=image))))
        forms[key] = form
    # Typst shares resource dictionaries and may nest image-bearing forms.
    for obj in list(doc.objects):
        if not isinstance(obj, pdf.Dictionary) or "/XObject" not in obj:
            continue
        table = obj.XObject
        for name, target in list(table.items()):
            if target.objgen in forms and name != "/Photo":
                table[name] = forms[target.objgen]


def print_layout(src, work):
    target = work / "print-layout.pdf"
    with pdf.open(src) as doc, pdf.open(work / "extra.pdf") as extras:
        fit_images(doc, src, SCALE, 302)
        out = pdf.Pdf.new()
        ordered = [extras.pages[0], *list(doc.pages)[1:], extras.pages[1], extras.pages[2]]
        for i, source in enumerate(ordered):
            page = out.add_blank_page(page_size=(621,810))
            left = 9 if i % 2 else 0
            page.TrimBox = [left,9,left+612,801]
            page.BleedBox = page.MediaBox
            page.Contents = out.make_stream(b"0.972549 0.960784 0.917647 rg 0 0 621 810 re f")
            dx, dy = 612*(1-SCALE)/2, 792*(1-SCALE)/2
            page.add_overlay(source, pdf.Rectangle(left+dx, 9+dy, left+612-dx, 801-dy))
        out.save(target)
    return target


def limited_cmyk(rgb, transform):
    data = np.array(ImageCms.applyTransform(rgb, transform))
    # Protect the small body type, whose manuscript ink is #262c28.
    source = np.asarray(rgb)
    text = (source[:,:,0] == 38) & (source[:,:,1] == 44) & (source[:,:,2] == 40)
    data[text] = (0,0,0,255)
    sums = data.sum(axis=2, dtype=np.uint16)
    excess = sums > 612
    pixels = data[excess].astype(np.uint32)
    if pixels.size:
        k = pixels[:,3:4]
        pixels[:,:3] = pixels[:,:3] * (612-k) // (sums[excess,None]-k)
        data[excess] = pixels
    return data


def drive_press(layout, icc, work):
    transform = ImageCms.buildTransform(ImageCms.createProfile("sRGB"), str(icc), "RGB", "CMYK")
    out = pdf.Pdf.new()
    profile = out.make_stream(icc.read_bytes())
    profile.N = 4
    intent = pdf.Dictionary(Type=pdf.Name.OutputIntent, S=pdf.Name.GTS_PDFX,
                            OutputConditionIdentifier="CGATS21_CRPC1",
                            RegistryName="http://www.color.org", DestOutputProfile=profile)
    out.Root.OutputIntents = [out.make_indirect(intent)]
    stamp = datetime.now(timezone.utc).strftime("D:%Y%m%d%H%M%SZ")
    out.docinfo.update(pdf.Dictionary(Title="Project Neon Relic: Core Operations Manual",
        GTS_PDFXVersion="PDF/X-1:2001", GTS_PDFXConformance="PDF/X-1a:2001",
        Trapped=pdf.Name("/False"), CreationDate=stamp, ModDate=stamp))
    with pdf.open(layout) as body:
        total = len(body.pages)
    # Render in small batches to bound temporary disk use.
    for first in range(1, total+1, 8):
        last = min(first+7, total)
        run("pdftoppm", "-r", 300, "-f", first, "-l", last, layout, work / "press")
        for n in range(first, last+1):
            name = work / f"press-{n:0{len(str(total))}d}.ppm"
            with Image.open(name) as rgb:
                data = limited_cmyk(rgb, transform)
                width, height = rgb.size
            name.unlink()
            stream = out.make_stream(zlib.compress(data.tobytes(), 3))
            stream.update(pdf.Dictionary(Type=pdf.Name.XObject, Subtype=pdf.Name.Image,
                ColorSpace=pdf.Name.DeviceCMYK, BitsPerComponent=8, Width=width,
                Height=height, Filter=pdf.Name.FlateDecode))
            page = out.add_blank_page(page_size=(621,810))
            left = 0 if n % 2 else 9
            page.TrimBox = [left,9,left+612,801]
            page.BleedBox = page.MediaBox
            page.Resources.XObject = pdf.Dictionary(Plate=stream)
            page.Contents = out.make_stream(b"q 621 0 0 810 0 0 cm /Plate Do Q")
        print(f"CMYK press folios {first}-{last}", flush=True)
    out.save(HOLD / "interior-review.pdf", force_version="1.3")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--icc", required=True, type=Path, help="DriveThru CGATS21_CRPC1.icc")
    args = parser.parse_args()
    if "CGATS21_CRPC1" not in ImageCms.getProfileName(str(args.icc)):
        parser.error("Expected the DriveThru CGATS21_CRPC1 press profile")
    for folder in (DIGITAL, PRINT, HOLD, PRESS):
        folder.mkdir(exist_ok=True, parents=True)
    src = DIST / BOOK
    with pdf.open(src) as doc:
        count = len(doc.pages)
    if count % 4 != 1:
        raise ValueError("Recalculate the signature and field-log pages for this new page count.")
    with tempfile.TemporaryDirectory(dir=OUT) as tmp:
        work = Path(tmp)
        make_extras(work)
        cover(count+1)
        digital(work, src)
        store_images(src, work)
        layout = print_layout(src, work)
        run("gs", "-q", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.3",
            "-r350", "-sColorConversionStrategy=RGB", "-dOverrideICC=true",
            "-dAutoFilterColorImages=false", "-dColorImageFilter=/FlateEncode", "-dAutoRotatePages=/None", "-dEmbedAllFonts=true", "-dPreserveAnnots=false",
            f"-dLastPage={count+1}", "-sOutputFile="+str(PRINT / "interior.pdf"), layout)
        drive_press(layout, args.icc, work)


if __name__ == "__main__":
    main()
