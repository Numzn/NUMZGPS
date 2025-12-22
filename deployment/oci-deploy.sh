#!/bin/bash
# OCI Deployment Script
# Deploys NumzTrak to OCI instance
# Usage: bash oci-deploy.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "NumzTrak OCI Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    echo "Please run: bash deployment/oci-server-setup.sh first"
    exit 1
fi

# Check if user is in docker group
if ! groups | grep -q docker; then
    echo -e "${YELLOW}Warning: You may not be in the docker group.${NC}"
    echo "Run: newgrp docker or log out and back in"
fi

echo -e "${GREEN}Step 1: Checking environment configuration...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    if [ -f "env.template" ]; then
        cp env.template .env
        echo -e "${YELLOW}Please edit .env file with your production values:${NC}"
        echo "  nano .env"
        echo ""
        read -p "Press Enter after you've configured .env file..."
    else
        echo -e "${RED}Error: env.template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}.env file exists.${NC}"
fi

echo -e "${GREEN}Step 2: Creating data directories...${NC}"
mkdir -p ../data/mysql
mkdir -p ../data/postgres
mkdir -p ../data/traccar/logs
chmod -R 755 ../data

echo -e "${GREEN}Step 3: Setting up SSL certificates...${NC}"
if [ ! -f "cert.pem" ] || [ ! -f "key.pem" ]; then
    echo -e "${YELLOW}SSL certificates not found.${NC}"
    echo "Options:"
    echo "1. Use Let's Encrypt (recommended for production)"
    echo "2. Generate self-signed certificate (for testing)"
    read -p "Choose option (1 or 2): " ssl_option
    
    if [ "$ssl_option" = "2" ]; then
        echo -e "${YELLOW}Generating self-signed certificate...${NC}"
        openssl req -x509 -newkey rsa:4096 -nodes \
            -keyout key.pem \
            -out cert.pem \
            -days 365 \
            -subj "/CN=localhost"
        echo -e "${GREEN}Self-signed certificate generated.${NC}"
    else
        echo -e "${YELLOW}Please set up Let's Encrypt certificate manually:${NC}"
        echo "  sudo certbot certonly --standalone -d yourdomain.com"
        echo "  Then copy certificates to backend/ directory"
    fi
else
    echo -e "${GREEN}SSL certificates found.${NC}"
fi

echo -e "${GREEN}Step 4: Pulling latest Docker images...${NC}"
docker-compose pull

echo -e "${GREEN}Step 5: Starting services...${NC}"
docker-compose up -d

echo -e "${GREEN}Step 6: Waiting for services to be healthy...${NC}"
sleep 10

echo -e "${GREEN}Step 7: Checking service status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Service URLs:"
echo "  Traccar API: http://$(hostname -I | awk '{print $1}'):8082"
echo "  Fuel API: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Check status: docker-compose ps"
echo ""

# Test services
echo -e "${GREEN}Testing services...${NC}"
sleep 5

if curl -s http://localhost:8082/api/server > /dev/null; then
    echo -e "${GREEN}✓ Traccar API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Traccar API may not be ready yet${NC}"
fi

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Fuel API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Fuel API may not be ready yet${NC}"
fi

echo ""
echo -e "${YELLOW}Next: Set up frontend deployment (see deployment/FRONTEND_DEPLOYMENT.md)${NC}"
echo ""

