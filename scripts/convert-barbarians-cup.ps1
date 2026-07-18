<#
.SYNOPSIS
    Converts all 9 HTML case-file documents in docs/case-files/the-barbarians-cup/ to PDF
    using Chrome headless mode. Applies margin fix to prevent phantom second page.

.DESCRIPTION
    Mirrors the build-pdfs.sh process (lines 13–39):
    1. Creates a temp copy of each HTML with margin:0.3in auto → margin:0 auto
    2. Runs Chrome headless on the temp copy to produce the PDF
    3. Deletes the temp copy

    The margin fix addresses a Chrome headless bug where .page { margin: 0.3in auto }
    adds 0.6in vertical margin that overflows letter-sized paper, creating a phantom
    blank second page.
#>

$ErrorActionPreference = 'Continue'
$RepoRoot = $PSScriptRoot

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
    Write-Error "ERROR: No Chrome/Chromium/Edge found. Checked:`n$($ChromePaths -join "`n")"
    exit 1
}

Write-Host "Using browser: $Chrome" -ForegroundColor Cyan
Write-Host ""

# ── Files to convert ───────────────────────────────────────────────────────
$CaseDir = Join-Path $RepoRoot 'docs\case-files\the-barbarians-cup'

$Files = @(
    'start-here.html',
    'case-brief-da.html',
    'case-brief-player.html',
    'relic-sheet.html',
    'operations-board.html',
    'organization-reference.html',
    'locations.html',
    'npc-cards.html',
    'information-cards.html'
)

# ── Convert each file ──────────────────────────────────────────────────────
$SuccessCount = 0
$FailCount = 0

foreach ($htmlFile in $Files) {
    $htmlPath = Join-Path $CaseDir $htmlFile
    $pdfPath = Join-Path $CaseDir ($htmlFile -replace '\.html$', '.pdf')
    $tmpPath = Join-Path $CaseDir ($htmlFile -replace '\.html$', '.tmp.html')

    if (-not (Test-Path $htmlPath)) {
        Write-Host "  SKIP: $htmlFile (file not found)" -ForegroundColor Yellow
        $FailCount++
        continue
    }

    Write-Host "  Converting: $htmlFile -> $($htmlFile -replace '\.html$','.pdf') ... " -NoNewline

    # .page margin:0.3in auto adds 0.6in vertical → overflows letter paper
    # causing a phantom second page. Set vertical margin to 0 to fix.
    $htmlContent = Get-Content $htmlPath -Raw
    $htmlContent = $htmlContent -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    Set-Content $tmpPath -Value $htmlContent -NoNewline

    $htmlUri = "file:///$($tmpPath -replace '\\','/')"

    $proc = Start-Process -FilePath $Chrome -ArgumentList @(
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        "--print-to-pdf=`"$pdfPath`"",
        '--no-pdf-header-footer',
        "`"$htmlUri`""
    ) -Wait -PassThru -WindowStyle Hidden

    # Clean up temp file
    Remove-Item $tmpPath -ErrorAction SilentlyContinue

    if ((Test-Path $pdfPath) -and ((Get-Item $pdfPath).Length -gt 0)) {
        $sizeKB = [math]::Round((Get-Item $pdfPath).Length / 1KB, 1)
        Write-Host "OK ($sizeKB KB)" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "FAILED" -ForegroundColor Red
        $FailCount++
    }
}

# ── Summary ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Conversion Summary ===" -ForegroundColor Cyan
Write-Host "  Succeeded: $SuccessCount" -ForegroundColor Green
if ($FailCount -gt 0) {
    Write-Host "  Failed:    $FailCount" -ForegroundColor Red
}
Write-Host "  Output directory: $CaseDir"
