<#
.SYNOPSIS
    Approach A: Convert HTML→PDF using absolute file paths + --allow-file-access-from-files
    Converts all 6 player-facing files with images.
#>
$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $Chrome)) {
    Write-Error "Chrome not found at $Chrome"
    exit 1
}

$RepoRoot = $PSScriptRoot

# 6 files to convert: case-dir, html-file
$Files = @(
    @{ Dir = 'docs\case-files\the-barbarians-cup'; Html = 'npc-cards-player.html' },
    @{ Dir = 'docs\case-files\the-barbarians-cup'; Html = 'relic-summary-player.html' },
    @{ Dir = 'docs\case-files\the-boudica-pact';  Html = 'npc-cards-player.html' },
    @{ Dir = 'docs\case-files\the-boudica-pact';  Html = 'relic-summary-player.html' },
    @{ Dir = 'docs\case-files\the-cormsil-compact'; Html = 'npc-cards-player.html' },
    @{ Dir = 'docs\case-files\the-cormsil-compact'; Html = 'relic-summary-player.html' }
)

$Success = 0
$Fail = 0

foreach ($f in $Files) {
    $caseDir = Join-Path $RepoRoot $f.Dir
    $htmlPath = Join-Path $caseDir $f.Html
    $pdfFile = $f.Html -replace '\.html$', '.pdf'
    $pdfPath = Join-Path $caseDir $pdfFile
    $tmpPath = Join-Path $caseDir ($f.Html -replace '\.html$', '.tmp.html')

    if (-not (Test-Path $htmlPath)) {
        Write-Host "SKIP: $htmlPath not found" -ForegroundColor Yellow
        $Fail++
        continue
    }

    Write-Host "Converting: $($f.Html) -> $pdfFile ... " -NoNewline

    try {
        # Read HTML, fix margin, replace relative image paths with absolute
        $html = Get-Content $htmlPath -Raw -Encoding UTF8
        $html = $html -replace 'margin:\s*30px\s+auto', 'margin: 0 auto'
        
        # Replace src="images/ with absolute path
        $absImageDir = (Join-Path $caseDir 'images').Replace('\', '/')
        $html = $html -replace 'src="images/', "src=`"$absImageDir/"

        [IO.File]::WriteAllText($tmpPath, $html, [Text.UTF8Encoding]::new($false))

        # Build file URI
        $uri = 'file:///' + ($tmpPath -replace '\\', '/')

        # Run Chrome headless
        $proc = Start-Process -FilePath $Chrome -ArgumentList @(
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--allow-file-access-from-files',
            '--no-pdf-header-footer',
            "--print-to-pdf=$pdfPath",
            $uri
        ) -Wait -PassThru -WindowStyle Hidden

        # Clean up temp
        Remove-Item $tmpPath -ErrorAction SilentlyContinue

        if ((Test-Path $pdfPath) -and ((Get-Item $pdfPath).Length -gt 10000)) {
            $sizeKB = [math]::Round((Get-Item $pdfPath).Length / 1KB, 1)
            Write-Host "OK ($sizeKB KB)" -ForegroundColor Green
            $Success++
        } elseif (Test-Path $pdfPath) {
            $sizeKB = [math]::Round((Get-Item $pdfPath).Length / 1KB, 1)
            Write-Host "WARNING: Very small ($sizeKB KB) - images may be missing" -ForegroundColor Yellow
            $Success++
        } else {
            Write-Host "FAILED (no output)" -ForegroundColor Red
            $Fail++
        }
    } catch {
        Write-Host "FAILED: $_" -ForegroundColor Red
        Remove-Item $tmpPath -ErrorAction SilentlyContinue
        $Fail++
    }
}

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "Succeeded: $Success" -ForegroundColor Green
if ($Fail -gt 0) {
    Write-Host "Failed: $Fail" -ForegroundColor Red
}
