<#
.SYNOPSIS
    Repairs common PDF issues detected by validate-pdf.ps1.

.DESCRIPTION
    Three repair modes:
      1. Structural repair — Uses pikepdf to open and re-save the PDF, fixing minor
         cross-reference table corruption, invalid object streams, and trailer issues.
      2. Encoding repair — Traces a PDF back to its source HTML, fixes double-encoded
         UTF-8 (cp1252→UTF-8 reversal), adds <meta charset="UTF-8"> and BOM, then
         regenerates the PDF via Chrome headless with font inlining.
      3. Metadata repair — Adds missing title, author, and creation date metadata
         using pikepdf.

.PARAMETER Path
    A single PDF file to repair, or a directory/glob to repair multiple files.

.PARAMETER All
    Repair all PDFs in the project that have detectable issues.

.PARAMETER WhatIf
    Show what would be repaired without making changes.

.PARAMETER Force
    Skip confirmation prompts.

.PARAMETER RepairMode
    Limit repairs to specific types: 'structural', 'encoding', 'metadata', or 'all' (default).

.EXAMPLE
    .\repair-pdf.ps1 -Path "problem-file.pdf"
    Repair a single file.

.EXAMPLE
    .\repair-pdf.ps1 -All -WhatIf
    Show what would be repaired across the entire project.

.EXAMPLE
    .\repair-pdf.ps1 -All -RepairMode encoding
    Only fix encoding issues across all project PDFs.

.EXAMPLE
    .\repair-pdf.ps1 -Path "broken.pdf" -RepairMode structural -Force
    Structural repair only, no confirmation.
#>

param(
    [string]$Path,
    [switch]$All,
    [switch]$WhatIf,
    [switch]$Force,
    [ValidateSet('structural', 'encoding', 'metadata', 'all')]
    [string]$RepairMode = 'all'
)

$ErrorActionPreference = 'Continue'
$RepoRoot = $PSScriptRoot

# ── Locate tools ──────────────────────────────────────────────────────────────
$Python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $Python)) {
    $Python = (Get-Command python -ErrorAction SilentlyContinue).Source
}
if (-not $Python) {
    Write-Error "Python not found."
    exit 1
}

$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $Chrome)) {
    $Chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $Chrome)) {
    $Chrome = (Get-Command chrome -ErrorAction SilentlyContinue).Source
}
if (-not $Chrome) {
    Write-Warning "Chrome not found. Encoding repair (PDF regeneration) will be unavailable."
}

# ── Font URIs (for HTML→PDF regeneration) ─────────────────────────────────────
$ThemesDir = Join-Path $RepoRoot 'docs\themes'
$FontMap = @{}
@('SpecialElite-Regular', 'CourierPrime-Regular', 'CourierPrime-Bold', 'CourierPrime-Italic', 'CourierPrime-BoldItalic') | ForEach-Object {
    $fontPath = Join-Path $ThemesDir "$_.ttf"
    if (Test-Path $fontPath) {
        $bytes = [System.IO.File]::ReadAllBytes($fontPath)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $FontMap[$_] = "data:font/truetype;base64,$b64"
    }
}

# ── Validate Python libraries ─────────────────────────────────────────────────
$libCheck = & $Python -c "import pikepdf; print('OK')" 2>&1
if ($libCheck -ne 'OK') {
    Write-Error "pikepdf not available. Run: pip install pikepdf"
    exit 1
}

# ── Collect PDF files ─────────────────────────────────────────────────────────
$PdfFiles = @()

if ($All) {
    Write-Host "Collecting all project PDFs..." -ForegroundColor Cyan
    $searchDirs = @('assets', 'docs\case-files', 'Bruce-Stuff')
    foreach ($dir in $searchDirs) {
        $fullDir = Join-Path $RepoRoot $dir
        if (Test-Path $fullDir) {
            $PdfFiles += Get-ChildItem -Path $fullDir -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
        }
    }
    $PdfFiles = $PdfFiles | Sort-Object FullName -Unique
} elseif ($Path) {
    if (Test-Path $Path -PathType Container) {
        $PdfFiles = Get-ChildItem -Path $Path -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
    } elseif (Test-Path $Path -PathType Leaf) {
        $PdfFiles = @(Get-Item $Path)
    } else {
        # Try glob
        $PdfFiles = Get-ChildItem -Path $Path -Recurse -Filter '*.pdf' -ErrorAction SilentlyContinue
    }
} else {
    Write-Error "Specify -Path or -All"
    exit 1
}

if ($PdfFiles.Count -eq 0) {
    Write-Host "No PDF files found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($PdfFiles.Count) PDF(s)." -ForegroundColor Cyan
if ($WhatIf) {
    Write-Host "[WHATIF MODE] No changes will be made." -ForegroundColor Yellow
}
Write-Host ""

# ── Python structural repair script ──────────────────────────────────────────
$pythonStructuralRepair = @'
import sys, os, json, pikepdf
from datetime import datetime

def structural_repair(filepath, dry_run=False):
    """Open and re-save a PDF to fix minor xref table corruption."""
    result = {
        'file': filepath,
        'filename': os.path.basename(filepath),
        'action': 'structural_repair',
        'success': False,
        'message': '',
        'before_size': 0,
        'after_size': 0,
    }
    
    try:
        result['before_size'] = os.path.getsize(filepath)
    except OSError:
        result['message'] = 'File not accessible'
        return result
    
    if dry_run:
        try:
            with pikepdf.open(filepath) as pdf:
                result['message'] = 'Would repair: open+save (xref table repair)'
                result['success'] = True
        except pikepdf.PdfError as e:
            result['message'] = f'Would attempt repair but PDF cannot be opened: {e}'
        except Exception as e:
            result['message'] = f'Would attempt repair but: {e}'
        return result
    
    # Actual repair
    backup_path = filepath + '.bak'
    try:
        # Create backup
        if not os.path.exists(backup_path):
            with open(filepath, 'rb') as src, open(backup_path, 'wb') as dst:
                dst.write(src.read())
        
        with pikepdf.open(filepath) as pdf:
            # Remove any invalid object streams
            try:
                pdf.remove_unreferenced_resources()
            except Exception:
                pass
            
            # Save with object stream compression
            pdf.save(filepath, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.preserve)
        
        result['after_size'] = os.path.getsize(filepath)
        result['success'] = True
        result['message'] = f'Structural repair complete ({result["before_size"]} → {result["after_size"]} bytes)'
        
        # Remove backup on success
        if os.path.exists(backup_path):
            os.remove(backup_path)
    
    except pikepdf.PdfError as e:
        result['message'] = f'Repair failed: {e}'
        # Restore backup if we have one
        if os.path.exists(backup_path):
            os.replace(backup_path, filepath)
            result['message'] += ' (restored from backup)'
    except Exception as e:
        result['message'] = f'Unexpected error: {e}'
        if os.path.exists(backup_path):
            os.replace(backup_path, filepath)
            result['message'] += ' (restored from backup)'
    
    return result


def metadata_repair(filepath, dry_run=False):
    """Add or fix metadata fields."""
    result = {
        'file': filepath,
        'filename': os.path.basename(filepath),
        'action': 'metadata_repair',
        'success': False,
        'message': '',
        'changes': [],
    }
    
    try:
        with pikepdf.open(filepath) as pdf:
            with pdf.open_metadata() as meta:
                existing_title = meta.get('dc:title', None)
                existing_author = meta.get('dc:author', None)
                existing_date = meta.get('xmp:CreateDate', None)
                
                if not existing_title:
                    if dry_run:
                        result['changes'].append('Would add title')
                    else:
                        # Derive title from filename
                        stem = os.path.splitext(os.path.basename(filepath))[0]
                        title = stem.replace('-', ' ').replace('_', ' ').title()
                        meta['dc:title'] = title
                        result['changes'].append(f'Title set to: {title}')
                
                if not existing_author:
                    if dry_run:
                        result['changes'].append('Would add author')
                    else:
                        meta['dc:author'] = 'Neon Relic'
                        result['changes'].append('Author set to: Neon Relic')
                
                if not existing_date:
                    if dry_run:
                        result['changes'].append('Would add creation date')
                    else:
                        now = datetime.utcnow().isoformat()
                        meta['xmp:CreateDate'] = now
                        result['changes'].append(f'Creation date set to: {now}')
            
            if not dry_run and result['changes']:
                pdf.save(filepath)
            
            result['success'] = True
            if result['changes']:
                result['message'] = f'Metadata repaired: {"; ".join(result["changes"])}'
            else:
                result['message'] = 'Metadata already complete — nothing to repair'
    
    except pikepdf.PdfError as e:
        result['message'] = f'Metadata repair failed: {e}'
    except Exception as e:
        result['message'] = f'Metadata repair error: {e}'
    
    return result


if __name__ == '__main__':
    json_path = sys.argv[1]
    mode = sys.argv[2]  # structural, metadata, or all
    dry_run = sys.argv[3].lower() == 'true'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        files = json.load(f)
    
    results = []
    for filepath in files:
        if mode in ('structural', 'all'):
            res = structural_repair(filepath, dry_run)
            results.append(res)
        if mode in ('metadata', 'all'):
            res = metadata_repair(filepath, dry_run)
            results.append(res)
    
    # Output results JSON
    out_path = json_path.replace('.json', '-repair-results.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f'REPAIR_RESULTS: {out_path}')
    
    for res in results:
        icon = '✅' if res['success'] else '❌'
        print(f'{icon} [{res["action"]}] {res["filename"]}: {res["message"]}')
'@

# ── Execute repairs ───────────────────────────────────────────────────────────
$tempJson = Join-Path $env:TEMP "neon-relic-pdf-repair-$pid.json"
$PdfFiles | Select-Object -ExpandProperty FullName | ConvertTo-Json | Set-Content -Path $tempJson -Encoding UTF8

$pythonScriptPath = Join-Path $env:TEMP "neon-relic-pdf-repair-$pid.py"
Set-Content -Path $pythonScriptPath -Value $pythonStructuralRepair -Encoding UTF8

# ── Run structural/metadata repairs via Python ─────────────────────────────────
$structOrMeta = ($RepairMode -eq 'structural' -or $RepairMode -eq 'metadata' -or $RepairMode -eq 'all')
if ($structOrMeta) {
    Write-Host "--- Structural & Metadata Repairs ---" -ForegroundColor Cyan
    $modeArg = if ($RepairMode -eq 'all') { 'all' } else { $RepairMode }
    $dryArg = if ($WhatIf) { 'true' } else { 'false' }
    
    $repairOutput = & $Python $pythonScriptPath $tempJson $modeArg $dryArg 2>&1
    $repairOutput | ForEach-Object { Write-Host $_ }
}

# ── Encoding repair: Fix source HTML + Regenerate PDF ─────────────────────────
function Repair-PdfEncoding {
    param(
        [string]$PdfPath,
        [bool]$IsDryRun
    )
    
    $pdfName = Split-Path $PdfPath -Leaf
    $htmlName = [System.IO.Path]::ChangeExtension($pdfName, '.html')
    
    # Strategy 1: Look for matching HTML in same directory
    $pdfDir = Split-Path $PdfPath -Parent
    $candidateHtml = Join-Path $pdfDir $htmlName
    
    # Strategy 2: Try removing '-player' suffix (e.g., locations-player.pdf → locations.html)
    if (-not (Test-Path $candidateHtml)) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($pdfName) -replace '-player$', ''
        $altHtml = Join-Path $pdfDir "$baseName.html"
        if (Test-Path $altHtml) {
            $candidateHtml = $altHtml
        }
    }
    
    # Strategy 3: Try Bruce-Stuff with character- prefix
    if (-not (Test-Path $candidateHtml)) {
        $bruceDir = Join-Path $RepoRoot 'Bruce-Stuff'
        $bruceHtml = Join-Path $bruceDir $htmlName
        if (Test-Path $bruceHtml) {
            $candidateHtml = $bruceHtml
        }
    }
    
    if (-not (Test-Path $candidateHtml)) {
        Write-Host "  ⚠️  No source HTML found for $pdfName — cannot repair encoding" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "  Source HTML: $candidateHtml" -ForegroundColor Gray
    
    if ($IsDryRun) {
        Write-Host "  [WHATIF] Would fix UTF-8 encoding in $htmlName and regenerate $pdfName" -ForegroundColor Yellow
        return $true
    }
    
    # Read raw bytes
    $rawBytes = [System.IO.File]::ReadAllBytes($candidateHtml)
    
    # Check for double-encoding signature
    $hasDoubleEncoding = $false
    for ($i = 0; $i -lt $rawBytes.Length - 3; $i++) {
        if ($rawBytes[$i] -eq 0xC3 -and $rawBytes[$i+1] -eq 0xA2 -and 
            $rawBytes[$i+2] -eq 0xE2 -and $rawBytes[$i+3] -eq 0x82) {
            $hasDoubleEncoding = $true
            break
        }
    }
    
    $content = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    if ($hasDoubleEncoding) {
        Write-Host "  🔧 Fixing double-encoded UTF-8..." -ForegroundColor Yellow
        try {
            $fixedBytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($content)
            $content = [System.Text.Encoding]::UTF8.GetString($fixedBytes)
            
            # Verify
            $verifyBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            $stillCorrupt = $false
            for ($i = 0; $i -lt $verifyBytes.Length - 3; $i++) {
                if ($verifyBytes[$i] -eq 0xC3 -and $verifyBytes[$i+1] -eq 0xA2 -and 
                    $verifyBytes[$i+2] -eq 0xE2 -and $verifyBytes[$i+3] -eq 0x82) {
                    $stillCorrupt = $true
                    break
                }
            }
            if ($stillCorrupt) {
                Write-Host "  ⚠️  Double-encoding may not be fully resolved" -ForegroundColor Red
            } else {
                Write-Host "  ✅ Double-encoding reversed" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ❌ Encoding fix failed: $_" -ForegroundColor Red
            return $false
        }
    }
    
    # Ensure <meta charset="UTF-8"> is present
    if ($content -notmatch '<meta charset="UTF-8"') {
        Write-Host "  🔧 Adding <meta charset=UTF-8>..." -ForegroundColor Yellow
        if ($content -match '<head>') {
            $content = $content -replace '<head>', '<head><meta charset="UTF-8">'
        } elseif ($content -match '<html[^>]*>') {
            $content = $content -replace '(<html[^>]*>)', '$1<head><meta charset="UTF-8"></head>'
        }
    }
    
    # Write source back with UTF-8 BOM
    [System.IO.File]::WriteAllText($candidateHtml, $content, [System.Text.UTF8Encoding]::new($true))
    Write-Host "  📝 Source saved with UTF-8 BOM" -ForegroundColor Gray
    
    # Regenerate PDF via Chrome headless
    if (-not $Chrome) {
        Write-Host "  ❌ Chrome not available — cannot regenerate PDF" -ForegroundColor Red
        return $false
    }
    
    # Inline fonts
    foreach ($fontName in $FontMap.Keys) {
        $shortName = $fontName -replace '-Regular|-Bold|-Italic|-BoldItalic', ''
        $content = $content -replace "url\(['""]?[^'""]*?$fontName\.ttf['""]?\)", "url('$($FontMap[$fontName])')"
    }
    
    # Margin fixes
    $content = $content -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    $content = $content -replace 'margin:\s*30px\s+auto', 'margin: 0 auto'
    
    # Write temp file without BOM (Chrome compatibility)
    $tmp = Join-Path $env:TEMP "neon-relic-repair-$pid.html"
    [System.IO.File]::WriteAllText($tmp, $content, [System.Text.UTF8Encoding]::new($false))
    
    # Convert to file URI
    $tmpUri = "file:///$($tmp -replace '\\', '/')"
    
    Write-Host "  🖨️  Generating PDF via Chrome headless..." -ForegroundColor Gray
    $proc = Start-Process -FilePath $Chrome -ArgumentList @(
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        "--print-to-pdf=`"$PdfPath`"",
        '--no-pdf-header-footer',
        "`"$tmpUri`""
    ) -Wait -NoNewWindow -PassThru
    
    Remove-Item $tmp -ErrorAction SilentlyContinue
    
    if ((Test-Path $PdfPath) -and ((Get-Item $PdfPath).Length -gt 0)) {
        $sizeKB = [math]::Round((Get-Item $PdfPath).Length / 1KB, 1)
        Write-Host "  ✅ PDF regenerated: $pdfName ($sizeKB KB)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ PDF generation failed (Chrome exit code: $($proc.ExitCode))" -ForegroundColor Red
        return $false
    }
}

# ── Run encoding repairs ──────────────────────────────────────────────────────
$encodingMode = ($RepairMode -eq 'encoding' -or $RepairMode -eq 'all')
if ($encodingMode) {
    Write-Host "`n--- Encoding Repairs ---" -ForegroundColor Cyan
    
    # Only attempt encoding repair on PDFs that likely came from HTML
    # (Chrome-generated PDFs, not asciidoctor-generated ones)
    $encodingCandidates = $PdfFiles | Where-Object {
        # Skip the core rulebook (asciidoctor-generated)
        $_.Name -notmatch 'neon-relic-core-rules|case-file-instructions' -and
        # Skip stamp SVGs (they're SVGs, not PDF source)
        $_.Name -notmatch '^stamp'
    }
    
    foreach ($pdf in $encodingCandidates) {
        Write-Host "`n  PDF: $($pdf.Name)" -ForegroundColor White
        $success = Repair-PdfEncoding -PdfPath $pdf.FullName -IsDryRun $WhatIf.IsPresent
    }
}

# ── Cleanup ───────────────────────────────────────────────────────────────────
Remove-Item $tempJson -ErrorAction SilentlyContinue
Remove-Item $pythonScriptPath -ErrorAction SilentlyContinue

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n=== Repair Complete ===" -ForegroundColor Cyan
if ($WhatIf) {
    Write-Host "  Mode: WHATIF — no changes were made" -ForegroundColor Yellow
}
Write-Host "  Repair mode: $RepairMode"
Write-Host "  Files processed: $($PdfFiles.Count)"
Write-Host ""
