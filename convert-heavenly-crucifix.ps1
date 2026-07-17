<#
.SYNOPSIS
    Converts all 13 HTML files in the-heavenly-crucifix to PDF using Chrome headless.
#>

$ErrorActionPreference = 'Continue'
$CaseDir = Join-Path $PSScriptRoot 'docs\case-files\the-heavenly-crucifix'

# ── Locate Chrome ──────────────────────────────────────────────────────────
$ChromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

$Chrome = $null
foreach ($p in $ChromePaths) {
    if (Test-Path $p) {
        $Chrome = $p
        break
    }
}

if (-not $Chrome) {
    Write-Error "ERROR: No Chrome/Chromium/Edge found."
    exit 1
}

Write-Host "Using browser: $Chrome" -ForegroundColor Cyan
Write-Host ""

# ── Files to convert (13 total) ────────────────────────────────────────────
$Files = @(
    'case-brief-da.html',
    'case-brief-player.html',
    'information-cards.html',
    'locations.html',
    'npc-cards.html',
    'operations-board.html',
    'organization-reference.html',
    'relic-sheet.html',
    'start-here.html',
    'locations-player.html',
    'npc-cards-player.html',
    'organization-reference-player.html',
    'relic-summary-player.html'
)

# ── Convert each file ──────────────────────────────────────────────────────
$TotalSuccess = 0
$TotalFail = 0

foreach ($htmlFile in $Files) {
    $htmlPath = Join-Path $CaseDir $htmlFile
    $pdfFile = $htmlFile -replace '\.html$', '.pdf'
    $pdfPath = Join-Path $CaseDir $pdfFile
    $tmpPath = Join-Path $CaseDir ($htmlFile -replace '\.html$', '.tmp.html')

    if (-not (Test-Path $htmlPath)) {
        Write-Host "  SKIP: $htmlFile (file not found)" -ForegroundColor Yellow
        $TotalFail++
        continue
    }

    Write-Host "  Converting: $htmlFile -> $pdfFile ... " -NoNewline

    # Apply margin fix: margin:30px auto -> margin:0 auto (and 0.3in variant)
    $htmlContent = Get-Content $htmlPath -Raw -Encoding UTF8
    $htmlContent = $htmlContent -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    $htmlContent = $htmlContent -replace 'margin:\s*30px\s+auto', 'margin: 0 auto'
    [IO.File]::WriteAllText($tmpPath, $htmlContent, [Text.UTF8Encoding]::new($false))

    $htmlUri = "file:///$($tmpPath -replace '\\','/')"

    $proc = Start-Process -FilePath $Chrome -ArgumentList @(
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--print-to-pdf-no-header-footer',
        "--print-to-pdf=`"$pdfPath`"",
        "`"$htmlUri`""
    ) -Wait -PassThru -WindowStyle Hidden

    # Clean up temp file
    Remove-Item $tmpPath -ErrorAction SilentlyContinue

    if ((Test-Path $pdfPath) -and ((Get-Item $pdfPath).Length -gt 0)) {
        $sizeKB = [math]::Round((Get-Item $pdfPath).Length / 1KB, 1)
        Write-Host "OK ($sizeKB KB)" -ForegroundColor Green
        $TotalSuccess++
    } else {
        Write-Host "FAILED" -ForegroundColor Red
        $TotalFail++
    }
}

# ── Summary ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Conversion Summary ===" -ForegroundColor Cyan
Write-Host "  Succeeded: $TotalSuccess" -ForegroundColor Green
if ($TotalFail -gt 0) {
    Write-Host "  Failed:    $TotalFail" -ForegroundColor Red
}
Write-Host "  Target: 13 files in the-heavenly-crucifix"
