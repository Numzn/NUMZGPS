# NumzTrak System Summary

## Quick Status Overview

### Container Status
| Container | Status | Purpose | Ports |
|-----------|--------|---------|-------|
| **numztrak-postgres** | ✅ Healthy | Fuel Management Database | 5432 |
| **numztrak-mysql** | ✅ Healthy | Traccar GPS Database | 3306 |
| **numztrak-fuel-api** | ✅ Healthy | Fuel Management API | 3001 |
| **numztrak-traccar** | ✅ Running | GPS Tracking Server | 8082, 8443, 5001-5020, 5055 |
| **numztrak-frontend** | ✅ Running | Web Dashboard | 3002 |
| **numztrak-nginx** | ✅ Running | Reverse Proxy | 80, 443 |

---

## Deployment Information (Oracle Cloud)
- **Server IP:** `129.151.163.95`
- **Active Directory:** `~/NUMZGPS/backend`
- **Config Files:**
  - Nginx: `~/NUMZGPS/backend/nginx/nginx-backend-only.conf`
  - Docker Compose: `~/NUMZGPS/backend/docker-compose.backend-only.yml`
- **SSL Certificates:** `/etc/letsencrypt/live/api.numz.site/`

---

## Database Passwords

### PostgreSQL (Fuel Management)
- **User:** `numztrak`
- **Password:** `NumzFuel2025`
- **Database:** `numztrak_fuel`
- **Connection String:** `postgresql://numztrak:NumzFuel2025@fuel-postgres:5432/numztrak_fuel`

### MySQL (Traccar GPS)
- **Root User:** `root`
- **Root Password:** `NumzTrak2025Root`
- **Application User:** `traccar`
- **Application Password:** `traccar123`
- **Database:** `traccar`
- **Connection:** `mysql://traccar:traccar123@traccar-mysql:3306/traccar`

---

## Network Architecture

```
Internet
   │
   ├── Port 80/443 (nginx)
   │   └── Routes to: Frontend (3002) or Fuel API (3001)
   │
   ├── Port 8082 (Traccar Web)
   ├── Port 8443 (Traccar HTTPS)
   └── GPS Ports: 5001, 5002, 5003, 5005, 5006, 5009, 5013, 5020, 5055
       └── Traccar GPS Protocols
```

---

## Service Dependencies

```
PostgreSQL (5432)
   └── Fuel API (3001)

MySQL (3306)
   └── Traccar Server (8082)
   └── Fuel API (3001)

Fuel API (3001)
   └── Frontend (3002)
   └── Nginx (80/443)

Traccar Server (8082)
   └── Frontend (3002)
   └── Nginx (80/443)

Frontend (3002)
   └── Nginx (80/443)
```

---

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend Dashboard** | http://localhost:3002 | Traccar credentials |
| **Fuel API** | http://localhost:3001 | API Key / Session |
| **Traccar Web** | http://localhost:8082 | Traccar admin |
| **Nginx Proxy** | http://localhost | Routes to frontend |
| **PostgreSQL** | localhost:5432 | numztrak / NumzFuel2025 |
| **MySQL** | localhost:3306 | traccar / traccar123 |

---

## Environment Variables

All passwords and configurations are stored in `.env` file (not committed to git).

**Location:** `backend/.env`

Key variables:
- `MYSQL_ROOT_PASSWORD=NumzTrak2025Root`
- `MYSQL_PASSWORD=traccar123`
- `POSTGRES_PASSWORD=NumzFuel2025`
- `SESSION_SECRET=NumzTrak2025FuelSecret`

---

## Operational Flow

### 1. Startup Sequence
1. **Databases start first** (PostgreSQL, MySQL)
2. **Wait for health checks** (both healthy)
3. **Core services start** (Traccar, Fuel API)
4. **Frontend services start** (Frontend, Nginx)

### 2. Daily Operations
- **GPS Tracking:** Devices → Traccar Server (ports 5001-5055)
- **Web Access:** Browser → Nginx (port 80) → Frontend/API
- **Fuel Requests:** Frontend → Fuel API → PostgreSQL
- **Data Sync:** Fuel API → Traccar MySQL (read-only)

### 3. Maintenance Commands

**Start all services:**
```powershell
cd backend
docker-compose up -d
```

**Stop all services:**
```powershell
docker-compose down
```

**View logs:**
```powershell
docker-compose logs -f [service-name]
```

**Test connections:**
```powershell
.\scripts\test-database-connections.ps1
```

---

## Quick Reference: Default Passwords

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | numztrak | NumzFuel2025 |
| MySQL Root | root | NumzTrak2025Root |
| MySQL App | traccar | traccar123 |
| Traccar Admin | admin | admin123 |

**⚠️ Change these in production!**

---

## Troubleshooting

### If services won't start:
1. Check Docker is running: `docker info`
2. Check ports aren't in use: `netstat -ano | findstr "3001 3002 3306 5432"`
3. Check logs: `docker-compose logs [service-name]`

### If databases won't connect:
1. Verify containers are healthy: `docker-compose ps`
2. Test connection: Run `test-database-connections.ps1`
3. Reset passwords if needed: See `scripts/reset-database-passwords.md`

### If ports conflict:
- Traccar ports reduced to individual ports (5001, 5002, etc.)
- Check what's using ports: `netstat -ano | findstr "PORT_NUMBER"`

---

## Files to Know

- **docker-compose.yml** - Main orchestration file
- **.env** - Passwords and configuration (DO NOT COMMIT)
- **env.template** - Template for .env file
- **scripts/test-database-connections.ps1** - Test all DB connections
- **scripts/reset-database-passwords.md** - Password reset guide

---

*Last Updated: After successful deployment*
*All services: ✅ Operational*

