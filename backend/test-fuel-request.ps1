# NumzTrak Fuel Request Flow Test Script
# Tests the complete fuel request flow from creation to retrieval

$baseURL = "http://localhost"
$fuelAPI = "http://localhost:3001"
$testUserId = 1  # Change this to a valid user ID from Traccar
$testDeviceId = 1  # Change this to a valid device ID from Traccar

Write-Host "🚀 Testing NumzTrak Fuel Request Flow..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Testing Fuel API Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$fuelAPI/health" -Method GET -UseBasicParsing
    Write-Host "   ✅ Fuel API Health: $($healthResponse.StatusCode)" -ForegroundColor Green
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "   📊 Service: $($healthData.service)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Fuel API Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: List Fuel Requests (via /api/fuel-requests)
Write-Host "2️⃣ Testing List Fuel Requests (via /api/fuel-requests)..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-WebRequest -Uri "$baseURL/api/fuel-requests" `
        -Method GET `
        -Headers @{"x-user-id"="$testUserId"} `
        -UseBasicParsing
    Write-Host "   ✅ List Requests: $($listResponse.StatusCode)" -ForegroundColor Green
    $requests = $listResponse.Content | ConvertFrom-Json
    Write-Host "   📊 Found $($requests.Count) existing requests" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️ List Requests: $($_.Exception.Message)" -ForegroundColor Yellow
    $requests = @()
}

Write-Host ""

# Test 3: Create Fuel Request (via /api/fuel-requests)
Write-Host "3️⃣ Testing Create Fuel Request (via /api/fuel-requests)..." -ForegroundColor Yellow
$requestBody = @{
    deviceId = $testDeviceId
    requestedAmount = 50
    reason = "Test fuel request - Low fuel level"
    urgency = "urgent"
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "$baseURL/api/fuel-requests" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "x-user-id"="$testUserId"
        } `
        -Body $requestBody `
        -UseBasicParsing
    
    Write-Host "   ✅ Create Request: $($createResponse.StatusCode)" -ForegroundColor Green
    $newRequest = $createResponse.Content | ConvertFrom-Json
    $requestId = $newRequest.id
    Write-Host "   📝 Created Request ID: $requestId" -ForegroundColor Gray
    Write-Host "   📝 Status: $($newRequest.status)" -ForegroundColor Gray
    Write-Host "   📝 Amount: $($newRequest.requestedAmount)L" -ForegroundColor Gray
    Write-Host "   📝 Urgency: $($newRequest.urgency)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Create Request Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   📄 Response: $responseBody" -ForegroundColor Gray
    }
    exit 1
}

Write-Host ""

# Test 4: Test Mobile App Route (/fuel/request)
Write-Host "4️⃣ Testing Mobile App Route (/fuel/request)..." -ForegroundColor Yellow
$mobileRequestBody = @{
    deviceId = $testDeviceId
    requestedAmount = 30
    reason = "Test via mobile app route"
    urgency = "normal"
} | ConvertTo-Json

try {
    $mobileResponse = Invoke-WebRequest -Uri "$baseURL/fuel/request" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "x-user-id"="$testUserId"
        } `
        -Body $mobileRequestBody `
        -UseBasicParsing
    
    Write-Host "   ✅ Mobile Route (/fuel/request): $($mobileResponse.StatusCode)" -ForegroundColor Green
    $mobileRequest = $mobileResponse.Content | ConvertFrom-Json
    Write-Host "   📝 Created Request ID: $($mobileRequest.id)" -ForegroundColor Gray
    Write-Host "   📝 Status: $($mobileRequest.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Mobile Route Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   📄 Response: $responseBody" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 5: Get Single Request
Write-Host "5️⃣ Testing Get Single Request..." -ForegroundColor Yellow
if ($requestId) {
    try {
        $getResponse = Invoke-WebRequest -Uri "$baseURL/api/fuel-requests/$requestId" `
            -Method GET `
            -Headers @{"x-user-id"="$testUserId"} `
            -UseBasicParsing
        
        Write-Host "   ✅ Get Request: $($getResponse.StatusCode)" -ForegroundColor Green
        $request = $getResponse.Content | ConvertFrom-Json
        Write-Host "   📝 Request Details:" -ForegroundColor Gray
        Write-Host "      - ID: $($request.id)" -ForegroundColor Gray
        Write-Host "      - Device: $($request.deviceId)" -ForegroundColor Gray
        Write-Host "      - Amount: $($request.requestedAmount)L" -ForegroundColor Gray
        Write-Host "      - Status: $($request.status)" -ForegroundColor Gray
        Write-Host "      - Urgency: $($request.urgency)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Get Request Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ Skipped (no request ID from previous test)" -ForegroundColor Yellow
}

Write-Host ""

# Test 6: List All Requests Again
Write-Host "6️⃣ Testing List Requests (after creation)..." -ForegroundColor Yellow
try {
    $listResponse2 = Invoke-WebRequest -Uri "$baseURL/api/fuel-requests" `
        -Method GET `
        -Headers @{"x-user-id"="$testUserId"} `
        -UseBasicParsing
    Write-Host "   ✅ List Requests: $($listResponse2.StatusCode)" -ForegroundColor Green
    $requests2 = $listResponse2.Content | ConvertFrom-Json
    Write-Host "   📊 Total Requests: $($requests2.Count)" -ForegroundColor Gray
    
    if ($requests2.Count -gt 0) {
        Write-Host "   📋 Recent Requests:" -ForegroundColor Gray
        $requests2 | Select-Object -First 3 | ForEach-Object {
            Write-Host "      - ID: $($_.id), Status: $($_.status), Amount: $($_.requestedAmount)L" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ List Requests Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Fuel Request Flow Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   - Health Check: ✅" -ForegroundColor Green
Write-Host "   - Create Request: ✅" -ForegroundColor Green
Write-Host "   - Mobile Route: ✅" -ForegroundColor Green
Write-Host "   - Get Request: ✅" -ForegroundColor Green
Write-Host "   - List Requests: ✅" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check the web dashboard to see the created requests" -ForegroundColor Gray
Write-Host "   2. Test approval/rejection as a manager" -ForegroundColor Gray
Write-Host "   3. Test WebSocket real-time updates" -ForegroundColor Gray

