"""Scan all case-file PDFs for mojibake patterns."""
import fitz
import glob
import sys

patterns = {
    '\u00e2\u20ac\u201c': 'em-dash var1',
    '\u00e2\u20ac\u201d': 'em-dash var2',
    '\u00e2\u20ac\u0094': 'em-dash var3',
    '\u00e2\u20ac\u00a6': 'ellipsis',
    '\u00e2\u20ac\u02dc': 'L single quote',
    '\u00e2\u20ac\u2122': 'R single quote',
    '\u00e2\u20ac\u0153': 'L double quote',
    '\u00e2\u20ac\u009d': 'R double quote',
}

pdf_files = glob.glob('docs/case-files/**/*.pdf', recursive=True)
print(f'Scanning {len(pdf_files)} PDF(s) in case-files...')
print()

total_clean = 0
total_dirty = 0
errors = 0

for pdf_path in sorted(pdf_files):
    try:
        doc = fitz.open(pdf_path)
        page_count = doc.page_count
        hits = 0
        dirty_pages = []
        for pg in range(page_count):
            text = doc[pg].get_text()
            page_hits = 0
            for pat, label in patterns.items():
                page_hits += text.count(pat)
            if page_hits > 0:
                hits += page_hits
                dirty_pages.append(str(pg + 1))
        doc.close()
        if hits > 0:
            total_dirty += 1
            print(f'MOJIBAKE: {pdf_path} ({hits} hits on pages: {", ".join(dirty_pages)})')
        else:
            total_clean += 1
            print(f'CLEAN:    {pdf_path}')
    except Exception as e:
        errors += 1
        print(f'ERROR:    {pdf_path}: {e}')

print()
print(f'Summary: {total_clean} clean, {total_dirty} with mojibake, {errors} errors')

sys.exit(0 if total_dirty == 0 else 1)
