"""Validate source files for mojibake (double-encoded UTF-8) corruption.

Checks .adoc and .html files for the characteristic double-encoding
signature (C3 A2 = 'a' in UTF-8, the start of most mojibake sequences).

Returns exit code 1 if any corruption is found, 0 if all clean.

Usage: python _validate_sources.py [--fix] [--paths PATH ...]
       python _validate_sources.py --check-adoc
       python _validate_sources.py --check-html
"""

import os
import sys
import io
import glob
import argparse

# UTF-8 encoding of U+00E2 (a-circumflex), the start byte of most mojibake
MOJIBAKE_SIGNATURE = b'\xc3\xa2'


def setup_stdout():
    """Ensure stdout handles Unicode safely on Windows consoles."""
    if hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer, encoding='utf-8', errors='replace'
        )


def check_file(filepath: str) -> dict:
    """Check a single file for mojibake. Returns result dict."""
    result = {
        'path': filepath,
        'corrupt_count': 0,
        'size': 0,
        'error': None,
    }
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        result['size'] = len(data)
        result['corrupt_count'] = data.count(MOJIBAKE_SIGNATURE)
    except Exception as e:
        result['error'] = str(e)
    return result


def check_paths(paths: list[str], extensions: tuple = ('.adoc', '.html')) -> list[dict]:
    """Collect files matching extensions from given paths/directories."""
    all_files = []
    for p in paths:
        if os.path.isfile(p):
            if p.endswith(extensions):
                all_files.append(p)
        elif os.path.isdir(p):
            for ext in extensions:
                all_files.extend(glob.glob(os.path.join(p, f'*{ext}')))
                # Recursively search subdirectories
                for root, dirs, files in os.walk(p):
                    for f in files:
                        if f.endswith(extensions):
                            all_files.append(os.path.join(root, f))
        else:
            # Glob pattern
            for ext in extensions:
                all_files.extend(glob.glob(p + f'/**/*{ext}', recursive=True))
                all_files.extend(glob.glob(p + f'/*{ext}'))

    # Deduplicate
    all_files = list(dict.fromkeys(all_files))
    return [check_file(f) for f in sorted(all_files)]


def try_fix_file(filepath: str) -> bool:
    """Attempt to fix a corrupted file using the double-encoding recovery.

    Returns True if the file was fixed (now clean), False otherwise.
    """
    try:
        from _fix_adoc_mojibake import fix_bytes, count_corruption
    except ImportError:
        print(f"  Cannot import fix function — run _fix_adoc_mojibake.py directly")
        return False

    try:
        with open(filepath, 'rb') as f:
            raw_bytes = f.read()
    except Exception as e:
        print(f"  Read error: {e}")
        return False

    # Create backup
    bak_path = filepath + '.bak'
    try:
        import shutil
        shutil.copy2(filepath, bak_path)
    except Exception:
        pass

    fixed_bytes, was_modified, diagnostic = fix_bytes(raw_bytes)

    if was_modified:
        try:
            with open(filepath, 'wb') as f:
                f.write(fixed_bytes)
            remaining = count_corruption(fixed_bytes)
            if remaining == 0:
                print(f"  FIXED: {diagnostic}")
                return True
            else:
                print(f"  PARTIAL FIX: {remaining} corrupt sequences remain")
                return False
        except Exception as e:
            print(f"  Write error: {e}")
            return False
    else:
        print(f"  {diagnostic}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Validate source files for mojibake corruption'
    )
    parser.add_argument(
        '--check-adoc', action='store_true',
        help='Check all .adoc chapter files'
    )
    parser.add_argument(
        '--check-html', action='store_true',
        help='Check all .html template files'
    )
    parser.add_argument(
        '--check-all', action='store_true',
        help='Check both .adoc and .html files (default)'
    )
    parser.add_argument(
        '--fix', action='store_true',
        help='Attempt to fix corrupted files'
    )
    parser.add_argument(
        '--paths', nargs='*',
        help='Specific files or directories to check'
    )
    parser.add_argument(
        '--quiet', action='store_true',
        help='Only report corrupted files'
    )
    args = parser.parse_args()

    setup_stdout()

    # Determine what to check
    check_adoc = args.check_adoc or args.check_all or (not args.check_adoc and not args.check_html)
    check_html = args.check_html or args.check_all or (not args.check_adoc and not args.check_html)

    # Build file list
    if args.paths:
        extensions = []
        if check_adoc:
            extensions.append('.adoc')
        if check_html:
            extensions.append('.html')
        if not extensions:
            extensions = ['.adoc', '.html']
        results = check_paths(args.paths, tuple(extensions))
    else:
        results = []
        if check_adoc:
            results.extend(check_paths(['docs/chapters/', 'docs/neon-relic.adoc'], ('.adoc',)))
        if check_html:
            results.extend(check_paths(
                ['assets/', 'docs/case-files/'], ('.html',)
            ))

    # Print results
    corrupted = [r for r in results if r['corrupt_count'] > 0]
    clean = [r for r in results if r['corrupt_count'] == 0]

    if not args.quiet:
        print(f"Checked {len(results)} file(s)")
        for r in clean:
            print(f"  CLEAN     {r['path']}")
        for r in corrupted:
            print(f"  CORRUPTED {r['corrupt_count']:>4}  {r['path']}")
        print()

    if corrupted:
        print(f"CORRUPTED FILES: {len(corrupted)}")
        for r in corrupted:
            print(f"  {r['corrupt_count']:>5} corrupt sequences: {r['path']}")

        if args.fix:
            print("\nAttempting to fix...")
            fixed_count = 0
            for r in corrupted:
                print(f"\nProcessing: {r['path']}")
                if try_fix_file(r['path']):
                    fixed_count += 1
            print(f"\nFixed: {fixed_count}/{len(corrupted)}")

        print("\nVALIDATION FAILED: Mojibake corruption detected.")
        print("Run: python _fix_adoc_mojibake.py to fix all .adoc files.")
        print("Or:  python _validate_sources.py --fix to fix detected files.")
        sys.exit(1)
    else:
        print("VALIDATION PASSED: All source files are clean.")
        sys.exit(0)


if __name__ == '__main__':
    main()
