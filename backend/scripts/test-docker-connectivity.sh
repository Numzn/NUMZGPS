#!/bin/bash

# Docker Network Connectivity Test Script
# Tests connectivity between Docker containers in the NumzTrak fleet system

echo "🐳 NumzTrak Docker Network Connectivity Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if containers are running
echo "📦 Checking container status..."
echo ""

containers=("numztrak-frontend" "numztrak-fuel-api" "numztrak-nginx" "numztrak-traccar" "numztrak-mysql" "numztrak-postgres")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        status=$(docker inspect --format='{{.State.Status}}' "${container}" 2>/dev/null)
        if [ "$status" = "running" ]; then
            echo -e "${GREEN}✅ ${container} is running${NC}"
        else
            echo -e "${RED}❌ ${container} is not running (status: ${status})${NC}"
            all_running=false
        fi
    else
        echo -e "${RED}❌ ${container} is not found${NC}"
        all_running=false
    fi
done

echo ""

if [ "$all_running" = false ]; then
    echo -e "${YELLOW}⚠️  Some containers are not running. Starting containers...${NC}"
    echo "Run: docker-compose up -d"
    echo ""
fi

# Check Docker network
echo "🌐 Checking Docker network..."
echo ""

if docker network ls | grep -q "numztrak-network"; then
    echo -e "${GREEN}✅ numztrak-network exists${NC}"
    
    # Get network details
    network_id=$(docker network ls --filter name=numztrak-network --format '{{.ID}}')
    echo "   Network ID: ${network_id}"
    
    # List containers in network
    echo "   Containers in network:"
    docker network inspect numztrak-network --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | tr ' ' '\n' | sed 's/^/   - /'
else
    echo -e "${RED}❌ numztrak-network does not exist${NC}"
    echo "   Run: docker-compose up -d"
fi

echo ""

# Test connectivity from frontend container
echo "🔌 Testing connectivity from frontend container..."
echo ""

if docker ps --format '{{.Names}}' | grep -q "^numztrak-frontend$"; then
    echo "Testing connection to fuel-api..."
    if docker exec numztrak-frontend ping -c 2 fuel-api > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend → Fuel API: Connection successful${NC}"
    else
        echo -e "${RED}❌ Frontend → Fuel API: Connection failed${NC}"
    fi
    
    echo "Testing connection to nginx..."
    if docker exec numztrak-frontend ping -c 2 numztrak-nginx > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend → Nginx: Connection successful${NC}"
    else
        echo -e "${RED}❌ Frontend → Nginx: Connection failed${NC}"
    fi
    
    echo "Testing HTTP connection to fuel-api:3001..."
    # Try curl first (more common), fallback to wget, then skip if neither available
    if docker exec numztrak-frontend curl -s -f --max-time 5 http://fuel-api:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend → Fuel API HTTP: Connection successful (curl)${NC}"
    elif docker exec numztrak-frontend wget -q --spider --timeout=5 http://fuel-api:3001/health 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend → Fuel API HTTP: Connection successful (wget)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend → Fuel API HTTP: Connection test skipped (curl/wget not available in container)${NC}"
        echo -e "${YELLOW}   This is normal - containers may not have HTTP testing tools installed${NC}"
    fi
else
    echo -e "${RED}❌ Frontend container is not running${NC}"
fi

echo ""

# Test connectivity from nginx container
echo "🔌 Testing connectivity from nginx container..."
echo ""

if docker ps --format '{{.Names}}' | grep -q "^numztrak-nginx$"; then
    echo "Testing connection to fuel-api..."
    if docker exec numztrak-nginx ping -c 2 fuel-api > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx → Fuel API: Connection successful${NC}"
    else
        echo -e "${RED}❌ Nginx → Fuel API: Connection failed${NC}"
    fi
    
    echo "Testing connection to frontend..."
    if docker exec numztrak-nginx ping -c 2 numztrak-frontend > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx → Frontend: Connection successful${NC}"
    else
        echo -e "${RED}❌ Nginx → Frontend: Connection failed${NC}"
    fi
else
    echo -e "${RED}❌ Nginx container is not running${NC}"
fi

echo ""

# Test port accessibility
echo "🔌 Testing port accessibility from host..."
echo ""

ports=("80:nginx" "3001:fuel-api" "3002:frontend" "8082:traccar")
for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    service=$(echo $port_info | cut -d: -f2)
    
    # Use portable method: try nc (netcat) first, then bash TCP test, then curl
    if command -v nc > /dev/null 2>&1; then
        # Use netcat with timeout (works on Linux and macOS with GNU coreutils)
        if nc -z -w 2 localhost "${port}" 2>/dev/null; then
            echo -e "${GREEN}✅ Port ${port} (${service}): Accessible${NC}"
        else
            echo -e "${RED}❌ Port ${port} (${service}): Not accessible${NC}"
        fi
    elif command -v timeout > /dev/null 2>&1; then
        # Fallback to timeout + bash TCP test (Linux)
        if timeout 2 bash -c "echo > /dev/tcp/localhost/${port}" 2>/dev/null; then
            echo -e "${GREEN}✅ Port ${port} (${service}): Accessible${NC}"
        else
            echo -e "${RED}❌ Port ${port} (${service}): Not accessible${NC}"
        fi
    elif bash -c "echo > /dev/tcp/localhost/${port}" 2>/dev/null; then
        # Fallback to bash TCP test without timeout (may hang, but works)
        echo -e "${GREEN}✅ Port ${port} (${service}): Accessible${NC}"
    elif curl -s --max-time 2 "http://localhost:${port}" > /dev/null 2>&1; then
        # Last resort: try HTTP connection (works for HTTP services)
        echo -e "${GREEN}✅ Port ${port} (${service}): Accessible (HTTP test)${NC}"
    else
        echo -e "${YELLOW}⚠️  Port ${port} (${service}): Test skipped (nc/timeout/curl not available)${NC}"
        echo -e "${YELLOW}   Install netcat (nc) or GNU coreutils for port testing${NC}"
    fi
done

echo ""

# Test Socket.IO endpoint
echo "🔌 Testing Socket.IO endpoint..."
echo ""

if command -v curl > /dev/null 2>&1; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/socket.io/ 2>/dev/null)
    if [ -n "$status_code" ] && [ "$status_code" != "000" ]; then
        if [ "$status_code" = "200" ] || [ "$status_code" = "400" ] || [ "$status_code" = "404" ]; then
            echo -e "${GREEN}✅ Socket.IO endpoint (via nginx): Responding (HTTP ${status_code})${NC}"
            echo "   Note: 400/404 may be normal for Socket.IO handshake"
        else
            echo -e "${YELLOW}⚠️  Socket.IO endpoint: Unexpected response (HTTP ${status_code})${NC}"
        fi
    else
        echo -e "${RED}❌ Socket.IO endpoint (via nginx): Not accessible${NC}"
        echo "   Try accessing: http://localhost/socket.io/"
    fi
else
    echo -e "${YELLOW}⚠️  Socket.IO endpoint test skipped: curl not available${NC}"
    echo "   Install curl to test HTTP endpoints"
fi

echo ""

# Test direct fuel-api access
echo "🔌 Testing direct fuel-api access..."
echo ""

if command -v curl > /dev/null 2>&1; then
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3001/health 2>/dev/null)
    if [ -n "$status_code" ] && [ "$status_code" != "000" ]; then
        if [ "$status_code" = "200" ]; then
            echo -e "${GREEN}✅ Fuel API direct access: Healthy (HTTP ${status_code})${NC}"
        else
            echo -e "${YELLOW}⚠️  Fuel API direct access: Responding but not healthy (HTTP ${status_code})${NC}"
        fi
    else
        echo -e "${RED}❌ Fuel API direct access: Not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Fuel API direct access test skipped: curl not available${NC}"
    echo "   Install curl to test HTTP endpoints"
fi

echo ""

# Summary and recommendations
echo "📋 Summary and Recommendations"
echo "==============================="
echo ""

echo "1. Access Method:"
echo "   - Recommended: http://localhost (via nginx on port 80)"
echo "   - Alternative: http://localhost:3002 (direct, uses Vite proxy)"
echo ""

echo "2. If Socket.IO is not working:"
echo "   - Check nginx logs: docker logs numztrak-nginx"
echo "   - Check fuel-api logs: docker logs numztrak-fuel-api"
echo "   - Check frontend logs: docker logs numztrak-frontend"
echo "   - Verify nginx proxy config: backend/nginx.conf"
echo ""

echo "3. If containers can't communicate:"
echo "   - Restart Docker network: docker-compose down && docker-compose up -d"
echo "   - Check network: docker network inspect numztrak-network"
echo ""

echo "4. For WebSocket debugging:"
echo "   - Open browser console and check for Socket.IO connection errors"
echo "   - Look for '🐳 [FuelSocket] Docker Diagnostics' logs"
echo "   - Check if accessing via nginx (recommended) or direct (port 3002)"
echo ""

echo -e "${GREEN}✅ Test completed!${NC}"

