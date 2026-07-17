"""Inspect neon-relic-core-rules.pdf for rendering issues."""
import fitz
import os
import sys
import io
from datetime import datetime

PDF_PATH = 'starter-kit/neon-relic-core-rules.pdf'

# Wrap stdout to handle Unicode
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

if not os.path.exists(PDF_PATH):
    print(f"ERROR: PDF not found at {PDF_PATH}")
    sys.exit(1)

doc = fitz.open(PDF_PATH)
print(f'=== PDF INFO ===')
print(f'Total pages: {doc.page_count}')
print(f'Metadata: {doc.metadata}')

# --- STEP 1: Extract text from pages 160-170 ---
print(f'\n=== TEXT EXTRACTION: Pages 160-170 ===')
for pn in range(160, min(171, doc.page_count + 1)):
    page = doc[pn - 1]
    text = page.get_text()
    has_issue = any(kw in text for kw in ['%header', '[%header', 'options="header"'])
    marker = ' *** ISSUE FOUND ***' if has_issue else ''
    print(f'\n--- Page {pn} ({len(text)} chars){marker} ---')
    lines = text.split('\n')
    for line in lines:
        if any(kw in line for kw in ['%header', '[%header', '[cols']):
            print(f'  >> {line.strip()[:200]}')
    if not has_issue:
        preview = text[:400].replace('\n', ' | ')
        print(f'  Preview: {preview}')

# --- STEP 2: Search entire PDF for %header ---
print(f'\n\n=== FULL PDF SEARCH: "%header" ===')
found_pages = []
for pn in range(1, doc.page_count + 1):
    page = doc[pn - 1]
    text = page.get_text()
    if '%header' in text:
        found_pages.append(pn)
        for line in text.split('\n'):
            if '%header' in line:
                print(f'  Page {pn}: {line.strip()[:200]}')
print(f'Total pages with "%header": {len(found_pages)}')
print(f'Page numbers: {found_pages}')

# --- STEP 3: Check for any raw AsciiDoc directives ---
print(f'\n=== SEARCH FOR RAW ASCIIDOC DIRECTIVES ===')
adoc_patterns = ['[%header', '[cols=', 'options="header"', '[%autowidth', '[%footer', 'include::']
for pattern in adoc_patterns:
    found = []
    for pn in range(1, doc.page_count + 1):
        text = doc[pn - 1].get_text()
        if pattern in text:
            found.append(pn)
    if found:
        print(f'  "{pattern}" found on pages: {found}')
    else:
        print(f'  "{pattern}": NOT FOUND')

# --- STEP 4: TOC/Bookmarks ---
print(f'\n=== PDF TOC / BOOKMARKS ===')
toc = doc.get_toc()
print(f'Total TOC entries: {len(toc)}')
for level, title, page in toc:
    indent = '  ' * (level - 1)
    print(f'{indent}[L{level}] p{page}: {title}')

# --- STEP 5: Timestamps ---
print(f'\n=== FILE TIMESTAMPS ===')
pdf_mtime = os.path.getmtime(PDF_PATH)
print(f'PDF modified: {datetime.fromtimestamp(pdf_mtime)}')

# Check all .adoc files
adoc_dir = 'docs/chapters'
adoc_files = sorted([f for f in os.listdir(adoc_dir) if f.endswith('.adoc')])
for fname in adoc_files:
    fpath = os.path.join(adoc_dir, fname)
    mtime = os.path.getmtime(fpath)
    print(f'  {fname}: {datetime.fromtimestamp(mtime)}')

# Check the master document
master_path = 'docs/neon-relic.adoc'
if os.path.exists(master_path):
    mtime = os.path.getmtime(master_path)
    print(f'  neon-relic.adoc: {datetime.fromtimestamp(mtime)}')

# Check build script
build_path = 'build.ps1'
if os.path.exists(build_path):
    mtime = os.path.getmtime(build_path)
    print(f'  build.ps1: {datetime.fromtimestamp(mtime)}')

# Check for asciidoctor cache dirs
print(f'\n=== CACHE CHECK ===')
cache_dirs = ['.asciidoctor', '.asciidoctor-pdf', 'docs/.asciidoctor', 'docs/.asciidoctor-pdf',
              os.path.expanduser('~/.asciidoctor'), os.path.expanduser('~/.asciidoctor-pdf')]
for d in cache_dirs:
    if os.path.exists(d):
        print(f'  CACHE EXISTS: {d}')
    else:
        print(f'  No cache: {d}')

doc.close()
print('\n=== DONE ===')
