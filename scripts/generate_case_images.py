"""
generate_case_images.py — Procedural B&W PNG generation for neon-relic case files.
Generates 27 images (24 NPC + 3 relic) across 3 case file image directories.
Style: grainy 1980s surveillance/PI aesthetic, B&W, white photo border, vignette.
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# ── Paths ──────────────────────────────────────────────────────────────
BASE = "docs/case-files"

CASE_DIRS = {
    "barbarians": os.path.join(BASE, "the-barbarians-cup", "images"),
    "boudica":    os.path.join(BASE, "the-boudica-pact", "images"),
    "cormsil":    os.path.join(BASE, "the-cormsil-compact", "images"),
}

os.makedirs(CASE_DIRS["barbarians"], exist_ok=True)
os.makedirs(CASE_DIRS["boudica"], exist_ok=True)
os.makedirs(CASE_DIRS["cormsil"], exist_ok=True)

# ── Constants ───────────────────────────────────────────────────────────
NPC_W, NPC_H = 300, 400   # portrait orientation
REL_W, REL_H = 400, 300   # landscape orientation for relics
BORDER = 12               # white photo border width
GRAY_MIN, GRAY_MAX = 30, 220  # contrast range


# ══════════════════════════════════════════════════════════════════════════
#  HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════

def make_canvas(w, h, border=BORDER):
    """Create a base image with white border. Returns (image, draw, inner_rect)."""
    bw = w + 2 * border
    bh = h + 2 * border
    img = Image.new("L", (bw, bh), 255)
    draw = ImageDraw.Draw(img)
    # inner area has a mid-gray base that we draw on
    inner = (border, border, border + w, border + h)
    # fill inner with a neutral tone
    img.paste(160, inner)  # mid-gray default
    return img, draw, inner


def add_film_grain(img, intensity=0.12):
    """Add random noise overlay for film grain effect."""
    arr = img.load()
    w, h = img.size
    bx, by, bw, bh = BORDER, BORDER, w - 2*BORDER, h - 2*BORDER
    for y in range(by, by + bh):
        for x in range(bx, bx + bw):
            noise = random.gauss(0, 255 * intensity)
            val = arr[x, y] + noise
            arr[x, y] = max(GRAY_MIN, min(GRAY_MAX, int(val)))
    return img


def add_vignette(img, falloff=0.4):
    """Darken edges with a radial gradient for vignette effect."""
    arr = img.load()
    w, h = img.size
    cx, cy = w / 2, h / 2
    max_dist = math.sqrt(cx * cx + cy * cy)
    for y in range(h):
        for x in range(w):
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / max_dist
            if dist > 0.35:
                factor = 1.0 - (dist - 0.35) * falloff
                factor = max(0.3, factor)
                arr[x, y] = max(GRAY_MIN, int(arr[x, y] * factor))
    return img


def add_white_border_effect(img):
    """Already have border via canvas, but add subtle inner shadow."""
    w, h = img.size
    arr = img.load()
    for y in range(BORDER, BORDER + 3):
        for x in range(BORDER, w - BORDER):
            factor = 0.7 + 0.1 * (y - BORDER)
            arr[x, y] = min(GRAY_MAX, int(arr[x, y] * factor))
    for y in range(h - BORDER - 3, h - BORDER):
        for x in range(BORDER, w - BORDER):
            factor = 0.7 + 0.1 * ((h - BORDER - 1) - y)
            arr[x, y] = min(GRAY_MAX, int(arr[x, y] * factor))
    return img


def finalize(img, grain_intensity=0.12):
    """Apply grain, vignette, border shadow, and clamp contrast."""
    img = add_film_grain(img, grain_intensity)
    img = add_vignette(img)
    img = add_white_border_effect(img)
    # clamp to grayscale range
    arr = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            if y < BORDER or y >= h - BORDER or x < BORDER or x >= w - BORDER:
                continue
            arr[x, y] = max(GRAY_MIN, min(GRAY_MAX, arr[x, y]))
    return img


def save_png(img, path):
    """Save image as PNG."""
    img.save(path, "PNG")
    print(f"  Saved: {path}")


# ── Drawing helpers ─────────────────────────────────────────────────────

def draw_oval_head(draw, cx, cy, rx, ry, face_tone):
    """Draw an oval head/face."""
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=face_tone)


def draw_eyes(draw, cx, cy, eye_spacing, eye_size, looking="center"):
    """Draw two eyes. looking: 'center', 'left', 'right', 'down'."""
    lx = cx - eye_spacing
    rx = cx + eye_spacing
    if looking == "left":
        lx -= 2; rx -= 2
    elif looking == "right":
        lx += 2; rx += 2
    elif looking == "down":
        cy += 2

    for ex in [lx, rx]:
        # eye white
        draw.ellipse([ex - eye_size - 1, cy - eye_size // 2 - 1,
                       ex + eye_size + 1, cy + eye_size // 2 + 1], fill=220)
        # pupil
        draw.ellipse([ex - eye_size // 2, cy - eye_size // 3,
                       ex + eye_size // 2, cy + eye_size // 3], fill=25)
        # highlight
        draw.ellipse([ex - 1, cy - eye_size // 3, ex + 1, cy], fill=240)


def draw_mouth(draw, cx, cy, width, expression="neutral"):
    """Draw mouth. expression: 'neutral', 'worried', 'smile', 'frown'."""
    hw = width // 2
    if expression == "neutral":
        draw.line([cx - hw, cy, cx + hw, cy], fill=50, width=2)
    elif expression == "worried":
        draw.arc([cx - hw, cy - 3, cx + hw, cy + 6], 0, 180, fill=50, width=2)
    elif expression == "smile":
        draw.arc([cx - hw, cy, cx + hw, cy + 10], 0, 180, fill=50, width=2)
    elif expression == "frown":
        draw.arc([cx - hw, cy - 10, cx + hw, cy], 180, 0, fill=50, width=2)


def draw_nose(draw, cx, cy, size=3):
    """Simple triangular-ish nose."""
    draw.ellipse([cx - size // 2, cy - size, cx + size // 2, cy + size], fill=80)


def draw_hair(draw, cx, top_y, width, height, color, style="short"):
    """Draw hair. style: 'short', 'bald', 'bun', 'long', 'receding', 'flat_cap', 'unkempt'."""
    if style == "bald":
        return
    elif style == "short":
        draw.ellipse([cx - width, top_y - 5, cx + width, top_y + height], fill=color)
    elif style == "receding":
        draw.ellipse([cx - width + 5, top_y - 3, cx + width - 5, top_y + height - 10], fill=color)
    elif style == "bun":
        draw.ellipse([cx - width, top_y - 5, cx + width, top_y + height // 2], fill=color)
        draw.ellipse([cx - 8, top_y - 15, cx + 8, top_y + 5], fill=color)
    elif style == "long":
        draw.ellipse([cx - width, top_y - 5, cx + width, top_y + height], fill=color)
        draw.rectangle([cx - width, top_y + height // 2, cx + width, top_y + height + 40], fill=color)
    elif style == "flat_cap":
        draw.ellipse([cx - width, top_y - 3, cx + width, top_y + height], fill=color)
        draw.ellipse([cx - width + 5, top_y - 8, cx + width - 5, top_y + 5], fill=color)
    elif style == "unkempt":
        draw.ellipse([cx - width + 2, top_y - 8, cx + width + 2, top_y + height + 5], fill=color)
        draw.ellipse([cx - width - 3, top_y + 2, cx - width + 10, top_y + height - 3], fill=color)


def draw_glasses(draw, cx, cy, eye_spacing):
    """Draw round glasses."""
    for ex in [cx - eye_spacing, cx + eye_spacing]:
        draw.ellipse([ex - 7, cy - 7, ex + 7, cy + 7], outline=30, width=2)
    draw.line([cx - eye_spacing + 7, cy, cx + eye_spacing - 7, cy], fill=30, width=2)


# ══════════════════════════════════════════════════════════════════════════
#  NPC PORTRAIT GENERATORS
# ══════════════════════════════════════════════════════════════════════════

def gen_portrait_base(bg_color, description="portrait"):
    """Create base portrait canvas."""
    img, draw, inner = make_canvas(NPC_W, NPC_H)
    bx, by = BORDER, BORDER
    # Fill background
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=bg_color)
    return img, draw, bx, by


# ── Barbarian's Cup NPCs ─────────────────────────────────────────────────

def gen_npc1_rosario():
    """Portuguese man, 50s, nervous, unkempt dark hair, dark suit, glancing over shoulder."""
    img, draw, bx, by = gen_portrait_base(90)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 20

    # Background: shop interior suggestion
    draw.rectangle([bx, by, bx + NPC_W, by + 60], fill=75)
    for i in range(3):
        sx = bx + 20 + i * 40
        draw.rectangle([sx, by + 5, sx + 30, by + 50], fill=65, outline=55)

    # Face turned slightly left (glancing over shoulder)
    face_cx = cx - 5
    draw_oval_head(draw, face_cx, cy - 5, 30, 38, 150)

    # Hair: unkempt dark
    draw_hair(draw, face_cx, cy - 35, 32, 20, 40, "unkempt")

    # Eyes glancing left
    draw_eyes(draw, face_cx, cy - 12, 10, 4, looking="left")
    # Dark circles under eyes
    for ex in [face_cx - 10, face_cx + 10]:
        draw.ellipse([ex - 6, cy - 8, ex + 6, cy - 5], fill=90)

    draw_nose(draw, face_cx, cy + 2, 5)
    draw_mouth(draw, face_cx, cy + 14, 14, "worried")

    # Dark suit
    suit_top = cy + 18
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 100], fill=50)
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 25], fill=60)
    # Collar
    draw.polygon([face_cx - 8, suit_top, face_cx, suit_top + 12, face_cx + 8, suit_top], fill=180)

    # Crucifix hint
    draw.line([face_cx, suit_top + 15, face_cx, suit_top + 30], fill=180, width=2)
    draw.line([face_cx - 4, suit_top + 20, face_cx + 4, suit_top + 20], fill=180, width=2)

    img = finalize(img, 0.14)
    return img


def gen_npc2_farouk():
    """Middle Eastern man, 30s, anxious, clean-shaven, looking at hands."""
    img, draw, bx, by = gen_portrait_base(85)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 10

    # Café background
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=80)
    draw.rectangle([bx, by + NPC_H - 40, bx + NPC_W, by + NPC_H], fill=70)
    draw.ellipse([bx + 180, by + 30, bx + 210, by + 60], fill=100)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy - 5, 28, 35, 160)
    draw_hair(draw, face_cx, cy - 32, 30, 16, 45, "short")

    # Eyes: downcast
    draw_eyes(draw, face_cx, cy - 12, 9, 3, looking="down")

    draw_nose(draw, face_cx, cy + 2, 4)
    draw_mouth(draw, face_cx, cy + 13, 12, "worried")

    # Shirt
    suit_top = cy + 18
    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 90], fill=190)
    draw.polygon([face_cx - 7, suit_top, face_cx, suit_top + 10, face_cx + 7, suit_top], fill=160)

    # Hands clasped at bottom
    hands_y = cy + 60
    draw.ellipse([face_cx - 20, hands_y - 5, face_cx + 20, hands_y + 10], fill=150)

    img = finalize(img, 0.13)
    return img


def gen_npc3_nasim():
    """Middle Eastern man, late 20s, intense, dark circles, staring — distant shot."""
    img, draw, bx, by = gen_portrait_base(95)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 30

    # Outdoor background, Coloane
    draw.rectangle([bx, by, bx + NPC_W, by + 90], fill=130)
    draw.rectangle([bx, by + 50, bx + NPC_W, by + NPC_H], fill=100)
    # Distant figure — smaller in frame
    fig_cx = cx + 10
    fig_cy = cy + 40

    draw_oval_head(draw, fig_cx, fig_cy, 16, 22, 120)
    draw_hair(draw, fig_cx, fig_cy - 20, 18, 12, 50, "short")

    # Intense staring eyes (slightly larger relative to face)
    draw_eyes(draw, fig_cx, fig_cy - 5, 7, 3)
    # Dark circles
    for ex in [fig_cx - 7, fig_cx + 7]:
        draw.ellipse([ex - 4, fig_cy - 2, ex + 4, fig_cy + 2], fill=70)

    draw_mouth(draw, fig_cx, fig_cy + 12, 8, "neutral")

    # Dark jacket
    draw.rectangle([fig_cx - 18, fig_cy + 14, fig_cx + 18, fig_cy + 70], fill=55)
    draw.rectangle([fig_cx - 18, fig_cy + 14, fig_cx + 18, fig_cy + 25], fill=65)

    img = finalize(img, 0.18)
    return img


def gen_npc4_park():
    """Korean man, 50s, serene, well-dressed, briefcase."""
    img, draw, bx, by = gen_portrait_base(100)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Modern office tower background
    draw.rectangle([bx, by, bx + NPC_W, by + 80], fill=160)
    draw.rectangle([bx + 60, by + 10, bx + 200, by + 70], fill=120, outline=90)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy, 27, 32, 170)
    draw_hair(draw, face_cx, cy - 28, 28, 14, 55, "short")

    draw_eyes(draw, face_cx, cy - 8, 9, 3)
    draw_nose(draw, face_cx, cy + 5, 4)
    draw_mouth(draw, face_cx, cy + 16, 14, "smile")

    # Well-tailored suit
    suit_top = cy + 20
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 100], fill=65)
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 22], fill=75)
    # Tie
    draw.polygon([face_cx - 3, suit_top + 5, face_cx + 3, suit_top + 5,
                  face_cx + 2, suit_top + 30, face_cx - 2, suit_top + 30], fill=100)
    # Briefcase
    draw.rectangle([face_cx + 50, cy + 60, face_cx + 90, cy + 85], fill=70, outline=50)

    img = finalize(img, 0.11)
    return img


def gen_npc5_yoon():
    """Korean woman, 40s, professional, worried, lab coat."""
    img, draw, bx, by = gen_portrait_base(85)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 10

    # Office building exit, evening
    draw.rectangle([bx, by, bx + NPC_W, by + 80], fill=100)
    draw.rectangle([bx + 70, by + 80, bx + 200, by + NPC_H], fill=80)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy - 3, 24, 30, 175)
    draw_hair(draw, face_cx, cy - 28, 26, 12, 50, "bun")

    draw_eyes(draw, face_cx, cy - 10, 8, 3)
    # Dark circles
    for ex in [face_cx - 8, face_cx + 8]:
        draw.ellipse([ex - 5, cy - 7, ex + 5, cy - 4], fill=90)

    draw_nose(draw, face_cx, cy + 3, 4)
    draw_mouth(draw, face_cx, cy + 14, 12, "worried")

    # Lab coat over business clothes
    suit_top = cy + 18
    draw.rectangle([face_cx - 30, suit_top, face_cx + 30, suit_top + 95], fill=210)
    draw.polygon([face_cx - 6, suit_top, face_cx, suit_top + 10, face_cx + 6, suit_top], fill=180)

    img = finalize(img, 0.13)
    return img


def gen_npc6_monk():
    """Chinese man, 74, bald, weathered, simple robes, wooden stick."""
    img, draw, bx, by = gen_portrait_base(105)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 25

    # Garden background
    draw.rectangle([bx, by, bx + NPC_W, by + 100], fill=130)
    draw.rectangle([bx, by + 100, bx + NPC_W, by + NPC_H], fill=100)
    # Banyan tree blobs
    draw.ellipse([bx + 10, by + 10, bx + 60, by + 50], fill=90)
    draw.ellipse([bx + 200, by + 15, bx + 270, by + 60], fill=90)

    face_cx = cx - 5
    face_cy = cy + 15
    draw_oval_head(draw, face_cx, face_cy, 22, 26, 160)
    # Bald head — just the face oval, no hair
    # Weathered features
    draw_eyes(draw, face_cx, face_cy - 6, 8, 2)
    # Crow's feet
    for ex in [face_cx - 8, face_cx + 8]:
        draw.line([ex - 5, face_cy - 5, ex - 8, face_cy - 6], fill=100, width=1)
        draw.line([ex + 5, face_cy - 5, ex + 8, face_cy - 6], fill=100, width=1)

    draw_nose(draw, face_cx, face_cy + 6, 4)
    draw_mouth(draw, face_cx, face_cy + 16, 12, "smile")

    # Simple robes
    robe_top = face_cy + 18
    draw.rectangle([face_cx - 30, robe_top, face_cx + 30, robe_top + 100], fill=90)
    draw.rectangle([face_cx - 30, robe_top, face_cx + 30, robe_top + 25], fill=100)
    # Collar
    draw.polygon([face_cx - 10, robe_top, face_cx, robe_top + 15, face_cx + 10, robe_top], fill=80)

    # Wooden stick
    draw.line([face_cx + 35, robe_top, face_cx + 60, robe_top + 80], fill=70, width=4)

    # Pigeons at feet
    for px, py, pr in [(face_cx - 30, robe_top + 90, 6), (face_cx - 15, robe_top + 95, 5),
                        (face_cx - 25, robe_top + 85, 4)]:
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=140)

    img = finalize(img, 0.12)
    return img


def gen_npc7_guterres():
    """Macanese/Portuguese man, 50s, weary, worn suit, mustache."""
    img, draw, bx, by = gen_portrait_base(90)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Police HQ background
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=105)
    draw.rectangle([bx, by, bx + NPC_W, by + 100], fill=140)
    draw.rectangle([bx + 20, by + 20, bx + 80, by + 60], fill=100)
    draw.rectangle([bx + 140, by + 20, bx + 240, by + 70], fill=100)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy, 26, 32, 155)
    draw_hair(draw, face_cx, cy - 28, 24, 14, 70, "receding")

    # Mustache
    draw.rectangle([face_cx - 8, cy + 8, face_cx + 8, cy + 14], fill=55, outline=55)

    draw_eyes(draw, face_cx, cy - 8, 9, 3)
    # Tired eyes
    for ex in [face_cx - 9, face_cx + 9]:
        draw.ellipse([ex - 5, cy - 4, ex + 5, cy - 1], fill=80)

    draw_nose(draw, face_cx, cy + 3, 4)
    draw_mouth(draw, face_cx, cy + 16, 14, "neutral")

    # Worn suit
    suit_top = cy + 20
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 100], fill=60)
    draw.rectangle([face_cx - 35, suit_top, face_cx + 35, suit_top + 22], fill=70)
    draw.polygon([face_cx - 7, suit_top, face_cx, suit_top + 10, face_cx + 7, suit_top], fill=170)

    img = finalize(img, 0.14)
    return img


def gen_npc8_chen():
    """Chinese woman, 30s, watchful, short hair, looking toward camera — distant."""
    img, draw, bx, by = gen_portrait_base(95)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 40

    # Street surveillance background
    draw.rectangle([bx, by, bx + NPC_W, by + 100], fill=110)
    draw.rectangle([bx, by + 60, bx + NPC_W, by + NPC_H], fill=130)

    # Distant figure
    fig_cx = cx + 15
    fig_cy = cy + 45
    draw_oval_head(draw, fig_cx, fig_cy, 15, 20, 165)
    draw_hair(draw, fig_cx, fig_cy - 18, 16, 10, 55, "short")

    # Direct, watchful eyes — she knows she's being watched
    draw_eyes(draw, fig_cx, fig_cy - 5, 6, 2)

    draw_mouth(draw, fig_cx, fig_cy + 10, 8, "neutral")

    # Plain clothes jacket
    draw.rectangle([fig_cx - 16, fig_cy + 12, fig_cx + 16, fig_cy + 60], fill=75)

    img = finalize(img, 0.17)
    return img


# ── Boudica Pact NPCs ───────────────────────────────────────────────────

def gen_npc1_townsfolk():
    """Group outside rural English pub, grainy distant shot, faces obscured."""
    img, draw, bx, by = gen_portrait_base(85)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 20

    # Pub exterior, dark
    draw.rectangle([bx, by, bx + NPC_W, by + 90], fill=70)
    draw.rectangle([bx, by + 90, bx + NPC_W, by + NPC_H], fill=60)
    # Pub sign
    draw.rectangle([bx + 20, by + 15, bx + 80, by + 45], fill=55, outline=80)

    # Group of figures, distant, faces obscured
    positions = [(bx + 50, cy + 50, 16), (bx + 100, cy + 35, 18), (bx + 150, cy + 55, 14),
                 (bx + 190, cy + 40, 15), (bx + 130, cy + 60, 12), (bx + 70, cy + 60, 13)]

    for px, py, pr in positions:
        # Body
        draw.ellipse([px - pr, py - pr, px + pr, py + pr + 15], fill=80)
        # Head (blurred/obscured)
        draw.ellipse([px - pr // 2, py - pr - 5, px + pr // 2, py - 2], fill=100)

    img = finalize(img, 0.22)
    return img


def gen_npc2_price():
    """English woman, 40s, tweed jacket, glasses, tired, standing near display case."""
    img, draw, bx, by = gen_portrait_base(90)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 10

    # Museum interior
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=100)
    # Display case
    draw.rectangle([bx + 20, by + 120, bx + 120, by + 180], fill=70, outline=50)
    draw.rectangle([bx + 25, by + 125, bx + 115, by + 175], fill=85)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy - 3, 26, 30, 165)
    draw_hair(draw, face_cx, cy - 30, 28, 16, 60, "short")

    # Glasses
    draw_glasses(draw, face_cx, cy - 8, 9)

    draw_eyes(draw, face_cx, cy - 8, 9, 2, looking="down")
    # Dark circles
    for ex in [face_cx - 9, face_cx + 9]:
        draw.ellipse([ex - 5, cy - 5, ex + 5, cy - 2], fill=85)

    draw_nose(draw, face_cx, cy + 3, 4)
    draw_mouth(draw, face_cx, cy + 14, 12, "worried")

    # Tweed jacket
    suit_top = cy + 18
    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 90], fill=105)
    # Tweed texture hints
    for _ in range(10):
        tx = face_cx - 28 + random.randint(0, 56)
        ty = suit_top + random.randint(5, 85)
        draw.line([tx, ty, tx + 2, ty], fill=90, width=1)

    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 20], fill=115)

    img = finalize(img, 0.13)
    return img


def gen_npc3_okonkwo():
    """Black British man, 50s, security uniform, kind face, night shift."""
    img, draw, bx, by = gen_portrait_base(75)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Night security station
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=55)
    draw.rectangle([bx, by + 30, bx + NPC_W, by + 80], fill=70)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy, 28, 34, 130)
    draw_hair(draw, face_cx, cy - 30, 30, 14, 35, "short")

    draw_eyes(draw, face_cx, cy - 8, 9, 3)
    draw_nose(draw, face_cx, cy + 5, 5)
    draw_mouth(draw, face_cx, cy + 16, 14, "smile")

    # Security uniform
    suit_top = cy + 20
    draw.rectangle([face_cx - 34, suit_top, face_cx + 34, suit_top + 90], fill=60)
    draw.rectangle([face_cx - 34, suit_top, face_cx + 34, suit_top + 20], fill=70)
    # Badge
    draw.rectangle([face_cx - 18, suit_top + 10, face_cx - 5, suit_top + 25], fill=120, outline=40)

    img = finalize(img, 0.15)
    return img


def gen_npc4_matteo():
    """Italian man, 60s, priest's cassock, spectacles, library corridor."""
    img, draw, bx, by = gen_portrait_base(80)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 20

    # Library corridor
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=85)
    # Corridor perspective
    for i in range(5):
        lx = bx + 60 - i * 8
        rx = bx + NPC_W - 60 + i * 8
        my = by + 20 + i * 35
        draw.rectangle([lx, my, rx, my + 30], fill=75, outline=65)

    face_cx = cx
    face_cy = cy
    draw_oval_head(draw, face_cx, face_cy, 24, 30, 155)
    draw_hair(draw, face_cx, face_cy - 28, 26, 14, 100, "receding")

    # Spectacles
    draw_glasses(draw, face_cx, face_cy - 8, 8)

    draw_eyes(draw, face_cx, face_cy - 8, 8, 2)
    draw_nose(draw, face_cx, face_cy + 4, 4)
    draw_mouth(draw, face_cx, face_cy + 14, 12, "smile")

    # Priest's cassock
    suit_top = face_cy + 18
    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 110], fill=35)
    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 30], fill=45)
    # Roman collar
    draw.rectangle([face_cx - 4, suit_top + 5, face_cx + 4, suit_top + 15], fill=200)
    draw.rectangle([face_cx - 4, suit_top + 5, face_cx + 4, suit_top + 8], fill=30)

    img = finalize(img, 0.12)
    return img


def gen_npc5_rhys():
    """Welsh woman, 71, cardigan, white hair in bun, gardening gloves."""
    img, draw, bx, by = gen_portrait_base(110)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 30

    # Garden background
    draw.rectangle([bx, by, bx + NPC_W, by + 80], fill=145)
    draw.rectangle([bx, by + 80, bx + NPC_W, by + NPC_H], fill=110)
    # Plants/flowers hints
    for i in range(6):
        px = bx + 30 + i * 45
        draw.ellipse([px, by + 10, px + 15, by + 30], fill=100)
        draw.ellipse([px + 20, by + 20, px + 35, by + 40], fill=90)

    face_cx = cx
    face_cy = cy + 10
    draw_oval_head(draw, face_cx, face_cy, 24, 28, 155)
    # White hair in bun
    draw_hair(draw, face_cx, face_cy - 26, 26, 14, 210, "bun")

    draw_eyes(draw, face_cx, face_cy - 6, 8, 2)
    # Crow's feet
    for ex in [face_cx - 8, face_cx + 8]:
        draw.line([ex - 5, face_cy - 5, ex - 8, face_cy - 6], fill=110, width=1)
        draw.line([ex + 5, face_cy - 5, ex + 8, face_cy - 6], fill=110, width=1)

    draw_nose(draw, face_cx, face_cy + 5, 4)
    draw_mouth(draw, face_cx, face_cy + 15, 12, "smile")

    # Cardigan
    suit_top = face_cy + 20
    draw.rectangle([face_cx - 32, suit_top, face_cx + 32, suit_top + 90], fill=120)
    # Cardigan texture hints
    for _ in range(8):
        draw.line([face_cx - 28 + random.randint(0, 56), suit_top + random.randint(5, 85),
                   face_cx - 26 + random.randint(0, 56), suit_top + random.randint(5, 85)], fill=105, width=1)

    # Gardening gloves
    draw.ellipse([face_cx - 25, suit_top + 70, face_cx - 10, suit_top + 85], fill=140)
    draw.ellipse([face_cx + 10, suit_top + 70, face_cx + 25, suit_top + 85], fill=140)

    img = finalize(img, 0.11)
    return img


def gen_npc6_dunn():
    """English man, 50s, weathered, flat cap, worn coat, distant field shot."""
    img, draw, bx, by = gen_portrait_base(100)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 50

    # Field background, distant
    draw.rectangle([bx, by, bx + NPC_W, by + 70], fill=150)
    draw.rectangle([bx, by + 70, bx + NPC_W, by + NPC_H], fill=110)
    # Distant hedgerow
    draw.rectangle([bx, by + 50, bx + NPC_W, by + 55], fill=80)

    # Distant figure
    fig_cx = cx + 20
    fig_cy = cy + 60

    # Flat cap
    draw.ellipse([fig_cx - 16, fig_cy - 10, fig_cx + 16, fig_cy + 5], fill=60)
    draw.ellipse([fig_cx - 14, fig_cy - 14, fig_cx + 14, fig_cy - 4], fill=70)

    draw_oval_head(draw, fig_cx, fig_cy, 12, 16, 140)

    draw_eyes(draw, fig_cx, fig_cy - 3, 5, 2)
    draw_mouth(draw, fig_cx, fig_cy + 8, 6, "neutral")

    # Worn coat
    draw.rectangle([fig_cx - 15, fig_cy + 10, fig_cx + 15, fig_cy + 60], fill=80)

    img = finalize(img, 0.16)
    return img


def gen_npc7_croft():
    """English man, 40s, clipboard, practical jacket, roadblock."""
    img, draw, bx, by = gen_portrait_base(95)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Roadblock background
    draw.rectangle([bx, by, bx + NPC_W, by + 80], fill=140)
    draw.rectangle([bx, by + 80, bx + NPC_W, by + NPC_H], fill=105)
    # Barrier
    draw.rectangle([bx + 20, by + 100, bx + NPC_W - 20, by + 110], fill=170, outline=60)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy - 3, 26, 30, 160)
    draw_hair(draw, face_cx, cy - 28, 28, 14, 60, "short")

    draw_eyes(draw, face_cx, cy - 8, 9, 3)
    draw_nose(draw, face_cx, cy + 3, 4)
    draw_mouth(draw, face_cx, cy + 14, 12, "neutral")

    # Practical jacket
    suit_top = cy + 18
    draw.rectangle([face_cx - 33, suit_top, face_cx + 33, suit_top + 90], fill=85)
    draw.rectangle([face_cx - 33, suit_top, face_cx + 33, suit_top + 22], fill=95)
    # Clipboard
    draw.rectangle([face_cx + 25, suit_top + 10, face_cx + 55, suit_top + 50], fill=200, outline=60)
    draw.line([face_cx + 30, suit_top + 20, face_cx + 50, suit_top + 20], fill=100, width=1)
    draw.line([face_cx + 30, suit_top + 30, face_cx + 50, suit_top + 30], fill=100, width=1)
    draw.line([face_cx + 30, suit_top + 40, face_cx + 50, suit_top + 40], fill=100, width=1)

    img = finalize(img, 0.13)
    return img


def gen_npc8_entity():
    """The Red Woman — smudge, heat-haze, barely visible female figure in field at twilight."""
    img, draw, bx, by = gen_portrait_base(70)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2

    # Deep twilight field
    draw.rectangle([bx, by, bx + NPC_W, by + 60], fill=50)
    draw.rectangle([bx, by + 60, bx + NPC_W, by + NPC_H], fill=40)

    # Barely visible figure — very low opacity, smudged
    fig_cx = cx + 20
    fig_cy = cy + 30

    # Very faint female figure silhouette
    # Head
    draw.ellipse([fig_cx - 10, fig_cy - 45, fig_cx + 10, fig_cy - 25], fill=90)
    # Hair flowing
    draw.ellipse([fig_cx - 14, fig_cy - 50, fig_cx + 14, fig_cy - 30], fill=85)
    # Body — barely there
    draw.ellipse([fig_cx - 12, fig_cy - 25, fig_cx + 12, fig_cy + 20], fill=85)
    # Arms
    draw.ellipse([fig_cx - 18, fig_cy - 20, fig_cx - 5, fig_cy + 5], fill=82)
    draw.ellipse([fig_cx + 5, fig_cy - 15, fig_cx + 20, fig_cy], fill=82)

    # Blur the figure heavily
    img = img.filter(ImageFilter.GaussianBlur(radius=3))

    # Heat haze effect — apply multiple blurred overlays
    haze_layer = Image.new("L", img.size, 0)
    haze_draw = ImageDraw.Draw(haze_layer)
    for _ in range(20):
        hx = fig_cx + random.randint(-30, 30)
        hy = fig_cy + random.randint(-40, 40)
        hr = random.randint(5, 15)
        haze_draw.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=random.randint(40, 80))

    haze_layer = haze_layer.filter(ImageFilter.GaussianBlur(radius=5))
    # Blend haze
    img_arr = img.load()
    haze_arr = haze_layer.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            if y < BORDER or y >= img.size[1] - BORDER or x < BORDER or x >= img.size[0] - BORDER:
                continue
            h = haze_arr[x, y]
            if h > 0:
                img_arr[x, y] = min(200, img_arr[x, y] + h // 3)

    img = finalize(img, 0.20)
    return img


# ── Cormsil Compact NPCs ────────────────────────────────────────────────

def gen_npc1_eleanor():
    """English woman, 60s, exhausted, cardigan, glasses, armchair, through window."""
    img, draw, bx, by = gen_portrait_base(75)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 20

    # Window frame
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=90)
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], outline=50, width=6)
    # Window cross
    draw.line([cx, by, cx, by + NPC_H], fill=50, width=4)
    draw.line([bx, by + NPC_H // 2, bx + NPC_W, by + NPC_H // 2], fill=50, width=4)

    # Interior through window — upper right quadrant
    qx, qy = cx + 3, by + 3
    qw, qh = NPC_W // 2 - 6, NPC_H // 2 - 6
    draw.rectangle([qx, qy, qx + qw, qy + qh], fill=65)

    # Figure in armchair
    fig_cx = qx + qw // 2 + 5
    fig_cy = qy + qh // 2 + 5

    draw_oval_head(draw, fig_cx, fig_cy - 5, 14, 18, 145)
    draw_hair(draw, fig_cx, fig_cy - 20, 16, 10, 180, "short")

    # Glasses
    draw_glasses(draw, fig_cx, fig_cy - 5, 5)

    draw_eyes(draw, fig_cx, fig_cy - 5, 5, 1, looking="down")
    draw_mouth(draw, fig_cx, fig_cy + 8, 7, "worried")

    # Cardigan in armchair
    draw.rectangle([fig_cx - 16, fig_cy + 10, fig_cx + 16, fig_cy + 50], fill=100)
    # Armchair
    draw.rectangle([fig_cx - 20, fig_cy + 10, fig_cx + 20, fig_cy + 55], fill=70, outline=55)

    img = finalize(img, 0.14)
    return img


def gen_npc2_dwerryhouse():
    """English man, 50s, gruff, flat cap, worn coat, field near standing stone."""
    img, draw, bx, by = gen_portrait_base(100)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 40

    # Field with standing stone in background
    draw.rectangle([bx, by, bx + NPC_W, by + 70], fill=150)
    draw.rectangle([bx, by + 70, bx + NPC_W, by + NPC_H], fill=105)
    # Standing stone silhouette
    draw.rectangle([bx + 180, by + 10, bx + 210, by + 80], fill=65)

    fig_cx = cx - 10
    fig_cy = cy + 45

    # Flat cap
    draw.ellipse([fig_cx - 18, fig_cy - 8, fig_cx + 18, fig_cy + 8], fill=55)
    draw.ellipse([fig_cx - 15, fig_cy - 14, fig_cx + 15, fig_cy - 2], fill=65)

    draw_oval_head(draw, fig_cx, fig_cy, 16, 20, 145)

    draw_eyes(draw, fig_cx, fig_cy - 5, 6, 2)
    draw_nose(draw, fig_cx, fig_cy + 4, 4)
    draw_mouth(draw, fig_cx, fig_cy + 12, 8, "frown")

    # Worn coat
    draw.rectangle([fig_cx - 18, fig_cy + 14, fig_cx + 18, fig_cy + 70], fill=80)

    img = finalize(img, 0.15)
    return img


def gen_npc3_threlfall():
    """English man, 40s, dog collar, kind anxious face, church doorway."""
    img, draw, bx, by = gen_portrait_base(80)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Church doorway
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=65)
    # Doorway arch
    draw.arc([bx + 30, by + 10, bx + NPC_W - 30, by + 130], 180, 0, fill=85, width=0)
    draw.rectangle([bx + 30, by + 75, bx + NPC_W - 30, by + NPC_H], fill=85)

    face_cx = cx
    face_cy = cy
    draw_oval_head(draw, face_cx, face_cy - 3, 24, 30, 155)
    draw_hair(draw, face_cx, face_cy - 30, 26, 14, 70, "receding")

    draw_eyes(draw, face_cx, face_cy - 8, 8, 2)
    # Anxious eyebrows
    draw.line([face_cx - 12, face_cy - 14, face_cx - 5, face_cy - 11], fill=50, width=2)
    draw.line([face_cx + 5, face_cy - 11, face_cx + 12, face_cy - 14], fill=50, width=2)

    draw_nose(draw, face_cx, face_cy + 3, 4)
    draw_mouth(draw, face_cx, face_cy + 14, 12, "smile")

    # Clerical shirt with dog collar
    suit_top = face_cy + 18
    draw.rectangle([face_cx - 30, suit_top, face_cx + 30, suit_top + 90], fill=40)
    draw.rectangle([face_cx - 30, suit_top, face_cx + 30, suit_top + 25], fill=50)
    # Dog collar
    draw.rectangle([face_cx - 4, suit_top + 5, face_cx + 4, suit_top + 14], fill=210)
    draw.rectangle([face_cx - 4, suit_top + 5, face_cx + 4, suit_top + 8], fill=35)

    img = finalize(img, 0.13)
    return img


def gen_npc4_mary():
    """English woman, 50s, gentle face, slightly vacant, stiff posture, distant."""
    img, draw, bx, by = gen_portrait_base(95)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 40

    # Distant shot across a room
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=100)
    draw.rectangle([bx, by + 20, bx + NPC_W, by + 70], fill=120)
    # Doorway in background
    draw.rectangle([bx + 200, by + 10, bx + 260, by + 90], fill=80, outline=60)

    fig_cx = cx - 15
    fig_cy = cy + 50

    draw_oval_head(draw, fig_cx, fig_cy, 14, 18, 150)
    draw_hair(draw, fig_cx, fig_cy - 16, 15, 10, 160, "short")

    draw_eyes(draw, fig_cx, fig_cy - 4, 5, 1)
    draw_mouth(draw, fig_cx, fig_cy + 8, 7, "neutral")

    # Stiff posture dress
    draw.rectangle([fig_cx - 14, fig_cy + 12, fig_cx + 14, fig_cy + 60], fill=110)

    img = finalize(img, 0.16)
    return img


def gen_npc5_margaret():
    """English woman, 40s, calm, analytical, neat, near burned library."""
    img, draw, bx, by = gen_portrait_base(80)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 15

    # Burned library background
    draw.rectangle([bx, by, bx + NPC_W, by + 80], fill=120)
    draw.rectangle([bx, by + 80, bx + NPC_W, by + NPC_H], fill=80)
    # Burn damage hints
    draw.rectangle([bx + 120, by + 20, bx + 180, by + 70], fill=50, outline=40)
    draw.rectangle([bx + 180, by + 10, bx + 240, by + 50], fill=55, outline=45)

    face_cx = cx
    draw_oval_head(draw, face_cx, cy - 3, 24, 30, 170)
    draw_hair(draw, face_cx, cy - 30, 26, 14, 50, "bun")

    draw_eyes(draw, face_cx, cy - 8, 8, 2)
    draw_nose(draw, face_cx, cy + 3, 4)
    draw_mouth(draw, face_cx, cy + 14, 10, "neutral")

    # Neat attire
    suit_top = cy + 18
    draw.rectangle([face_cx - 28, suit_top, face_cx + 28, suit_top + 85], fill=100)
    draw.rectangle([face_cx - 28, suit_top, face_cx + 28, suit_top + 20], fill=115)

    img = finalize(img, 0.14)
    return img


def gen_npc6_domere():
    """The Dōmere — Standing stone in field at dusk, slightly luminous."""
    img, draw, bx, by = gen_portrait_base(60)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2

    # Dusk sky
    for y_off in range(by, by + NPC_H):
        ratio = (y_off - by) / NPC_H
        tone = int(50 + ratio * 40)
        draw.line([bx, y_off, bx + NPC_W, y_off], fill=tone)

    # Ground
    draw.rectangle([bx, by + 160, bx + NPC_W, by + NPC_H], fill=40)
    # Darker soil around base
    draw.ellipse([bx + 80, by + 140, bx + 220, by + 180], fill=35)

    # Standing stone — tall, slightly luminous
    stone_l = cx - 15
    stone_r = cx + 15
    stone_top = by + 20
    stone_bot = by + 155

    # Stone body with slight irregularity
    draw.rectangle([stone_l, stone_top, stone_r, stone_bot], fill=80)
    draw.rectangle([stone_l + 2, stone_top + 5, stone_r - 2, stone_bot - 5], fill=95)

    # Luminous effect — faint glow around upper portion
    glow = Image.new("L", img.size, 0)
    glow_draw = ImageDraw.Draw(glow)
    for r in range(10, 40, 2):
        alpha = max(0, 80 - r * 2)
        glow_draw.ellipse([cx - r, stone_top - r + 20, cx + r, stone_top + r + 20], fill=alpha)
    glow = glow.filter(ImageFilter.GaussianBlur(radius=6))

    # Blend glow
    img_arr = img.load()
    glow_arr = glow.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            g = glow_arr[x, y]
            if g > 0:
                img_arr[x, y] = min(GRAY_MAX, img_arr[x, y] + g // 2)

    # Long exposure feel — slight horizontal blur on the stone
    stone_region = img.crop((stone_l - 5, stone_top - 5, stone_r + 5, stone_bot + 5))
    stone_region = stone_region.filter(ImageFilter.GaussianBlur(radius=0.8))
    img.paste(stone_region, (stone_l - 5, stone_top - 5))

    img = finalize(img, 0.15)
    return img


def gen_npc7_colne():
    """Sir Geoffrey Colne — 17th-century engraved portrait style, high contrast, crosshatch texture."""
    img, draw, bx, by = gen_portrait_base(150)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2 - 10

    # Light aged paper background
    draw.rectangle([bx, by, bx + NPC_W, by + NPC_H], fill=190)

    # Cavalier portrait — high contrast line art feel
    face_cx = cx
    face_cy = cy - 5

    # Face outline (oval with strong chin)
    draw.ellipse([face_cx - 25, face_cy - 30, face_cx + 25, face_cy + 15], fill=180)
    draw.ellipse([face_cx - 24, face_cy - 29, face_cx + 24, face_cy + 14], outline=40, width=2)

    # Long hair — Cavalier style
    draw.ellipse([face_cx - 30, face_cy - 35, face_cx + 30, face_cy + 5], fill=100)
    draw.rectangle([face_cx - 30, face_cy - 15, face_cx - 10, face_cy + 50], fill=100)
    draw.rectangle([face_cx + 10, face_cy - 15, face_cx + 30, face_cy + 50], fill=100)
    # Hair texture — crosshatch lines
    for _ in range(30):
        hx = face_cx - 28 + random.randint(0, 56)
        hy = face_cy - 30 + random.randint(0, 75)
        draw.line([hx, hy, hx + 2, hy + random.randint(-2, 2)], fill=80, width=1)

    # Eyes — intense, engraved style
    for ex in [face_cx - 10, face_cx + 10]:
        draw.ellipse([ex - 5, face_cy - 10, ex + 5, face_cy - 2], fill=210)
        draw.ellipse([ex - 3, face_cy - 8, ex + 3, face_cy - 4], fill=30)
        draw.ellipse([ex - 1, face_cy - 7, ex + 1, face_cy - 5], fill=220)

    # Strong nose
    draw.line([face_cx, face_cy - 5, face_cx - 3, face_cy + 5], fill=40, width=2)
    draw.line([face_cx - 3, face_cy + 5, face_cx, face_cy + 8], fill=40, width=2)
    # Nostril
    draw.ellipse([face_cx - 5, face_cy + 6, face_cx, face_cy + 10], fill=40)

    # Mouth — firm line
    draw.line([face_cx - 8, face_cy + 16, face_cx + 8, face_cy + 16], fill=40, width=2)
    # Mustache/goatee hint
    draw.line([face_cx - 6, face_cy + 13, face_cx + 6, face_cy + 13], fill=80, width=1)

    # Cavalier collar / attire
    suit_top = face_cy + 18
    # Large collar
    draw.polygon([face_cx - 35, suit_top, face_cx - 15, suit_top - 10, face_cx, suit_top + 5], fill=170)
    draw.polygon([face_cx + 35, suit_top, face_cx + 15, suit_top - 10, face_cx, suit_top + 5], fill=170)
    # Doublet
    draw.rectangle([face_cx - 35, suit_top + 5, face_cx + 35, suit_top + 80], fill=140)
    # Doublet lines
    for i in range(4):
        line_x = face_cx - 20 + i * 13
        draw.line([line_x, suit_top + 5, line_x, suit_top + 80], fill=120, width=1)

    # Quill in hand
    quill_x = face_cx + 45
    quill_y = suit_top + 30
    draw.line([quill_x, quill_y, quill_x + 5, quill_y - 40], fill=50, width=2)
    draw.ellipse([quill_x - 3, quill_y - 45, quill_x + 8, quill_y - 35], fill=40)

    # Manuscript below
    draw.rectangle([face_cx - 30, suit_top + 85, face_cx + 20, suit_top + 105], fill=200, outline=80)
    # Text lines on manuscript
    for i in range(4):
        ly = suit_top + 90 + i * 5
        draw.line([face_cx - 25, ly, face_cx + 15, ly], fill=120, width=1)

    # Crosshatch texture overlay
    for _ in range(200):
        hx = bx + random.randint(0, NPC_W)
        hy = by + random.randint(0, NPC_H)
        length = random.randint(2, 8)
        angle = random.choice([0, 45, 90, 135])
        if angle == 0:
            draw.line([hx, hy, hx + length, hy], fill=160, width=1)
        elif angle == 45:
            draw.line([hx, hy, hx + length, hy + length], fill=160, width=1)
        elif angle == 90:
            draw.line([hx, hy, hx, hy + length], fill=160, width=1)
        else:
            draw.line([hx, hy, hx + length, hy - length], fill=160, width=1)

    img = finalize(img, 0.08)
    return img


def gen_npc8_society():
    """Victorian building, curtains drawn, brass plaque overexposed, no people."""
    img, draw, bx, by = gen_portrait_base(120)
    cx, cy = bx + NPC_W // 2, by + NPC_H // 2

    # Sky
    draw.rectangle([bx, by, bx + NPC_W, by + 60], fill=160)

    # Victorian townhouse facade
    draw.rectangle([bx + 30, by + 40, bx + NPC_W - 30, by + NPC_H], fill=100)

    # Roof
    draw.polygon([bx + 20, by + 50, cx, by + 10, bx + NPC_W - 20, by + 50], fill=70)

    # Windows — dark, curtains drawn
    for wx, wy in [(bx + 60, by + 70), (bx + 180, by + 70), (bx + 60, by + 160), (bx + 180, by + 160)]:
        draw.rectangle([wx, wy, wx + 40, wy + 55], fill=35, outline=50)
        # Curtains
        draw.rectangle([wx + 2, wy + 2, wx + 18, wy + 53], fill=45)
        draw.rectangle([wx + 22, wy + 2, wx + 38, wy + 53], fill=45)
        # Curtain tie-backs
        draw.line([wx + 18, wy + 15, wx + 22, wy + 15], fill=60, width=2)
        draw.line([wx + 18, wy + 35, wx + 22, wy + 35], fill=60, width=2)

    # Front door
    draw.rectangle([cx - 20, by + 180, cx + 20, by + NPC_H], fill=50, outline=40)
    draw.ellipse([cx - 3, by + 215, cx + 3, by + 220], fill=100)

    # Brass plaque — overexposed (very bright)
    draw.rectangle([cx - 25, by + 165, cx + 25, by + 180], fill=235, outline=180)
    draw.rectangle([cx - 22, by + 167, cx + 22, by + 178], fill=245)

    # Steps
    for i in range(3):
        step_y = by + NPC_H - 10 + i * 6
        draw.rectangle([cx - 30, step_y, cx + 30, step_y + 5], fill=80, outline=60)

    img = finalize(img, 0.10)
    return img


# ══════════════════════════════════════════════════════════════════════════
#  RELIC IMAGE GENERATORS
# ══════════════════════════════════════════════════════════════════════════

def gen_relic_teacup():
    """Cracked stoneware teacup, tenmoku glaze, ruler for scale, evidence photo."""
    img, draw, inner = make_canvas(REL_W, REL_H)
    bx, by = BORDER, BORDER
    w, h = REL_W, REL_H
    cx, cy = bx + w // 2, by + h // 2

    # Evidence photo background — neutral gray
    draw.rectangle([bx, by, bx + w, by + h], fill=135)

    # Table surface (bottom half)
    draw.rectangle([bx, by + h // 2 + 10, bx + w, by + h], fill=110)
    # Table edge line
    draw.line([bx, by + h // 2 + 10, bx + w, by + h // 2 + 10], fill=90, width=2)

    # Ruler for scale
    ruler_x = bx + 20
    ruler_y = by + h - 40
    draw.rectangle([ruler_x, ruler_y, ruler_x + 220, ruler_y + 10], fill=210, outline=80)
    for i in range(0, 221, 20):
        tick_h = 6 if i % 40 == 0 else 3
        draw.line([ruler_x + i, ruler_y, ruler_x + i, ruler_y + tick_h], fill=50, width=1)

    # Teacup — positioned left of center
    cup_cx = cx - 30
    cup_cy = cy

    # Cup body — unglazed stoneware exterior
    cup_w, cup_h = 60, 50
    draw.rectangle([cup_cx - cup_w // 2, cup_cy - cup_h, cup_cx + cup_w // 2, cup_cy + 5], fill=95)
    # Slightly tapered sides
    draw.polygon([cup_cx - cup_w // 2 + 4, cup_cy - cup_h, cup_cx - cup_w // 2, cup_cy + 5,
                  cup_cx + cup_w // 2, cup_cy + 5, cup_cx + cup_w // 2 - 4, cup_cy - cup_h], fill=90)

    # Cup opening ellipse
    draw.ellipse([cup_cx - cup_w // 2 + 2, cup_cy - cup_h - 8, cup_cx + cup_w // 2 - 2, cup_cy - cup_h + 8], fill=30)

    # Dark tenmoku glaze inside rim
    draw.ellipse([cup_cx - cup_w // 2 + 8, cup_cy - cup_h - 4, cup_cx + cup_w // 2 - 8, cup_cy - cup_h + 10], fill=20)

    # Crack from rim to base
    crack_start_x = cup_cx - 5
    crack_x = crack_start_x
    crack_y = cup_cy - cup_h - 2
    crack_points = []
    for step in range(15):
        crack_x += random.randint(-3, 3)
        crack_y += random.randint(3, 5)
        crack_points.append((crack_x, min(crack_y, cup_cy + 5)))
    for i in range(len(crack_points) - 1):
        draw.line([crack_points[i], crack_points[i + 1]], fill=35, width=1)

    # Slight highlight on cup
    draw.ellipse([cup_cx - 20, cup_cy - cup_h + 5, cup_cx - 10, cup_cy - 15], fill=120)
    draw.ellipse([cup_cx - 18, cup_cy - cup_h + 5, cup_cx - 12, cup_cy - 12], fill=140)

    # Subtle heat-haze above cup
    for _ in range(8):
        hx = cup_cx + random.randint(-30, 30)
        hy = cup_cy - cup_h - 10 + random.randint(-10, 5)
        hr = random.randint(8, 20)
        draw.ellipse([hx - hr, hy - hr // 2, hx + hr, hy + hr // 2], fill=180)

    img = finalize(img, 0.10)
    return img


def gen_relic_coin():
    """Gold Anglo-Saxon coin in white cotton gloves, evidence photo."""
    img, draw, inner = make_canvas(REL_W, REL_H)
    bx, by = BORDER, BORDER
    w, h = REL_W, REL_H
    cx, cy = bx + w // 2, by + h // 2

    # Dark background
    draw.rectangle([bx, by, bx + w, by + h], fill=50)
    draw.rectangle([bx, by, bx + w, by + h // 2 + 30], fill=60)

    # White cotton gloves holding coin
    glove_l_cx = cx - 50
    glove_l_cy = cy + 10
    glove_r_cx = cx + 50
    glove_r_cy = cy + 5

    for gx, gy in [(glove_l_cx, glove_l_cy), (glove_r_cx, glove_r_cy)]:
        # Glove palm / fingers
        draw.ellipse([gx - 30, gy - 20, gx + 30, gy + 20], fill=210)
        draw.ellipse([gx - 35, gy - 15, gx + 35, gy + 25], fill=220)
        # Fingers — two visible fingers
        draw.ellipse([gx - 25, gy - 35, gx - 10, gy - 10], fill=200)
        draw.ellipse([gx + 5, gy - 38, gx + 20, gy - 12], fill=200)
        # Glove texture seam
        draw.line([gx - 5, gy - 25, gx + 5, gy + 25], fill=190, width=1)

    # Coin — gold, tilted slightly
    coin_cx = cx
    coin_cy = cy - 15
    coin_r = 38

    # Coin disc
    draw.ellipse([coin_cx - coin_r, coin_cy - coin_r, coin_cx + coin_r, coin_cy + coin_r], fill=170)
    draw.ellipse([coin_cx - coin_r + 2, coin_cy - coin_r + 2, coin_cx + coin_r - 2, coin_cy + coin_r - 2], fill=180)
    draw.ellipse([coin_cx - coin_r + 5, coin_cy - coin_r + 5, coin_cx + coin_r - 5, coin_cy + coin_r - 5], fill=185)
    draw.ellipse([coin_cx - coin_r + 8, coin_cy - coin_r + 8, coin_cx + coin_r - 8, coin_cy + coin_r - 8], fill=190, outline=160, width=2)

    # Woman's face on obverse — stylized
    # Hair
    draw.ellipse([coin_cx - 18, coin_cy - 25, coin_cx + 18, coin_cy + 5], fill=175)
    # Face profile
    draw.ellipse([coin_cx - 10, coin_cy - 18, coin_cx + 10, coin_cy + 5], fill=200)
    # Eye
    draw.ellipse([coin_cx - 3, coin_cy - 12, coin_cx + 2, coin_cy - 8], fill=160)
    # Nose
    draw.line([coin_cx + 5, coin_cy - 10, coin_cx + 8, coin_cy - 3], fill=160, width=1)
    # Mouth
    draw.line([coin_cx - 2, coin_cy - 1, coin_cx + 4, coin_cy - 1], fill=160, width=1)
    # Neck
    draw.rectangle([coin_cx - 4, coin_cy + 5, coin_cx + 4, coin_cy + 15], fill=195)

    # Heptagonal pattern on reverse (shown as edge detail) — not visible from obverse
    # Instead show rim lettering hints
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        lx = coin_cx + int((coin_r - 8) * math.cos(rad))
        ly = coin_cy + int((coin_r - 8) * math.sin(rad))
        draw.ellipse([lx - 1, ly - 1, lx + 1, ly + 1], fill=150)

    # Coin shine
    draw.ellipse([coin_cx - 10, coin_cy - 30, coin_cx + 5, coin_cy - 20], fill=220)

    img = finalize(img, 0.09)
    return img


def gen_relic_manual():
    """Victorian leather journal, open to diagrams page, faded brown ink, library table."""
    img, draw, inner = make_canvas(REL_W, REL_H)
    bx, by = BORDER, BORDER
    w, h = REL_W, REL_H
    cx, cy = bx + w // 2, by + h // 2

    # Library table background
    draw.rectangle([bx, by, bx + w, by + h], fill=100)
    # Table surface
    draw.rectangle([bx, by, bx + w, by + 60], fill=115)
    draw.rectangle([bx, by + 60, bx + w, by + h], fill=105)

    # Open journal
    book_cx = cx
    book_cy = cy + 5
    page_w = 70
    page_h = 100

    # Left page
    draw.rectangle([book_cx - page_w, book_cy - page_h // 2, book_cx, book_cy + page_h // 2], fill=195)
    draw.rectangle([book_cx - page_w + 1, book_cy - page_h // 2 + 1, book_cx - 1, book_cy + page_h // 2 - 1], fill=200)

    # Right page
    draw.rectangle([book_cx, book_cy - page_h // 2, book_cx + page_w, book_cy + page_h // 2], fill=190)
    draw.rectangle([book_cx + 1, book_cy - page_h // 2 + 1, book_cx + page_w - 1, book_cy + page_h // 2 - 1], fill=198)

    # Spine line
    draw.line([book_cx, book_cy - page_h // 2, book_cx, book_cy + page_h // 2], fill=140, width=2)

    # Leather cover visible at edges
    draw.rectangle([book_cx - page_w - 8, book_cy - page_h // 2 - 5, book_cx - page_w, book_cy + page_h // 2 + 5], fill=70)
    draw.rectangle([book_cx + page_w, book_cy - page_h // 2 - 5, book_cx + page_w + 8, book_cy + page_h // 2 + 5], fill=70)
    draw.rectangle([book_cx - page_w - 8, book_cy - page_h // 2 - 5, book_cx + page_w + 8, book_cy - page_h // 2], fill=65)

    # Left page: diagrams — circles and arrows in brown ink
    ink_color = 100  # faded brown
    # Circle diagram
    draw.ellipse([book_cx - page_w + 15, book_cy - 20, book_cx - page_w + 55, book_cy + 20], outline=ink_color, width=1)
    draw.ellipse([book_cx - page_w + 20, book_cy - 15, book_cx - page_w + 50, book_cy + 15], outline=ink_color, width=1)
    # Inner circle
    draw.ellipse([book_cx - page_w + 25, book_cy - 10, book_cx - page_w + 45, book_cy + 10], fill=ink_color + 30)
    # Arrows
    draw.line([book_cx - page_w + 55, book_cy, book_cx - page_w + 65, book_cy], fill=ink_color, width=1)
    draw.polygon([book_cx - page_w + 65, book_cy - 3, book_cx - page_w + 70, book_cy, book_cx - page_w + 65, book_cy + 3], fill=ink_color)
    # Annotation squiggles
    for i in range(5):
        sy = book_cy - 30 + i * 12
        draw.line([book_cx - page_w + 10, sy, book_cx - page_w + 10 + random.randint(30, 50), sy], fill=ink_color, width=1)

    # Right page: more diagrams and procedural notes
    # Rectangle with annotations
    draw.rectangle([book_cx + 15, book_cy - 25, book_cx + page_w - 15, book_cy + 5], outline=ink_color, width=1)
    # Diagonal cross
    draw.line([book_cx + 15, book_cy - 25, book_cx + page_w - 15, book_cy + 5], fill=ink_color, width=1)
    draw.line([book_cx + page_w - 15, book_cy - 25, book_cx + 15, book_cy + 5], fill=ink_color, width=1)
    # Arrow from cross
    draw.line([book_cx + page_w - 15, book_cy - 10, book_cx + page_w - 5, book_cy - 30], fill=ink_color, width=1)
    draw.polygon([book_cx + page_w - 8, book_cy - 30, book_cx + page_w - 5, book_cy - 35, book_cx + page_w - 2, book_cy - 30], fill=ink_color)

    # Text lines (squiggles)
    for i in range(6):
        sy = book_cy + 15 + i * 10
        draw.line([book_cx + 8, sy, book_cx + 8 + random.randint(40, 55), sy], fill=ink_color, width=1)

    # Bottom annotation
    draw.line([book_cx + 10, book_cy + 75, book_cx + page_w - 15, book_cy + 75], fill=ink_color, width=1)

    # Page number
    draw.line([book_cx - 10, book_cy + page_h // 2 - 10, book_cx + 10, book_cy + page_h // 2 - 10], fill=ink_color, width=1)

    # Foxing (age spots)
    for _ in range(15):
        fx = book_cx - page_w + 5 + random.randint(0, 2 * page_w - 10)
        fy = book_cy - page_h // 2 + 5 + random.randint(0, page_h - 10)
        fr = random.randint(1, 3)
        draw.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=160)

    img = finalize(img, 0.08)
    return img


# ══════════════════════════════════════════════════════════════════════════
#  MAIN GENERATION
# ══════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("Generating 27 case file images...")
    print("=" * 60)

    # Barbarian's Cup NPCs
    base = CASE_DIRS["barbarians"]
    print("\n--- Barbarian's Cup NPCs ---")
    generators = [
        ("npc1-rosario.png", gen_npc1_rosario),
        ("npc2-farouk.png", gen_npc2_farouk),
        ("npc3-nasim.png", gen_npc3_nasim),
        ("npc4-park.png", gen_npc4_park),
        ("npc5-yoon.png", gen_npc5_yoon),
        ("npc6-monk.png", gen_npc6_monk),
        ("npc7-guterres.png", gen_npc7_guterres),
        ("npc8-chen.png", gen_npc8_chen),
    ]
    for fname, gen_func in generators:
        img = gen_func()
        save_png(img, os.path.join(base, fname))

    # Barbarian's Cup Relic
    print("\n--- Barbarian's Cup Relic ---")
    save_png(gen_relic_teacup(), os.path.join(base, "relic-teacup.png"))

    # Boudica Pact NPCs
    base = CASE_DIRS["boudica"]
    print("\n--- Boudica Pact NPCs ---")
    generators = [
        ("npc1-townsfolk.png", gen_npc1_townsfolk),
        ("npc2-price.png", gen_npc2_price),
        ("npc3-okonkwo.png", gen_npc3_okonkwo),
        ("npc4-matteo.png", gen_npc4_matteo),
        ("npc5-rhys.png", gen_npc5_rhys),
        ("npc6-dunn.png", gen_npc6_dunn),
        ("npc7-croft.png", gen_npc7_croft),
        ("npc8-entity.png", gen_npc8_entity),
    ]
    for fname, gen_func in generators:
        img = gen_func()
        save_png(img, os.path.join(base, fname))

    # Boudica Pact Relic
    print("\n--- Boudica Pact Relic ---")
    save_png(gen_relic_coin(), os.path.join(base, "relic-coin.png"))

    # Cormsil Compact NPCs
    base = CASE_DIRS["cormsil"]
    print("\n--- Cormsil Compact NPCs ---")
    generators = [
        ("npc1-eleanor.png", gen_npc1_eleanor),
        ("npc2-dwerryhouse.png", gen_npc2_dwerryhouse),
        ("npc3-threlfall.png", gen_npc3_threlfall),
        ("npc4-mary.png", gen_npc4_mary),
        ("npc5-margaret.png", gen_npc5_margaret),
        ("npc6-domere.png", gen_npc6_domere),
        ("npc7-colne.png", gen_npc7_colne),
        ("npc8-society.png", gen_npc8_society),
    ]
    for fname, gen_func in generators:
        img = gen_func()
        save_png(img, os.path.join(base, fname))

    # Cormsil Compact Relic
    print("\n--- Cormsil Compact Relic ---")
    save_png(gen_relic_manual(), os.path.join(base, "relic-manual.png"))

    print("\n" + "=" * 60)
    print("All 27 images generated successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()
