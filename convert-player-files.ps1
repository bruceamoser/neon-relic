<#
.SYNOPSIS
    Converts all 12 player-facing HTML case-file documents to PDF using Chrome headless.
    Targets: the-barbarians-cup, the-boudica-pact, the-cormsil-compact

.DESCRIPTION
    Mirrors the existing convert-barbarians-cup.ps1 process:
    1. Creates a temp copy of each HTML with margin:0.3in auto → margin:0 auto
    2. Runs Chrome headless on the temp copy to produce the PDF
    3. Deletes the temp copy
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
    Write-Error "ERROR: No Chrome/Chromium/Edge found."
    exit 1
}

Write-Host "Using browser: $Chrome" -ForegroundColor Cyan
Write-Host ""

# ── Files to convert (12 total across 3 case directories) ──────────────────
$CaseDirs = @(
    @{ Dir = Join-Path $RepoRoot 'docs\case-files\the-barbarians-cup'; Name = 'The Barbarian''s Cup' },
    @{ Dir = Join-Path $RepoRoot 'docs\case-files\the-boudica-pact';      Name = 'The Boudica Pact' },
    @{ Dir = Join-Path $RepoRoot 'docs\case-files\the-cormsil-compact';   Name = 'The Cormsil Compact' }
)

$PlayerFiles = @(
    'locations-player.html',
    'npc-cards-player.html',
    'organization-reference-player.html',
    'relic-summary-player.html'
)

# ── Convert each file ──────────────────────────────────────────────────────
$TotalSuccess = 0
$TotalFail = 0

foreach ($case in $CaseDirs) {
    Write-Host "=== $($case.Name) ===" -ForegroundColor Yellow
    
    foreach ($htmlFile in $PlayerFiles) {
        $htmlPath = Join-Path $case.Dir $htmlFile
        $pdfFile = $htmlFile -replace '\.html$', '.pdf'
        $pdfPath = Join-Path $case.Dir $pdfFile
        $tmpPath = Join-Path $case.Dir ($htmlFile -replace '\.html$', '.tmp.html')

        if (-not (Test-Path $htmlPath)) {
            Write-Host "  SKIP: $htmlFile (file not found)" -ForegroundColor Yellow
            $TotalFail++
            continue
        }

        Write-Host "  Converting: $htmlFile -> $pdfFile ... " -NoNewline

        # Apply margin fix: margin:0.3in auto → margin:0 auto
        $htmlContent = Get-Content $htmlPath -Raw -Encoding UTF8
        $htmlContent = $htmlContent -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
        # Also fix margin:30px auto (our player files use this)
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
    Write-Host ""
}

# ── Summary ────────────────────────────────────────────────────────────────
Write-Host "=== Conversion Summary ===" -ForegroundColor Cyan
Write-Host "  Succeeded: $TotalSuccess" -ForegroundColor Green
if ($TotalFail -gt 0) {
    Write-Host "  Failed:    $TotalFail" -ForegroundColor Red
}
Write-Host "  Target: 12 files across 3 case directories"
