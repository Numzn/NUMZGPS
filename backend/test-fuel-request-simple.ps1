# Simple Fuel Request Test - Create and Monitor Notifications
Write-Host "Testing Fuel Request Creation and Notifications" -ForegroundColor Cyan
Write-Host ""

# First, you need to set a valid device ID
# Check Traccar dashboard at http://localhost:8082 for available devices
$deviceId = Read-Host "Enter a valid Device ID from Traccar"

if ([string]::IsNullOrWhiteSpace($deviceId)) {
    Write-Host "Device ID is required!" -ForegroundColor Red
    exit 1
}

$apiUrl = "http://localhost:3001/api/fuel-requests"
$userId = 1

$body = @{
    deviceId = [int]$deviceId
    requestedAmount = 60
    reason = "Test notification - Please check immediately"
    urgency = "urgent"
} | ConvertTo-Json

Write-Host "Creating fuel request..." -ForegroundColor Yellow
Write-Host "  Device ID: $deviceId" -ForegroundColor Gray
Write-Host "  Amount: 60L" -ForegroundColor Gray
Write-Host "  Urgency: urgent" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-user-id" = $userId.ToString()
        } `
        -Body $body
    
    Write-Host "[SUCCESS] Fuel request created!" -ForegroundColor Green
    Write-Host "  Request ID: $($response.id)" -ForegroundColor White
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Amount: $($response.requestedAmount)L" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Checking Socket.IO events..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    $logs = docker logs numztrak-fuel-api --tail 30 2>&1 | Select-String -Pattern "fuel-request-created|Emitting|managers" 
    
    if ($logs) {
        Write-Host "[OK] Socket.IO events found in logs:" -ForegroundColor Green
        $logs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "[INFO] Check backend logs manually:" -ForegroundColor Yellow
        Write-Host "  docker logs numztrak-fuel-api --tail 50" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open browser dashboard at http://localhost:3002" -ForegroundColor White
    Write-Host "  2. Open browser console (F12) to see Socket.IO events" -ForegroundColor White
    Write-Host "  3. Check if notification appears in the UI" -ForegroundColor White
    Write-Host "  4. View logs: docker logs -f numztrak-fuel-api" -ForegroundColor White
    
} catch {
    Write-Host "[ERROR] Failed to create fuel request" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  HTTP Status: $statusCode" -ForegroundColor Yellow
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "  Error: $errorBody" -ForegroundColor Gray
        
        if ($errorBody -like "*Device not found*") {
            Write-Host ""
            Write-Host "SOLUTION: The device ID you entered doesn't exist." -ForegroundColor Cyan
            Write-Host "  1. Login to Traccar: http://localhost:8082" -ForegroundColor Gray
            Write-Host "  2. Go to Devices section" -ForegroundColor Gray
            Write-Host "  3. Find a device and note its ID" -ForegroundColor Gray
            Write-Host "  4. Run this script again with the correct device ID" -ForegroundColor Gray
        }
    }
}

