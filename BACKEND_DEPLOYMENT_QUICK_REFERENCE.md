# 🚀 NumzTrak Backend-Only Deployment - Quick Reference

## Files Created

### 1. **docker-compose.backend-only.yml** 
   - Location: `backend/`
   - Purpose: Complete backend stack (Traccar, Fuel API, MySQL, PostgreSQL, Nginx)
   - Run: `docker-compose -f docker-compose.backend-only.yml up -d`

### 2. **nginx.conf.production**
   - Location: `backend/`
   - Purpose: HTTPS reverse proxy for APIs
   - Routes:
     - `/api/fuel/*` → Fuel API (3001)
     - `/api/traccar/*` → Traccar (8082)
     - `/socket.io` → Socket.IO for real-time updates
     - `/api/socket` → Traccar WebSocket
   - HTTP → HTTPS redirect enabled
   - SSL/TLS 1.2 + 1.3

### 3. **.env.production.template**
   - Location: `traccar-fleet-system/frontend/`
   - Purpose: Netlify frontend environment variables
   - Key variable: `VITE_API_BASE_URL=https://your-oracle-ip-or-domain`

### 4. **ORACLE_DEPLOYMENT_GUIDE.md**
   - Location: Root (`./`)
   - Purpose: Step-by-step deployment instructions
   - Covers: Setup, configuration, testing, troubleshooting

---

## ⚡ Quick Start on Oracle Cloud

### Step 1: SSH into Oracle instance
```bash
ssh -i your_key ubuntu@your-oracle-public-ip
cd ~
mkdir -p numztrak/conf
```

### Step 2: Copy files from repo
```bash
git clone https://github.com/Numzn/NUMZGPS.git
cp NUMZGPS/backend/docker-compose.backend-only.yml ~/numztrak/
cp NUMZGPS/backend/nginx.conf.production ~/numztrak/
cp NUMZGPS/backend/cert.pem ~/numztrak/
cp NUMZGPS/backend/key.pem ~/numztrak/
cp NUMZGPS/backend/conf/traccar.xml ~/numztrak/conf/
```

### Step 3: Set environment variables
```bash
cd ~/numztrak
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_PASSWORD=traccar_secure_password
POSTGRES_PASSWORD=fuel_secure_password
SESSION_SECRET=session_secure_secret
CORS_ORIGIN=https://your-netlify-domain.netlify.app
TRACCAR_SERVER_URL=http://traccar-server:8082
EOF
```

### Step 4: Start containers
```bash
docker-compose -f docker-compose.backend-only.yml up -d
```

### Step 5: Verify
```bash
# Check all running
docker ps

# Test health endpoints
curl -k https://localhost/health
curl -k https://localhost/api/traccar/server
```

### Step 6: Update frontend
```bash
# On your local machine
nano traccar-fleet-system/frontend/.env.production
# Set: VITE_API_BASE_URL=https://your-oracle-ip

git add .env.production
git commit -m "Configure Oracle backend URL"
git push origin main
```

### Step 7: Redeploy frontend on Netlify
- Go to Netlify Dashboard
- Click "Trigger Deploy" → "Clear cache and deploy site"
- Done! ✅

---

## 🎯 Architecture

```
┌─────────────────────────────────────────┐
│         Netlify (Frontend)              │
│  https://your-site.netlify.app          │
│                                         │
│  (React, Vite, MapLibre)                │
└────────────┬────────────────────────────┘
             │
             │ HTTPS Calls
             │
             ▼
┌──────────────────────────────────────────────┐
│    Oracle Cloud (Backend Stack)              │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  Nginx Reverse Proxy (443/80)       │   │
│  │  - HTTPS/SSL                        │   │
│  │  - Routes to Traccar & Fuel APIs    │   │
│  │  - WebSocket support                │   │
│  └──┬────────────┬────────────────────┘   │
│     │            │                         │
│  ┌──▼──┐      ┌──▼──────────┐             │
│  │     │      │              │             │
│  │Traccar   │ Fuel API      │             │
│  │(8082)    │  (3001)       │             │
│  └──┬──┘     │   Node.js    │             │
│     │        │              │             │
│  ┌──▼───┐  ┌─▼──────────┐  │             │
│  │MySQL │  │ PostgreSQL │  │             │
│  └──────┘  └────────────┘  │             │
│                             │             │
└─────────────────────────────────────────┘
```

---

## 📊 Port Mapping

| Service | Container Port | Host Port | Protocol | Purpose |
|---------|---|---|---|---|
| Nginx   | 80 | 80 | HTTP | Redirects to HTTPS |
| Nginx   | 443 | 443 | HTTPS | API Gateway |
| Traccar | 8082 | (internal) | HTTP | GPS Tracking API |
| Fuel API| 3001 | (internal) | HTTP | Fuel Management API |
| MySQL   | 3306 | 3306 | TCP | Traccar Database |
| PostgreSQL | 5432 | 5432 | TCP | Fuel API Database |
| GPS Devices | - | 5001-5055 | TCP | GPS protocols (optional) |

---

## 🔒 Security Checklist

- [ ] Change all passwords in `.env` to strong values
- [ ] Use Let's Encrypt for production SSL certs (not self-signed)
- [ ] Configure Oracle Cloud firewall to allow only 80/443/SSH
- [ ] Set `CORS_ORIGIN` to your actual Netlify domain
- [ ] Enable database backups in Oracle Cloud
- [ ] Monitor logs for errors/unauthorized access
- [ ] Set resource limits on containers to prevent resource exhaustion

---

## 📝 Common Commands

```bash
# View logs
docker-compose -f docker-compose.backend-only.yml logs -f numztrak-fuel-api

# Restart service
docker-compose -f docker-compose.backend-only.yml restart numztrak-traccar

# Stop everything
docker-compose -f docker-compose.backend-only.yml down

# Full cleanup (deletes data!)
docker-compose -f docker-compose.backend-only.yml down -v

# Test API
curl -k https://your-oracle-ip/health
curl -k https://your-oracle-ip/api/traccar/server
```

---

## 🆘 Help & Troubleshooting

**Frontend shows "Unexpected token '<'":**
- Backend APIs not responding
- Check: `curl -k https://your-oracle-ip/health`
- Verify `.env.production` has correct IP/domain

**Services won't start:**
- Check port conflicts: `sudo netstat -tlnp | grep 80`
- Wait for databases: `sleep 60 && docker-compose up -d`

**Nginx SSL errors:**
- For dev: use `curl -k` (ignore cert errors)
- For prod: regenerate Let's Encrypt certs

**Database connection failed:**
- Ensure MySQL/PostgreSQL health checks pass
- Wait 30-60 seconds for databases to initialize
- Check `.env` passwords are correct

---

## 📚 Full Documentation

See **ORACLE_DEPLOYMENT_GUIDE.md** for comprehensive step-by-step instructions.

---

## ✅ Success Indicators

Once deployed:

1. ✅ `curl -k https://your-ip/health` returns `{"status":"ok"}`
2. ✅ `curl -k https://your-ip/api/traccar/server` returns server info
3. ✅ Netlify frontend loads without console errors
4. ✅ Login works with your Traccar credentials
5. ✅ GPS devices appear on map (if tracking)
6. ✅ Fuel requests load and update in real-time

---

🎉 **You're ready for production!**
