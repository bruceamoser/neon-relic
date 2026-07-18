<#
.SYNOPSIS
    Validates HTML files for tag mismatches, UTF-8 encoding issues, and structural problems.

.DESCRIPTION
    Comprehensive HTML validation tool for the Neon Relic project. Uses regex-based
    tag counting for mismatch detection and byte-level analysis for encoding issues.

    Checks performed per HTML file:
      1. Tag mismatch — every opening tag must have a matching close tag
      2. UTF-8 encoding — double-encoding signatures (cp1252->UTF-8), BOM issues
      3. Broken character sequences — non-UTF-8 byte sequences
      4. Structural issues — DOCTYPE, html, head, body presence

.PARAMETER All
    Scan all HTML files in the entire project (assets/, docs/case-files/, Bruce-Stuff/).

.PARAMETER Path
    A single HTML file, directory of HTML files, or glob pattern.

.PARAMETER Verbose
    Show detailed per-file tag mismatch information.

.PARAMETER SummaryOnly
    Only show the summary table — skip per-file detail.

.PARAMETER OutputReport
    Save the full validation report to a markdown file.

.EXAMPLE
    .\validate-html.ps1 -All
    Validate every HTML file in the entire project.

.EXAMPLE
    .\validate-html.ps1 -Path "docs/case-files/the-barbarians-cup/"
    Validate all HTML files in the Barbarians Cup directory.

.EXAMPLE
    .\validate-html.ps1 -All -OutputReport "docs/output/html-validation-report.md"
    Full project scan with report saved to disk.
#>

param(
    [string]$Path,
    [switch]$All,
    [switch]$Verbose,
    [switch]$SummaryOnly,
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

# ── Collect HTML files ─────────────────────────────────────────────────────────
function Get-HtmlFiles {
    param([string]$BasePath)
    
    # Glob pattern (contains * or ?)
    if ($BasePath -match '[\*\?]') {
        $files = Get-ChildItem -Path $BasePath -Recurse -Filter '*.html' -ErrorAction SilentlyContinue
        return $files
    }
    
    # Directory
    if (Test-Path $BasePath -PathType Container) {
        $files = Get-ChildItem -Path $BasePath -Recurse -Filter '*.html' -ErrorAction SilentlyContinue
        return $files
    }
    
    # Single file
    if (Test-Path $BasePath -PathType Leaf) {
        if ($BasePath -match '\.html$') {
            return @(Get-Item $BasePath)
        }
    }
    
    return @()
}

$HtmlFiles = @()

if ($All) {
    Write-Host "Scanning entire project for HTML files..." -ForegroundColor Cyan
    $searchDirs = @(
        'assets',
        'docs\case-files',
        'Bruce-Stuff'
    )
    foreach ($dir in $searchDirs) {
        $fullDir = Join-Path $RepoRoot $dir
        if (Test-Path $fullDir) {
            $HtmlFiles += Get-ChildItem -Path $fullDir -Recurse -Filter '*.html' -ErrorAction SilentlyContinue
        }
    }
    $HtmlFiles = $HtmlFiles | Sort-Object FullName -Unique
} elseif ($Path) {
    $HtmlFiles = Get-HtmlFiles -BasePath $Path
} else {
    Write-Error "Specify -Path or -All"
    exit 1
}

if ($HtmlFiles.Count -eq 0) {
    Write-Host "No HTML files found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($HtmlFiles.Count) HTML file(s) to validate." -ForegroundColor Cyan
Write-Host ""

# ── Embed the Python validation engine ─────────────────────────────────────────
$tempJson = Join-Path $env:TEMP "neon-relic-html-validate-$pid.json"
$HtmlFiles | Select-Object -ExpandProperty FullName | ConvertTo-Json | Set-Content -Path $tempJson -Encoding UTF8

$pythonScript = @'
import json, sys, os, re
from collections import Counter

# ── Self-closing / void HTML tags ────────────────────────────────────────────
VOID_TAGS = {
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', 'command',
    'keygen', 'menuitem',
    # SVG elements that are always self-closing
    'animate', 'animatetransform', 'circle', 'ellipse', 'feblend',
    'fecolormatrix', 'fecomponenttransfer', 'fecomposite', 'feconvolvematrix',
    'fediffuselighting', 'fedisplacementmap', 'fedistantlight', 'fedropshadow',
    'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur',
    'feimage', 'femerge', 'femergenode', 'femorphology', 'feoffset',
    'fepointlight', 'fespecularlighting', 'fespotlight', 'fetile',
    'feturbulence', 'image', 'line', 'path', 'polygon', 'polyline',
    'rect', 'stop', 'textpath', 'use',
}

# ── Mojibake byte patterns (same as PDF validator) ──────────────────────────
MOJIBAKE_PATTERNS = [
    (b'\xc3\xa2\xe2\x82\xac', 'aEUR" (double-encoded en-dash/em-dash)'),
    (b'\xc3\xa2\xe2\x82\xac\xc5\x93', 'aEURoe (double-encoded left curly quote)'),
    (b'\xc3\xa2\xe2\x82\xac\xc2\x9d', 'aEUR (double-encoded right curly quote)'),
    (b'\xc3\x83\xc2\xa9', 'A(c) (double-encoded e)'),
    (b'\xc3\x83\xc2\xa7', 'A(c) (double-encoded c)'),
    (b'\xc3\x83\xc2\xb1', 'A+- (double-encoded n)'),
    (b'\xc3\x83\xc2\xa1', 'A! (double-encoded a)'),
    (b'\xc3\x83\xc2\xb3', 'A3 (double-encoded o)'),
    (b'\xc3\x83\xc2\xba', 'Ao (double-encoded u)'),
    (b'\xc3\x83\xc2\xad', 'A (double-encoded i)'),
    (b'\xc3\x83\xe2\x80\x9a', 'A, (double-encoded A)'),
    (b'\xc3\x82\xc2\xa0', 'common cp1252->UTF-8 corruption prefix'),
    (b'\xc3\xa2\xc2\x80\xc2', 'aEUR (variant double encoding)'),
]


def check_html_tags(filepath):
    """Parse HTML file and check for mismatched open/close tags."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        return {'error': f'Cannot read file: {e}', 'mismatches': []}

    # Find all opening and closing tags
    open_tags = re.findall(r'<(\w+)[>\s]', content)
    close_tags = re.findall(r'</(\w+)>', content)

    # Also find self-closing tags like <br/>
    self_close = re.findall(r'<(\w+)\s*/>', content)

    open_count = Counter(t.lower() for t in open_tags)
    close_count = Counter(t.lower() for t in close_tags)
    self_close_count = Counter(t.lower() for t in self_close)

    mismatches = []
    all_tags = set(list(open_count.keys()) + list(close_count.keys()) + list(self_close_count.keys()))

    for tag in sorted(all_tags):
        if tag in VOID_TAGS:
            continue
        opens = open_count.get(tag, 0)
        closes = close_count.get(tag, 0)
        selfs = self_close_count.get(tag, 0)
        diff = opens - (closes + selfs)
        if diff != 0:
            mismatches.append({
                'tag': tag,
                'open': opens,
                'close': closes,
                'self_close': selfs,
                'diff': diff,
            })

    return {'mismatches': mismatches, 'error': None}


def check_html_encoding(filepath):
    """Check HTML file for UTF-8 encoding issues at the byte level."""
    result = {
        'utf8_valid': True,
        'has_bom': False,
        'mojibake_count': 0,
        'mojibake_details': [],
        'encoding_errors': [],
    }

    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
    except Exception as e:
        result['utf8_valid'] = False
        result['encoding_errors'].append(f'Cannot read file: {e}')
        return result

    # Check for BOM
    if raw.startswith(b'\xef\xbb\xbf'):
        result['has_bom'] = True

    # Check for UTF-8 validity
    try:
        raw.decode('utf-8')
    except UnicodeDecodeError as e:
        result['utf8_valid'] = False
        result['encoding_errors'].append(f'Invalid UTF-8: {e}')

    # Check for double-encoding mojibake patterns in raw bytes
    for pattern, desc in MOJIBAKE_PATTERNS:
        count = len(re.findall(re.escape(pattern), raw))
        if count > 0:
            result['mojibake_count'] += count
            result['mojibake_details'].append({
                'pattern': desc,
                'count': count,
            })

    # Check for null bytes (often indicate UTF-16 misdetected as UTF-8)
    null_count = raw.count(b'\x00')
    if null_count > 0:
        result['encoding_errors'].append(f'{null_count} null bytes found (possible UTF-16 encoding)')

    return result


def check_html_structure(filepath):
    """Check for standard HTML document structure."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        return {'issues': [f'Cannot read file: {e}'], 'has_doctype': False,
                'has_html': False, 'has_head': False, 'has_body': False}

    lower = content.lower()

    has_doctype = bool(re.search(r'<!doctype\s+html', lower))
    has_html_open = bool(re.search(r'<html[>\s]', lower))
    has_html_close = bool(re.search(r'</html>', lower))
    has_head_open = bool(re.search(r'<head[>\s]', lower))
    has_head_close = bool(re.search(r'</head>', lower))
    has_body_open = bool(re.search(r'<body[>\s]', lower))
    has_body_close = bool(re.search(r'</body>', lower))

    if not has_doctype:
        issues.append('Missing <!DOCTYPE html>')
    if not has_html_open:
        issues.append('Missing <html> opening tag')
    if not has_html_close:
        issues.append('Missing </html> closing tag')
    if not has_head_open:
        issues.append('Missing <head> opening tag')
    if not has_head_close:
        issues.append('Missing </head> closing tag')
    if not has_body_open:
        issues.append('Missing <body> opening tag')
    if not has_body_close:
        issues.append('Missing </body> closing tag')

    return {
        'issues': issues,
        'has_doctype': has_doctype,
        'has_html': has_html_open and has_html_close,
        'has_head': has_head_open and has_head_close,
        'has_body': has_body_open and has_body_close,
    }


def validate_single_html(filepath):
    """Validate one HTML file. Returns a dict with results."""
    rel_path = os.path.relpath(filepath).replace('\\', '/')
    result = {
        'file': filepath,
        'filename': os.path.basename(filepath),
        'rel_path': rel_path,
        'size_kb': 0,
        'tags': {'mismatches': [], 'ok': True},
        'encoding': {'utf8_valid': True, 'has_bom': False, 'mojibake_count': 0,
                      'mojibake_details': [], 'encoding_errors': [], 'ok': True},
        'structure': {'issues': [], 'has_doctype': False, 'has_html': False,
                      'has_head': False, 'has_body': False, 'ok': True},
        'status': 'unknown',  # pass, warn, fail
    }

    # ── File size ──────────────────────────────────────────────────────────
    try:
        size = os.path.getsize(filepath)
        result['size_kb'] = round(size / 1024, 1)
    except OSError:
        result['status'] = 'fail'
        result['tags']['ok'] = False
        result['tags']['mismatches'] = [{'tag': 'N/A', 'open': 0, 'close': 0, 'self_close': 0, 'diff': 0}]
        return result

    if size == 0:
        result['status'] = 'fail'
        return result

    # ── Tag mismatch check ─────────────────────────────────────────────────
    tag_result = check_html_tags(filepath)
    result['tags']['mismatches'] = tag_result['mismatches']
    result['tags']['ok'] = len(tag_result['mismatches']) == 0
    if tag_result.get('error'):
        result['tags']['ok'] = False
        result['tags']['mismatches'].append({'tag': 'ERROR', 'open': 0, 'close': 0, 'self_close': 0, 'diff': 1})

    # ── Encoding check ─────────────────────────────────────────────────────
    enc_result = check_html_encoding(filepath)
    result['encoding'] = enc_result
    result['encoding']['ok'] = (enc_result['utf8_valid']
                                and enc_result['mojibake_count'] == 0
                                and len(enc_result['encoding_errors']) == 0)

    # ── Structure check ────────────────────────────────────────────────────
    struct_result = check_html_structure(filepath)
    result['structure'] = struct_result
    result['structure']['ok'] = len(struct_result['issues']) == 0

    # ── Determine status ────────────────────────────────────────────────────
    issues = []
    if not result['tags']['ok']:
        num_mismatches = len([m for m in result['tags']['mismatches'] if m['tag'] != 'ERROR'])
        issues.append(f'{num_mismatches} tag mismatches')
    if not result['encoding']['ok']:
        enc_issues = []
        if not result['encoding']['utf8_valid']:
            enc_issues.append('invalid UTF-8')
        if result['encoding']['mojibake_count'] > 0:
            enc_issues.append(f'{result["encoding"]["mojibake_count"]} mojibake')
        if result['encoding']['encoding_errors']:
            enc_issues.extend(result['encoding']['encoding_errors'])
        issues.append(f'encoding: {"; ".join(enc_issues)}')
    if not result['structure']['ok']:
        issues.append(f'structure: {"; ".join(result["structure"]["issues"])}')

    if not result['encoding']['utf8_valid']:
        result['status'] = 'fail'
    elif not result['tags']['ok'] or not result['encoding']['ok']:
        result['status'] = 'warn'
    elif not result['structure']['ok']:
        result['status'] = 'warn'
    else:
        result['status'] = 'pass'

    result['issues_summary'] = '; '.join(issues) if issues else 'none'
    return result


# ── Run validation ────────────────────────────────────────────────────────────
def main():
    import io
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass

    json_path = sys.argv[1]
    verbose = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else False
    summary_only = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False

    with open(json_path, 'r', encoding='utf-8-sig') as f:
        files = json.load(f)

    results = []
    total = len(files)

    for i, filepath in enumerate(files, 1):
        if not summary_only:
            print(f'\n{"─" * 70}')
            print(f'[{i}/{total}] {os.path.basename(filepath)}')
            print(f'      {os.path.relpath(filepath)}')

        res = validate_single_html(filepath)
        results.append(res)

        if not summary_only:
            print(f'{"─" * 70}')
            print(f'  Size: {res["size_kb"]} KB')

            # Tags
            t_icon = '✅' if res['tags']['ok'] else '❌'
            if res['tags']['ok']:
                print(f'  {t_icon} Tags: All matched')
            else:
                mismatches = [m for m in res['tags']['mismatches'] if m['tag'] != 'ERROR']
                print(f'  {t_icon} Tags: {len(mismatches)} mismatches')
                if verbose:
                    for m in mismatches:
                        direction = 'unclosed' if m['diff'] > 0 else 'extra close'
                        print(f'      └─ <{m["tag"]}>: {m["open"]} open, {m["close"]} close, '
                              f'{m["self_close"]} self-close (diff: {m["diff"]} — {direction})')

            # Encoding
            e_icon = '✅' if res['encoding']['ok'] else ('❌' if not res['encoding']['utf8_valid'] else '⚠️')
            if res['encoding']['ok']:
                bom_note = ' (BOM present)' if res['encoding']['has_bom'] else ''
                print(f'  {e_icon} Encoding: Valid UTF-8{bom_note}')
            else:
                issues_list = []
                if not res['encoding']['utf8_valid']:
                    issues_list.append('INVALID UTF-8')
                if res['encoding']['mojibake_count'] > 0:
                    issues_list.append(f'{res["encoding"]["mojibake_count"]} mojibake patterns')
                if res['encoding']['encoding_errors']:
                    issues_list.extend(res['encoding']['encoding_errors'])
                print(f'  {e_icon} Encoding: {"; ".join(issues_list)}')
                if verbose and res['encoding']['mojibake_details']:
                    for md in res['encoding']['mojibake_details']:
                        print(f'      └─ {md["pattern"]} (×{md["count"]})')

            # Structure
            s_icon = '✅' if res['structure']['ok'] else '⚠️'
            if res['structure']['ok']:
                print(f'  {s_icon} Structure: DOCTYPE, html, head, body — all present')
            else:
                print(f'  {s_icon} Structure: {"; ".join(res["structure"]["issues"])}')

            # Status
            status_icon = {'pass': '✅ PASS', 'warn': '⚠️  WARNINGS', 'fail': '❌ FAIL'}
            print(f'  RESULT: {status_icon.get(res["status"], res["status"])}  ({res["issues_summary"]})')

    # ── Summary ────────────────────────────────────────────────────────────
    print(f'\n{"=" * 70}')
    print(f'SUMMARY: {len(results)} HTML files scanned')

    passed = sum(1 for r in results if r['status'] == 'pass')
    warned = sum(1 for r in results if r['status'] == 'warn')
    failed = sum(1 for r in results if r['status'] == 'fail')

    print(f'  ✅ {passed} passed all checks')
    print(f'  ⚠️  {warned} warnings')
    print(f'  ❌ {failed} failed')

    if failed > 0:
        print(f'\nFAILED FILES:')
        for r in results:
            if r['status'] == 'fail':
                print(f'  ❌ {r["filename"]}  — {r["issues_summary"]}')

    if warned > 0:
        print(f'\nWARNING FILES:')
        for r in results:
            if r['status'] == 'warn':
                print(f'  ⚠️  {r["filename"]}  — {r["issues_summary"]}')

    print(f'{"=" * 70}')

    # ── Output JSON ────────────────────────────────────────────────────────
    out_json = json.dumps(results, indent=2)
    output_path = json_path.replace('.json', '-results.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(out_json)
    print(f'\nRESULTS_FILE: {output_path}')


if __name__ == '__main__':
    main()
'@

# ── Write Python script to temp file ──────────────────────────────────────────
$pythonScriptPath = Join-Path $env:TEMP "neon-relic-html-validate-$pid.py"
Set-Content -Path $pythonScriptPath -Value $pythonScript -Encoding UTF8

# ── Execute Python validator ──────────────────────────────────────────────────
$verbFlag = if ($Verbose) { 'true' } else { 'false' }
$summFlag = if ($SummaryOnly) { 'true' } else { 'false' }

Write-Host "Running HTML validation engine..." -ForegroundColor Cyan
$pythonOutput = & $Python $pythonScriptPath $tempJson $verbFlag $summFlag 2>&1
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
# HTML Validation Report — Neon Relic

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Total HTML files scanned:** $($resultsData.Count)

## Summary

| Status | Count |
|--------|-------|
| ✅ Pass | $(($resultsData | Where-Object { $_.status -eq 'pass' }).Count) |
| ⚠️  Warning | $(($resultsData | Where-Object { $_.status -eq 'warn' }).Count) |
| ❌ Fail | $(($resultsData | Where-Object { $_.status -eq 'fail' }).Count) |

---

## Failed HTML Files

$(
    $failed = $resultsData | Where-Object { $_.status -eq 'fail' }
    if ($failed) {
        $failed | ForEach-Object {
            "### ❌ $($_.filename)`n"
            "- **Path:** $($_.rel_path)`n"
            "- **Size:** $($_.size_kb) KB`n"
            "- **Issues:** $($_.issues_summary)`n"
            if ($_.encoding.'encoding_errors') {
                "- **Encoding Errors:**`n"
                $_.encoding.'encoding_errors' | ForEach-Object { "  - $_`n" }
            }
            "`n"
        }
    } else {
        "_None -- all HTML files are valid_`n"
    }
)

---

## Warnings

$(
    $warned = $resultsData | Where-Object { $_.status -eq 'warn' }
    if ($warned) {
        $warned | ForEach-Object {
            "### ⚠️  $($_.filename)`n"
            "- **Path:** $($_.rel_path)`n"
            "- **Size:** $($_.size_kb) KB`n"
            "- **Issues:** $($_.issues_summary)`n"
            if (-not $_.tags.ok) {
                "- **Tag Mismatches:**`n"
                $_.tags.mismatches | Where-Object { $_.tag -ne 'ERROR' } | ForEach-Object {
                    $direction = if ($_.diff -gt 0) { 'unclosed' } else { 'extra close' }
                    "  - `<$_`>: $($_.open) open, $($_.close) close, $($_.self_close) self-close (diff: $($_.diff) -- $direction)`n"
                }
            }
            if (-not $_.encoding.ok) {
                "- **Encoding issues:**`n"
                if (-not $_.encoding.utf8_valid) { "  - Invalid UTF-8`n" }
                if ($_.encoding.mojibake_count -gt 0) {
                    "  - Mojibake: $($_.encoding.mojibake_count) instances`n"
                    $_.encoding.mojibake_details | ForEach-Object {
                        "    - $($_.pattern) (x$($_.count))`n"
                    }
                }
                if ($_.encoding.'encoding_errors') {
                    $_.encoding.'encoding_errors' | ForEach-Object { "  - $_`n" }
                }
            }
            if (-not $_.structure.ok) {
                "- **Structure issues:**`n"
                $_.structure.issues | ForEach-Object { "  - $_`n" }
            }
            "`n"
        }
    } else {
        "_None_`n"
    }
)

---

## Passed HTML Files

$(
    $passed = $resultsData | Where-Object { $_.status -eq 'pass' }
    if ($passed) {
        "$($passed.Count) files passed all checks:`n"
        $passed | ForEach-Object { "- ✅ $($_.filename) ($($_.size_kb) KB)`n" }
    } else {
        "_None_`n"
    }
)

---
*Report generated by validate-html.ps1*
"@
    
    Set-Content -Path $OutputReport -Value $report -Encoding UTF8
    Write-Host "Report saved to: $OutputReport" -ForegroundColor Green
}

# ── Cleanup temp files ────────────────────────────────────────────────────────
Remove-Item $tempJson -ErrorAction SilentlyContinue
Remove-Item $pythonScriptPath -ErrorAction SilentlyContinue
if (-not $OutputReport) {
    Remove-Item $resultsJsonPath -ErrorAction SilentlyContinue
}
