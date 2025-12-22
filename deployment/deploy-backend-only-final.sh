#!/bin/bash
# Final Backend-Only Deployment (no frontend/nginx)
# Usage: bash deployment/deploy-backend-only-final.sh

set -e

SERVER_IP="${1:-129.151.163.95}"
SSH_KEY="${2:-~/.ssh/oci_instance_key}"
USER="${3:-ubuntu}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

# Expand ~ to home directory
if [[ "$SSH_KEY" == ~* ]]; then
    SSH_KEY="${SSH_KEY/#\~/$HOME}"
fi

if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

echo "=========================================="
echo -e "${BLUE}NumzTrak Backend-Only Deployment${NC}"
echo "=========================================="
echo ""

echo -e "${GREEN}Step 1: Stopping existing services...${NC}"
ssh -i "$SSH_KEY" "${USER}@${SERVER_IP}" << 'EOF'
cd ~/NUMZGPS/backend
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.backend-only.yml down 2>/dev/null || true
echo "✓ Existing services stopped"
EOF

echo ""
echo -e "${GREEN}Step 2: Ensuring backend-only compose file exists...${NC}"
ssh -i "$SSH_KEY" "${USER}@${SERVER_IP}" << 'EOF'
cd ~/NUMZGPS/backend

if [ ! -f docker-compose.backend-only.yml ]; then
    echo "⚠️  docker-compose.backend-only.yml not found"
    echo "   Using regular docker-compose.yml (will skip frontend)"
    COMPOSE_FILE="docker-compose.yml"
else
    echo "✓ Using docker-compose.backend-only.yml"
    COMPOSE_FILE="docker-compose.backend-only.yml"
fi
EOF

echo ""
echo -e "${GREEN}Step 3: Pulling images and building...${NC}"
ssh -i "$SSH_KEY" "${USER}@${SERVER_IP}" << 'EOF'
cd ~/NUMZGPS/backend

# Determine which compose file to use
if [ -f docker-compose.backend-only.yml ]; then
    COMPOSE_FILE="docker-compose.backend-only.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

echo "📥 Pulling Docker images..."
docker-compose -f "$COMPOSE_FILE" pull 2>/dev/null || true

echo "🔨 Building fuel-api..."
docker-compose -f "$COMPOSE_FILE" build fuel-api
EOF

echo ""
echo -e "${GREEN}Step 4: Starting backend services...${NC}"
ssh -i "$SSH_KEY" "${USER}@${SERVER_IP}" << 'EOF'
cd ~/NUMZGPS/backend

# Determine which compose file to use
if [ -f docker-compose.backend-only.yml ]; then
    COMPOSE_FILE="docker-compose.backend-only.yml"
else
    COMPOSE_FILE="docker-compose.yml"
    # Start only backend services
    docker-compose up -d traccar-mysql fuel-postgres traccar-server fuel-api
    exit 0
fi

# Start all services from backend-only compose
echo "🚀 Starting backend services..."
COMPOSE_HTTP_TIMEOUT=120 docker-compose -f "$COMPOSE_FILE" up -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 15

echo ""
echo "📊 Service Status:"
docker-compose -f "$COMPOSE_FILE" ps
EOF

echo ""
echo -e "${GREEN}Step 5: Verifying deployment...${NC}"
ssh -i "$SSH_KEY" "${USER}@${SERVER_IP}" << 'EOF'
cd ~/NUMZGPS/backend

if [ -f docker-compose.backend-only.yml ]; then
    COMPOSE_FILE="docker-compose.backend-only.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

echo "Testing services..."
sleep 5

# Test Traccar
if curl -s -f http://localhost:8082/api/server > /dev/null 2>&1; then
    echo "✓ Traccar API is responding"
else
    echo "⚠️  Traccar API not ready yet"
    echo "   Check logs: docker-compose -f $COMPOSE_FILE logs traccar-server"
fi

# Test Fuel API
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✓ Fuel API is responding"
else
    echo "⚠️  Fuel API not ready yet"
    echo "   Check logs: docker-compose -f $COMPOSE_FILE logs fuel-api"
fi

# Check databases
if docker exec numztrak-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo "✓ MySQL (Traccar) is running"
else
    echo "⚠️  MySQL not ready"
fi

if docker exec numztrak-postgres pg_isready -U numztrak -d numztrak_fuel > /dev/null 2>&1; then
    echo "✓ PostgreSQL (Fuel) is running"
else
    echo "⚠️  PostgreSQL not ready"
fi
EOF

echo ""
echo "=========================================="
echo -e "${GREEN}Backend Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${CYAN}Backend API URLs:${NC}"
echo -e "  Traccar API: ${BLUE}http://${SERVER_IP}:8082${NC}"
echo -e "  Fuel API:    ${BLUE}http://${SERVER_IP}:3001${NC}"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo -e "  View logs:    ${BLUE}ssh -i $SSH_KEY ${USER}@${SERVER_IP} 'cd ~/NUMZGPS/backend && docker-compose -f docker-compose.backend-only.yml logs -f'${NC}"
echo -e "  Check status: ${BLUE}ssh -i $SSH_KEY ${USER}@${SERVER_IP} 'cd ~/NUMZGPS/backend && docker-compose -f docker-compose.backend-only.yml ps'${NC}"
echo -e "  Restart:      ${BLUE}ssh -i $SSH_KEY ${USER}@${SERVER_IP} 'cd ~/NUMZGPS/backend && docker-compose -f docker-compose.backend-only.yml restart'${NC}"
echo ""



