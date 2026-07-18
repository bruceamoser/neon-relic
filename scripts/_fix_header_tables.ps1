# Fix [%header,cols="..."] → [cols="...", options="header"] in all chapter .adoc files
$chapterDir = "docs/chapters"
$pattern = '\[%header,cols="([^"]+)"\]'
$replacement = '[cols="$1", options="header"]'

$files = Get-ChildItem -Path "$chapterDir/*.adoc"
$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match $pattern) {
        $newContent = $content -replace $pattern, $replacement
        Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
        $count = ([regex]::Matches($content, $pattern)).Count
        Write-Host "Fixed $count occurrences in: $($file.Name)"
        $fixedCount += $count
    }
}

Write-Host "`nTotal occurrences fixed: $fixedCount"
