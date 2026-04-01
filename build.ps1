<#
.SYNOPSIS
    Builds the Neon Relic starter kit — generates PDFs and self-contained HTML files,
    then packages everything into starter-kit.zip.

.DESCRIPTION
    Generates:
      - Core rulebook PDF (via asciidoctor-pdf)
      - Case file instructions PDF (via asciidoctor-pdf)
      - Self-contained HTML files with embedded fonts for:
        - 9 blank DA templates (agent dossier, case file form, case brief,
          operations board, organization reference, information card,
          location page, NPC card, relic sheet)
        - 5 prebuilt character dossiers
      - Sample case file (The Spear That Went Dark) with all filled HTML
        forms and markdown handouts

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
    Write-Host "  [1/5] Core rulebook..." -NoNewline
    $rulebookSrc = Join-Path $RepoRoot 'docs\neon-relic.adoc'
    $rulebookPdf = Join-Path $StarterKit 'neon-relic-core-rules.pdf'
    $ErrorActionPreference = 'Continue'
    & $AsciidoctorPdf $rulebookSrc -o $rulebookPdf 2>&1 | Out-Null
    $ErrorActionPreference = 'Stop'
    if (-not (Test-Path $rulebookPdf)) {
        Write-Error "Failed to generate rulebook PDF"
        exit 1
    }
    Write-Host " done" -ForegroundColor Green
}

# ── 2. Case File Instructions ────────────────────────────────────────────────

Write-Host "  [2/5] Case file instructions..." -NoNewline
$caseInstructionsSrc = Join-Path $RepoRoot 'docs\case-file-instructions.adoc'
$caseInstructionsPdf = Join-Path $StarterKit 'case-file-instructions.pdf'
$ErrorActionPreference = 'Continue'
& $AsciidoctorPdf $caseInstructionsSrc -o $caseInstructionsPdf 2>&1 | Out-Null
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $caseInstructionsPdf)) {
    Write-Error "Failed to generate case file instructions PDF"
    exit 1
}
Write-Host " done" -ForegroundColor Green

# ── 3. Blank HTML Templates ──────────────────────────────────────────────────

Write-Host "  [3/5] Blank HTML templates..." -NoNewline
$blankDir = Join-Path $StarterKit 'blank-templates'
New-Item -ItemType Directory -Path $blankDir | Out-Null

$blankTemplates = @(
    @{ Src = 'assets\character-sheet.html';        Dest = 'agent-dossier.html' }
    @{ Src = 'assets\case-file-form.html';         Dest = 'case-file-form.html' }
    @{ Src = 'assets\case-brief.html';             Dest = 'case-brief.html' }
    @{ Src = 'assets\operations-board.html';       Dest = 'operations-board.html' }
    @{ Src = 'assets\organization-reference.html'; Dest = 'organization-reference.html' }
    @{ Src = 'assets\information-card.html';       Dest = 'information-card.html' }
    @{ Src = 'assets\location-page.html';          Dest = 'location-page.html' }
    @{ Src = 'assets\npc-card.html';               Dest = 'npc-card.html' }
    @{ Src = 'assets\relic-sheet.html';            Dest = 'relic-sheet.html' }
)
foreach ($tmpl in $blankTemplates) {
    Export-SelfContainedHtml `
        -SourcePath (Join-Path $RepoRoot $tmpl.Src) `
        -DestPath   (Join-Path $blankDir $tmpl.Dest)
}
Write-Host " done" -ForegroundColor Green

# ── 4. Prebuilt Characters ───────────────────────────────────────────────────

Write-Host "  [4/5] Prebuilt character dossiers..." -NoNewline
$prebuiltSrcDir = Join-Path $RepoRoot 'assets\prebuilt'
$prebuiltDestDir = Join-Path $StarterKit 'prebuilt-characters'
New-Item -ItemType Directory -Path $prebuiltDestDir | Out-Null
$prebuiltFiles = Get-ChildItem -Path $prebuiltSrcDir -Filter '*.html'
foreach ($file in $prebuiltFiles) {
    Export-SelfContainedHtml `
        -SourcePath $file.FullName `
        -DestPath   (Join-Path $prebuiltDestDir $file.Name)
}
Write-Host " done" -ForegroundColor Green

# ── 5. Sample Case File ──────────────────────────────────────────────────────

Write-Host "  [5/5] Sample case file (The Spear That Went Dark)..." -NoNewline
$caseDir = Join-Path $RepoRoot 'docs\case-files\spear-that-went-dark'
$caseDestDir = Join-Path $StarterKit 'sample-case-file'
New-Item -ItemType Directory -Path $caseDestDir | Out-Null

# HTML files — inline fonts
$caseHtmlFiles = Get-ChildItem -Path $caseDir -Filter '*.html'
foreach ($file in $caseHtmlFiles) {
    Export-SelfContainedHtml `
        -SourcePath $file.FullName `
        -DestPath   (Join-Path $caseDestDir $file.Name)
}

# Markdown handouts — copy as-is
$handoutsDir = Join-Path $caseDir 'handouts'
if (Test-Path $handoutsDir) {
    $handoutsDestDir = Join-Path $caseDestDir 'handouts'
    New-Item -ItemType Directory -Path $handoutsDestDir | Out-Null
    Copy-Item -Path (Join-Path $handoutsDir '*.md') -Destination $handoutsDestDir
}

# README — copy as-is
$caseReadme = Join-Path $caseDir 'README.md'
if (Test-Path $caseReadme) {
    Copy-Item -Path $caseReadme -Destination $caseDestDir
}
Write-Host " done" -ForegroundColor Green

# ── Package ───────────────────────────────────────────────────────────────────

Write-Host "`n  Packaging starter-kit.zip..." -NoNewline
Compress-Archive -Path "$StarterKit\*" -DestinationPath $ZipFile -Force
Write-Host " done" -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────

Write-Host "`n=== Build Complete ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path $StarterKit -Recurse -File
Write-Host "  $($files.Count) files in starter-kit/"
Write-Host "  $('{0:N1} MB' -f ((Get-Item $ZipFile).Length / 1MB)) starter-kit.zip"
Write-Host ""
