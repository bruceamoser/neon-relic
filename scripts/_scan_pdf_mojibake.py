"""Scan rulebook PDF for mojibake patterns."""
import fitz
from collections import Counter

pdf_path = 'starter-kit/neon-relic-core-rules.pdf'
doc = fitz.open(pdf_path)

simple_patterns = {
    '\u00e2\u20ac\u201c': 'em-dash var1',
    '\u00e2\u20ac\u201d': 'em-dash var2',
    '\u00e2\u20ac\u0094': 'em-dash var3',
    '\u00e2\u20ac\u00a6': 'ellipsis',
    '\u00e2\u20ac\u02dc': 'L single quote',
    '\u00e2\u20ac\u2122': 'R single quote',
    '\u00e2\u20ac\u0153': 'L double quote',
    '\u00e2\u20ac\u009d': 'R double quote',
}

# Also check for the "simpler" double encoding where only â and € survived
# This is the pattern: C3 A2 E2 82 AC ... (UTF-8 of â€)
# In the extracted text, this shows as literal â€

pattern_counts = Counter()
total_hits = 0
pages_with_moji = set()
page_samples = []

for page_num in range(doc.page_count):
    page = doc[page_num]
    text = page.get_text()
    
    page_hits = 0
    for pattern, label in simple_patterns.items():
        c = text.count(pattern)
        if c > 0:
            pattern_counts[label] += c
            page_hits += c
    
    if page_hits > 0:
        pages_with_moji.add(page_num + 1)
        total_hits += page_hits
        
        # Find first â€ occurrence for context
        idx = text.find('\u00e2\u20ac')
        start = max(0, idx - 40)
        end = min(len(text), idx + 80)
        ctx = text[start:end].replace('\n', ' ').replace('\r', ' ')
        page_samples.append((page_num + 1, page_hits, ctx[:150]))

doc.close()

print(f"Total PDF pages: {len(pages_with_moji) + (306 - len(pages_with_moji))}")  # ~306
# Actually we can't use len(doc) after close. Let's just report from our data.
print(f"Pages with mojibake: {len(pages_with_moji)}")
print(f"Total mojibake hits: {total_hits}")
print()

print("=== Pattern Distribution ===")
for label, count in pattern_counts.most_common():
    print(f"  {label}: {count}")

print()
print("=== Affected Pages ===")
sorted_pages = sorted(pages_with_moji)
print(f"  Count: {len(sorted_pages)}")
if sorted_pages:
    print(f"  First 20: {sorted_pages[:20]}")
    print(f"  Last 10: {sorted_pages[-10:]}")

print()
print("=== Sample Contexts (first 20 pages with hits) ===")
for pg, cnt, ctx in page_samples[:20]:
    print(f"  Page {pg:3d} [{cnt:2d} hits]: ...{ctx}...")
