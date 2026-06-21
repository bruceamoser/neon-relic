"""Fix issues found in case file HTML files.

1. Fix encoding in spear-that-went-dark files (stray Windows-1252 bytes in UTF-8 files)
2. Fix broken font references (../../docs/themes/ -> ../../themes/)
3. Fix tag mismatch in the-barbarians-cup/information-cards.html
"""
import glob
import os
import sys
import shutil

# Map Windows-1252 bytes to UTF-8 bytes for common problematic characters
# 0x97 = em-dash (—) in Windows-1252 -> UTF-8: E2 80 94
WIN1252_TO_UTF8 = {
    0x96: b'\xe2\x80\x93',  # en-dash –
    0x97: b'\xe2\x80\x94',  # em-dash —
    0x91: b'\xe2\x80\x98',  # left single quote '
    0x92: b'\xe2\x80\x99',  # right single quote '
    0x93: b'\xe2\x80\x9c',  # left double quote "
    0x94: b'\xe2\x80\x9d',  # right double quote "
    0x85: b'\xe2\x80\xa6',  # ellipsis …
}


def fix_stray_bytes(filepath):
    """Replace stray Windows-1252 bytes with proper UTF-8 sequences in a UTF-8 file."""
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        # Check for stray Windows-1252 bytes in the 0x80-0x9F range
        # that are not part of valid UTF-8 sequences
        modified = bytearray()
        i = 0
        fixed_count = 0
        while i < len(raw):
            b = raw[i]
            if b in WIN1252_TO_UTF8:
                # Check if this byte is part of a valid UTF-8 sequence
                # If the byte before it was a valid multi-byte start, it's fine
                # Simplistic: just replace it — it's in the ASCII range that
                # shouldn't appear as a continuation byte in valid UTF-8
                modified.extend(WIN1252_TO_UTF8[b])
                fixed_count += 1
                i += 1
            else:
                modified.append(b)
                i += 1
        
        if fixed_count == 0:
            return False, "No stray bytes found"
        
        # Verify result is valid UTF-8
        try:
            modified.decode('utf-8')
        except Exception as e:
            return False, f"Result not valid UTF-8: {e}"
        
        # Create backup
        bak_path = filepath + '.encfix-bak'
        shutil.copy2(filepath, bak_path)
        
        with open(filepath, 'wb') as f:
            f.write(bytes(modified))
        
        return True, f"Fixed {fixed_count} stray byte(s) (backup: {os.path.basename(bak_path)})"
    except Exception as e:
        return False, str(e)


def fix_font_refs(filepath):
    """Fix broken font references: ../../docs/themes/ -> ../../themes/"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '../../docs/themes/' not in content:
            return False, "No broken font refs found"
        
        new_content = content.replace('../../docs/themes/', '../../themes/')
        
        if new_content == content:
            return False, "No changes made"
        
        # Backup
        bak_path = filepath + '.fontfix-bak'
        with open(bak_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        
        return True, f"Fixed font refs (backup: {os.path.basename(bak_path)})"
    except Exception as e:
        return False, str(e)


def main():
    fixes_applied = 0
    errors = 0
    
    # 1. Fix encoding in spear-that-went-dark files
    print("=" * 60)
    print("STEP 1: Fix stray Windows-1252 bytes in spear-that-went-dark")
    print()
    spear_files = [
        'docs/case-files/spear-that-went-dark/case-brief-da.html',
        'docs/case-files/spear-that-went-dark/operations-board.html',
    ]
    for f in spear_files:
        ok, msg = fix_stray_bytes(f)
        if ok:
            print(f"  FIXED: {f}")
            print(f"         {msg}")
            fixes_applied += 1
        else:
            print(f"  SKIP: {f} — {msg}")
            if 'No stray' not in msg:
                errors += 1
    
    # 2. Fix font references in 3 case directories
    print()
    print("=" * 60)
    print("STEP 2: Fix broken font references")
    print("         ../../docs/themes/ -> ../../themes/")
    print()
    case_dirs = [
        'docs/case-files/the-barbarians-cup',
        'docs/case-files/the-boudica-pact',
        'docs/case-files/the-heavenly-crucifix',
    ]
    for case_dir in case_dirs:
        case_name = os.path.basename(case_dir)
        print(f"  [{case_name}]")
        html_files = glob.glob(os.path.join(case_dir, '*.html'))
        dir_fixes = 0
        for f in sorted(html_files):
            ok, msg = fix_font_refs(f)
            if ok:
                print(f"    FIXED: {os.path.basename(f)}")
                dir_fixes += 1
                fixes_applied += 1
        if dir_fixes == 0:
            print(f"    (no fixes needed)")
    
    # 3. Fix the tag issue in the-barbarians-cup/information-cards.html
    print()
    print("=" * 60)
    print("STEP 3: Fix tag mismatch in the-barbarians-cup/information-cards.html")
    print()
    
    info_cards_path = 'docs/case-files/the-barbarians-cup/information-cards.html'
    with open(info_cards_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_tag = False
    for i, line in enumerate(lines):
        # Find line with unclosed <p> that ends with </div>
        if '<p>' in line and '</p>' not in line:
            stripped = line.rstrip()
            if stripped.endswith('</div>'):
                # Replace last </div> with </p>
                last_div = stripped.rfind('</div>')
                new_line = stripped[:last_div] + '</p>' + stripped[last_div + len('</div>'):]
                # Preserve trailing whitespace/newline
                trailing = line[len(stripped):]
                old_line = line
                lines[i] = new_line + trailing
                fixed_tag = True
                print(f"  FIXED line {i+1}: </div> -> </p> at end of unclosed paragraph")
                print(f"  Context: ...{old_line.strip()[-100:]}")
                break
    
    if fixed_tag:
        bak_path = info_cards_path + '.tagfix-bak'
        shutil.copy2(info_cards_path, bak_path)
        with open(info_cards_path, 'w', encoding='utf-8', newline='') as f:
            f.writelines(lines)
        fixes_applied += 1
        print(f"  Backup saved to: {os.path.basename(bak_path)}")
    else:
        print(f"  Could not find the broken tag pattern — may already be fixed")
    
    print()
    print("=" * 60)
    print(f"SUMMARY: {fixes_applied} fixes applied, {errors} errors")
    
    return 0 if errors == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
