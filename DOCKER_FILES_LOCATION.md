# Docker Files Location - How Services Start

## 📍 Main Docker Configuration File

**Location:** `C:\Users\NUMERI\NUMZFLEET\backend\docker-compose.yml`

This is the **single file** that defines and orchestrates all services. It contains:

### Services Defined:
1. **traccar-mysql** - MySQL database for Traccar
2. **fuel-postgres** - PostgreSQL database for Fuel API
3. **traccar-server** - GPS tracking server
4. **fuel-api** - Fuel management API (Node.js)
5. **numztrak-frontend** - React frontend
6. **numztrak-nginx** - Nginx reverse proxy

---

## 🚀 How to Start All Services

### Method 1: Using Docker Compose (Recommended)

From the `backend` directory:
```powershell
cd C:\Users\NUMERI\NUMZFLEET\backend
docker-compose up -d
```

This command:
- Reads `docker-compose.yml`
- Starts all services in the correct order
- Respects dependencies (`depends_on`)
- Runs containers in detached mode (`-d`)

### Method 2: Using the Startup Script

There's also a PowerShell script:
**Location:** `C:\Users\NUMERI\NUMZFLEET\backend\start-numztrak.ps1`

Run it:
```powershell
cd C:\Users\NUMERI\NUMZFLEET\backend
.\start-numztrak.ps1
```

This script:
- Checks Docker is running
- Cleans up old containers
- Starts all services
- Shows status of each service
- Displays access URLs

---

## 📁 File Structure

```
NUMZFLEET/
├── backend/
│   ├── docker-compose.yml      ← MAIN FILE: Defines all services
│   ├── start-numztrak.ps1      ← Startup script (optional)
│   ├── nginx.conf              ← Nginx configuration
│   ├── conf/
│   │   └── traccar.xml         ← Traccar configuration
│   └── scripts/
│       └── init-database.sql   ← Database initialization
│
├── fuel-api/
│   ├── Dockerfile              ← Fuel API container definition
│   └── src/
│
├── traccar-fleet-system/
│   └── frontend/
│       ├── Dockerfile.dev      ← Frontend container definition
│       └── src/
│
└── data/                       ← Database volumes (created automatically)
    ├── mysql/
    ├── fuel-postgres/
    └── traccar/
```

---

## 🔧 How Docker Compose Works

### Service Dependencies (Start Order):

```
1. traccar-mysql (MySQL Database)
   └─> Waits for: Nothing (starts first)

2. fuel-postgres (PostgreSQL Database)
   └─> Waits for: Nothing (starts first)

3. traccar-server (GPS Server)
   └─> Waits for: traccar-mysql to be healthy

4. fuel-api (Fuel API)
   └─> Waits for: 
       - fuel-postgres to be healthy
       - traccar-mysql to be healthy

5. numztrak-frontend (Frontend)
   └─> Waits for:
       - traccar-server to be running
       - fuel-api to be running

6. numztrak-nginx (Gateway)
   └─> Waits for:
       - traccar-server to be running
       - numztrak-frontend to be running
```

---

## 📋 Key Commands

### Start all services:
```powershell
cd C:\Users\NUMERI\NUMZFLEET\backend
docker-compose up -d
```

### Stop all services:
```powershell
docker-compose down
```

### View logs:
```powershell
docker-compose logs -f          # All services
docker-compose logs -f fuel-api # Specific service
```

### Check status:
```powershell
docker-compose ps
```

### Restart a specific service:
```powershell
docker-compose restart fuel-api
```

### Rebuild and start:
```powershell
docker-compose up -d --build
```

---

## 🎯 Summary

**Single Command to Start Everything:**
```powershell
cd C:\Users\NUMERI\NUMZFLEET\backend
docker-compose up -d
```

**Or use the startup script:**
```powershell
cd C:\Users\NUMERI\NUMZFLEET\backend
.\start-numztrak.ps1
```

The `docker-compose.yml` file in the `backend` directory is the **master configuration** that orchestrates all services. It automatically:
- Builds images (if needed)
- Creates networks
- Starts containers in the right order
- Manages dependencies
- Handles health checks

---

*Last Updated: Current Session*









