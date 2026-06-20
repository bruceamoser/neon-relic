$pdfs = @(
    'C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\npc-cards-player.pdf',
    'C:\Repos\neon-relic\docs\case-files\the-barbarians-cup\relic-summary-player.pdf',
    'C:\Repos\neon-relic\docs\case-files\the-boudica-pact\npc-cards-player.pdf',
    'C:\Repos\neon-relic\docs\case-files\the-boudica-pact\relic-summary-player.pdf',
    'C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\npc-cards-player.pdf',
    'C:\Repos\neon-relic\docs\case-files\the-cormsil-compact\relic-summary-player.pdf'
)

Write-Host "=== PDF Header Validation ===" -ForegroundColor Cyan
Write-Host ""

$allValid = $true
foreach ($p in $pdfs) {
    $name = Split-Path $p -Leaf
    if (Test-Path $p) {
        $bytes = [System.IO.File]::ReadAllBytes($p)
        $sizeKB = [math]::Round($bytes.Length / 1KB, 1)
        $header = [System.Text.Encoding]::ASCII.GetString($bytes[0..7])
        $trailerBytes = $bytes[($bytes.Length-7)..($bytes.Length-1)]
        $trailerChars = $trailerBytes | ForEach-Object { if ($_ -ge 32 -and $_ -le 126) { [char]$_ } else { '.' } }
        $trailer = -join $trailerChars
        $valid = $header.StartsWith('%PDF-')
        if (-not $valid) { $allValid = $false }
        $status = if ($valid) { "VALID" } else { "CORRUPT" }
        $color = if ($valid) { "Green" } else { "Red" }
        Write-Host ("  {0,-42} {1,8} KB  header=[{2}]  trailer=[{3}]  {4}" -f $name, $sizeKB, $header, $trailer, $status) -ForegroundColor $color
    } else {
        Write-Host ("  {0,-42} MISSING" -f $name) -ForegroundColor Red
        $allValid = $false
    }
}

Write-Host ""
if ($allValid) {
    Write-Host "All 6 PDFs have valid %PDF headers." -ForegroundColor Green
} else {
    Write-Host "SOME PDFs ARE CORRUPT!" -ForegroundColor Red
}
