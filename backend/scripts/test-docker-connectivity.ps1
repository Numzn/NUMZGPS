# Docker Network Connectivity Test Script (PowerShell)
# Tests connectivity between Docker containers in the NumzTrak fleet system

Write-Host "🐳 NumzTrak Docker Network Connectivity Test" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if containers are running
Write-Host "📦 Checking container status..." -ForegroundColor Cyan
Write-Host ""

$containers = @("numztrak-frontend", "numztrak-fuel-api", "numztrak-nginx", "numztrak-traccar", "numztrak-mysql", "numztrak-postgres")
$allRunning = $true

foreach ($container in $containers) {
    $containerInfo = docker ps --format '{{.Names}}' | Select-String -Pattern "^${container}$"
    if ($containerInfo) {
        $status = docker inspect --format='{{.State.Status}}' $container 2>$null
        if ($status -eq "running") {
            Write-Host "✅ $container is running" -ForegroundColor Green
        } else {
            Write-Host "❌ $container is not running (status: $status)" -ForegroundColor Red
            $allRunning = $false
        }
    } else {
        Write-Host "❌ $container is not found" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if (-not $allRunning) {
    Write-Host "⚠️  Some containers are not running. Starting containers..." -ForegroundColor Yellow
    Write-Host "Run: docker-compose up -d" -ForegroundColor Yellow
    Write-Host ""
}

# Check Docker network
Write-Host "🌐 Checking Docker network..." -ForegroundColor Cyan
Write-Host ""

$networkExists = docker network ls | Select-String -Pattern "numztrak-network"
if ($networkExists) {
    Write-Host "✅ numztrak-network exists" -ForegroundColor Green
    
    # Get network details
    $networkId = docker network ls --filter name=numztrak-network --format '{{.ID}}'
    Write-Host "   Network ID: $networkId"
    
    # List containers in network
    Write-Host "   Containers in network:"
    $containersInNetwork = docker network inspect numztrak-network --format '{{range .Containers}}{{.Name}} {{end}}' 2>$null
    $containersInNetwork -split ' ' | Where-Object { $_ -ne '' } | ForEach-Object {
        Write-Host "   - $_"
    }
} else {
    Write-Host "❌ numztrak-network does not exist" -ForegroundColor Red
    Write-Host "   Run: docker-compose up -d" -ForegroundColor Yellow
}

Write-Host ""

# Test connectivity from frontend container
Write-Host "🔌 Testing connectivity from frontend container..." -ForegroundColor Cyan
Write-Host ""

$frontendRunning = docker ps --format '{{.Names}}' | Select-String -Pattern "^numztrak-frontend$"
if ($frontendRunning) {
    Write-Host "Testing connection to fuel-api..."
    $pingResult = docker exec numztrak-frontend ping -c 2 fuel-api 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend → Fuel API: Connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend → Fuel API: Connection failed" -ForegroundColor Red
    }
    
    Write-Host "Testing connection to nginx..."
    $pingResult = docker exec numztrak-frontend ping -c 2 numztrak-nginx 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend → Nginx: Connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend → Nginx: Connection failed" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Frontend container is not running" -ForegroundColor Red
}

Write-Host ""

# Test connectivity from nginx container
Write-Host "🔌 Testing connectivity from nginx container..." -ForegroundColor Cyan
Write-Host ""

$nginxRunning = docker ps --format '{{.Names}}' | Select-String -Pattern "^numztrak-nginx$"
if ($nginxRunning) {
    Write-Host "Testing connection to fuel-api..."
    $pingResult = docker exec numztrak-nginx ping -c 2 fuel-api 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nginx → Fuel API: Connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Nginx → Fuel API: Connection failed" -ForegroundColor Red
    }
    
    Write-Host "Testing connection to frontend..."
    $pingResult = docker exec numztrak-nginx ping -c 2 numztrak-frontend 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nginx → Frontend: Connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Nginx → Frontend: Connection failed" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Nginx container is not running" -ForegroundColor Red
}

Write-Host ""

# Test port accessibility
Write-Host "🔌 Testing port accessibility from host..." -ForegroundColor Cyan
Write-Host ""

$ports = @(
    @{Port=80; Service="nginx"},
    @{Port=3001; Service="fuel-api"},
    @{Port=3002; Service="frontend"},
    @{Port=8082; Service="traccar"}
)

foreach ($portInfo in $ports) {
    $port = $portInfo.Port
    $service = $portInfo.Service
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-Host "✅ Port $port ($service): Accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ Port $port ($service): Not accessible" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Port $port ($service): Not accessible" -ForegroundColor Red
    }
}

Write-Host ""

# Test Socket.IO endpoint
Write-Host "🔌 Testing Socket.IO endpoint..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost/socket.io/" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
    if ($statusCode -eq 200 -or $statusCode -eq 400 -or $statusCode -eq 404) {
        Write-Host "✅ Socket.IO endpoint (via nginx): Responding (HTTP $statusCode)" -ForegroundColor Green
        Write-Host "   Note: 400/404 may be normal for Socket.IO handshake" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Socket.IO endpoint: Unexpected response (HTTP $statusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Socket.IO endpoint (via nginx): Not accessible" -ForegroundColor Red
    Write-Host "   Try accessing: http://localhost/socket.io/" -ForegroundColor Yellow
}

Write-Host ""

# Test direct fuel-api access
Write-Host "🔌 Testing direct fuel-api access..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
    if ($statusCode -eq 200) {
        Write-Host "✅ Fuel API direct access: Healthy (HTTP $statusCode)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fuel API direct access: Responding but not healthy (HTTP $statusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Fuel API direct access: Not accessible" -ForegroundColor Red
}

Write-Host ""

# Summary and recommendations
Write-Host "📋 Summary and Recommendations" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Access Method:"
Write-Host "   - Recommended: http://localhost (via nginx on port 80)"
Write-Host "   - Alternative: http://localhost:3002 (direct, uses Vite proxy)"
Write-Host ""

Write-Host "2. If Socket.IO is not working:"
Write-Host "   - Check nginx logs: docker logs numztrak-nginx"
Write-Host "   - Check fuel-api logs: docker logs numztrak-fuel-api"
Write-Host "   - Check frontend logs: docker logs numztrak-frontend"
Write-Host "   - Verify nginx proxy config: backend/nginx.conf"
Write-Host ""

Write-Host "3. If containers can't communicate:"
Write-Host "   - Restart Docker network: docker-compose down && docker-compose up -d"
Write-Host "   - Check network: docker network inspect numztrak-network"
Write-Host ""

Write-Host "4. For WebSocket debugging:"
Write-Host "   - Open browser console and check for Socket.IO connection errors"
Write-Host "   - Look for '🐳 [FuelSocket] Docker Diagnostics' logs"
Write-Host "   - Check if accessing via nginx (recommended) or direct (port 3002)"
Write-Host ""

Write-Host "✅ Test completed!" -ForegroundColor Green

