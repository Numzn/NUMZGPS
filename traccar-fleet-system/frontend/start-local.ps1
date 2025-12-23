# Start Frontend in Local Development Mode
# This script starts the frontend locally with hot module replacement (HMR)
# Backend services should be running in Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend in LOCAL Mode" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mode: Local Development (HMR Enabled)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend URLs (should be accessible):" -ForegroundColor Cyan
Write-Host "  - Traccar Server: http://localhost:8082" -ForegroundColor White
Write-Host "  - Fuel API: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will run on: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "Tip: Make sure Docker backend services are running:" -ForegroundColor Yellow
Write-Host "  cd ..\..\backend" -ForegroundColor Gray
Write-Host "  docker-compose up -d traccar-server fuel-api traccar-mysql numztrak-postgres" -ForegroundColor Gray
Write-Host "  docker stop numztrak-frontend" -ForegroundColor Gray
Write-Host ""

# Set environment variable and start
$env:LOCAL_DEV = "true"
npm run start:local

