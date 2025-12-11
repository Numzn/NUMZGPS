# Test script to check fuel requests
Write-Host "Checking fuel requests in database..." -ForegroundColor Cyan

$query = 'SELECT id, "deviceId", "userId", "requestedAmount", status FROM fuel_requests ORDER BY "requestTime" DESC LIMIT 5;'
docker exec numztrak-postgres psql -U numztrak -d numztrak_fuel -c $query

Write-Host "`nChecking users..." -ForegroundColor Cyan
docker exec numztrak-mysql mysql -u traccar -ptraccar123 traccar -e "SELECT id, name, email, administrator FROM tc_users WHERE email IN ('numerinyirenda14@gmail.com', 'hellenmwamba66@gmail.com');"

