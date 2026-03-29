<#
.SYNOPSIS
    Builds the Neon Relic starter kit — generates all PDFs and packages them into starter-kit.zip.

.DESCRIPTION
    Generates PDFs for:
      - Core rulebook (via asciidoctor-pdf)
      - Case file instructions (via asciidoctor-pdf)
      - Character sheet (via Chrome headless)
      - Case file form (via Chrome headless)
      - 5 prebuilt character dossiers (via Chrome headless)

    All PDFs land in starter-kit/ and are zipped into starter-kit.zip.

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

$Chrome = (Get-Command chrome -ErrorAction SilentlyContinue).Source
if (-not $Chrome) {
    $Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $Chrome)) {
    Write-Error "Chrome not found. Install Google Chrome or ensure it is on PATH."
    exit 1
}

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

# ── Helper: HTML to PDF via Chrome headless ───────────────────────────────────

function Convert-HtmlToPdf {
    param(
        [string]$HtmlPath,
        [string]$PdfPath
    )
    $uri = "file:///$($HtmlPath -replace '\\','/')"
    $chromeArgs = @(
        '--headless'
        '--disable-gpu'
        '--no-pdf-header-footer'
        "--print-to-pdf=$PdfPath"
        $uri
    )
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & $Chrome @chromeArgs 2>&1 | Out-Null
    $ErrorActionPreference = $prev
    if (-not (Test-Path $PdfPath)) {
        Write-Error "Failed to generate: $PdfPath"
        exit 1
    }
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
Convert-HtmlToPdf `
    -HtmlPath (Join-Path $RepoRoot 'assets\character-sheet.html') `
    -PdfPath  (Join-Path $StarterKit 'agent-dossier-blank.pdf')

Convert-HtmlToPdf `
    -HtmlPath (Join-Path $RepoRoot 'assets\case-file-form.html') `
    -PdfPath  (Join-Path $StarterKit 'case-file-form-blank.pdf')
Write-Host " done" -ForegroundColor Green

# ── 4. Prebuilt Characters ───────────────────────────────────────────────────

Write-Host "  [4/4] Prebuilt character dossiers..." -NoNewline
$prebuiltDir = Join-Path $RepoRoot 'assets\prebuilt'
$prebuiltFiles = Get-ChildItem -Path $prebuiltDir -Filter '*.html'
foreach ($file in $prebuiltFiles) {
    $pdfName = $file.BaseName + '.pdf'
    Convert-HtmlToPdf `
        -HtmlPath $file.FullName `
        -PdfPath  (Join-Path $StarterKit $pdfName)
}
Write-Host " done" -ForegroundColor Green

# ── Package ───────────────────────────────────────────────────────────────────

Write-Host "`n  Packaging starter-kit.zip..." -NoNewline
Compress-Archive -Path "$StarterKit\*" -DestinationPath $ZipFile -Force
Write-Host " done" -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────

Write-Host "`n=== Build Complete ===" -ForegroundColor Cyan
$pdfs = Get-ChildItem -Path $StarterKit -Filter '*.pdf'
Write-Host "  $($pdfs.Count) PDFs in starter-kit/"
Write-Host "  $('{0:N1} MB' -f ((Get-Item $ZipFile).Length / 1MB)) starter-kit.zip"
Write-Host ""
