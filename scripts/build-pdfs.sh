#!/bin/bash
# Convert all Neon Relic HTML assets to PDF using Chrome headless
set -e

PROJECT_ROOT="/home/bruceamoser/Repos/neon-relic"
CHROME=$(which google-chrome || which chromium || which chromium-browser)

if [ -z "$CHROME" ]; then
    echo "ERROR: No Chrome/Chromium found"
    exit 1
fi

convert_html_to_pdf() {
    local html_file="$1"
    local pdf_file="${html_file%.html}.pdf"
    local tmp_html="${html_file%.html}-tmp-$$.html"
    
    echo "  → $(basename "$pdf_file")"
    
    # .page margin:0.3in auto adds 0.6in vertical → overflows letter paper
    # causing a phantom second page. Set vertical margin to 0 to fix.
    sed 's/margin: *0\.3in auto/margin: 0 auto/g' "$html_file" > "$tmp_html"
    
    "$CHROME" \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --print-to-pdf="$pdf_file" \
        --print-to-pdf-no-header \
        "file://${tmp_html}" \
        2>/dev/null
    
    rm -f "$tmp_html"
    
    if [ -f "$pdf_file" ]; then
        echo "    OK ($(du -h "$pdf_file" | cut -f1))"
    else
        echo "    FAILED"
    fi
}

echo "=== Converting HTML assets to PDF ==="
echo ""

# ── Blank templates ──
echo "[1/3] Blank templates:"
for html in "$PROJECT_ROOT/assets/"*.html; do
    [ -f "$html" ] || continue
    convert_html_to_pdf "$html"
done

# ── Prebuilt characters ──
echo ""
echo "[2/3] Prebuilt characters:"
for html in "$PROJECT_ROOT/assets/prebuilt/"*.html; do
    [ -f "$html" ] || continue
    convert_html_to_pdf "$html"
done

# ── Sample case file ──
echo ""
echo "[3/3] Sample case file:"
for html in "$PROJECT_ROOT/docs/case-files/spear-that-went-dark/"*.html; do
    [ -f "$html" ] || continue
    convert_html_to_pdf "$html"
done

echo ""
echo "=== Done ==="
