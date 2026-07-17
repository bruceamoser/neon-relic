$files = @(
    'assets/operations-board.html',
    'docs/case-files/spear-that-went-dark/information-cards.html'
)

foreach ($file in $files) {
    Write-Host "Processing: $file"
    $rawBytes = [System.IO.File]::ReadAllBytes($file)
    
    # Check BOM
    $hasBOM = ($rawBytes.Length -ge 3 -and $rawBytes[0] -eq 0xEF -and $rawBytes[1] -eq 0xBB -and $rawBytes[2] -eq 0xBF)
    Write-Host "  Has BOM: $hasBOM"
    
    # Read content as UTF-8
    $content = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    # Replace known mojibake patterns for em-dash
    # aEUR" (U+00E2 U+20AC U+201C) -> em dash (U+2014)
    $before = $content.Length
    $content = $content -replace "\u00E2\u20AC\u201C", [char]0x2014
    $content = $content -replace "\u00E2\u20AC\u201D", [char]0x2014
    $content = $content -replace "\u00E2\u20AC\u0094", [char]0x2014
    Write-Host "  Content length: $before -> $($content.Length)"
    
    # Write back with BOM
    [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($true))
    Write-Host "  Written"
    
    # Verify
    $vbytes = [System.IO.File]::ReadAllBytes($file)
    $vfound = $false
    for ($i = 0; $i -lt $vbytes.Length - 3; $i++) {
        if ($vbytes[$i] -eq 0xC3 -and $vbytes[$i+1] -eq 0xA2 -and $vbytes[$i+2] -eq 0xE2 -and $vbytes[$i+3] -eq 0x82) {
            $vfound = $true
            break
        }
    }
    if ($vfound) {
        Write-Host "  STILL HAS DOUBLE-ENCODING" -ForegroundColor Red
    } else {
        Write-Host "  CLEAN" -ForegroundColor Green
    }
}

Write-Host "Done."
