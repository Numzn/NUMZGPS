# Stop Frontend Docker Container
# Use this before starting local development to avoid port conflicts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping Frontend Docker Container" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker stop numztrak-frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend Docker stopped!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can run frontend locally:" -ForegroundColor Cyan
    Write-Host "  cd ..\traccar-fleet-system\frontend" -ForegroundColor White
    Write-Host "  .\start-local.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use:" -ForegroundColor Cyan
    Write-Host "  npm run start:local" -ForegroundColor White
} else {
    Write-Host "⚠️  Container may not be running (this is okay)" -ForegroundColor Yellow
    Write-Host "You can proceed with local development" -ForegroundColor Green
}

