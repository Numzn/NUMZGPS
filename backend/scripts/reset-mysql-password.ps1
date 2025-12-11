# PowerShell Script to Reset MySQL Password in Docker Container
# This script resets MySQL passwords when you've forgotten them

Write-Host "🔧 MySQL Password Reset Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$containerName = "numztrak-mysql"

# Check if container is running
$containerStatus = docker ps -a --filter "name=$containerName" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "❌ Container $containerName not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Current container status: $containerStatus" -ForegroundColor Yellow
Write-Host ""

# Method 1: Try to access with default root password
Write-Host "Method 1: Trying default root password..." -ForegroundColor Cyan
$testRoot = docker exec $containerName mysql -u root -pNumzTrak2025Root -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Root password works! Resetting traccar user password..." -ForegroundColor Green
    
    docker exec $containerName mysql -u root -pNumzTrak2025Root -e @"
ALTER USER 'traccar'@'%' IDENTIFIED BY 'traccar123';
FLUSH PRIVILEGES;
"@ 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Traccar user password reset successfully!" -ForegroundColor Green
        
        # Test the new password
        docker exec $containerName mysql -u traccar -ptraccar123 -e "SELECT USER(), DATABASE();" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Verified: traccar user can connect with new password" -ForegroundColor Green
            exit 0
        }
    }
} else {
    Write-Host "❌ Default root password doesn't work" -ForegroundColor Red
}

Write-Host ""
Write-Host "Method 2: Using skip-grant-tables approach..." -ForegroundColor Cyan
Write-Host "⚠️  This will temporarily disable authentication" -ForegroundColor Yellow
Write-Host ""

# Stop the container
Write-Host "Stopping MySQL container..." -ForegroundColor Yellow
docker stop $containerName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to stop container" -ForegroundColor Red
    exit 1
}

# Start MySQL with skip-grant-tables
Write-Host "Starting MySQL with skip-grant-tables..." -ForegroundColor Yellow
docker run -d --name mysql-reset-temp `
    --network numztrak-network `
    -v "$PWD/../data/mysql:/var/lib/mysql" `
    -e MYSQL_ROOT_PASSWORD=temp `
    mysql:8.0 `
    --skip-grant-tables `
    --skip-networking

Start-Sleep -Seconds 5

# Connect and reset passwords
Write-Host "Resetting passwords..." -ForegroundColor Yellow
docker exec mysql-reset-temp mysql -u root << 'EOF'
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NumzTrak2025Root';
ALTER USER 'root'@'%' IDENTIFIED BY 'NumzTrak2025Root';
ALTER USER 'traccar'@'%' IDENTIFIED BY 'traccar123';
FLUSH PRIVILEGES;
EOF

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Passwords reset!" -ForegroundColor Green
} else {
    Write-Host "❌ Password reset failed" -ForegroundColor Red
}

# Stop and remove temp container
Write-Host "Cleaning up temporary container..." -ForegroundColor Yellow
docker stop mysql-reset-temp
docker rm mysql-reset-temp

# Restart original container
Write-Host "Restarting original MySQL container..." -ForegroundColor Yellow
docker start $containerName

Start-Sleep -Seconds 5

# Verify
Write-Host ""
Write-Host "Verifying connection..." -ForegroundColor Cyan
docker exec $containerName mysql -u traccar -ptraccar123 -e "SELECT USER(), DATABASE();" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUCCESS: MySQL passwords have been reset!" -ForegroundColor Green
    Write-Host "   Root password: NumzTrak2025Root" -ForegroundColor Green
    Write-Host "   Traccar password: traccar123" -ForegroundColor Green
} else {
    Write-Host "❌ Verification failed. You may need to use Method 3 (complete reset)" -ForegroundColor Red
}

