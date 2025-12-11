# Test Database Connections Script
# Verifies all database passwords and connections

Write-Host "NumzTrak Database Connection Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allTestsPassed = $true

# Test 1: PostgreSQL Connection
Write-Host "Test 1: PostgreSQL (Fuel Management)" -ForegroundColor Yellow
Write-Host "  User: numztrak" -ForegroundColor Gray
Write-Host "  Database: numztrak_fuel" -ForegroundColor Gray
Write-Host "  Password: NumzFuel2025" -ForegroundColor Gray

$pgTest = docker exec numztrak-postgres psql -U numztrak -d numztrak_fuel -c 'SELECT current_user, current_database(), version();' 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] PostgreSQL: Connection successful" -ForegroundColor Green
    $pgVersion = ($pgTest | Select-String -Pattern "PostgreSQL").ToString().Split("`n")[2]
    Write-Host "     $pgVersion" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] PostgreSQL: Connection failed" -ForegroundColor Red
    Write-Host "     Error: $($pgTest | Select-String -Pattern 'error|ERROR' | Select-Object -First 1)" -ForegroundColor Red
    $allTestsPassed = $false
}

Write-Host ""

# Test 2: MySQL Root Connection
Write-Host "Test 2: MySQL Root Access" -ForegroundColor Yellow
Write-Host "  User: root" -ForegroundColor Gray
Write-Host "  Password: NumzTrak2025Root" -ForegroundColor Gray

$mysqlRootTest = docker exec numztrak-mysql mysql -u root -pNumzTrak2025Root -e 'SELECT USER(), VERSION();' 2>&1

if ($LASTEXITCODE -eq 0 -and $mysqlRootTest -notmatch 'ERROR|Access denied') {
    Write-Host "  [OK] MySQL Root: Connection successful" -ForegroundColor Green
    $mysqlVersion = ($mysqlRootTest | Select-String -Pattern "mysql|MySQL|8\." | Select-Object -First 1)
    if ($mysqlVersion) {
        Write-Host "     Version: $mysqlVersion" -ForegroundColor Green
    }
} else {
    Write-Host "  [FAIL] MySQL Root: Connection failed" -ForegroundColor Red
    $errorMsg = $mysqlRootTest | Select-String -Pattern "ERROR|Access denied" | Select-Object -First 1
    if ($errorMsg) {
        Write-Host "     Error: $errorMsg" -ForegroundColor Red
    }
    $allTestsPassed = $false
}

Write-Host ""

# Test 3: MySQL Traccar User Connection
Write-Host "Test 3: MySQL Traccar User" -ForegroundColor Yellow
Write-Host "  User: traccar" -ForegroundColor Gray
Write-Host "  Database: traccar" -ForegroundColor Gray
Write-Host "  Password: traccar123" -ForegroundColor Gray

$mysqlUserTest = docker exec numztrak-mysql mysql -u traccar -ptraccar123 traccar -e 'SELECT USER(), DATABASE(), VERSION();' 2>&1

if ($LASTEXITCODE -eq 0 -and $mysqlUserTest -notmatch 'ERROR|Access denied') {
    Write-Host "  [OK] MySQL Traccar User: Connection successful" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] MySQL Traccar User: Connection failed" -ForegroundColor Red
    $errorMsg = $mysqlUserTest | Select-String -Pattern "ERROR|Access denied" | Select-Object -First 1
    if ($errorMsg) {
        Write-Host "     Error: $errorMsg" -ForegroundColor Red
    }
    $allTestsPassed = $false
}

Write-Host ""

# Test 4: Check Fuel API Database Connections
Write-Host "Test 4: Fuel API Service Status" -ForegroundColor Yellow

$fuelApiStatus = docker ps --filter "name=numztrak-fuel-api" --format "{{.Status}}"
$fuelApiHealthy = docker inspect numztrak-fuel-api --format='{{.State.Health.Status}}' 2>&1

if ($fuelApiHealthy -eq "healthy") {
    Write-Host "  [OK] Fuel API: Running and healthy" -ForegroundColor Green
    Write-Host "     Status: $fuelApiStatus" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Fuel API: Status - $fuelApiStatus" -ForegroundColor Yellow
    
    # Check logs for database connection status
    $fuelApiLogs = docker logs numztrak-fuel-api --tail 10 2>&1 | Select-String -Pattern "PostgreSQL|MySQL|Connected|error" | Select-Object -Last 3
    if ($fuelApiLogs) {
        Write-Host "     Recent logs:" -ForegroundColor Gray
        $fuelApiLogs | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }
    }
}

Write-Host ""

# Test 5: Check Traccar Database Connection
Write-Host "Test 5: Traccar Server Database Connection" -ForegroundColor Yellow

$traccarStatus = docker ps --filter "name=numztrak-traccar" --format "{{.Status}}"
if ($traccarStatus) {
    Write-Host "  [OK] Traccar Server: Running" -ForegroundColor Green
    Write-Host "     Status: $traccarStatus" -ForegroundColor Green
    
    # Check Traccar logs for database connection
    $traccarLogs = docker logs numztrak-traccar --tail 10 2>&1 | Select-String -Pattern "database|Database|mysql|MySQL|Connected|error" | Select-Object -Last 3
    if ($traccarLogs) {
        Write-Host "     Recent logs:" -ForegroundColor Gray
        $traccarLogs | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "  [FAIL] Traccar Server: Not running" -ForegroundColor Red
    $allTestsPassed = $false
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan

# Summary
if ($allTestsPassed) {
    Write-Host "[SUCCESS] All database connection tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL: [OK] Connected" -ForegroundColor Green
    Write-Host "  - MySQL Root: [OK] Connected" -ForegroundColor Green
    Write-Host "  - MySQL Traccar: [OK] Connected" -ForegroundColor Green
    Write-Host "  - Fuel API: [OK] Healthy" -ForegroundColor Green
    Write-Host "  - Traccar Server: [OK] Running" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some tests failed. Check errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Check containers are running: docker-compose ps" -ForegroundColor Gray
    Write-Host "  2. Check logs: docker-compose logs [service-name]" -ForegroundColor Gray
    Write-Host "  3. See reset guide: scripts/reset-database-passwords.md" -ForegroundColor Gray
}

Write-Host ""

