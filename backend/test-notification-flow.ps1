# Test Notification Flow - Verify Socket.IO Events
# This script tests the full flow from request creation to notification

Write-Host "🧪 Testing Notification Flow..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001"
$userId = 1  # Manager user ID

# Step 1: Check Socket.IO connection status
Write-Host "📡 Step 1: Checking Socket.IO connection status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/test-websocket" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Socket.IO Status:" -ForegroundColor Green
    Write-Host "   Connected Sockets: $($data.socketCount)" -ForegroundColor White
    Write-Host "   Managers Room Size: $($data.managersRoomSize)" -ForegroundColor White
    Write-Host "   Driver Rooms: $($data.driverRooms | ConvertTo-Json -Compress)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Failed to check Socket.IO status: $_" -ForegroundColor Red
    Write-Host ""
}

# Step 2: Create a test fuel request
Write-Host "📝 Step 2: Creating test fuel request..." -ForegroundColor Yellow
try {
    $requestBody = @{
        deviceId = 2
        requestedAmount = 50
        reason = "Test notification flow"
        urgency = "normal"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "x-user-id" = "1"  # Driver user ID
    }

    $response = Invoke-WebRequest -Uri "$baseUrl/api/fuel-requests" `
        -Method POST `
        -Headers $headers `
        -Body $requestBody `
        -UseBasicParsing

    $fuelRequest = $response.Content | ConvertFrom-Json
    $requestId = $fuelRequest.id
    
    Write-Host "✅ Fuel request created:" -ForegroundColor Green
    Write-Host "   ID: $requestId" -ForegroundColor White
    Write-Host "   Device: $($fuelRequest.deviceId)" -ForegroundColor White
    Write-Host "   Amount: $($fuelRequest.requestedAmount)L" -ForegroundColor White
    Write-Host "   Status: $($fuelRequest.status)" -ForegroundColor White
    Write-Host ""
    
    # Step 3: Check backend logs for event emission
    Write-Host "📡 Step 3: Check backend logs for event emission..." -ForegroundColor Yellow
    Write-Host "   Run: docker logs numztrak-fuel-api --tail=50 | Select-String -Pattern 'Emitting|fuel-request-created|managers'" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 4: Approve the request to test update events
    Write-Host "✅ Step 4: Approving fuel request to test update events..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    $approveBody = @{
        approvedAmount = 50
        notes = "Test approval for notification flow"
    } | ConvertTo-Json

    $approveHeaders = @{
        "Content-Type" = "application/json"
        "x-user-id" = $userId.ToString()  # Manager user ID
    }

    $approveResponse = Invoke-WebRequest -Uri "$baseUrl/api/fuel-requests/$requestId/approve" `
        -Method PUT `
        -Headers $approveHeaders `
        -Body $approveBody `
        -UseBasicParsing

    $approvedRequest = $approveResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Fuel request approved:" -ForegroundColor Green
    Write-Host "   ID: $($approvedRequest.id)" -ForegroundColor White
    Write-Host "   Status: $($approvedRequest.status)" -ForegroundColor White
    Write-Host "   Approved Amount: $($approvedRequest.approvedAmount)L" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📡 Step 5: Check backend logs for update event emission..." -ForegroundColor Yellow
    Write-Host "   Run: docker logs numztrak-fuel-api --tail=50 | Select-String -Pattern 'fuel-request-updated|Emitting'" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check browser console for Socket.IO events" -ForegroundColor White
Write-Host "2. Check backend logs for event emission" -ForegroundColor White
Write-Host "3. Verify popup notifications appear in browser" -ForegroundColor White
Write-Host ""

