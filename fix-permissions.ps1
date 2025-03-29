$files = Get-ChildItem -Path "a:\Code Projekte\yurna.info\apps\dashboard" -Recurse -Include "*.tsx", "*.ts" | 
  Where-Object { (Get-Content $_.FullName -Raw) -match "!serverMember\.permissions_names\.includes\(.(ManageGuild|Administrator).\) \|\| !serverMember\.permissions_names\.includes\(.(Administrator|ManageGuild).\)" }

$totalFiles = $files.Count
$processedFiles = 0

Write-Host "Gefundene Dateien mit falscher Berechtigungsprüfung: $totalFiles"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Ersetze die falsche Berechtigungsprüfung mit der korrekten
    $newContent = $content -replace "(!serverMember\.permissions_names\.includes\(.(ManageGuild|Administrator).\)) \|\| (!serverMember\.permissions_names\.includes\(.(Administrator|ManageGuild).\))", '($1 && $3)'
    
    # Erweiterte Muster für API-Routen
    $newContent = $newContent -replace "(!serverMember\s+\|\|\s+!serverMember\.permissions_names\s+\|\|\s+!serverMember\.permissions_names\.includes\(.(ManageGuild|Administrator).\)) \|\| (!serverMember\.permissions_names\.includes\(.(Administrator|ManageGuild).\))", '$1 && $3'
    
    Set-Content -Path $file.FullName -Value $newContent
    
    $processedFiles++
    Write-Host "[$processedFiles/$totalFiles] Korrigiert: $($file.FullName)"
}

Write-Host "Alle Berechtigungsprüfungen wurden korrigiert."
