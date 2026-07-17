$ErrorActionPreference = 'Continue'
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$ThemeDir = "C:\Repos\neon-relic\docs\themes"

Write-Host "=== Player-Facing PDF Regeneration with Font Inlining ===" -ForegroundColor Cyan
Write-Host ""

# ── Read font files and convert to base64 ──────────────────────────────────
$fonts = @{}
@("SpecialElite-Regular", "CourierPrime-Regular", "CourierPrime-Bold", "CourierPrime-Italic", "CourierPrime-BoldItalic") | ForEach-Object {
    $fontPath = Join-Path $ThemeDir "$_.ttf"
    if (Test-Path $fontPath) {
        $bytes = [System.IO.File]::ReadAllBytes($fontPath)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $fonts[$_] = "data:font/truetype;base64,$b64"
        Write-Host "  Font loaded: $_ ($($b64.Length) chars base64, $([math]::Round($bytes.Length/1KB,1)) KB)" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Font not found: $fontPath" -ForegroundColor Yellow
    }
}
Write-Host ""

# ── Files to convert (6 player-facing across 3 case directories) ───────────
$files = @(
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\relic-summary-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\relic-summary-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\relic-summary-player.html"
)

$SuccessCount = 0
$FailCount = 0

foreach ($html in $files) {
    $htmlName = Split-Path $html -Leaf
    $pdf = [System.IO.Path]::ChangeExtension($html, ".pdf")
    $pdfName = Split-Path $pdf -Leaf
    
    if (-not (Test-Path $html)) {
        Write-Host "  SKIP: $htmlName (file not found)" -ForegroundColor Yellow
        $FailCount++
        continue
    }
    
    Write-Host "Processing: $htmlName -> $pdfName" -ForegroundColor White
    
    # Read original HTML with UTF-8 encoding
    $content = Get-Content $html -Raw -Encoding UTF8
    
    # Inline all 5 font references
    foreach ($fontName in $fonts.Keys) {
        $pattern = "url\('.*?$fontName\.ttf'\)"
        $replacement = "url('$($fonts[$fontName])')"
        $content = $content -replace $pattern, $replacement
    }
    
    # Apply margin fixes (matching convert-boudica-pact.ps1 and convert-player-files.ps1)
    $content = $content -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    $content = $content -replace 'margin:\s*30px\s+auto', 'margin: 0 auto'
    
    # Write temp file (UTF-8 without BOM, matching convert-boudica-pact.ps1 pattern)
    $tmp = [System.IO.Path]::ChangeExtension($html, ".tmp.html")
    [IO.File]::WriteAllText($tmp, $content, [Text.UTF8Encoding]::new($false))
    
    # Build file URI
    $tmpUri = "file:///$($tmp -replace '\\', '/')"
    
    # Run Chrome headless (matching convert-boudica-pact.ps1 argument pattern)
    $proc = Start-Process -FilePath $Chrome -ArgumentList @(
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        "--print-to-pdf=`"$pdf`"",
        '--no-pdf-header-footer',
        "`"$tmpUri`""
    ) -Wait -NoNewWindow -PassThru
    
    # Clean up temp file
    Remove-Item $tmp -ErrorAction SilentlyContinue
    
    if ((Test-Path $pdf) -and ((Get-Item $pdf).Length -gt 0)) {
        $sizeKB = [math]::Round((Get-Item $pdf).Length / 1KB, 1)
        $sizeBytes = (Get-Item $pdf).Length
        Write-Host "  OK: $pdfName ($sizeKB KB / $sizeBytes bytes)" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "  FAILED: $pdfName (Chrome exit code: $($proc.ExitCode))" -ForegroundColor Red
        $FailCount++
    }
    Write-Host ""
}

# ── Summary ────────────────────────────────────────────────────────────────
Write-Host "=== Conversion Summary ===" -ForegroundColor Cyan
Write-Host "  Succeeded: $SuccessCount" -ForegroundColor Green
if ($FailCount -gt 0) {
    Write-Host "  Failed:    $FailCount" -ForegroundColor Red
}
Write-Host "  Target: 6 player-facing PDFs across 3 case directories"
Write-Host ""
