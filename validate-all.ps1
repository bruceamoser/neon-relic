<#
.SYNOPSIS
    Master validation script -- runs PDF and HTML validators and produces a comprehensive manifest.

.DESCRIPTION
    Orchestrates validate-pdf.ps1 and validate-html.ps1, combining their results into
    a single per-file manifest at docs/output/full-project-manifest.md.

.PARAMETER SkipPdf
    Only run HTML validation.

.PARAMETER SkipHtml
    Only run PDF validation.

.PARAMETER OutputManifest
    Path for the output manifest file (default: docs/output/full-project-manifest.md).

.EXAMPLE
    .\validate-all.ps1
    Run both validators against the full project and produce the manifest.
#>

param(
    [switch]$SkipPdf,
    [switch]$SkipHtml,
    [string]$OutputManifest = 'docs/output/full-project-manifest.md'
)

$ErrorActionPreference = 'Continue'
$RepoRoot = $PSScriptRoot
$StartTime = Get-Date

Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host '  Neon Relic -- Full Project Validation Suite' -ForegroundColor Cyan
Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host ''

# Ensure output directory exists
$outputDir = Split-Path $OutputManifest -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Helper: shorten path for display
function Get-ShortPath {
    param([string]$FullPath)
    $rel = $FullPath -replace [regex]::Escape($RepoRoot + '\'), ''
    $rel = $rel -replace '\\', '/'
    return $rel
}

# ---------- PHASE 1: PDF Validation ----------
$pdfData = $null
$pdfPassed = 0
$pdfWarned = 0
$pdfFailed = 0

if (-not $SkipPdf) {
    Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow
    Write-Host 'PHASE 1/2: PDF Validation' -ForegroundColor Yellow
    Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow

    $pdfScript = Join-Path $RepoRoot 'validate-pdf.ps1'
    if (-not (Test-Path $pdfScript)) {
        Write-Error 'validate-pdf.ps1 not found'
        exit 1
    }

    $tempPdfReport = Join-Path $env:TEMP ('neon-relic-pdf-report-{0}.md' -f $pid)
    & $pdfScript -All -SummaryOnly -CheckMetadata -OutputReport $tempPdfReport 2>&1 | Out-Null

    $possibleResults = Get-ChildItem -Path $env:TEMP -Filter 'neon-relic-pdf-validate-*-results.json' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($possibleResults) {
        try {
            $pdfData = Get-Content -Path $possibleResults.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
            $pdfPassed = @($pdfData | Where-Object { $_.status -eq 'pass' }).Count
            $pdfWarned = @($pdfData | Where-Object { $_.status -eq 'warn' }).Count
            $pdfFailed = @($pdfData | Where-Object { $_.status -eq 'fail' }).Count
            Write-Host ('PDF validation complete: {0} scanned, {1} passed, {2} warnings, {3} failed' -f $pdfData.Count, $pdfPassed, $pdfWarned, $pdfFailed) -ForegroundColor Green
        } catch {
            Write-Warning ('Could not parse PDF results: {0}' -f $_)
        }
    } else {
        Write-Warning 'PDF results file not found. Running with visible output...'
        & $pdfScript -All -CheckMetadata
    }
    Remove-Item $tempPdfReport -ErrorAction SilentlyContinue
} else {
    Write-Host 'Skipping PDF validation (-SkipPdf)' -ForegroundColor DarkGray
}

# ---------- PHASE 2: HTML Validation ----------
$htmlData = $null
$htmlPassed = 0
$htmlWarned = 0
$htmlFailed = 0

if (-not $SkipHtml) {
    Write-Host ''
    Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow
    Write-Host 'PHASE 2/2: HTML Validation' -ForegroundColor Yellow
    Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow

    $htmlScript = Join-Path $RepoRoot 'validate-html.ps1'
    if (-not (Test-Path $htmlScript)) {
        Write-Error 'validate-html.ps1 not found'
        exit 1
    }

    $tempHtmlReport = Join-Path $env:TEMP ('neon-relic-html-report-{0}.md' -f $pid)
    & $htmlScript -All -SummaryOnly -OutputReport $tempHtmlReport 2>&1 | Out-Null

    $possibleResults = Get-ChildItem -Path $env:TEMP -Filter 'neon-relic-html-validate-*-results.json' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($possibleResults) {
        try {
            $htmlData = Get-Content -Path $possibleResults.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
            $htmlPassed = @($htmlData | Where-Object { $_.status -eq 'pass' }).Count
            $htmlWarned = @($htmlData | Where-Object { $_.status -eq 'warn' }).Count
            $htmlFailed = @($htmlData | Where-Object { $_.status -eq 'fail' }).Count
            Write-Host ('HTML validation complete: {0} scanned, {1} passed, {2} warnings, {3} failed' -f $htmlData.Count, $htmlPassed, $htmlWarned, $htmlFailed) -ForegroundColor Green
        } catch {
            Write-Warning ('Could not parse HTML results: {0}' -f $_)
        }
    } else {
        Write-Warning 'HTML results file not found. Running with visible output...'
        & $htmlScript -All
    }
    Remove-Item $tempHtmlReport -ErrorAction SilentlyContinue
} else {
    Write-Host 'Skipping HTML validation (-SkipHtml)' -ForegroundColor DarkGray
}

# ---------- Generate Manifest ----------
Write-Host ''
Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow
Write-Host 'Generating full project manifest...' -ForegroundColor Yellow
Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow

$now = Get-Date -Format 'yyyy-MM-dd'
$pdfCount = if ($pdfData) { $pdfData.Count } else { 0 }
$htmlCount = if ($htmlData) { $htmlData.Count } else { 0 }

# Build PDF table rows
$pdfRows = ''
$pdfIssueList = ''

if ($pdfData) {
    $idx = 0
    foreach ($p in @($pdfData | Sort-Object { Get-ShortPath $_.file })) {
        $idx++
        $shortPath = Get-ShortPath $p.file

        $structIcon = if ($p.structure_ok) { 'OK' } else { 'FAIL' }
        $fontIcon = if ($p.fonts.tounicode_issues -eq 0) { 'OK' } else { 'WARN' }

        $bodyUtf8Icon = 'OK'
        if ($p.mojibake_count -gt 0) { $bodyUtf8Icon = 'FAIL' }
        elseif ($p.utf8_roundtrip_failures -gt 0) { $bodyUtf8Icon = 'WARN' }

        $metaUtf8Icon = 'OK'
        $mu = $p.meta_utf8
        if ($mu -and (-not $mu.ok)) { $metaUtf8Icon = 'WARN' }
        if (-not $mu -or -not $mu.fields) { $metaUtf8Icon = 'N/A' }

        $statusIcon = switch ($p.status) {
            'pass' { 'PASS' }
            'warn' { 'WARN' }
            'fail' { 'FAIL' }
            default { $p.status }
        }

        $pdfRows += "| {0} | {1} | {2} KB | {3} | {4} | {5} | {6} | {7} | {8} |`n" -f $idx, $shortPath, $p.size_kb, $p.pages, $structIcon, $fontIcon, $bodyUtf8Icon, $metaUtf8Icon, $statusIcon

        if ($p.status -ne 'pass') {
            $pdfIssueList += "- **{0}**: {1}`n" -f $shortPath, $p.issues_summary
            if ($p.mojibake_details) {
                foreach ($md in $p.mojibake_details) {
                    $pdfIssueList += "  - Page {0}: {1} (x{2})`n" -f $md.page, $md.pattern, $md.count
                }
            }
            if ($mu -and (-not $mu.ok)) {
                foreach ($mud in $mu.mojibake_details) {
                    $pdfIssueList += "  - Meta field '{0}': {1} (x{2})`n" -f $mud.field, $mud.pattern, $mud.count
                }
                foreach ($muc in $mu.roundtrip_chars) {
                    $pdfIssueList += "  - Meta field '{0}': char '{1}' ({2})`n" -f $muc.field, $muc.char, $muc.codepoint
                }
            }
            if ($p.metadata_issues) {
                $pdfIssueList += "  - Metadata: {0}`n" -f ($p.metadata_issues -join ', ')
            }
            $pdfIssueList += "`n"
        }
    }
}

# Build HTML table rows
$htmlRows = ''
$htmlIssueList = ''

if ($htmlData) {
    $idx = 0
    foreach ($h in @($htmlData | Sort-Object { Get-ShortPath $_.file })) {
        $idx++
        $shortPath = Get-ShortPath $h.file

        $tagsIcon = if ($h.tags.ok) { 'OK' } else {
            $mismatchCount = @($h.tags.mismatches | Where-Object { $_.tag -ne 'ERROR' }).Count
            "WARN ({0} mismatches)" -f $mismatchCount
        }

        $encIcon = if ($h.encoding.ok) { 'OK' } else {
            if (-not $h.encoding.utf8_valid) { 'FAIL' } else { 'WARN' }
        }

        $structIcon = if ($h.structure.ok) { 'OK' } else { 'WARN' }

        $statusIcon = switch ($h.status) {
            'pass' { 'PASS' }
            'warn' { 'WARN' }
            'fail' { 'FAIL' }
            default { $h.status }
        }

        $htmlRows += "| {0} | {1} | {2} KB | {3} | {4} | {5} | {6} |`n" -f $idx, $shortPath, $h.size_kb, $tagsIcon, $encIcon, $structIcon, $statusIcon

        if ($h.status -ne 'pass') {
            $htmlIssueList += "- **{0}**: {1}`n" -f $shortPath, $h.issues_summary
            if (-not $h.tags.ok) {
                @($h.tags.mismatches | Where-Object { $_.tag -ne 'ERROR' }) | ForEach-Object {
                    $direction = if ($_.diff -gt 0) { 'unclosed' } else { 'extra close' }
                    $htmlIssueList += "  - <{0}>: {1} open, {2} close (diff: {3} -- {4})`n" -f $_.tag, $_.open, $_.close, $_.diff, $direction
                }
            }
            if (-not $h.encoding.ok) {
                if (-not $h.encoding.utf8_valid) { $htmlIssueList += "  - Invalid UTF-8 encoding`n" }
                if ($h.encoding.mojibake_count -gt 0) { $htmlIssueList += "  - {0} mojibake patterns`n" -f $h.encoding.mojibake_count }
                foreach ($ee in $h.encoding.encoding_errors) { $htmlIssueList += "  - {0}`n" -f $ee }
            }
            if (-not $h.structure.ok) {
                foreach ($si in $h.structure.issues) { $htmlIssueList += "  - {0}`n" -f $si }
            }
            $htmlIssueList += "`n"
        }
    }
}

# Assemble manifest (using here-string for the template)
$manifest = @"
# Full Project Manifest -- PDF & HTML Validation

**Scanned:** $now | **PDFs:** $pdfCount | **HTML files:** $htmlCount

---

## PDF Files

| # | File | Size | Pages | Struct | Fonts | Body UTF-8 | Meta UTF-8 | Status |
|---|------|------|-------|--------|-------|------------|------------|--------|
$pdfRows
**PDF Summary:** $pdfPassed passed, $pdfWarned warnings, $pdfFailed failed

---

## HTML Files

| # | File | Size | Tags | UTF-8 | Structure | Status |
|---|------|------|------|-------|-----------|--------|
$htmlRows
**HTML Summary:** $htmlPassed passed, $htmlWarned warnings, $htmlFailed failed

---

## Issues Found

### PDF Issues

$(if ($pdfIssueList) { $pdfIssueList } else { "_None -- all PDFs passed_`n" })

### HTML Issues

$(if ($htmlIssueList) { $htmlIssueList } else { "_None -- all HTML files passed_`n" })

---

## Legend

| Status | Meaning |
|--------|---------|
| PASS | All checks passed |
| WARN | Non-critical issues detected |
| FAIL | Critical issues (structural damage, invalid encoding) |
| N/A | Check not performed / not applicable |

**PDF Columns:**
- **Struct:** PDF header, trailer, xref table integrity
- **Fonts:** Embedded font check + ToUnicode CMap presence
- **Body UTF-8:** Mojibake pattern detection in extracted text
- **Meta UTF-8:** Mojibake/encoding check on metadata fields (title, author, subject, keywords)

**HTML Columns:**
- **Tags:** Opening/closing tag mismatch detection
- **UTF-8:** Encoding validity, mojibake patterns, BOM checks
- **Structure:** DOCTYPE, html, head, body presence

---

*Manifest generated by validate-all.ps1 at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*
"@

# Write manifest
$manifestPath = Join-Path $RepoRoot $OutputManifest
Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8
Write-Host ('Manifest saved to: {0}' -f $OutputManifest) -ForegroundColor Green

# Final summary
$duration = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)
Write-Host ''
Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host '  VALIDATION COMPLETE' -ForegroundColor Cyan
Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host ('  PDFs:  {0,3} passed, {1,3} warnings, {2,3} failed' -f $pdfPassed, $pdfWarned, $pdfFailed) -ForegroundColor White
Write-Host ('  HTML:  {0,3} passed, {1,3} warnings, {2,3} failed' -f $htmlPassed, $htmlWarned, $htmlFailed) -ForegroundColor White
Write-Host ('  Time:  {0,5}s' -f $duration) -ForegroundColor White
Write-Host ('  Report: {0}' -f $OutputManifest) -ForegroundColor White
Write-Host '==============================================================' -ForegroundColor Cyan
