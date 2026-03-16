#!/usr/bin/env pwsh
# ============================================================
# Neon Relic — Typst Build Script
# ============================================================
# Usage:
#   ./build.ps1            # compile PDF
#   ./build.ps1 --watch    # live-preview (recompiles on save)
#   ./build.ps1 --clean    # delete output directory
# ============================================================

param(
  [switch]$Watch,
  [switch]$Clean
)

$Root    = $PSScriptRoot
$Source  = Join-Path $Root "docs-typst\neon-relic.typ"
$OutDir  = Join-Path $Root "docs-typst\output"
$OutFile = Join-Path $OutDir "neon-relic.pdf"

# ── Ensure output directory exists ──────────────────────────
if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

# ── Clean mode ──────────────────────────────────────────────
if ($Clean) {
  Write-Host "Cleaning output directory..."
  Remove-Item -Path "$OutDir\*" -Recurse -Force
  Write-Host "Done."
  exit 0
}

# ── Verify Typst is available ───────────────────────────────
if (-not (Get-Command typst -ErrorAction SilentlyContinue)) {
  Write-Error "Typst CLI not found. Install with: winget install Typst.Typst"
  exit 1
}

# ── Compile or watch ────────────────────────────────────────
if ($Watch) {
  Write-Host "Starting Typst watch mode..."
  Write-Host "  Source : $Source"
  Write-Host "  Output : $OutFile"
  Write-Host "  Press Ctrl+C to stop."
  typst watch $Source $OutFile --root $Root
} else {
  Write-Host "Compiling Neon Relic PDF..."
  Write-Host "  Source : $Source"
  Write-Host "  Output : $OutFile"
  typst compile $Source $OutFile --root $Root
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Build succeeded: $OutFile"
  } else {
    Write-Error "Build failed. Check Typst output above."
    exit 1
  }
}
