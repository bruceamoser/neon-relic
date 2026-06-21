"""Check encoding of all .adoc chapter files for mojibake corruption."""
import os
import glob

chapters_dir = 'docs/chapters'
results = []

for filepath in sorted(glob.glob(os.path.join(chapters_dir, '*.adoc'))):
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    filename = os.path.basename(filepath)
    has_bom = raw[:3] == b'\xef\xbb\xbf'
    
    # Count proper UTF-8 em dash (E2 80 94)
    emdash_count = raw.count(b'\xe2\x80\x94')
    # Count proper UTF-8 en dash (E2 80 93)
    endash_count = raw.count(b'\xe2\x80\x93')
    # Count double-encoded â (C3 A2) - first byte of the mojibake
    # This is the UTF-8 encoding of U+00E2 which is 'â'
    corrupt_count = raw.count(b'\xc3\xa2')
    
    # Also check for the full double-encoded em dash sequence
    # C3 A2 E2 82 AC E2 80 9D = â€" (double-encoded em dash)
    full_corrupt_emdash = raw.count(b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9d')
    
    # Check for the other variant: C3 A2 E2 82 AC E2 80 9C = â€œ (double-encoded en dash or left quote)
    full_corrupt_variant = raw.count(b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9c')
    
    if corrupt_count > 0:
        status = 'CORRUPTED'
    elif emdash_count > 0 or endash_count > 0:
        status = 'CLEAN'
    else:
        status = 'NO DASHES'
    
    results.append((filename, has_bom, len(raw), emdash_count, endash_count, corrupt_count, full_corrupt_emdash, full_corrupt_variant, status))

# Print results
print(f"{'File':<35} {'BOM':<5} {'Size':>6} {'—':>4} {'–':>4} {'â':>4} {'â€\"':>5} {'â€œ':>5}  Status")
print("-" * 95)
for r in results:
    filename, has_bom, size, emdash, endash, corrupt, full1, full2, status = r
    print(f"{filename:<35} {str(has_bom):<5} {size:>6} {emdash:>4} {endash:>4} {corrupt:>4} {full1:>5} {full2:>5}  {status}")

print()
total_corrupt = sum(r[5] for r in results)
total_full = sum(r[6] for r in results) + sum(r[7] for r in results)
print(f"Total files with corruption: {sum(1 for r in results if r[5] > 0)} / {len(results)}")
print(f"Total corrupt â€ prefix bytes: {total_corrupt}")
print(f"Total full double-encoded sequences: {total_full}")
