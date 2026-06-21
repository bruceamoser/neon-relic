<#
.SYNOPSIS
    Builds the Neon Relic starter kit — generates PDFs and self-contained HTML files,
    then packages everything into starter-kit.zip.

.DESCRIPTION
    Generates:
      - Core rulebook PDF (via asciidoctor-pdf)
      - Case file instructions PDF (via asciidoctor-pdf)
      - Self-contained HTML + PDF files for:
        - 9 blank DA templates (agent dossier, case brief DA,
          case brief player, operations board, organization reference,
          information card, location page, NPC card, relic sheet)
        - 5 prebuilt character dossiers
      - Sample case file (The Spear That Went Dark) with all filled HTML/PDF
        forms and handout images

    All output lands in starter-kit/ and is zipped into starter-kit.zip.

.PARAMETER SkipRulebook
    Skip the rulebook PDF build (it's the slowest step).

.PARAMETER SkipPdfs
    Skip HTML-to-PDF conversion (only generate self-contained HTML).

.EXAMPLE
    .\build.ps1
    .\build.ps1 -SkipRulebook
    .\build.ps1 -SkipPdfs
#>
param(
    [switch]$SkipRulebook,
    [switch]$SkipPdfs
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

# Look for Chrome in standard locations
$ChromePaths = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
)
$Chrome = $null
foreach ($cp in $ChromePaths) {
    if (Test-Path $cp) {
        $Chrome = $cp
        break
    }
}
# Also check PATH
if (-not $Chrome) {
    $Chrome = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
}
if (-not $Chrome) {
    $Chrome = (Get-Command msedge.exe -ErrorAction SilentlyContinue).Source
}

if (-not $SkipPdfs -and -not $Chrome) {
    Write-Warning "Chrome/Edge not found. HTML→PDF conversion will be skipped. Use -SkipPdfs to suppress this warning."
    $SkipPdfs = $true
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
if ($SkipPdfs) {
    Write-Host "  [NOTE] HTML→PDF conversion skipped" -ForegroundColor DarkYellow
}

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

# ── Helper: convert HTML to PDF via Chrome headless ───────────────────────────

function Convert-HtmlToPdf {
    param(
        [string]$SourceHtmlPath,
        [string]$DestPdfPath
    )
    # Read the source HTML and apply the margin fix to prevent phantom second page
    # (matches the sed workaround in build.sh)
    $html = Get-Content -Path $SourceHtmlPath -Raw -Encoding UTF8
    $html = $html -replace 'margin:\s*0\.3in\s+auto', 'margin: 0 auto'

    # Write to a temp file for Chrome to consume
    $tmpHtml = [System.IO.Path]::GetTempFileName() + '.html'
    [IO.File]::WriteAllText($tmpHtml, $html, [Text.UTF8Encoding]::new($false))

    try {
        $tmpPath = [System.IO.Path]::GetTempFileName() + '.pdf'
        # Resolve to absolute file:// URI (Chrome requires forward slashes)
        $fileUri = 'file:///' + ($tmpHtml -replace '\\', '/').TrimStart('/')

        # Chrome writes status to stderr even on success; suppress to avoid
        # PowerShell treating it as an error under $ErrorActionPreference='Stop'
        $prevEAP = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        & $Chrome `
            --headless `
            --disable-gpu `
            --no-sandbox `
            --print-to-pdf="$tmpPath" `
            --print-to-pdf-no-header `
            $fileUri 2>&1 | Out-Null
        $ErrorActionPreference = $prevEAP

        if (Test-Path $tmpPath) {
            Move-Item -Path $tmpPath -Destination $DestPdfPath -Force
            $sizeKB = '{0:N1}' -f ((Get-Item $DestPdfPath).Length / 1KB)
            Write-Host "    PDF: $(Split-Path $DestPdfPath -Leaf) ($sizeKB KB)" -ForegroundColor DarkGray
        }
        else {
            Write-Warning "    PDF generation failed for: $(Split-Path $SourceHtmlPath -Leaf)"
        }
    }
    finally {
        Remove-Item $tmpHtml -Force -ErrorAction SilentlyContinue
        Remove-Item $tmpPath -Force -ErrorAction SilentlyContinue
    }
}

# ── 1. Core Rulebook ─────────────────────────────────────────────────────────

if ($SkipRulebook) {
    Write-Host "  [SKIP] Core rulebook" -ForegroundColor DarkGray
} else {
    Write-Host "  [1/6] Core rulebook..." -NoNewline
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

Write-Host "  [2/6] Case file instructions..." -NoNewline
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

# ── 3. Blank HTML Templates + PDFs ───────────────────────────────────────────

Write-Host "  [3/6] Blank HTML templates + PDFs..." -NoNewline
$blankDir = Join-Path $StarterKit 'blank-templates'
New-Item -ItemType Directory -Path $blankDir | Out-Null

$blankTemplates = @(
    @{ Src = 'assets\character-sheet.html';        Dest = 'agent-dossier.html' }
    @{ Src = 'assets\case-brief-da.html';          Dest = 'case-brief-da.html' }
    @{ Src = 'assets\case-brief-player.html';      Dest = 'case-brief-player.html' }
    @{ Src = 'assets\operations-board.html';       Dest = 'operations-board.html' }
    @{ Src = 'assets\organization-reference.html'; Dest = 'organization-reference.html' }
    @{ Src = 'assets\information-card.html';       Dest = 'information-card.html' }
    @{ Src = 'assets\location-page.html';          Dest = 'location-page.html' }
    @{ Src = 'assets\npc-card.html';               Dest = 'npc-card.html' }
    @{ Src = 'assets\relic-sheet.html';            Dest = 'relic-sheet.html' }
)
foreach ($tmpl in $blankTemplates) {
    $srcFull = Join-Path $RepoRoot $tmpl.Src
    $destHtml = Join-Path $blankDir $tmpl.Dest
    $destPdf = Join-Path $blankDir ($($tmpl.Dest) -replace '\.html$', '.pdf')

    # Self-contained HTML (inline fonts)
    Export-SelfContainedHtml -SourcePath $srcFull -DestPath $destHtml

    # Generate PDF from the self-contained HTML
    if (-not $SkipPdfs) {
        Convert-HtmlToPdf -SourceHtmlPath $destHtml -DestPdfPath $destPdf
    }
}
Write-Host " done" -ForegroundColor Green

# ── 4. Prebuilt Characters ───────────────────────────────────────────────────

Write-Host "  [4/6] Prebuilt character dossiers..." -NoNewline
$prebuiltSrcDir = Join-Path $RepoRoot 'assets\prebuilt'
$prebuiltDestDir = Join-Path $StarterKit 'prebuilt-characters'
New-Item -ItemType Directory -Path $prebuiltDestDir | Out-Null
$prebuiltFiles = Get-ChildItem -Path $prebuiltSrcDir -Filter '*.html'
foreach ($file in $prebuiltFiles) {
    $destHtml = Join-Path $prebuiltDestDir $file.Name
    $destPdf = Join-Path $prebuiltDestDir ($($file.Name) -replace '\.html$', '.pdf')

    Export-SelfContainedHtml -SourcePath $file.FullName -DestPath $destHtml

    if (-not $SkipPdfs) {
        Convert-HtmlToPdf -SourceHtmlPath $destHtml -DestPdfPath $destPdf
    }
}
Write-Host " done" -ForegroundColor Green

# ── 5. Sample Case File ──────────────────────────────────────────────────────

Write-Host "  [5/6] Sample case file (The Spear That Went Dark)..." -NoNewline
$caseDir = Join-Path $RepoRoot 'docs\case-files\spear-that-went-dark'
$caseDestDir = Join-Path $StarterKit 'sample-case-file'
New-Item -ItemType Directory -Path $caseDestDir | Out-Null

# HTML files — inline fonts + generate PDFs
$caseHtmlFiles = Get-ChildItem -Path $caseDir -Filter '*.html'
foreach ($file in $caseHtmlFiles) {
    $destHtml = Join-Path $caseDestDir $file.Name
    $destPdf = Join-Path $caseDestDir ($($file.Name) -replace '\.html$', '.pdf')

    Export-SelfContainedHtml -SourcePath $file.FullName -DestPath $destHtml

    if (-not $SkipPdfs) {
        Convert-HtmlToPdf -SourceHtmlPath $destHtml -DestPdfPath $destPdf
    }
}

# Handout images — copy as-is
$handoutsDir = Join-Path $caseDir 'handouts'
if (Test-Path $handoutsDir) {
    $handoutsDestDir = Join-Path $caseDestDir 'handouts'
    New-Item -ItemType Directory -Path $handoutsDestDir | Out-Null
    Copy-Item -Path (Join-Path $handoutsDir '*.png') -Destination $handoutsDestDir
}

Write-Host " done" -ForegroundColor Green

# ── 6. Package ───────────────────────────────────────────────────────────────────

Write-Host "`n  Packaging starter-kit.zip..." -NoNewline
Compress-Archive -Path "$StarterKit\*" -DestinationPath $ZipFile -Force
Write-Host " done" -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────

Write-Host "`n=== Build Complete ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path $StarterKit -Recurse -File
Write-Host "  $($files.Count) files in starter-kit/"
if (Test-Path $ZipFile) {
    Write-Host "  $('{0:N1} MB' -f ((Get-Item $ZipFile).Length / 1MB)) starter-kit.zip"
}
Write-Host ""
