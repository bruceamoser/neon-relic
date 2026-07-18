"""Validate the rebuilt neon-relic-core-rules.pdf.

Checks:
  1. No raw `%header` or `[%header` in any page text
  2. TOC completeness — all expected chapters present as bookmarks
  3. Basic page count sanity (expect 180+ pages)

Usage: python _validate_rulebook_pdf.py [path-to-pdf]
"""

import fitz
import os
import sys
import io
import re

# --- Configuration ---

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else 'starter-kit/neon-relic-core-rules.pdf'

# Expected chapter numbers that should appear in TOC bookmarks.
# The PDF chapter numbering includes the opening fiction as Chapter 2,
# so Chapter N in source = Chapter N+1 in PDF for sources 02+.
# We check that TOC contains bookmark entries for these chapter numbers.
EXPECTED_CHAPTER_NUMS = list(range(1, 22))  # Chapters 1 through 21

# Also expect an appendix entry
EXPECTED_APPENDIX_KEYWORDS = ['appendix', 'combat rules', 'advanced combat']


def setup_stdout():
    """Ensure stdout handles Unicode."""
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def check_raw_directives(doc):
    """Search every page for '%header' and '[%header'. Returns (pass, details)."""
    patterns = ['%header', '[%header']
    findings = {p: [] for p in patterns}

    for pn in range(1, doc.page_count + 1):
        page = doc[pn - 1]
        text = page.get_text()
        for pattern in patterns:
            if pattern in text:
                for line in text.split('\n'):
                    if pattern in line:
                        findings[pattern].append((pn, line.strip()[:200]))
                        break

    all_clear = True
    details = []
    for pattern in patterns:
        if findings[pattern]:
            all_clear = False
            details.append(f'  FAIL: "{pattern}" found on {len(findings[pattern])} page(s):')
            for pn, line in findings[pattern]:
                details.append(f'    Page {pn}: {line}')
        else:
            details.append(f'  PASS: "{pattern}" not found in any page text')

    return all_clear, '\n'.join(details)


def check_toc(doc):
    """Verify TOC bookmarks contain all expected chapters. Returns (pass, details)."""
    toc = doc.get_toc()

    # Extract all TOC entry titles
    toc_entries = [(level, title.strip(), page) for level, title, page in toc]

    details = []
    details.append(f'  Total TOC bookmark entries: {len(toc)}')

    # Show chapter-level (L1) entries
    details.append(f'  Chapter-level (L1) bookmarks:')
    chapter_entries = []
    for level, title, page in toc_entries:
        if level == 1:
            details.append(f'    p{page}: {title}')
            chapter_entries.append((title, page))

    # Build a set of chapter numbers found in the TOC
    found_chapter_nums = set()
    for title, page in chapter_entries:
        m = re.match(r'Chapter\s+(\d+)', title, re.IGNORECASE)
        if m:
            found_chapter_nums.add(int(m.group(1)))

    # Check for appendix
    has_appendix = False
    for level, title, page in toc_entries:
        if any(kw in title.lower() for kw in EXPECTED_APPENDIX_KEYWORDS):
            has_appendix = True
            break

    # Report missing chapters
    missing_nums = [n for n in EXPECTED_CHAPTER_NUMS if n not in found_chapter_nums]

    details.append(f'\n  Found chapter numbers in TOC: {sorted(found_chapter_nums)}')
    details.append(f'  Expected chapter numbers: {EXPECTED_CHAPTER_NUMS[0]}–{EXPECTED_CHAPTER_NUMS[-1]}')

    all_ok = True

    if missing_nums:
        all_ok = False
        details.append(f'\n  FAIL: Missing {len(missing_nums)} chapter(s) from TOC bookmarks:')
        details.append(f'    Chapters: {missing_nums}')
    else:
        details.append(f'\n  PASS: All {len(EXPECTED_CHAPTER_NUMS)} chapters found in TOC bookmarks')

    if not has_appendix:
        # Appendix might not have "Chapter" prefix, check alternative
        details.append(f'\n  INFO: No appendix keyword found in TOC bookmarks.')
        details.append(f'  (Appendix content may exist without bookmark entry.)')
    else:
        details.append(f'\n  PASS: Appendix entry found in TOC bookmarks')

    return all_ok, '\n'.join(details)


def main():
    setup_stdout()

    if not os.path.exists(PDF_PATH):
        print(f'ERROR: PDF not found at "{PDF_PATH}"')
        sys.exit(1)

    doc = fitz.open(PDF_PATH)
    print(f'=== PDF VALIDATION: {PDF_PATH} ===')
    print(f'Pages: {doc.page_count}')
    print(f'File size: {os.path.getsize(PDF_PATH):,} bytes')
    print()

    all_pass = True

    # --- Check 1: Raw directives ---
    print('--- Check 1: Raw AsciiDoc Directives in PDF Text ---')
    passed, details = check_raw_directives(doc)
    print(details)
    if not passed:
        all_pass = False
    print()

    # --- Check 2: TOC completeness ---
    print('--- Check 2: TOC / Bookmark Completeness ---')
    passed, details = check_toc(doc)
    print(details)
    if not passed:
        all_pass = False
    print()

    # --- Check 3: Page count sanity ---
    print('--- Check 3: Page Count Sanity ---')
    if doc.page_count >= 180:
        print(f'  PASS: {doc.page_count} pages (>= 180 minimum)')
    else:
        print(f'  WARN: Only {doc.page_count} pages (expected >= 180)')
    print()

    # --- Check 4: Content verification for chapters 14+ ---
    print('--- Check 4: Content Presence for Chapters 14+ ---')
    # Search for chapter headings in the PDF text (not just bookmarks)
    content_found = set()
    for pn in range(1, doc.page_count + 1):
        text = doc[pn - 1].get_text()
        # Look for "Chapter N." pattern in page text
        for m in re.finditer(r'Chapter\s+(\d+)\.', text):
            content_found.add(int(m.group(1)))
    missing_content = [n for n in EXPECTED_CHAPTER_NUMS if n not in content_found]
    if missing_content:
        print(f'  WARN: Chapters {missing_content} not found in PDF page text')
    else:
        print(f'  PASS: All chapters 1–21 found in PDF page text')
    print(f'  Chapter numbers found in page text: {sorted(content_found)}')
    print()

    # --- Summary ---
    print('=' * 60)
    if all_pass:
        print('VALIDATION RESULT: ALL CHECKS PASSED')
        doc.close()
        sys.exit(0)
    else:
        print('VALIDATION RESULT: ONE OR MORE CHECKS FAILED')
        doc.close()
        sys.exit(1)


if __name__ == '__main__':
    main()
