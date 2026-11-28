"""Fit the commercial cover to the reviewed DriveThru template CSS5565031."""
import argparse
from functools import lru_cache
import hashlib
import io
from pathlib import Path

import pikepdf as pdf
from PIL import Image, ImageCms
from reportlab.pdfgen.canvas import Canvas

from prepare_submission import (CREAM, HOLD, PINE, back_panel, front_panel, ink, label,
                                limited_cmyk, press_document, register_cover_fonts)

# The generator outlines its job ticket. Pin the measured sheet so a different
# stock, signature or request cannot accidentally inherit these coordinates.
TEMPLATE_SHA256 = "31c33f03e7dd1dbd060bba349b4aebb17be91e96b31ccd016fbd5cba296d0e96"
LEFT, BASE = 241.56, 54.09743
SPINE_LEFT, SPINE_RIGHT = LEFT + 621, 891.0
SHEET = (1512, 864)


def artwork():
    register_cover_fonts()
    stream = io.BytesIO()
    c = Canvas(stream, pagesize=SHEET, initialFontName="CourierPrime", invariant=1)
    ink(c, PINE)
    # The template's cyan outlines straddle the bleed boundary by half a point.
    c.rect(LEFT-.5, BASE-.5, SHEET[0]-LEFT+.5, 811, stroke=0, fill=1)
    c.saveState()
    c.translate(LEFT, BASE)
    back_panel(c)
    c.restoreState()
    c.saveState()
    c.translate(SPINE_RIGHT, BASE+9)
    front_panel(c)
    c.restoreState()
    c.saveState()
    c.translate((SPINE_LEFT+SPINE_RIGHT)/2+3, BASE+265)
    c.rotate(90)
    label(c, 0, 0, "PROJECT NEON RELIC   /   VC-1", 12, color=CREAM)
    c.restoreState()
    # Center the printer's 0.75 x 0.5 inch white reserve on its sample barcode.
    ink(c, "#ffffff")
    c.rect(713.7072+(90.34555-54)/2, 85.69684+(72-36)/2, 54, 36, stroke=0, fill=1)
    c.showPage()
    c.save()
    stream.seek(0)
    return stream


def build(template, icc):
    if hashlib.sha256(template.read_bytes()).hexdigest() != TEMPLATE_SHA256:
        raise ValueError("This layout requires the verified 152-page template CSS5565031.")
    with pdf.open(HOLD / "interior-review.pdf") as interior:
        if len(interior.pages) != 151:
            raise ValueError("Request a new template for the revised interior.")
    if "CGATS21_CRPC1" not in ImageCms.getProfileName(str(icc)):
        raise ValueError("Use the CGATS21_CRPC1 printer profile.")
    transform = ImageCms.buildTransform(ImageCms.createProfile("sRGB"), str(icc), "RGB", "CMYK")

    @lru_cache
    def swatch(rgb):
        if rgb[0] == rgb[1] == rgb[2]:
            return (0, 0, 0, 1-rgb[0])
        sample = Image.new("RGB", (1,1), tuple(round(c*255) for c in rgb))
        return tuple(float(c)/255 for c in limited_cmyk(sample, transform)[0,0])

    def press_colors(page, owner, skip_image=None):
        commands = []
        for operands, operator in pdf.parse_content_stream(page):
            if str(operator) in ("rg", "RG"):
                operands = swatch(tuple(map(float, operands)))
                operator = pdf.Operator("k" if str(operator) == "rg" else "K")
            if str(operator) == "Do" and operands[0] == skip_image:
                continue
            commands.append((operands, operator))
        page.Contents = owner.make_stream(pdf.unparse_content_stream(commands))

    output = press_document(icc)
    with pdf.open(template) as original, pdf.open(artwork()) as art:
        output.pages.append(original.pages[0])
        sheet = output.pages[0]
        # Preserve the original printer marks and grayscale production QR.
        sample = next(name for name, obj in sheet.images.items() if obj.Height == 573)
        press_colors(sheet, output, pdf.Name(sample))
        del sheet.Resources.XObject[sample]
        press_colors(art.pages[0], art)
        sheet.add_overlay(art.pages[0])
        sheet.TrimBox = sheet.MediaBox
        sheet.BleedBox = sheet.MediaBox
        output.docinfo.Title = "Project Neon Relic | DriveThru softcover | 152 pages"
        output.docinfo.Author = "Bruce Moser and Stewart Voit"
        target = HOLD / "cover-review.pdf"
        output.save(target, force_version="1.3")
    return target


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("template", type=Path)
    parser.add_argument("--icc", required=True, type=Path)
    args = parser.parse_args()
    print(build(args.template, args.icc))
