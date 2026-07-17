# swap-svgs.ps1 — Replace inline SVGs with img tags in player-facing HTML files

function Replace-NPC-SVGs {
    param($FilePath, $ImageNames)
    $content = Get-Content $FilePath -Raw
    
    # Update CSS: .photo svg -> .photo img
    $content = $content -replace '\.photo svg \{ border:4px solid #fff; box-shadow:0 1px 3px rgba\(0,0,0,0\.3\); max-width:160px; height:auto; \}',
                                  '.photo img { border:4px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.3); max-width:200px; height:auto; }'
    
    # Replace each <div class="photo"><svg ...></svg></div> in order
    $i = 0
    $pattern = '(?s)<div class="photo">\s*<svg[\s\S]*?</svg>\s*</div>'
    $re = [regex]::new($pattern)
    $content = $re.Replace($content, {
        param($m)
        $img = $ImageNames[$script:i]
        $script:i++
        return '<div class="photo"><img src="images/' + $img + '" style="width:200px;"></div>'
    })
    
    Set-Content $FilePath $content -NoNewline
    Write-Host "  OK: $FilePath ($($ImageNames.Count) imgs)"
}

function Replace-Relic-SVG {
    param($FilePath, $ImageName)
    $content = Get-Content $FilePath -Raw
    
    # Update CSS: .photo svg -> .photo img
    $content = $content -replace '\.photo svg \{ border:4px solid #fff; box-shadow:0 1px 3px rgba\(0,0,0,0\.3\); max-width:360px; \}',
                                  '.photo img { border:4px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.3); max-width:360px; }'
    
    # Replace the single relic SVG
    $pattern = '(?s)<div class="photo">\s*<svg[\s\S]*?</svg>\s*</div>'
    $re = [regex]::new($pattern)
    $content = $re.Replace($content, '<div class="photo"><img src="images/' + $ImageName + '" style="width:300px;"></div>', 1)
    
    Set-Content $FilePath $content -NoNewline
    Write-Host "  OK: $FilePath (1 img)"
}

Write-Host "=== Barbarian's Cup ==="
Replace-NPC-SVGs -FilePath 'docs/case-files/the-barbarians-cup/npc-cards-player.html' -ImageNames @(
    'npc1-rosario.png','npc2-farouk.png','npc3-nasim.png','npc4-park.png',
    'npc5-yoon.png','npc6-monk.png','npc7-guterres.png','npc8-chen.png'
)
Replace-Relic-SVG -FilePath 'docs/case-files/the-barbarians-cup/relic-summary-player.html' -ImageName 'relic-teacup.png'

Write-Host "=== Boudica Pact ==="
Replace-NPC-SVGs -FilePath 'docs/case-files/the-boudica-pact/npc-cards-player.html' -ImageNames @(
    'npc1-townsfolk.png','npc2-price.png','npc3-okonkwo.png','npc4-matteo.png',
    'npc5-rhys.png','npc6-dunn.png','npc7-croft.png','npc8-entity.png'
)
Replace-Relic-SVG -FilePath 'docs/case-files/the-boudica-pact/relic-summary-player.html' -ImageName 'relic-coin.png'

Write-Host "=== Cormsil Compact ==="
Replace-NPC-SVGs -FilePath 'docs/case-files/the-cormsil-compact/npc-cards-player.html' -ImageNames @(
    'npc1-eleanor.png','npc2-dwerryhouse.png','npc3-threlfall.png','npc4-mary.png',
    'npc5-margaret.png','npc6-domere.png','npc7-colne.png','npc8-society.png'
)
Replace-Relic-SVG -FilePath 'docs/case-files/the-cormsil-compact/relic-summary-player.html' -ImageName 'relic-manual.png'

Write-Host "Done."
