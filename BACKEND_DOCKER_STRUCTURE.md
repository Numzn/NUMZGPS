# Backend & Docker Structure Documentation

Complete overview of the NumzTrak backend architecture and Docker containerization setup.

## 📁 Backend Directory Structure

```
backend/
├── conf/                          # Traccar configuration files
│   ├── traccar.xml               # Main Traccar server configuration
│   └── traccar-admin.xml         # Admin interface configuration
│
├── scripts/                       # Utility and setup scripts
│   ├── init-database.sql/        # Database initialization script
│   ├── quick-reset-mysql.ps1     # Quick MySQL reset script
│   ├── reset-database-passwords.md # Password reset documentation
│   ├── reset-mysql-password.ps1  # MySQL password reset
│   ├── start-backend-only.ps1   # Start only backend services
│   ├── start-frontend-docker.ps1 # Start frontend in Docker
│   ├── stop-frontend-docker.ps1  # Stop frontend container
│   ├── test-database-connections.ps1 # Test DB connectivity
│   ├── test-docker-connectivity.ps1  # Test Docker network
│   └── test-docker-connectivity.sh    # Linux connectivity test
│
├── docker-compose.yml            # Main Docker Compose configuration
├── nginx.conf                    # Nginx reverse proxy configuration
├── env.template                  # Environment variables template
├── keystore.jks                  # SSL keystore (gitignored)
├── start-numztrak.ps1            # Main startup script
├── QUICK_STATUS.md               # Quick status guide
└── SYSTEM_SUMMARY.md              # System overview
```

## 🐳 Docker Compose Architecture

### Service Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: numztrak-network          │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   MySQL 8.0   │    │ PostgreSQL  │    │   Traccar    │  │
│  │  (Port 3306)  │    │ 15 (5432)   │    │  (8082/8443) │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Fuel API      │                      │
│                    │  (Port 3001)    │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Frontend     │                      │
│                    │  (Port 3002)   │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │     Nginx       │                      │
│                    │   (Port 80/443) │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Services

### 1. Traccar MySQL (`numztrak-mysql`)

**Image**: `mysql:8.0`  
**Container**: `numztrak-mysql`  
**Port**: `3306:3306`

**Configuration**:
```yaml
Environment Variables:
  - MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  - MYSQL_DATABASE: traccar
  - MYSQL_USER: traccar
  - MYSQL_PASSWORD: ${MYSQL_PASSWORD}

Volumes:
  - ../data/mysql:/var/lib/mysql
  - ./scripts/init-database.sql:/docker-entrypoint-initdb.d/

Health Check:
  - Command: mysqladmin ping -h localhost
  - Interval: 20s
  - Retries: 10
```

**Purpose**: Stores Traccar GPS tracking data
- Device information
- Position history
- Events and alerts
- User accounts
- Geofences

### 2. Fuel PostgreSQL (`numztrak-postgres`)

**Image**: `postgres:15-alpine`  
**Container**: `numztrak-postgres`  
**Port**: `5432:5432`

**Configuration**:
```yaml
Environment Variables:
  - POSTGRES_DB: numztrak_fuel
  - POSTGRES_USER: numztrak
  - POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

Volumes:
  - ../data/fuel-postgres:/var/lib/postgresql/data

Health Check:
  - Command: pg_isready -U numztrak -d numztrak_fuel
  - Interval: 10s
  - Timeout: 5s
  - Retries: 5
```

**Purpose**: Stores fuel management data
- Fuel requests
- Fuel stations
- Vehicle specifications
- Approval workflows

## 🔧 Core Services

### 3. Traccar Server (`numztrak-traccar`)

**Image**: `traccar/traccar:latest`  
**Container**: `numztrak-traccar`

**Ports**:
```
HTTP:  8082:8082
HTTPS: 8443:8443
GPS Protocols (TCP):
  - 5001:5001  # GPS103
  - 5002:5002  # TK103
  - 5003:5003  # GL200
  - 5005:5005  # T55
  - 5006:5006  # Teltonika
  - 5009:5009  # Meiligao
  - 5013:5013  # H02
  - 5020:5020  # GPSGate
  - 5055:5055  # OsmAnd (HTTP)
```

**Configuration**:
```yaml
Volumes:
  - ../data/traccar/logs:/opt/traccar/logs
  - ./conf/traccar.xml:/opt/traccar/conf/traccar.xml:ro
  - ./cert.pem:/opt/traccar/conf/cert.pem:ro
  - ./key.pem:/opt/traccar/conf/key.pem:ro

Environment:
  - TRACCAR_DATABASE_URL: jdbc:mysql://traccar-mysql:3306/traccar
  - TRACCAR_DATABASE_USER: traccar
  - TRACCAR_DATABASE_PASSWORD: ${MYSQL_PASSWORD}

Depends On:
  - traccar-mysql (health check)
```

**Purpose**: GPS tracking server
- Receives GPS data from devices
- Processes position updates
- Manages devices and users
- Provides REST API

### 4. Fuel API (`numztrak-fuel-api`)

**Image**: Built from `../fuel-api/Dockerfile`  
**Container**: `numztrak-fuel-api`  
**Port**: `3001:3001`

**Dockerfile** (`fuel-api/Dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', ...)"
CMD ["node", "src/server.js"]
```

**Configuration**:
```yaml
Environment:
  - DATABASE_URL: postgresql://numztrak:${POSTGRES_PASSWORD}@fuel-postgres:5432/numztrak_fuel
  - TRACCAR_MYSQL_HOST: traccar-mysql
  - TRACCAR_MYSQL_PORT: 3306
  - TRACCAR_MYSQL_DATABASE: traccar
  - TRACCAR_MYSQL_USER: traccar
  - TRACCAR_MYSQL_PASSWORD: ${MYSQL_PASSWORD}
  - PORT: 3001
  - NODE_ENV: development
  - SESSION_SECRET: ${SESSION_SECRET}
  - CORS_ORIGIN: http://localhost:3002

Depends On:
  - fuel-postgres (health check)
  - traccar-mysql (health check)
```

**API Structure**:
```
fuel-api/src/
├── config/
│   ├── database.js      # PostgreSQL connection
│   └── traccar.js       # MySQL/Traccar connection
├── controllers/
│   └── vehicleSpecController.js
├── fuelRequests/
│   ├── controllers/     # Fuel request CRUD operations
│   ├── handlers/        # Socket event handlers
│   ├── routes/          # Express routes
│   └── services/        # Business logic
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/              # Sequelize models
│   ├── FuelRequest.js
│   ├── FuelStation.js
│   └── VehicleSpec.js
├── routes/
│   └── vehicleSpecs.js
├── services/
│   └── vehicleSpecService.js
├── socket/
│   └── socketHandler.js # Socket.io server
└── server.js            # Express app entry point
```

**Endpoints**:
- `GET /api/fuel-requests` - List fuel requests
- `POST /api/fuel-requests` - Create fuel request
- `PUT /api/fuel-requests/:id` - Update request
- `POST /api/fuel-requests/:id/approve` - Approve request
- `POST /api/fuel-requests/:id/reject` - Reject request
- `GET /api/fuel-stations` - List stations
- `GET /api/vehicle-specs` - Get vehicle specs
- `GET /health` - Health check

## 🎨 Frontend Service

### 5. Frontend (`numztrak-frontend`)

**Image**: Built from `../traccar-fleet-system/frontend/Dockerfile.dev`  
**Container**: `numztrak-frontend`  
**Port**: `3002:3002`

**Dockerfile** (`traccar-fleet-system/frontend/Dockerfile.dev`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

**Configuration**:
```yaml
Volumes (Hot Reload):
  - ../traccar-fleet-system/frontend/src:/app/src
  - ../traccar-fleet-system/frontend/public:/app/public
  - ../traccar-fleet-system/frontend/index.html:/app/index.html
  - ../traccar-fleet-system/frontend/vite.config.js:/app/vite.config.js

Environment:
  - NODE_ENV: development
  - VITE_HMR_HOST: localhost
  - VITE_HMR_PORT: 3002

Depends On:
  - fuel-api
  - traccar-server
```

**Tech Stack**:
- React 19
- Material-UI (MUI) 7
- Redux Toolkit
- MapLibre GL JS
- Vite
- Socket.io Client

## 🌐 Gateway Service

### 6. Nginx (`numztrak-nginx`)

**Image**: `nginx:alpine`  
**Container**: `numztrak-nginx`  
**Ports**: `80:80`, `443:443`

**Configuration** (`backend/nginx.conf`):
```nginx
# Fuel API Routes (Priority)
/api/fuel-requests → http://fuel-api:3001/api/fuel-requests
/api/vehicle-specs → http://fuel-api:3001/api/vehicle-specs

# Traccar API Routes
/api/* → http://traccar-server:8082/api/*

# Frontend
/ → http://numztrak-frontend:3002

# WebSocket Support
Upgrade headers for real-time updates
```

**Purpose**: Reverse proxy and load balancer
- Routes API requests to appropriate services
- Serves frontend application
- Handles SSL termination
- WebSocket proxying

## 🔗 Network Architecture

### Docker Network: `numztrak-network`

**Type**: Bridge network  
**Purpose**: Internal service communication

**Service Communication**:
```
Frontend → Fuel API: http://fuel-api:3001
Frontend → Traccar: http://traccar-server:8082
Fuel API → PostgreSQL: postgresql://fuel-postgres:5432
Fuel API → MySQL: mysql://traccar-mysql:3306
Traccar → MySQL: jdbc:mysql://traccar-mysql:3306
Nginx → Frontend: http://numztrak-frontend:3002
Nginx → Fuel API: http://fuel-api:3001
Nginx → Traccar: http://traccar-server:8082
```

## 📊 Data Persistence

### Volume Mounts

```
../data/
├── mysql/              # MySQL data directory
│   └── /var/lib/mysql
├── fuel-postgres/       # PostgreSQL data directory
│   └── /var/lib/postgresql/data
└── traccar/
    └── logs/            # Traccar log files
        └── /opt/traccar/logs
```

**Note**: Using bind mounts instead of named volumes for easier backup/restore.

## 🚀 Startup Sequence

1. **Databases** (Parallel)
   - MySQL starts and waits for health check
   - PostgreSQL starts and waits for health check

2. **Core Services** (After databases healthy)
   - Traccar server starts (depends on MySQL)
   - Fuel API starts (depends on both databases)

3. **Frontend** (After APIs ready)
   - Frontend starts (depends on Fuel API and Traccar)

4. **Gateway** (After all services)
   - Nginx starts (depends on Frontend and Traccar)

## 🔧 Configuration Files

### Traccar Configuration (`backend/conf/traccar.xml`)

Main Traccar server configuration:
- Database connection
- GPS protocol handlers
- Port configurations
- Security settings

### Nginx Configuration (`backend/nginx.conf`)

Reverse proxy rules:
- API routing
- WebSocket support
- SSL configuration
- Timeout settings

### Environment Template (`backend/env.template`)

Required environment variables:
- Database passwords
- API secrets
- Port configurations
- CORS settings

## 📝 Utility Scripts

### Startup Scripts

- `start-numztrak.ps1` - Main startup script (Windows)
- `start-backend-only.ps1` - Start only backend services
- `start-frontend-docker.ps1` - Start frontend in Docker

### Database Scripts

- `init-database.sql` - Database initialization
- `reset-mysql-password.ps1` - Reset MySQL password
- `quick-reset-mysql.ps1` - Quick MySQL reset

### Testing Scripts

- `test-database-connections.ps1` - Test DB connectivity
- `test-docker-connectivity.ps1` - Test Docker network
- `test-fuel-request.ps1` - Test fuel API endpoints

## 🔒 Security Considerations

### SSL/TLS

- SSL certificates mounted from host: `cert.pem`, `key.pem`
- HTTPS on Traccar: Port 8443
- HTTPS on Nginx: Port 443

### Secrets Management

- All secrets in `.env` file (gitignored)
- Environment variables passed to containers
- No hardcoded credentials

### Network Isolation

- Services communicate via internal Docker network
- Only necessary ports exposed to host
- Nginx as single entry point

## 📈 Monitoring & Health Checks

### Health Check Endpoints

- **MySQL**: `mysqladmin ping`
- **PostgreSQL**: `pg_isready`
- **Fuel API**: `GET /health`
- **Traccar**: Built-in health checks

### Logging

- Traccar logs: `../data/traccar/logs/`
- Container logs: `docker-compose logs [service]`
- Application logs: Container stdout/stderr

## 🛠️ Common Operations

### Start All Services
```bash
cd backend
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f [service-name]
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Services
```bash
docker-compose up -d --build
```

### Access Services
```bash
# MySQL
docker exec -it numztrak-mysql mysql -u traccar -p

# PostgreSQL
docker exec -it numztrak-postgres psql -U numztrak -d numztrak_fuel

# Fuel API Shell
docker exec -it numztrak-fuel-api sh

# Frontend Shell
docker exec -it numztrak-frontend sh
```

---

**Last Updated**: 2025-01-XX  
**Docker Compose Version**: 3.8+  
**Docker Engine**: 20.10+





