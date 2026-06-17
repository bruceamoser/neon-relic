#!/bin/bash
# Neon Relic Starter Kit Build (Linux)
# Mirrors build.ps1 — generates PDFs, self-contained HTML, and packages starter-kit.zip
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
STARTER_KIT="$REPO_ROOT/starter-kit"
ZIP_FILE="$REPO_ROOT/starter-kit.zip"
THEMES_DIR="$REPO_ROOT/docs/themes"

ASCIIDOCTOR_PDF=$(which asciidoctor-pdf 2>/dev/null || true)
CHROME=$(which google-chrome || which chromium || which chromium-browser 2>/dev/null || true)

# ── Locate tools ──────────────────────────────────────────────────────────────

if [ -z "$ASCIIDOCTOR_PDF" ]; then
    echo "ERROR: asciidoctor-pdf not found. Install via: gem install asciidoctor-pdf"
    exit 1
fi

if [ -z "$CHROME" ]; then
    echo "ERROR: Chrome/Chromium not found. Needed for HTML→PDF conversion."
    exit 1
fi

# ── Prepare output folder ────────────────────────────────────────────────────

rm -rf "$STARTER_KIT" "$ZIP_FILE"
mkdir -p "$STARTER_KIT"

# ── Helper: convert HTML to PDF via Chrome headless ──────────────────────────

html_to_pdf() {
    local html_file="$1"
    local pdf_file="$2"
    local tmp_html="${html_file%.html}-tmp-$$.html"

    # .page margin:0.3in auto adds 0.6in vertical → overflows letter paper.
    # Replace with margin:0 auto to prevent phantom second page.
    sed 's/margin: *0\.3in auto/margin: 0 auto/g' "$html_file" > "$tmp_html"

    "$CHROME" \
        --headless --disable-gpu --no-sandbox \
        --print-to-pdf="$pdf_file" \
        --print-to-pdf-no-header \
        "file://${tmp_html}" 2>/dev/null

    rm -f "$tmp_html"
}

echo ""
echo "=== Neon Relic Starter Kit Build ==="
echo ""

# ── Helper: make HTML self-contained by inlining fonts ────────────────────────

inline_fonts() {
    local src="$1" dest="$2"
    local se_font="$THEMES_DIR/SpecialElite-Regular.ttf"
    local cp_font="$THEMES_DIR/CourierPrime-Regular.ttf"

    python3 -c "
import sys, base64, re

with open('$se_font', 'rb') as f:
    se_b64 = base64.b64encode(f.read()).decode()
with open('$cp_font', 'rb') as f:
    cp_b64 = base64.b64encode(f.read()).decode()

with open('$src', 'r') as f:
    html = f.read()

html = re.sub(r'url\([^)]*SpecialElite-Regular\.ttf[^)]*\)',
              f\"url('data:font/truetype;base64,{se_b64}')\", html)
html = re.sub(r'url\([^)]*CourierPrime-Regular\.ttf[^)]*\)',
              f\"url('data:font/truetype;base64,{cp_b64}')\", html)

with open('$dest', 'w') as f:
    f.write(html)
"
}

# ── 1. Core Rulebook ─────────────────────────────────────────────────────────

echo "  [1/5] Core rulebook..."
asciidoctor-pdf \
    -a pdf-fontsdir="$THEMES_DIR/fonts" \
    -o "$STARTER_KIT/neon-relic-core-rules.pdf" \
    "$REPO_ROOT/docs/neon-relic.adoc" 2>&1 | grep -v "^$" || true
echo "         done"

# ── 2. Case File Instructions ────────────────────────────────────────────────

echo "  [2/5] Case file instructions..."
asciidoctor-pdf \
    -a pdf-fontsdir="$THEMES_DIR/fonts" \
    -o "$STARTER_KIT/case-file-instructions.pdf" \
    "$REPO_ROOT/docs/case-file-instructions.adoc" 2>&1 | grep -v "^$" || true
echo "         done"

# ── 3. Blank HTML Templates + PDFs ───────────────────────────────────────────

echo "  [3/6] Blank HTML templates + PDFs..."
BLANK_DIR="$STARTER_KIT/blank-templates"
mkdir -p "$BLANK_DIR"

for html in "$REPO_ROOT/assets/"*.html; do
    [ -f "$html" ] || continue
    base=$(basename "$html")
    pdf_base="${base%.html}.pdf"

    # Self-contained HTML (inline fonts)
    inline_fonts "$html" "$BLANK_DIR/$base"

    # Generate PDF from source HTML
    html_to_pdf "$html" "$BLANK_DIR/$pdf_base"
done
echo "         done"

# ── 4. Prebuilt Characters ───────────────────────────────────────────────────

echo "  [4/6] Prebuilt character dossiers..."
PREBUILT_DIR="$STARTER_KIT/prebuilt-characters"
mkdir -p "$PREBUILT_DIR"

for html in "$REPO_ROOT/assets/prebuilt/"*.html; do
    [ -f "$html" ] || continue
    base=$(basename "$html")
    pdf_base="${base%.html}.pdf"

    inline_fonts "$html" "$PREBUILT_DIR/$base"
    html_to_pdf "$html" "$PREBUILT_DIR/$pdf_base"
done
echo "         done"

# ── 5. Sample Case File ──────────────────────────────────────────────────────

echo "  [5/6] Sample case file (The Spear That Went Dark)..."
CASE_DIR="$REPO_ROOT/docs/case-files/spear-that-went-dark"
CASE_DEST="$STARTER_KIT/sample-case-file"
mkdir -p "$CASE_DEST"

for html in "$CASE_DIR/"*.html; do
    [ -f "$html" ] || continue
    base=$(basename "$html")
    pdf_base="${base%.html}.pdf"

    inline_fonts "$html" "$CASE_DEST/$base"
    html_to_pdf "$html" "$CASE_DEST/$pdf_base"
done

# Copy handout images
if [ -d "$CASE_DIR/handouts" ]; then
    mkdir -p "$CASE_DEST/handouts"
    cp "$CASE_DIR/handouts/"*.png "$CASE_DEST/handouts/" 2>/dev/null || true
fi
echo "         done"

# ── 6. Package ───────────────────────────────────────────────────────────────────

echo ""
echo "  Packaging starter-kit.zip..."
cd "$REPO_ROOT"
zip -rq "$ZIP_FILE" "starter-kit/"
echo "         done"

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "=== Build Complete ==="
file_count=$(find "$STARTER_KIT" -type f | wc -l)
zip_size=$(du -h "$ZIP_FILE" | cut -f1)
echo "  $file_count files in starter-kit/"
echo "  $zip_size starter-kit.zip"
echo ""
