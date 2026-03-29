<#
.SYNOPSIS
    Builds the Neon Relic starter kit — generates PDFs and self-contained HTML files,
    then packages everything into starter-kit.zip.

.DESCRIPTION
    Generates:
      - Core rulebook PDF (via asciidoctor-pdf)
      - Case file instructions PDF (via asciidoctor-pdf)
      - Self-contained HTML files with embedded fonts for:
        - Character sheet (agent dossier)
        - Case file form
        - 5 prebuilt character dossiers

    All output lands in starter-kit/ and is zipped into starter-kit.zip.

.PARAMETER SkipRulebook
    Skip the rulebook PDF build (it's the slowest step).

.EXAMPLE
    .\build.ps1
    .\build.ps1 -SkipRulebook
#>
param(
    [switch]$SkipRulebook
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$StarterKit = Join-Path $RepoRoot 'starter-kit'
$ZipFile = Join-Path $RepoRoot 'starter-kit.zip'

# ── Locate tools ──────────────────────────────────────────────────────────────

$AsciidoctorPdf = (Get-Command asciidoctor-pdf -ErrorAction SilentlyContinue).Source
if (-not $AsciidoctorPdf) {
    Write-Error "asciidoctor-pdf not found. Install via: gem install asciidoctor-pdf"
    exit 1
}

# ── Prepare output folder ────────────────────────────────────────────────────

if (Test-Path $StarterKit) {
    Remove-Item $StarterKit -Recurse -Force
}
New-Item -ItemType Directory -Path $StarterKit | Out-Null

if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}

Write-Host "`n=== Neon Relic Starter Kit Build ===" -ForegroundColor Cyan

# ── Pre-encode fonts as base64 data URIs ──────────────────────────────────────

$ThemesDir = Join-Path $RepoRoot 'docs\themes'
$FontMap = @{}

$specialElite = Join-Path $ThemesDir 'SpecialElite-Regular.ttf'
$courierPrime = Join-Path $ThemesDir 'CourierPrime-Regular.ttf'

$FontMap['SpecialElite'] = "data:font/truetype;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($specialElite)))"
$FontMap['CourierPrime'] = "data:font/truetype;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($courierPrime)))"

# ── Helper: make HTML self-contained by inlining fonts ────────────────────────

function Export-SelfContainedHtml {
    param(
        [string]$SourcePath,
        [string]$DestPath
    )
    $html = Get-Content -Path $SourcePath -Raw -Encoding UTF8
    # Replace all relative font URL references with data URIs
    $html = $html -replace "url\(['""]?[^'""]*?SpecialElite-Regular\.ttf['""]?\)", "url('$($FontMap['SpecialElite'])')"
    $html = $html -replace "url\(['""]?[^'""]*?CourierPrime-Regular\.ttf['""]?\)", "url('$($FontMap['CourierPrime'])')"
    [IO.File]::WriteAllText($DestPath, $html, [Text.UTF8Encoding]::new($false))
}

# ── 1. Core Rulebook ─────────────────────────────────────────────────────────

if ($SkipRulebook) {
    Write-Host "  [SKIP] Core rulebook" -ForegroundColor DarkGray
} else {
    Write-Host "  [1/4] Core rulebook..." -NoNewline
    $rulebookSrc = Join-Path $RepoRoot 'docs\neon-relic.adoc'
    $rulebookPdf = Join-Path $StarterKit 'neon-relic-core-rules.pdf'
    & $AsciidoctorPdf $rulebookSrc -o $rulebookPdf 2>&1 | Out-Null
    if (-not (Test-Path $rulebookPdf)) {
        Write-Error "Failed to generate rulebook PDF"
        exit 1
    }
    Write-Host " done" -ForegroundColor Green
}

# ── 2. Case File Instructions ────────────────────────────────────────────────

Write-Host "  [2/4] Case file instructions..." -NoNewline
$caseInstructionsSrc = Join-Path $RepoRoot 'docs\case-file-instructions.adoc'
$caseInstructionsPdf = Join-Path $StarterKit 'case-file-instructions.pdf'
& $AsciidoctorPdf $caseInstructionsSrc -o $caseInstructionsPdf 2>&1 | Out-Null
if (-not (Test-Path $caseInstructionsPdf)) {
    Write-Error "Failed to generate case file instructions PDF"
    exit 1
}
Write-Host " done" -ForegroundColor Green

# ── 3. Character Sheet & Case File Form ──────────────────────────────────────

Write-Host "  [3/4] Character sheet & case file form..." -NoNewline
Export-SelfContainedHtml `
    -SourcePath (Join-Path $RepoRoot 'assets\character-sheet.html') `
    -DestPath   (Join-Path $StarterKit 'agent-dossier-blank.html')

Export-SelfContainedHtml `
    -SourcePath (Join-Path $RepoRoot 'assets\case-file-form.html') `
    -DestPath   (Join-Path $StarterKit 'case-file-form-blank.html')
Write-Host " done" -ForegroundColor Green

# ── 4. Prebuilt Characters ───────────────────────────────────────────────────

Write-Host "  [4/4] Prebuilt character dossiers..." -NoNewline
$prebuiltDir = Join-Path $RepoRoot 'assets\prebuilt'
$prebuiltFiles = Get-ChildItem -Path $prebuiltDir -Filter '*.html'
foreach ($file in $prebuiltFiles) {
    Export-SelfContainedHtml `
        -SourcePath $file.FullName `
        -DestPath   (Join-Path $StarterKit $file.Name)
}
Write-Host " done" -ForegroundColor Green

# ── Package ───────────────────────────────────────────────────────────────────

Write-Host "`n  Packaging starter-kit.zip..." -NoNewline
Compress-Archive -Path "$StarterKit\*" -DestinationPath $ZipFile -Force
Write-Host " done" -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────

Write-Host "`n=== Build Complete ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path $StarterKit
Write-Host "  $($files.Count) files in starter-kit/"
Write-Host "  $('{0:N1} MB' -f ((Get-Item $ZipFile).Length / 1MB)) starter-kit.zip"
Write-Host ""
