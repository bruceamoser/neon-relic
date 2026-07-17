"""
Fix double-encoded UTF-8 mojibake in .adoc source files.

Corruption chain: original UTF-8 bytes -> misinterpreted as Windows-1252 ->
re-encoded to UTF-8 -> garbled characters like aEUR" instead of -- (em dash).

Strategy (character-by-character recovery):
  1. Read raw bytes, strip BOM if present.
  2. Decode as UTF-8 -> garbled text.
  3. For each character: map back to a single byte via cp1252 (preferred)
     or latin-1 (fallback for control chars not in cp1252).
  4. The resulting byte stream is the original UTF-8; decode it.
  5. Write back as UTF-8 WITHOUT BOM.
  6. Create .bak backup of original.

Usage: python _fix_adoc_mojibake.py [--check] [--files file1.adoc file2.adoc ...]
"""

import os
import sys
import io
import shutil
import argparse
import glob


def setup_stdout():
    """Ensure stdout handles Unicode safely on Windows consoles."""
    if hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer, encoding='utf-8', errors='replace'
        )


def safe_str(s: str) -> str:
    """Replace characters that may cause console encoding issues."""
    return s.replace('\u2192', '->').replace('\u2014', '--').replace('\u2013', '-')

# --- Known double-encoded patterns to detect after fix ------------------
# These are UTF-8 bytes for the garbled characters (e.g., 'a' = C3 A2)
# We check for C3 A2 (a) followed by E2 82 AC (EUR) -- classic mojibake signature.
MOJIBAKE_SIGNATURE = b'\xc3\xa2'  # 'a' in UTF-8, first byte of most mojibake

# Files known to be clean -- do NOT modify
CLEAN_FILES = {
    '00-front-matter.adoc',
    '01b-opening-fiction.adoc',
    '21-glossary.adoc',
    '22-yze-license.adoc',
}

# --- Chapter files that need fixing (the 21 corrupted) ------------------
CORRUPTED_FILES = [
    '01-introduction.adoc',
    '02-character-creation.adoc',
    '03-core-resolution.adoc',
    '04-attributes-skills.adoc',
    '05-combat.adoc',
    '06-social-conflict.adoc',
    '07-health-damage-armor.adoc',
    '08-corruption-fear-healing.adoc',
    '09-divisions.adoc',
    '10-equipment.adoc',
    '11-artifacts.adoc',
    '12-headquarters.adoc',
    '13-advancement.adoc',
    '14-da-guidance.adoc',
    '15-case-file.adoc',
    '16-travel.adoc',
    '17-rival-factions.adoc',
    '18-notable-members.adoc',
    '19-bestiary.adoc',
    '20-sample-case-file.adoc',
    'appendix-combat.adoc',
]


def count_corruption(raw_bytes: bytes) -> int:
    """Count double-encoded 'a' (C3 A2) occurrences in raw bytes."""
    return raw_bytes.count(MOJIBAKE_SIGNATURE)


def _map_char_to_byte(c: str) -> int | None:
    """Map a Unicode character back to its single-byte cp1252/latin-1 origin.

    Returns the byte value (0-255) or None if the character cannot be mapped.
    """
    # Try cp1252 first (handles most double-encoded chars)
    try:
        return c.encode('cp1252')[0]
    except (UnicodeEncodeError, ValueError):
        pass
    # Try latin-1 (handles control chars like U+0090)
    try:
        return c.encode('latin-1')[0]
    except (UnicodeEncodeError, ValueError):
        pass
    return None


def _try_recover_sequence(garbled: str, pos: int) -> tuple[str | None, int]:
    """Try to recover original character from a double-encoded sequence.

    Double-encoded sequences start with U+00E2 (a) and are typically
    3 characters long. We try sequence lengths of 2 and 3 characters.

    Returns (recovered_char, chars_consumed) or (None, 0) if recovery fails.
    """
    if pos >= len(garbled) or garbled[pos] != '\u00e2':
        return None, 0

    # Try 3-char sequence first (most common)
    if pos + 3 <= len(garbled):
        seq = garbled[pos:pos + 3]
        byte_vals = []
        for c in seq:
            b = _map_char_to_byte(c)
            if b is None:
                break
            byte_vals.append(b)
        if len(byte_vals) == 3:
            try:
                recovered = bytes(byte_vals).decode('utf-8')
                # Successfully recovered a single character
                return recovered, 3
            except (UnicodeDecodeError, ValueError):
                pass

    # Try 2-char sequence
    if pos + 2 <= len(garbled):
        seq = garbled[pos:pos + 2]
        byte_vals = []
        for c in seq:
            b = _map_char_to_byte(c)
            if b is None:
                break
            byte_vals.append(b)
        if len(byte_vals) == 2:
            try:
                recovered = bytes(byte_vals).decode('utf-8')
                return recovered, 2
            except (UnicodeDecodeError, ValueError):
                pass

    return None, 0


def fix_bytes(raw_bytes: bytes) -> tuple[bytes, bool, str]:
    """
    Apply the double-encoding fix using pattern-based recovery.

    Only attempts recovery on sequences starting with U+00E2 (the
    characteristic start of double-encoded mojibake). Characters
    not part of a double-encoded sequence pass through unchanged.

    Returns (fixed_bytes, was_modified, diagnostic_message).
    """
    # Strip BOM if present
    has_bom = raw_bytes.startswith(b'\xef\xbb\xbf')
    if has_bom:
        raw_bytes = raw_bytes[3:]

    # Decode as UTF-8 -> garbled text
    try:
        garbled = raw_bytes.decode('utf-8')
    except UnicodeDecodeError as e:
        return raw_bytes, False, f"  ERROR: Not valid UTF-8: {e}"

    # Walk through garbled text, recovering double-encoded sequences
    result_chars = []
    pos = 0
    recoveries = 0
    skipped_sequences = 0

    while pos < len(garbled):
        recovered, consumed = _try_recover_sequence(garbled, pos)
        if recovered is not None:
            result_chars.append(recovered)
            pos += consumed
            recoveries += 1
        else:
            result_chars.append(garbled[pos])
            pos += 1
            if garbled[pos - 1] == '\u00e2':
                skipped_sequences += 1

    fixed = ''.join(result_chars)
    fixed_encoded = fixed.encode('utf-8')

    # Check if anything changed
    if fixed_encoded == raw_bytes:
        remaining = count_corruption(fixed_encoded)
        msg = f"  No change needed (recoveries:{recoveries} skipped:{skipped_sequences})"
        if remaining > 0:
            msg += f" -- WARNING: {remaining} residual corrupt sequences"
        return fixed_encoded, False, msg

    # Count changes
    before_corrupt = count_corruption(raw_bytes)
    after_corrupt = count_corruption(fixed_encoded)
    changed_bytes = len(raw_bytes) - len(fixed_encoded)

    msg = (
        f"  FIXED: {before_corrupt} -> {after_corrupt} corrupt sequences"
        f" (recoveries:{recoveries} skipped:{skipped_sequences})"
        f" (size delta: {changed_bytes:+d} bytes)"
    )

    return fixed_encoded, True, msg


def process_file(filepath: str, make_backup: bool = True) -> dict:
    """Process a single file, returning result dict."""
    filename = os.path.basename(filepath)
    result = {
        'file': filepath,
        'filename': filename,
        'modified': False,
        'error': None,
        'diagnostic': '',
        'before_corrupt': 0,
        'after_corrupt': 0,
    }

    if not os.path.exists(filepath):
        result['error'] = 'FILE_NOT_FOUND'
        return result

    try:
        with open(filepath, 'rb') as f:
            original_bytes = f.read()
    except Exception as e:
        result['error'] = f'READ_ERROR: {e}'
        return result

    result['before_corrupt'] = count_corruption(original_bytes)
    result['original_size'] = len(original_bytes)

    # Create backup
    if make_backup:
        bak_path = filepath + '.bak'
        try:
            shutil.copy2(filepath, bak_path)
            result['backup'] = bak_path
        except Exception as e:
            result['error'] = f'BACKUP_ERROR: {e}'
            return result

    # Fix
    fixed_bytes, was_modified, diagnostic = fix_bytes(original_bytes)
    result['diagnostic'] = diagnostic
    result['modified'] = was_modified
    result['after_corrupt'] = count_corruption(fixed_bytes)

    if was_modified:
        try:
            with open(filepath, 'wb') as f:
                f.write(fixed_bytes)
            result['written_size'] = len(fixed_bytes)
        except Exception as e:
            result['error'] = f'WRITE_ERROR: {e}'
            return result

    return result


def check_mode(filepath: str) -> dict:
    """Check-only mode: report corruption without modifying."""
    filename = os.path.basename(filepath)
    result = {
        'file': filepath,
        'filename': filename,
        'corrupt_count': 0,
        'has_bom': False,
        'size': 0,
    }

    if not os.path.exists(filepath):
        result['error'] = 'FILE_NOT_FOUND'
        return result

    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
    except Exception as e:
        result['error'] = f'READ_ERROR: {e}'
        return result

    result['has_bom'] = raw.startswith(b'\xef\xbb\xbf')
    result['size'] = len(raw)
    result['corrupt_count'] = count_corruption(raw)

    return result


def print_check_table(results: list[dict]):
    """Print a check-mode results table."""
    header = f"{'File':<35} {'BOM':<5} {'Size':>7} {'Corrupt':>7}  Status"
    print(header)
    print("-" * 70)
    for r in results:
        fn = r['filename']
        bom = 'YES' if r.get('has_bom') else 'no'
        sz = r.get('size', 0)
        cc = r.get('corrupt_count', 0)
        status = 'CORRUPTED' if cc > 0 else ('CLEAN' if 'error' not in r else r['error'])
        print(f"{fn:<35} {bom:<5} {sz:>7} {cc:>7}  {status}")

    total_corrupt = sum(r.get('corrupt_count', 0) for r in results)
    total_files_corrupt = sum(1 for r in results if r.get('corrupt_count', 0) > 0)
    print()
    print(f"Files with corruption: {total_files_corrupt} / {len(results)}")
    print(f"Total corrupt sequences: {total_corrupt}")


def main():
    parser = argparse.ArgumentParser(
        description='Fix double-encoded UTF-8 mojibake in .adoc files'
    )
    parser.add_argument(
        '--check', action='store_true',
        help='Check only (report corruption, do not fix)'
    )
    parser.add_argument(
        '--no-backup', action='store_true',
        help='Skip creating .bak backup files'
    )
    parser.add_argument(
        '--files', nargs='*',
        help='Specific files to process (overrides default list)'
    )
    args = parser.parse_args()

    chapters_dir = 'docs/chapters'

    # Determine file list
    if args.files:
        filepaths = args.files
    else:
        filepaths = [os.path.join(chapters_dir, f) for f in CORRUPTED_FILES]

    # Also check master document
    master_path = 'docs/neon-relic.adoc'
    if master_path not in filepaths:
        filepaths.append(master_path)

    if args.check:
        setup_stdout()
        print("=== CHECK MODE -- No files will be modified ===\n")
        results = [check_mode(fp) for fp in filepaths]
        print_check_table(results)
        return 0

    # Fix mode
    setup_stdout()
    print("=== FIX MODE ===\n")
    make_backup = not args.no_backup

    results = []
    total_modified = 0
    total_bytes_changed = 0

    for filepath in filepaths:
        filename = os.path.basename(filepath)

        # Skip known clean files
        if filename in CLEAN_FILES:
            print(f"SKIP (clean list): {filename}")
            continue

        print(f"Processing: {filename}")
        result = process_file(filepath, make_backup=make_backup)
        results.append(result)

        if result.get('error'):
            print(f"  ERROR: {safe_str(result['error'])}")
        else:
            print(safe_str(result['diagnostic']))
            if result['modified']:
                total_modified += 1
                total_bytes_changed += abs(
                    result.get('written_size', 0) - result.get('original_size', 0)
                )
        print()

    # Summary
    print("=" * 60)
    print(f"Files processed: {len(results)}")
    print(f"Files modified:  {total_modified}")
    print(f"Bytes changed:   {total_bytes_changed}")
    print(f"Backups:         {'.bak files created' if make_backup else 'disabled'}")

    # Final verification: re-check all processed files
    print("\n--- Post-fix verification ---")
    verify_results = [check_mode(r['file']) for r in results if not r.get('error')]
    remaining = sum(v['corrupt_count'] for v in verify_results)
    if remaining > 0:
        print(f"WARNING: {remaining} corrupt sequences still remain!")
        for v in verify_results:
            if v['corrupt_count'] > 0:
                print(f"  {v['filename']}: {v['corrupt_count']}")
    else:
        print("ALL CLEAN -- Zero corrupt sequences detected.")


if __name__ == '__main__':
    main()
