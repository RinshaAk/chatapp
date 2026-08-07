$files = Get-ChildItem -Path "client\src" -Recurse -Include "*.ts","*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $content -replace "(from\s+'\.\.?/[^']*?)\.js(')", '$1$2'
    $updated = $updated -replace '(from\s+"\.\.?/[^"]*?)\.js(")', '$1$2'
    if ($content -ne $updated) {
        Set-Content -Path $file.FullName -Value $updated -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}
Write-Host "Done!"
