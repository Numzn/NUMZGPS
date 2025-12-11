# Start Only Backend Services (for local frontend development)
# This starts all backend services but NOT the frontend container

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Services Only" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start:" -ForegroundColor Cyan
Write-Host "  ✅ PostgreSQL (Fuel DB)" -ForegroundColor White
Write-Host "  ✅ MySQL (Traccar DB)" -ForegroundColor White
Write-Host "  ✅ Traccar Server" -ForegroundColor White
Write-Host "  ✅ Fuel API" -ForegroundColor White
Write-Host "  ✅ Nginx (optional)" -ForegroundColor White
Write-Host "  ❌ Frontend (will NOT start - use local dev instead)" -ForegroundColor Yellow
Write-Host ""

# Stop frontend first to avoid conflicts
docker stop numztrak-frontend 2>$null

# Start backend services
docker-compose up -d traccar-mysql numztrak-postgres traccar-server fuel-api numztrak-nginx

Write-Host ""
Write-Host "✅ Backend services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URLs:" -ForegroundColor Cyan
Write-Host "  - Traccar: http://localhost:8082" -ForegroundColor White
Write-Host "  - Fuel API: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Now start frontend locally:" -ForegroundColor Yellow
Write-Host "  cd ..\traccar-fleet-system\frontend" -ForegroundColor Gray
Write-Host "  .\start-local.ps1" -ForegroundColor Gray
Write-Host ""

