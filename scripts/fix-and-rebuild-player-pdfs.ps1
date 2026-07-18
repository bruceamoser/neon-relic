$ErrorActionPreference = 'Continue'
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$ThemeDir = "C:\Repos\neon-relic\docs\themes"

Write-Host "=== UTF-8 Encoding Fix + PDF Regeneration ===" -ForegroundColor Cyan
Write-Host ""

# ── Step 0: Load fonts ──────────────────────────────────────────────────────
$fonts = @{}
@("SpecialElite-Regular", "CourierPrime-Regular", "CourierPrime-Bold", "CourierPrime-Italic", "CourierPrime-BoldItalic") | ForEach-Object {
    $fontPath = Join-Path $ThemeDir "$_.ttf"
    if (Test-Path $fontPath) {
        $bytes = [System.IO.File]::ReadAllBytes($fontPath)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $fonts[$_] = "data:font/truetype;base64,$b64"
    }
}

# ── All 12 player-facing HTML files ─────────────────────────────────────────
$playerFiles = @(
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\locations-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\organization-reference-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\relic-summary-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\locations-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\organization-reference-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-boudica-pact\relic-summary-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\locations-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\npc-cards-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\organization-reference-player.html",
    "C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\relic-summary-player.html"
)

$fixCount = 0
$cleanCount = 0
$pdfCount = 0
$failCount = 0

# ── Helper: detect double-encoded UTF-8 by raw byte signature ───────────────
# The byte sequence C3 A2 E2 82 AC is the double-encoded form of the start
# of an em-dash/en-dash corruption pattern (a with circumflex + Euro sign).
function Test-DoubleEncodedBytes {
    param([byte[]]$Bytes)
    
    # Signature: C3 A2 E2 82 AC (double-encoded start of em/en dash)
    # Also check for C3 83 C2 (double-encoded A with tilde + ...)
    for ($i = 0; $i -lt $Bytes.Length - 3; $i++) {
        if ($Bytes[$i] -eq 0xC3 -and $Bytes[$i+1] -eq 0xA2 -and 
            $Bytes[$i+2] -eq 0xE2 -and $Bytes[$i+3] -eq 0x82) {
            return $true
        }
    }
    return $false
}

# ── Part 1: Fix source files ────────────────────────────────────────────────
Write-Host "--- Part 1: Fix UTF-8 Encoding in Source Files ---" -ForegroundColor Cyan
Write-Host ""

foreach ($html in $playerFiles) {
    $htmlName = Split-Path $html -Leaf
    $caseName = Split-Path (Split-Path $html) -Leaf
    
    if (-not (Test-Path $html)) {
        Write-Host "  SKIP: $caseName/$htmlName (file not found)" -ForegroundColor Yellow
        $failCount++
        continue
    }
    
    # Read raw bytes
    $rawBytes = [System.IO.File]::ReadAllBytes($html)
    
    # Check for double-encoding signature
    $isDoubleEncoded = Test-DoubleEncodedBytes $rawBytes
    
    # Decode as UTF-8
    $content = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    if ($isDoubleEncoded) {
        Write-Host "  FIXING: $caseName/$htmlName (double-encoded UTF-8 signature detected)" -ForegroundColor Yellow
        
        # Fix: encode the garbled string as Windows-1252, then decode as proper UTF-8
        try {
            $fixedBytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($content)
            $content = [System.Text.Encoding]::UTF8.GetString($fixedBytes)
            
            # Verify the fix: check if signature still present in fixed content bytes
            $verifyBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            $stillCorrupt = Test-DoubleEncodedBytes $verifyBytes
            
            if ($stillCorrupt) {
                Write-Host "    WARNING: Fix may be incomplete" -ForegroundColor Red
            } else {
                Write-Host "    OK: Double-encoding reversed" -ForegroundColor Green
            }
            $fixCount++
        } catch {
            Write-Host "    ERROR during fix: $_" -ForegroundColor Red
            $failCount++
            continue
        }
    } else {
        Write-Host "  CLEAN:  $caseName/$htmlName" -ForegroundColor Green
        $cleanCount++
    }
    
    # Ensure <meta charset="UTF-8"> is present
    if ($content -notmatch '<meta charset="UTF-8"') {
        Write-Host "    Adding <meta charset=UTF-8>" -ForegroundColor Yellow
        if ($content -match '<head>') {
            $content = $content -replace '<head>', '<head><meta charset="UTF-8">'
        } elseif ($content -match '<html[^>]*>') {
            $content = $content -replace '(<html[^>]*>)', '$1<head><meta charset="UTF-8"></head>'
        }
    }
    
    # Write source back with UTF-8 BOM
    [System.IO.File]::WriteAllText($html, $content, [System.Text.UTF8Encoding]::new($true))
    Write-Host "    Written: $htmlName (UTF-8 with BOM)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Part 1 Complete: $fixCount fixed, $cleanCount already clean" -ForegroundColor Green
Write-Host ""

# ── Part 2: Regenerate PDFs ─────────────────────────────────────────────────
Write-Host "--- Part 2: Regenerate PDFs with Proper UTF-8 ---" -ForegroundColor Cyan
Write-Host ""

foreach ($html in $playerFiles) {
    $htmlName = Split-Path $html -Leaf
    $caseName = Split-Path (Split-Path $html) -Leaf
    $pdf = [System.IO.Path]::ChangeExtension($html, ".pdf")
    $pdfName = Split-Path $pdf -Leaf
    
    if (-not (Test-Path $html)) {
        Write-Host "  SKIP: $caseName/$htmlName (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "  PDF: $caseName/$htmlName -> $pdfName" -ForegroundColor White
    
    # Read with explicit UTF-8
    $content = [System.IO.File]::ReadAllText($html, [System.Text.Encoding]::UTF8)
    
    # Inline all font references
    foreach ($fontName in $fonts.Keys) {
        $content = $content -replace "url\('.*?$fontName\.ttf'\)", "url('$($fonts[$fontName])')"
    }
    
    # Margin fixes
    $content = $content -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    $content = $content -replace 'margin:\s*30px\s+auto', 'margin: 0 auto'
    
    # Write temp file with UTF-8 WITHOUT BOM (Chrome compatibility)
    $tmp = [System.IO.Path]::ChangeExtension($html, ".tmp.html")
    [System.IO.File]::WriteAllText($tmp, $content, [System.Text.UTF8Encoding]::new($false))
    
    # Build file URI (forward slashes)
    $tmpUri = "file:///$($tmp -replace '\\', '/')"
    
    # Run Chrome headless
    $proc = Start-Process -FilePath $Chrome -ArgumentList @(
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        "--print-to-pdf=`"$pdf`"",
        '--no-pdf-header-footer',
        "`"$tmpUri`""
    ) -Wait -NoNewWindow -PassThru
    
    # Clean up temp
    Remove-Item $tmp -ErrorAction SilentlyContinue
    
    if ((Test-Path $pdf) -and ((Get-Item $pdf).Length -gt 0)) {
        $sizeKB = [math]::Round((Get-Item $pdf).Length / 1KB, 1)
        Write-Host "    OK: $pdfName ($sizeKB KB)" -ForegroundColor Green
        $pdfCount++
    } else {
        Write-Host "    FAILED: $pdfName (Chrome exit: $($proc.ExitCode))" -ForegroundColor Red
        $failCount++
    }
}

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Source files fixed:  $fixCount (double-encoding reversed)"
Write-Host "  Source files clean:  $cleanCount (no fix needed)"
Write-Host "  PDFs regenerated:    $pdfCount"
if ($failCount -gt 0) {
    Write-Host "  Failures:            $failCount" -ForegroundColor Red
}
Write-Host "  Total player files:  $($playerFiles.Count)"
Write-Host ""
