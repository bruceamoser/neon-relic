"""Bulk metadata repair for Neon Relic PDFs.
Adds title (derived from filename) and author metadata to all PDFs.
"""
import pikepdf, os, sys, glob, shutil
from datetime import datetime, timezone

def repair_metadata(filepath, dry_run=False):
    """Add title and author metadata to a PDF."""
    result = {
        'file': filepath,
        'filename': os.path.basename(filepath),
        'success': False,
        'message': '',
        'changes': [],
    }
    
    pdf = None
    try:
        pdf = pikepdf.open(filepath)
        
        with pdf.open_metadata() as meta:
            existing_title = meta.get('dc:title', None)
            existing_author = meta.get('dc:author', None)
            
            changes_made = False
            
            if not existing_title:
                stem = os.path.splitext(os.path.basename(filepath))[0]
                title = stem.replace('-', ' ').replace('_', ' ').title()
                if not dry_run:
                    meta['dc:title'] = title
                result['changes'].append(f'Title: {title}')
                changes_made = True
            
            if not existing_author:
                if not dry_run:
                    meta['dc:author'] = 'Neon Relic'
                result['changes'].append('Author: Neon Relic')
                changes_made = True
            
            if not existing_title and not existing_author:
                if not dry_run:
                    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
                    meta['xmp:CreateDate'] = now
        
        if not dry_run and changes_made:
            # Save to temp file, close pdf, then swap
            tmp_path = filepath + '.tmp'
            pdf.save(tmp_path)
            pdf.close()
            pdf = None
            
            # Remove existing temp if present
            if os.path.exists(tmp_path + '.old'):
                os.remove(tmp_path + '.old')
            
            # Try atomic replace, fall back to copy+delete
            try:
                os.replace(tmp_path, filepath)
            except OSError:
                try:
                    shutil.copy2(tmp_path, filepath)
                    os.remove(tmp_path)
                except OSError as e2:
                    result['message'] = f'Error replacing file: {e2} (temp at {tmp_path})'
                    result['success'] = False
                    return result
            
            result['message'] = f'Added: {", ".join(result["changes"])}'
        else:
            if changes_made:
                result['message'] = f'[DRY RUN] Would add: {", ".join(result["changes"])}'
            else:
                result['message'] = 'Metadata already complete'
        
        result['success'] = True
    
    except Exception as e:
        result['message'] = f'Error: {type(e).__name__}: {e}'
    finally:
        if pdf is not None:
            try:
                pdf.close()
            except Exception:
                pass
    
    return result


def main():
    if len(sys.argv) < 2:
        print('Usage: python _repair_metadata.py <path_or_all> [--dry-run]')
        sys.exit(1)
    
    target = sys.argv[1]
    dry_run = '--dry-run' in sys.argv
    
    # Collect PDFs
    pdf_files = []
    if target.lower() == 'all':
        search_dirs = ['assets', 'docs/case-files', 'Bruce-Stuff']
        for d in search_dirs:
            if os.path.isdir(d):
                for root, dirs, files in os.walk(d):
                    for f in files:
                        if f.lower().endswith('.pdf'):
                            pdf_files.append(os.path.join(root, f))
    elif os.path.isdir(target):
        for root, dirs, files in os.walk(target):
            for f in files:
                if f.lower().endswith('.pdf'):
                    pdf_files.append(os.path.join(root, f))
    elif os.path.isfile(target):
        pdf_files = [target]
    else:
        # Try glob
        pdf_files = glob.glob(target, recursive=True)
        pdf_files = [f for f in pdf_files if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print('No PDF files found.')
        sys.exit(1)
    
    mode_str = '[DRY RUN] ' if dry_run else ''
    print(f'{mode_str}Processing {len(pdf_files)} PDF(s)...')
    
    repaired = 0
    already_ok = 0
    failed = 0
    
    for filepath in sorted(pdf_files):
        res = repair_metadata(filepath, dry_run)
        if res['success']:
            if 'already complete' in res['message']:
                already_ok += 1
            else:
                repaired += 1
                status = '[WOULD FIX]' if dry_run else '[FIXED]'
                print(f'  {status} {res["filename"]}: {res["message"]}')
        else:
            failed += 1
            print(f'  [ERROR] {res["filename"]}: {res["message"]}')
    
    print(f'\nDone. Repaired: {repaired}, Already OK: {already_ok}, Failed: {failed}')


if __name__ == '__main__':
    main()
