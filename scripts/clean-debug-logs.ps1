# Script de nettoyage des console.log de debug
# À exécuter avant le déploiement final (optionnel)

Write-Host "🧹 Nettoyage des console.log de debug..." -ForegroundColor Cyan

# Liste des fichiers à nettoyer
$files = @(
    "src/app/(app)/alerts/page.tsx",
    "src/app/(app)/messages/page.tsx",
    "src/app/(app)/market/page.tsx",
    "src/app/api/user/profile/route.ts",
    "src/app/api/ai/press-review/route.ts"
)

$totalRemoved = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot ".." $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $originalLength = $content.Length
        
        # Supprimer les lignes console.log (mais garder console.error et console.warn)
        $newContent = $content -replace "^\s*console\.log\([^)]*\);\s*$", "" -replace "`r`n`r`n`r`n", "`r`n`r`n"
        
        if ($newContent.Length -ne $originalLength) {
            Set-Content $fullPath $newContent -NoNewline
            $totalRemoved++
            Write-Host "  ✅ Nettoyé: $file" -ForegroundColor Green
        } else {
            Write-Host "  ⏭️  Aucun log: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  Non trouvé: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Nettoyage terminé! $totalRemoved fichier(s) modifié(s)" -ForegroundColor Cyan
Write-Host "💡 N'oubliez pas de commit les changements!" -ForegroundColor Yellow
