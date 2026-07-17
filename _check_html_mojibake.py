"""Check HTML files for mojibake corruption."""
import os
import glob
import sys

# Set up stdout for proper output
if hasattr(sys.stdout, 'buffer'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

patterns = ['assets/*.html', 'assets/prebuilt/*.html']
all_files = []
for p in patterns:
    all_files.extend(glob.glob(p, recursive=False))

# Also check case-files directories
case_dirs = glob.glob('docs/case-files/*/')
for cd in case_dirs:
    all_files.extend(glob.glob(os.path.join(cd, '*.html')))

print(f'Checking {len(all_files)} HTML files...')
print()

corrupt_files = []
for filepath in sorted(all_files):
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        count = data.count(b'\xc3\xa2')
        status = 'CORRUPTED' if count > 0 else 'CLEAN'
        if count > 0:
            corrupt_files.append((os.path.basename(filepath), count, filepath))
        print(f'  {status:<12} {count:>4} corrupt  {os.path.basename(filepath):40s} ({filepath})')
    except Exception as e:
        print(f'  ERROR     {filepath}: {e}')

print()
if corrupt_files:
    print(f'TOTAL CORRUPTED HTML FILES: {len(corrupt_files)}')
    for name, count, path in corrupt_files:
        print(f'  {count:>5} corrupt: {name}')
    print()
    print('Run _fix_adoc_mojibake.py --files on these to fix them.')
else:
    print('ALL HTML FILES CLEAN -- no mojibake detected.')
