$ErrorActionPreference = 'Continue'
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$dir = "C:\Repos\neon-relic\docs\case-files\the-boudica-pact"
$themesDir = "C:\Repos\neon-relic\docs\themes"

Write-Host "=== PDF Generation with Font Inlining ==="
Write-Host ""

# Pre-encode fonts
$specialElitePath = Join-Path $themesDir 'SpecialElite-Regular.ttf'
$courierPrimePath = Join-Path $themesDir 'CourierPrime-Regular.ttf'

if (-not (Test-Path $specialElitePath)) {
    Write-Host "ERROR: SpecialElite font not found at $specialElitePath"
    exit 1
}
if (-not (Test-Path $courierPrimePath)) {
    Write-Host "ERROR: CourierPrime font not found at $courierPrimePath"
    exit 1
}

$specialEliteB64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($specialElitePath))
$courierPrimeB64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($courierPrimePath))

Write-Host "Fonts encoded:"
Write-Host "  SpecialElite: $($specialEliteB64.Length) chars base64"
Write-Host "  CourierPrime: $($courierPrimeB64.Length) chars base64"
Write-Host ""

Get-ChildItem "$dir\*.html" | ForEach-Object {
    $name = $_.Name
    $tmp = Join-Path $dir "$($_.BaseName).tmp.html"
    $pdf = Join-Path $dir "$($_.BaseName).pdf"
    
    Write-Host "Processing: $name"
    
    # Read original HTML
    $html = Get-Content $_.FullName -Raw -Encoding UTF8
    
    # Replace font URL references with base64 data URIs
    $html = $html -replace "url\('?`"?(?:[^'`")]*?/)??SpecialElite-Regular\.ttf'?`"?\)", "url('data:font/truetype;base64,$specialEliteB64')"
    $html = $html -replace "url\('?`"?(?:[^'`")]*?/)??CourierPrime-Regular\.ttf'?`"?\)", "url('data:font/truetype;base64,$courierPrimeB64')"
    
    # Also handle local() fallbacks and src references that include local()
    $html = $html -replace "local\('Special Elite'\)", "local('Special Elite')"
    
    # Apply margin fix (from build-pdfs.sh line 22)
    $html = $html -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'
    
    # Write temp file
    [IO.File]::WriteAllText($tmp, $html, [Text.UTF8Encoding]::new($false))
    
    Write-Host "  Temp: $(Split-Path $tmp -Leaf) ($($html.Length) chars)"
    
    # Build file URI - ensure proper formatting for Windows
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
    
    Write-Host "  Chrome exit code: $($proc.ExitCode)"
    
    # Clean up temp
    Remove-Item $tmp -ErrorAction SilentlyContinue
    
    if (Test-Path $pdf) {
        $sizeKB = [math]::Round((Get-Item $pdf).Length / 1KB, 1)
        $sizeBytes = (Get-Item $pdf).Length
        Write-Host "  OK: $(Split-Path $pdf -Leaf) ($sizeKB KB / $sizeBytes bytes)" -ForegroundColor Green
    } else {
        Write-Host "  FAILED: $(Split-Path $pdf -Leaf)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Done ==="
