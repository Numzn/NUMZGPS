# NumzTrak Fleet Management System - Startup Script
# PowerShell script for Windows development environment

Write-Host "🚀 Starting NumzTrak Fleet Management System..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Clean up any existing containers
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down 2>$null

# Start services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "📊 Checking service status..." -ForegroundColor Cyan

$services = @(
    @{Name="MySQL"; Container="numztrak-mysql"; Port="3306"},
    @{Name="PostgreSQL"; Container="numztrak-postgres"; Port="5432"},
    @{Name="Traccar Server"; Container="numztrak-traccar"; Port="8082"},
    @{Name="Fuel API"; Container="numztrak-fuel-api"; Port="3001"},
    @{Name="Frontend"; Container="numztrak-frontend"; Port="3002"},
    @{Name="Nginx Gateway"; Container="numztrak-nginx"; Port="80"}
)

foreach ($service in $services) {
    $container = docker ps --filter "name=$($service.Container)" --format "{{.Status}}"
    if ($container -like "*Up*") {
        Write-Host "✅ $($service.Name): Running" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name): Not running" -ForegroundColor Red
    }
}

# Display access URLs
Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Web Dashboard: http://localhost:3002" -ForegroundColor White
Write-Host "   Traccar Server: http://localhost:8082" -ForegroundColor White
Write-Host "   Fuel API: http://localhost:3001" -ForegroundColor White
Write-Host "   Nginx Gateway: http://localhost" -ForegroundColor White

# Display mobile app configuration
Write-Host "`n📱 Mobile App Configuration:" -ForegroundColor Cyan
Write-Host "   Server IP: 10.152.184.242" -ForegroundColor White
Write-Host "   API Base: http://10.152.184.242/api" -ForegroundColor White
Write-Host "   WebSocket: ws://10.152.184.242/api/socket" -ForegroundColor White
Write-Host "   GPS Port: 5055 (OsmAnd protocol)" -ForegroundColor White

# Display network information
Write-Host "`n🔧 Network Information:" -ForegroundColor Cyan
$hostIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.*" -or $_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
if ($hostIP) {
    Write-Host "   Detected IP: $hostIP" -ForegroundColor White
} else {
    Write-Host "   IP Detection: Manual configuration required" -ForegroundColor Yellow
}

Write-Host "`n✅ NumzTrak system started successfully!" -ForegroundColor Green
Write-Host "   Check the logs with: docker-compose logs -f" -ForegroundColor Gray
Write-Host "   Stop services with: docker-compose down" -ForegroundColor Gray
