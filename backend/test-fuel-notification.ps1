# Test Fuel Request Notification - Create Request and Verify Immediate Notifications
# This script creates a fuel request and monitors for immediate Socket.IO notifications

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fuel Request Notification Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001"
$driverUserId = 1  # Driver user ID
$managerUserId = 1  # Manager user ID (can be same for testing)
$deviceId = 1  # Device ID - Update this with a valid device ID from Traccar

# Try to get a valid device ID from Traccar
try {
    $traccarDevices = Invoke-RestMethod -Uri "http://localhost:8082/api/devices" -Method GET -Headers @{"Authorization"="Basic YWRtaW46YWRtaW4xMjM="} 2>$null
    if ($traccarDevices -and $traccarDevices.Count -gt 0) {
        $deviceId = $traccarDevices[0].id
        Write-Host "Auto-detected Device ID: $deviceId ($($traccarDevices[0].name))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Could not auto-detect device ID, using default: $deviceId" -ForegroundColor Yellow
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  API URL: $baseUrl" -ForegroundColor Gray
Write-Host "  Driver User ID: $driverUserId" -ForegroundColor Gray
Write-Host "  Device ID: $deviceId" -ForegroundColor Gray
Write-Host ""

# Step 1: Check API Health
Write-Host "[1/4] Checking API Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "  [OK] API is healthy" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] API health check failed: $_" -ForegroundColor Red
    Write-Host "  Make sure fuel-api container is running!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Monitor backend logs (in background)
Write-Host "[2/4] Setting up log monitoring..." -ForegroundColor Yellow
Write-Host "  Monitoring Socket.IO events in backend logs..." -ForegroundColor Gray
Write-Host ""

# Step 3: Create Fuel Request
Write-Host "[3/4] Creating fuel request..." -ForegroundColor Yellow

$requestBody = @{
    deviceId = $deviceId
    requestedAmount = 75
    reason = "Test notification - Low fuel warning"
    urgency = "urgent"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-user-id" = $driverUserId.ToString()
}

$timestamp = Get-Date -Format "HH:mm:ss"
Write-Host "  Request sent at: $timestamp" -ForegroundColor Gray

try {
    Write-Host "  Request URL: $baseUrl/api/fuel-requests" -ForegroundColor Gray
    Write-Host "  Headers: x-user-id=$driverUserId" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/fuel-requests" `
        -Method POST `
        -Headers $headers `
        -Body $requestBody `
        -UseBasicParsing `
        -TimeoutSec 10 `
        -ErrorAction Stop

    $fuelRequest = $response.Content | ConvertFrom-Json
    $requestId = $fuelRequest.id
    
    Write-Host "  [OK] Fuel request created successfully!" -ForegroundColor Green
    Write-Host "  Request ID: $requestId" -ForegroundColor White
    Write-Host "  Device ID: $($fuelRequest.deviceId)" -ForegroundColor White
    Write-Host "  Amount: $($fuelRequest.requestedAmount)L" -ForegroundColor White
    Write-Host "  Status: $($fuelRequest.status)" -ForegroundColor White
    Write-Host "  Urgency: $($fuelRequest.urgency)" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "  [FAIL] Failed to create fuel request" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  HTTP Status: $statusCode" -ForegroundColor Yellow
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "  Response: $responseBody" -ForegroundColor Gray
            
            # Try to parse as JSON
            try {
                $errorObj = $responseBody | ConvertFrom-Json
                if ($errorObj.error) {
                    Write-Host "  Error Details: $($errorObj.error)" -ForegroundColor Yellow
                    
                    if ($errorObj.error -like "*Device not found*") {
                        Write-Host ""
                        Write-Host "  SOLUTION: Device ID $deviceId does not exist in Traccar" -ForegroundColor Cyan
                        Write-Host "  Steps to fix:" -ForegroundColor Cyan
                        Write-Host "    1. Login to Traccar: http://localhost:8082" -ForegroundColor Gray
                        Write-Host "    2. Go to Devices and note a valid device ID" -ForegroundColor Gray
                        Write-Host "    3. Update deviceId in this script (currently: $deviceId)" -ForegroundColor Gray
                    }
                }
            } catch {
                # Not JSON, ignore
            }
        } catch {
            Write-Host "  Could not read error response" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "  Checking backend logs..." -ForegroundColor Yellow
    docker logs numztrak-fuel-api --tail 10 2>&1 | Select-String -Pattern "fuel|error|Error" | Select-Object -Last 3
    
    exit 1
}

# Step 4: Check backend logs for Socket.IO events
Write-Host "[4/4] Checking backend logs for Socket.IO events..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2  # Give time for event to be emitted

try {
    $logs = docker logs numztrak-fuel-api --tail 50 2>&1 | Select-String -Pattern "fuel-request-created|Emitting|managers|Socket|WebSocket" -Context 1
    
    if ($logs) {
        Write-Host "  [OK] Found Socket.IO events in logs:" -ForegroundColor Green
        Write-Host ""
        $logs | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "  [WARN] No Socket.IO events found in recent logs" -ForegroundColor Yellow
        Write-Host "  This might mean:" -ForegroundColor Yellow
        Write-Host "    - Socket.IO is not connected" -ForegroundColor Gray
        Write-Host "    - Event was not emitted" -ForegroundColor Gray
        Write-Host "    - Check if managers room has connected clients" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "  [WARN] Could not check logs: $_" -ForegroundColor Yellow
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fuel Request Created:" -ForegroundColor Yellow
Write-Host "  ID: $requestId" -ForegroundColor White
Write-Host "  Created at: $timestamp" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check browser console (F12) for Socket.IO events" -ForegroundColor Gray
Write-Host "  2. Verify notification appears in web dashboard" -ForegroundColor Gray
Write-Host "  3. Check if managers received the notification" -ForegroundColor Gray
Write-Host "  4. View detailed logs: docker logs numztrak-fuel-api --tail 100" -ForegroundColor Gray
Write-Host ""

Write-Host "To view real-time logs:" -ForegroundColor Cyan
Write-Host "  docker logs -f numztrak-fuel-api" -ForegroundColor White
Write-Host ""

Write-Host "To check Socket.IO status:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:3001/api/test-websocket" -ForegroundColor White
Write-Host ""

