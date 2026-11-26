param([switch]$SkipRulebook, [switch]$SkipPdfs)
$buildArgs = @()
if ($SkipRulebook) { $buildArgs += '--skip-rulebook' }
if ($SkipPdfs) { $buildArgs += '--skip-pdfs' }
& python (Join-Path $PSScriptRoot 'build_book.py') @buildArgs
exit $LASTEXITCODE
