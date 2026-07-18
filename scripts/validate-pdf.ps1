<#
.SYNOPSIS
    Validates PDF files for structural integrity, font encoding, text extractability,
    metadata completeness, and resource integrity.

.DESCRIPTION
    Comprehensive PDF validation tool for the Neon Relic project. Uses pikepdf for
    structural analysis and PyMuPDF for text extraction and mojibake detection.

    Checks performed per PDF:
      1. Structural validity — valid header (%PDF-x.y), %%EOF trailer, xref table
      2. Font encoding — embedded fonts, ToUnicode CMap, glyph mappings
      3. Text extractability — mojibake detection (double-encoded UTF-8 patterns)
      4. Metadata — title, author, creation date
      5. Page count and file size
      6. Resource integrity — broken image/XObject references

.PARAMETER Path
    A single PDF file, directory of PDFs, or glob pattern (e.g., "docs/case-files/**/*.pdf").

.PARAMETER All
    Scan all PDFs in the entire project (assets/, docs/case-files/, assets/prebuilt/, Bruce-Stuff/).

.PARAMETER Verbose
    Show detailed per-page and per-font information.

.PARAMETER Fix
    After validation, attempt to repair detected issues using repair-pdf.ps1.

.PARAMETER SummaryOnly
    Only show the summary table — skip per-file detail.

.PARAMETER OutputReport
    Save the full validation report to a markdown file.

.EXAMPLE
    .\validate-pdf.ps1 -Path "docs/case-files/the-barbarians-cup/"
    Validate all PDF files in the Barbarians Cup case directory.

.EXAMPLE
    .\validate-pdf.ps1 -Path "docs/case-files/**/*.pdf"
    Validate all PDFs across all case files (glob pattern).

.EXAMPLE
    .\validate-pdf.ps1 -Path "some-file.pdf" -Verbose
    Validate a single file with detailed output.

.EXAMPLE
    .\validate-pdf.ps1 -All
    Validate every PDF in the entire project.

.EXAMPLE
    .\validate-pdf.ps1 -All -OutputReport "docs/output/pdf-validation-report.md"
    Full project scan with report saved to disk.
#>

param(
    [string]$Path,
    [switch]$All,
    [switch]$Verbose,
    [switch]$Fix,
    [switch]$SummaryOnly,
    [switch]$CheckMetadata,
    [string]$OutputReport
)

$ErrorActionPreference = 'Continue'
$RepoRoot = $PSScriptRoot

# ── Python executable ──────────────────────────────────────────────────────────
$Python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $Python)) {
    $Python = (Get-Command python -ErrorAction SilentlyContinue).Source
}
if (-not $Python) {
    Write-Error "Python not found. Expected at: $env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
    exit 1
}

# ── Verify Python libraries ────────────────────────────────────────────────────
$libCheck = & $Python -c "import pikepdf, fitz; print('OK')" 2>&1
if ($libCheck -ne 'OK') {
    Write-Error "Required Python libraries missing. Run: pip install pikepdf PyMuPDF"
    Write-Error $libCheck
    exit 1
}

# ── Collect PDF files ─────────────────────────────────────────────────────────

function Get-PdfFiles {
    param([string]$BasePath)
    
    # Glob pattern (contains * or ?)
    if ($BasePath -match '[\*\?]') {
        $files = Get-ChildItem -Path $BasePath -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
        return $files
    }
    
    # Directory
    if (Test-Path $BasePath -PathType Container) {
        $files = Get-ChildItem -Path $BasePath -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
        return $files
    }
    
    # Single file
    if (Test-Path $BasePath -PathType Leaf) {
        if ($BasePath -match '\.pdf$') {
            return @(Get-Item $BasePath)
        }
    }
    
    return @()
}

$PdfFiles = @()

if ($All) {
    Write-Host "Scanning entire project for PDFs..." -ForegroundColor Cyan
    $searchDirs = @(
        'assets',
        'docs\case-files',
        'Bruce-Stuff'
    )
    foreach ($dir in $searchDirs) {
        $fullDir = Join-Path $RepoRoot $dir
        if (Test-Path $fullDir) {
            $PdfFiles += Get-ChildItem -Path $fullDir -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
        }
    }
    # Deduplicate by FullName
    $PdfFiles = $PdfFiles | Sort-Object FullName -Unique
} elseif ($Path) {
    $PdfFiles = Get-PdfFiles -BasePath $Path
} else {
    Write-Error "Specify -Path or -All"
    exit 1
}

if ($PdfFiles.Count -eq 0) {
    Write-Host "No PDF files found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($PdfFiles.Count) PDF(s) to validate." -ForegroundColor Cyan
Write-Host ""

# ── Embed the Python validation engine ─────────────────────────────────────────
# We pass file paths to Python via a temp JSON file to avoid escaping issues.

$tempJson = Join-Path $env:TEMP "neon-relic-pdf-validate-$pid.json"
$PdfFiles | Select-Object -ExpandProperty FullName | ConvertTo-Json | Set-Content -Path $tempJson -Encoding UTF8

$pythonScript = @'
import json, sys, os, re, struct

# ── Import validation libraries ──────────────────────────────────────────────
try:
    import pikepdf
except ImportError:
    print("FATAL: pikepdf not installed", file=sys.stderr)
    sys.exit(1)

try:
    import fitz  # PyMuPDF
except ImportError:
    print("FATAL: PyMuPDF not installed", file=sys.stderr)
    sys.exit(1)

# ── Console output sanitizer ────────────────────────────────────────────────
def safe_str(s):
    """Replace characters that can't be encoded in the terminal's codepage."""
    if s is None:
        return '<none>'
    try:
        s.encode(sys.stdout.encoding or 'cp1252')
        return s
    except UnicodeEncodeError:
        return s.encode(sys.stdout.encoding or 'cp1252', errors='replace').decode(sys.stdout.encoding or 'cp1252')

# ── Mojiabake signature patterns ─────────────────────────────────────────────
# These are byte sequences that appear when UTF-8 text is misinterpreted as
# Windows-1252 (or similar) and then re-encoded as UTF-8.
MOJIBAKE_PATTERNS = [
    (b'\xc3\xa2\xe2\x82\xac', 'â€" (double-encoded en-dash/em-dash)'),
    (b'\xc3\xa2\xe2\x82\xac\xc5\x93', 'â€œ (double-encoded left curly quote)'),
    (b'\xc3\xa2\xe2\x82\xac\xc2\x9d', 'â€ (double-encoded right curly quote)'),
    (b'\xc3\x83\xc2\xa9', 'Ã© (double-encoded é)'),
    (b'\xc3\x83\xc2\xa7', 'Ã§ (double-encoded ç)'),
    (b'\xc3\x83\xc2\xb1', 'Ã± (double-encoded ñ)'),
    (b'\xc3\x83\xc2\xa1', 'Ã¡ (double-encoded á)'),
    (b'\xc3\x83\xc2\xb3', 'Ã³ (double-encoded ó)'),
    (b'\xc3\x83\xc2\xba', 'Ãº (double-encoded ú)'),
    (b'\xc3\x83\xc2\xad', 'Ã (double-encoded í)'),
    (b'\xc3\x83\xe2\x80\x9a', 'Ã‚ (double-encoded Á)'),
    (b'\xc3\x82\xc2\xa0', 'common cp1252->UTF-8 corruption prefix'),
    (b'\xc3\xa2\xc2\x80\xc2', 'â€ (variant double encoding)'),
]

# Single-byte mojibake that indicates encoding issues
MOJIBAKE_CHARS = re.compile(
    r'[\u00c2\u00c3\u00e2\u20ac\u201a\u2013\u2014\u2018\u2019\u201c\u201d\u2020\u2021\u2022\u2026\u2030\u2039\u203a]'
)

# ── UTF-8 roundtrip validation ────────────────────────────────────────────────
def check_utf8_roundtrip(text):
    """Characters that don't survive a strict UTF-8 encode→decode roundtrip."""
    problematic = []
    for i, ch in enumerate(text):
        try:
            encoded = ch.encode('utf-8')
            decoded = encoded.decode('utf-8')
            if decoded != ch:
                problematic.append((i, ch, hex(ord(ch))))
        except (UnicodeEncodeError, UnicodeDecodeError):
            problematic.append((i, ch, hex(ord(ch))))
    return problematic


def check_metadata_utf8(filepath):
    """Extract PDF metadata via PyMuPDF and check for UTF-8 encoding issues."""
    result = {
        'meta_fields': {},
        'meta_mojibake_count': 0,
        'meta_mojibake_details': [],
        'meta_roundtrip_failures': 0,
        'meta_roundtrip_chars': [],
        'meta_issues': [],
    }

    try:
        doc = fitz.open(filepath)
        meta = doc.metadata

        fields_to_check = {
            'title': meta.get('title', ''),
            'author': meta.get('author', ''),
            'subject': meta.get('subject', ''),
            'keywords': meta.get('keywords', ''),
        }

        for field_name, field_value in fields_to_check.items():
            if not field_value:
                result['meta_fields'][field_name] = '<empty>'
                continue

            result['meta_fields'][field_name] = field_value

            # Check for mojibake patterns in metadata string
            field_bytes = field_value.encode('utf-8', errors='surrogateescape')
            for pattern, desc in MOJIBAKE_PATTERNS:
                count = len(re.findall(re.escape(pattern), field_bytes))
                if count > 0:
                    result['meta_mojibake_count'] += count
                    result['meta_mojibake_details'].append({
                        'field': field_name,
                        'pattern': desc,
                        'count': count,
                    })

            # UTF-8 roundtrip check on metadata field
            problems = check_utf8_roundtrip(field_value)
            if problems:
                result['meta_roundtrip_failures'] += len(problems)
                seen_chars = set()
                for idx, ch, cp in problems:
                    if ch not in seen_chars and len(result['meta_roundtrip_chars']) < 10:
                        seen_chars.add(ch)
                        result['meta_roundtrip_chars'].append({
                            'field': field_name,
                            'char': ch,
                            'codepoint': cp,
                        })

            # Check for mojibake chars via regex
            if MOJIBAKE_CHARS.search(field_value):
                if not any(d['field'] == field_name for d in result['meta_mojibake_details']):
                    result['meta_mojibake_details'].append({
                        'field': field_name,
                        'pattern': 'suspicious Unicode chars (mojibake charset)',
                        'count': 1,
                    })
                    result['meta_mojibake_count'] += 1

        doc.close()
    except Exception as e:
        result['meta_issues'].append(f'Metadata extraction failed: {e}')

    return result


def validate_single_pdf(filepath):
    """Validate one PDF file. Returns a dict with results."""
    result = {
        'file': filepath,
        'filename': os.path.basename(filepath),
        'size_kb': 0,
        'pages': 0,
        'pdf_version': 'unknown',
        'header_valid': False,
        'trailer_valid': False,
        'structure_ok': False,
        'structure_error': None,
        'fonts': {'embedded': 0, 'subset': 0, 'missing_glyphs': 0, 'tounicode_issues': 0, 'details': []},
        'mojibake_count': 0,
        'mojibake_details': [],
        'utf8_roundtrip_failures': 0,
        'utf8_roundtrip_chars': [],
        'metadata': {'title': None, 'author': None, 'creator': None, 'creation_date': None},
        'metadata_issues': [],
        'meta_utf8': {
            'ok': True,
            'fields': {},
            'mojibake_count': 0,
            'mojibake_details': [],
            'roundtrip_failures': 0,
            'roundtrip_chars': [],
            'issues': [],
        },
        'resource_errors': [],
        'page_sizes': [],
        'status': 'unknown',  # pass, warn, fail
    }
    
    # ── File size ──────────────────────────────────────────────────────────
    try:
        size = os.path.getsize(filepath)
        result['size_kb'] = round(size / 1024, 1)
    except OSError:
        result['status'] = 'fail'
        result['structure_error'] = 'Cannot read file'
        return result
    
    if size == 0:
        result['status'] = 'fail'
        result['structure_error'] = 'Zero-byte file'
        return result
    
    # ── Header check ───────────────────────────────────────────────────────
    try:
        with open(filepath, 'rb') as f:
            header = f.read(8)
        if header.startswith(b'%PDF-'):
            result['header_valid'] = True
            ver = header[5:8].decode('ascii', errors='ignore').strip()
            result['pdf_version'] = ver
    except Exception as e:
        result['structure_error'] = f'Header read error: {e}'
    
    # ── Trailer check ──────────────────────────────────────────────────────
    try:
        with open(filepath, 'rb') as f:
            # Seek to last 1KB and look for %%EOF
            f.seek(max(0, size - 1024))
            tail = f.read()
        # Find %%EOF ignoring trailing whitespace
        eof_match = re.search(rb'%%EOF', tail)
        if eof_match:
            result['trailer_valid'] = True
        else:
            result['trailer_valid'] = False
    except Exception as e:
        result['structure_error'] = result.get('structure_error', '') + f'; Trailer check: {e}'
    
    # ── Structural validation with pikepdf ──────────────────────────────────
    try:
        with pikepdf.open(filepath) as pdf:
            result['structure_ok'] = True
            result['pages'] = len(pdf.pages)
            
            # ── Metadata ─────────────────────────────────────────────────
            with pdf.open_metadata() as meta:
                result['metadata']['title'] = meta.get('dc:title', None)
                result['metadata']['author'] = meta.get('dc:author', None)
                result['metadata']['creator'] = meta.get('xmp:CreatorTool', None)
                result['metadata']['creation_date'] = meta.get('xmp:CreateDate', None)
            
            if not result['metadata']['title']:
                result['metadata_issues'].append('Title missing')
            if not result['metadata']['author']:
                result['metadata_issues'].append('Author missing')
            
            # ── Font analysis ─────────────────────────────────────────────
            fonts_seen = set()
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    resources = page['/Resources'] if '/Resources' in page else {}
                    font_dict = resources.get('/Font', {})
                except Exception:
                    font_dict = {}
                for font_name in font_dict:
                    font = font_dict[font_name]
                    font_key = f'{font_name}_{page_num}'
                    if font_key in fonts_seen:
                        continue
                    fonts_seen.add(font_key)
                    
                    font_info = {
                        'name': str(font_name),
                        'page': page_num,
                        'embedded': False,
                        'subset': False,
                        'tounicode_ok': True,
                        'issues': []
                    }
                    
                    try:
                        if '/FontDescriptor' in font:
                            fd = font['/FontDescriptor']
                            if '/FontFile' in fd or '/FontFile2' in fd or '/FontFile3' in fd:
                                font_info['embedded'] = True
                                result['fonts']['embedded'] += 1
                            else:
                                font_info['issues'].append('Font descriptor present but no embedded font file')
                        
                        if '/ToUnicode' not in font:
                            font_info['tounicode_ok'] = False
                            result['fonts']['tounicode_issues'] += 1
                            font_info['issues'].append('Missing ToUnicode CMap')
                        
                        # Check for subset prefix in font name
                        if str(font_name).startswith(('AAAAAA+', 'ABCDEE+', 'BCDFEE+')) or '+' in str(font_name)[:10]:
                            font_info['subset'] = True
                            result['fonts']['subset'] += 1
                    except Exception as fe:
                        font_info['issues'].append(f'Font analysis error: {fe}')
                    
                    if font_info['issues']:
                        result['fonts']['details'].append(font_info)
            
            # ── Page dimensions ────────────────────────────────────────────
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    mb = page.mediabox
                    if mb:
                        w = float(mb[2]) - float(mb[0])
                        h = float(mb[3]) - float(mb[1])
                        result['page_sizes'].append({
                            'page': page_num,
                            'width_pt': round(w, 1),
                            'height_pt': round(h, 1),
                            'width_in': round(w / 72, 2),
                            'height_in': round(h / 72, 2)
                        })
                except Exception:
                    pass
            
            # ── Resource/XObject integrity ─────────────────────────────────
            try:
                for page_num, page in enumerate(pdf.pages, 1):
                    if '/Resources' in page:
                        resources = page['/Resources']
                        if '/XObject' in resources:
                            xobjects = resources['/XObject']
                            for xo_name in xobjects:
                                try:
                                    xo = xobjects[xo_name]
                                    # Check if referenced stream is accessible
                                    if hasattr(xo, 'read_bytes'):
                                        _ = len(xo.read_bytes())
                                except Exception as xoe:
                                    result['resource_errors'].append(
                                        f'Page {page_num}: Broken XObject "{xo_name}": {xoe}'
                                    )
            except Exception as res_e:
                result['resource_errors'].append(f'Resource check failed: {res_e}')
    
    except pikepdf.PdfError as e:
        result['structure_ok'] = False
        result['structure_error'] = str(e)
    except Exception as e:
        result['structure_ok'] = False
        result['structure_error'] = f'pikepdf open error: {e}'
    
    # ── Text extraction & mojibake detection (PyMuPDF) ───────────────────────
    try:
        doc = fitz.open(filepath)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Get raw text
            text = page.get_text()
            
            # Get text as dict for positional info
            blocks = page.get_text('dict')['blocks']
            
            # Check for mojibake patterns in raw bytes
            text_bytes = text.encode('utf-8', errors='surrogateescape')
            for pattern, desc in MOJIBAKE_PATTERNS:
                count = len(re.findall(re.escape(pattern), text_bytes))
                if count > 0:
                    # Try to locate position in page
                    result['mojibake_count'] += count
                    result['mojibake_details'].append({
                        'page': page_num + 1,
                        'pattern': desc,
                        'count': count,
                    })
            
            # UTF-8 roundtrip check
            problems = check_utf8_roundtrip(text)
            if problems:
                result['utf8_roundtrip_failures'] += len(problems)
                # Only record first 5 distinct chars
                seen_chars = set()
                for idx, ch, cp in problems:
                    if ch not in seen_chars and len(result['utf8_roundtrip_chars']) < 10:
                        seen_chars.add(ch)
                        result['utf8_roundtrip_chars'].append({
                            'page': page_num + 1,
                            'char': ch,
                            'codepoint': cp,
                        })
        
        doc.close()
    
    except Exception as fe:
        result['mojibake_details'].append({
            'page': 0,
            'pattern': f'Text extraction failed: {fe}',
            'count': 0,
        })

    # ── Metadata UTF-8 validation ─────────────────────────────────────────
    if check_metadata:
        meta_result = check_metadata_utf8(filepath)
        result['meta_utf8'] = {
            'ok': (meta_result['meta_mojibake_count'] == 0
                   and meta_result['meta_roundtrip_failures'] == 0
                   and len(meta_result['meta_issues']) == 0),
            'fields': meta_result['meta_fields'],
            'mojibake_count': meta_result['meta_mojibake_count'],
            'mojibake_details': meta_result['meta_mojibake_details'],
            'roundtrip_failures': meta_result['meta_roundtrip_failures'],
            'roundtrip_chars': meta_result['meta_roundtrip_chars'],
            'issues': meta_result['meta_issues'],
        }

    # ── Determine status ────────────────────────────────────────────────────
    issues = []
    if not result['structure_ok']:
        issues.append('structural failure')
    if result['mojibake_count'] > 0:
        issues.append(f'mojibake detected ({result["mojibake_count"]} instances)')
    if result['utf8_roundtrip_failures'] > 0:
        issues.append(f'UTF-8 roundtrip failures ({result["utf8_roundtrip_failures"]} chars)')
    if result['fonts']['tounicode_issues'] > 0:
        issues.append(f'ToUnicode issues ({result["fonts"]["tounicode_issues"]} fonts)')
    if result['resource_errors']:
        issues.append('resource errors')
    if result['metadata_issues']:
        issues.append(f'metadata issues ({len(result["metadata_issues"])})')
    if not result['meta_utf8']['ok']:
        meta_utf8_issues = []
        if result['meta_utf8']['mojibake_count'] > 0:
            meta_utf8_issues.append(f'{result["meta_utf8"]["mojibake_count"]} meta mojibake')
        if result['meta_utf8']['roundtrip_failures'] > 0:
            meta_utf8_issues.append(f'{result["meta_utf8"]["roundtrip_failures"]} meta roundtrip fails')
        if result['meta_utf8']['issues']:
            meta_utf8_issues.append('meta extraction errors')
        if meta_utf8_issues:
            issues.append(f'meta UTF-8: {"; ".join(meta_utf8_issues)}')

    if not result['structure_ok'] or result['resource_errors']:
        result['status'] = 'fail'
    elif (result['mojibake_count'] > 0 or result['utf8_roundtrip_failures'] > 0
          or result['fonts']['tounicode_issues'] > 0 or not result['meta_utf8']['ok']):
        result['status'] = 'warn'
    elif result['metadata_issues']:
        result['status'] = 'warn'
    else:
        result['status'] = 'pass'

    result['issues_summary'] = '; '.join(issues) if issues else 'none'
    return result


# ── Run validation ────────────────────────────────────────────────────────────
def main():
    # Handle Unicode output on Windows terminals
    import io
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass
    
    json_path = sys.argv[1]
    verbose = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else False
    summary_only = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False
    global check_metadata
    check_metadata = sys.argv[4].lower() == 'true' if len(sys.argv) > 4 else True

    with open(json_path, 'r', encoding='utf-8-sig') as f:
        files = json.load(f)
    
    results = []
    total = len(files)
    
    for i, filepath in enumerate(files, 1):
        if not summary_only:
            print(f'\n{"─" * 70}')
            print(f'[{i}/{total}] {os.path.basename(filepath)}')
            print(f'      {filepath}')
        
        res = validate_single_pdf(filepath)
        results.append(res)
        
        if not summary_only:
            # ── Print detailed result ────────────────────────────────────
            print(f'{"─" * 70}')
            print(f'  Size: {res["size_kb"]} KB | Pages: {res["pages"]} | PDF Version: {res["pdf_version"]}')
            
            # Header/Trailer/Structure
            hdr = '✅' if res['header_valid'] else '❌'
            print(f'  {hdr} Header valid: %PDF-{res["pdf_version"]}' if res['header_valid'] else f'  {hdr} Header INVALID')
            
            tr = '✅' if res['trailer_valid'] else '❌'
            print(f'  {tr} Trailer valid' if res['trailer_valid'] else f'  {tr} Trailer MISSING/INVALID')
            
            st = '✅' if res['structure_ok'] else '❌'
            if res['structure_ok']:
                print(f'  {st} Structure: Opens without errors')
            else:
                print(f'  {st} Structure: {res["structure_error"]}')
            
            # Fonts
            f_icon = '⚠️' if res['fonts']['tounicode_issues'] > 0 else '✅'
            print(f'  {f_icon} Fonts: {res["fonts"]["embedded"]} embedded, '
                  f'{res["fonts"]["tounicode_issues"]} ToUnicode issues')
            if verbose:
                for fd in res['fonts']['details']:
                    print(f'      └─ "{fd["name"]}" (page {fd["page"]}): {"; ".join(fd["issues"])}')
            
            # Encoding / Mojibake
            body_ok = res['mojibake_count'] == 0 and res['utf8_roundtrip_failures'] == 0
            meta_ok = (not res['meta_utf8'] or res['meta_utf8'].get('ok', True))
            e_icon = '❌' if res['mojibake_count'] > 0 else ('⚠️' if not body_ok or not meta_ok else '✅')
            if res['mojibake_count'] > 0:
                print(f'  {e_icon} Body UTF-8: MOJIBAKE DETECTED — {res["mojibake_count"]} instances')
                for md in res['mojibake_details']:
                    print(f'      └─ Page {md["page"]}: {md["pattern"]} (×{md["count"]})')
            elif res['utf8_roundtrip_failures'] > 0:
                print(f'  {e_icon} Body UTF-8: {res["utf8_roundtrip_failures"]} roundtrip failures')
                if verbose:
                    for uc in res['utf8_roundtrip_chars']:
                        print(f'      └─ Page {uc["page"]}: char "{uc["char"]}" ({uc["codepoint"]})')
            else:
                print(f'  {e_icon} Body UTF-8: Clean')

            # Meta UTF-8
            mu = res.get('meta_utf8', {})
            if mu and mu.get('fields'):
                mu_icon = '✅' if mu.get('ok', True) else '❌'
                print(f'  {mu_icon} Meta UTF-8: ', end='')
                if mu.get('mojibake_count', 0) > 0:
                    print(f'{mu["mojibake_count"]} mojibake instances')
                    for md in mu.get('mojibake_details', []):
                        print(f'      └─ Field "{md["field"]}": {md["pattern"]} (×{md["count"]})')
                elif mu.get('roundtrip_failures', 0) > 0:
                    print(f'{mu["roundtrip_failures"]} roundtrip failures')
                    if verbose:
                        for uc in mu.get('roundtrip_chars', []):
                            print(f'      └─ Field "{uc["field"]}": char "{uc["char"]}" ({uc["codepoint"]})')
                elif mu.get('issues'):
                    print(f'Issues: {"; ".join(mu["issues"])}')
                else:
                    print('Clean')
            else:
                print(f'  ⬜ Meta UTF-8: Not checked')

            # Metadata
            m_icon = '⚠️' if res['metadata_issues'] else '✅'
            title_rep = res['metadata']['title'] or '<missing>'
            author_rep = res['metadata']['author'] or '<missing>'
            print(f'  {m_icon} Metadata: Title={title_rep}, Author={author_rep}')
            if res['metadata_issues']:
                print(f'      Issues: {"; ".join(res["metadata_issues"])}')
            
            # Resources
            r_icon = '❌' if res['resource_errors'] else '✅'
            if res['resource_errors']:
                print(f'  {r_icon} Resources: {len(res["resource_errors"])} broken references')
                for re_err in res['resource_errors'][:3]:
                    print(f'      └─ {re_err}')
            else:
                print(f'  {r_icon} Resources: No broken references')
            
            # Page sizes (only if verbose and unusual)
            if verbose and res['page_sizes']:
                unusual = [ps for ps in res['page_sizes']
                          if abs(ps['width_pt'] - 612) > 10 or abs(ps['height_pt'] - 792) > 10]
                if unusual:
                    print(f'  📐 Unusual page sizes:')
                    for ps in unusual:
                        print(f'      └─ Page {ps["page"]}: {ps["width_in"]}×{ps["height_in"]} in')
            
            # Status line
            status_icon = {'pass': '✅ PASS', 'warn': '⚠️  WARNINGS', 'fail': '❌ FAIL'}
            print(f'  RESULT: {status_icon.get(res["status"], res["status"])}  ({res["issues_summary"]})')
    
    # ── Summary ────────────────────────────────────────────────────────────
    print(f'\n{"=" * 70}')
    print(f'SUMMARY: {len(results)} PDFs scanned')
    
    passed = sum(1 for r in results if r['status'] == 'pass')
    warned = sum(1 for r in results if r['status'] == 'warn')
    failed = sum(1 for r in results if r['status'] == 'fail')
    
    pass_icon = '✅'
    warn_icon = '⚠️ '
    fail_icon = '❌'
    
    print(f'  {pass_icon} {passed} passed all checks')
    print(f'  {warn_icon} {warned} warnings')
    print(f'  {fail_icon} {failed} failed')
    
    # List failures
    if failed > 0:
        print(f'\nFAILED FILES:')
        for r in results:
            if r['status'] == 'fail':
                print(f'  ❌ {r["filename"]}  — {r["issues_summary"]}')
    
    # List warnings
    if warned > 0:
        print(f'\nWARNING FILES:')
        for r in results:
            if r['status'] == 'warn':
                issues = r['issues_summary']
                if 'mojibake' in issues.lower():
                    print(f'  ⚠️  {r["filename"]}  — {issues}')
                elif 'metadata' in issues.lower():
                    print(f'  ⚠️  {r["filename"]}  — {issues}')
                else:
                    print(f'  ⚠️  {r["filename"]}  — {issues}')
    
    print(f'{"=" * 70}')
    
    # ── Output JSON for PowerShell consumption ─────────────────────────────
    out_json = json.dumps(results, indent=2)
    output_path = json_path.replace('.json', '-results.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(out_json)
    print(f'\nRESULTS_FILE: {output_path}')


if __name__ == '__main__':
    main()
'@

# ── Write Python script to temp file ──────────────────────────────────────────
$pythonScriptPath = Join-Path $env:TEMP "neon-relic-pdf-validate-$pid.py"
Set-Content -Path $pythonScriptPath -Value $pythonScript -Encoding UTF8

# ── Execute Python validator ──────────────────────────────────────────────────
$verbFlag = if ($Verbose) { 'true' } else { 'false' }
$summFlag = if ($SummaryOnly) { 'true' } else { 'false' }
$metaFlag = if ($CheckMetadata -or (-not $PSBoundParameters.ContainsKey('CheckMetadata'))) { 'true' } else { 'false' }

Write-Host "Running PDF validation engine..." -ForegroundColor Cyan
$pythonOutput = & $Python $pythonScriptPath $tempJson $verbFlag $summFlag $metaFlag 2>&1
$pythonOutput | ForEach-Object { Write-Host $_ }

# ── Read structured results ───────────────────────────────────────────────────
$resultsJsonPath = $tempJson -replace '\.json$', '-results.json'
$resultsData = $null
if (Test-Path $resultsJsonPath) {
    try {
        $resultsData = Get-Content -Path $resultsJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        Write-Warning "Could not parse results JSON: $_"
    }
}

# ── Generate markdown report ──────────────────────────────────────────────────
if ($OutputReport -and $resultsData) {
    Write-Host "`nGenerating markdown report..." -ForegroundColor Cyan
    
    $reportDir = Split-Path $OutputReport -Parent
    if ($reportDir -and -not (Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
    }
    
    $report = @"
# PDF Validation Report -- Neon Relic

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Total PDFs scanned:** $($resultsData.Count)

## Summary

| Status | Count |
|--------|-------|
| ✅ Pass | $(($resultsData | Where-Object { $_.status -eq 'pass' }).Count) |
| ⚠️  Warning | $(($resultsData | Where-Object { $_.status -eq 'warn' }).Count) |
| ❌ Fail | $(($resultsData | Where-Object { $_.status -eq 'fail' }).Count) |

---

## Failed PDFs

$(
    $failed = $resultsData | Where-Object { $_.status -eq 'fail' }
    if ($failed) {
        $failed | ForEach-Object {
            "### ❌ $($_.filename)`n"
            "- **Path:** $($_.file)`n"
            "- **Size:** $($_.size_kb) KB | **Pages:** $($_.pages) | **PDF Version:** $($_.pdf_version)`n"
            "- **Issues:** $($_.issues_summary)`n"
            if ($_.structure_error) {
                "- **Structure Error:** $($_.structure_error)`n"
            }
            if ($_.resource_errors) {
                "- **Resource Errors:**`n"
                $_.resource_errors | ForEach-Object { "  - $_`n" }
            }
            "`n"
        }
    } else {
        "_None -- all PDFs are structurally valid_`n"
    }
)

---

## Warnings

$(
    $warned = $resultsData | Where-Object { $_.status -eq 'warn' }
    if ($warned) {
        $warned | ForEach-Object {
            "### ⚠️  $($_.filename)`n"
            "- **Path:** $($_.file)`n"
            "- **Size:** $($_.size_kb) KB | **Pages:** $($_.pages) | **PDF Version:** $($_.pdf_version)`n"
            "- **Issues:** $($_.issues_summary)`n"
            if ($_.mojibake_count -gt 0) {
                "- **Mojibake instances:** $($_.mojibake_count)`n"
                $_.mojibake_details | ForEach-Object {
                    "  - Page $($_.page): $($_.pattern) (x$($_.count))`n"
                }
            }
            if ($_.utf8_roundtrip_failures -gt 0) {
                "- **UTF-8 roundtrip failures:** $($_.utf8_roundtrip_failures)`n"
            }
            if ($_.fonts.tounicode_issues -gt 0) {
                "- **ToUnicode CMap issues:** $($_.fonts.tounicode_issues) fonts`n"
            }
            if ($_.metadata_issues) {
                "- **Metadata issues:** $($($_.metadata_issues) -join ', ')`n"
            }
            if ($_.meta_utf8 -and (-not $_.meta_utf8.ok)) {
                "- **Meta UTF-8 issues:**`n"
                if ($_.meta_utf8.mojibake_count -gt 0) {
                    "  - Mojibake: $($_.meta_utf8.mojibake_count) instances`n"
                    $_.meta_utf8.mojibake_details | ForEach-Object {
                        "    - Field `"$($_.field)`": $($_.pattern) (x$($_.count))`n"
                    }
                }
                if ($_.meta_utf8.roundtrip_failures -gt 0) {
                    "  - Roundtrip failures: $($_.meta_utf8.roundtrip_failures)`n"
                    $_.meta_utf8.roundtrip_chars | ForEach-Object {
                        "    - Field `"$($_.field)`": char `"$($_.char)`" ($($_.codepoint))`n"
                    }
                }
                if ($_.meta_utf8.issues) {
                    $_.meta_utf8.issues | ForEach-Object { "  - $_`n" }
                }
            }
            "`n"
        }
    } else {
        "_None_`n"
    }
)

---

## Passed PDFs

$(
    $passed = $resultsData | Where-Object { $_.status -eq 'pass' }
    if ($passed) {
        "$($passed.Count) files passed all checks:`n"
        $passed | ForEach-Object { "- ✅ $($_.filename) ($($_.size_kb) KB, $($_.pages) pp)`n" }
    } else {
        "_None_`n"
    }
)

---
*Report generated by validate-pdf.ps1*
"@
    
    Set-Content -Path $OutputReport -Value $report -Encoding UTF8
    Write-Host "Report saved to: $OutputReport" -ForegroundColor Green
}

# ── Attempt repair if requested ───────────────────────────────────────────────
if ($Fix -and $resultsData) {
    $problemFiles = $resultsData | Where-Object { $_.status -ne 'pass' }
    if ($problemFiles.Count -gt 0) {
        Write-Host "`n$($problemFiles.Count) problem PDF(s) detected. Running repair..." -ForegroundColor Yellow
        $repairScript = Join-Path $RepoRoot 'repair-pdf.ps1'
        if (Test-Path $repairScript) {
            foreach ($pf in $problemFiles) {
                & $repairScript -Path $pf.file
            }
        } else {
            Write-Warning "repair-pdf.ps1 not found. Cannot auto-repair."
        }
    }
}

# ── Cleanup temp files ────────────────────────────────────────────────────────
Remove-Item $tempJson -ErrorAction SilentlyContinue
Remove-Item $pythonScriptPath -ErrorAction SilentlyContinue
# Keep results JSON if we wrote a report (for debugging)
if (-not $OutputReport) {
    Remove-Item $resultsJsonPath -ErrorAction SilentlyContinue
}
