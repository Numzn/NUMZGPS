# Start Frontend Docker Container
# Use this when you want to test the full Docker stack

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Docker Container" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker start numztrak-frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend Docker started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access at: http://localhost:3002" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop local dev server and use Docker:" -ForegroundColor Yellow
    Write-Host "  - Press Ctrl+C in your local dev terminal" -ForegroundColor Gray
    Write-Host "  - Then run this script again if needed" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start frontend Docker container" -ForegroundColor Red
    Write-Host "Try: docker-compose up -d numztrak-frontend" -ForegroundColor Yellow
}

