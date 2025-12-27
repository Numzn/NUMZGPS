# =========================================================================
# NumzTrak Backend-Only Deployment Guide (Oracle Cloud / Linux)
# =========================================================================

## 🎯 Overview

This guide walks you through deploying the **backend-only stack** to Oracle Cloud:
- Traccar Server (GPS tracking)
- Fuel API (Node.js microservice)
- PostgreSQL (Fuel API database)
- MySQL (Traccar database)
- Nginx (HTTPS reverse proxy)

**Frontend:** Deployed separately on Netlify, connects via HTTPS APIs.

---

## 📋 Prerequisites

On your Oracle Cloud Linux instance:
- ✅ Docker installed (`docker --version`)
- ✅ Docker Compose installed (`docker-compose --version`)
- ✅ SSH access to the instance
- ✅ Public IP address or custom domain
- ✅ SSL certificates (cert.pem + key.pem) or ready to generate

---

## 📁 Directory Structure

Create this structure on your Oracle instance:

```
~/numztrak/
├── docker-compose.backend-only.yml
├── nginx.conf.production
├── cert.pem                  (your SSL certificate)
├── key.pem                   (your SSL private key)
├── .env                      (environment variables)
├── conf/
│   ├── traccar.xml          (Traccar config)
│   └── traccar-admin.xml    (Traccar admin config)
└── logs/                     (created automatically)
    ├── traccar/
    ├── nginx/
    └── postgres/
```

---

## 🚀 Step 1: Prepare Oracle Instance

### 1.1 Connect via SSH

```bash
ssh ubuntu@<your-oracle-public-ip>
# or use your SSH key
ssh -i ~/.ssh/oracle_key ubuntu@<your-oracle-public-ip>
```

### 1.2 Create deployment directory

```bash
mkdir -p ~/numztrak/conf
mkdir -p ~/numztrak/logs
cd ~/numztrak
```

### 1.3 Verify Docker is running

```bash
docker --version
docker-compose --version
docker ps
```

If Docker isn't running:
```bash
# On Oracle Linux (RHEL-based)
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker

# On Ubuntu
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📄 Step 2: Copy Configuration Files

### 2.1 Download from your repo

From your local machine:

```bash
# SSH into Oracle instance in a new terminal
# Copy the files:

scp -i ~/.ssh/oracle_key backend/docker-compose.backend-only.yml ubuntu@<oracle-ip>:~/numztrak/
scp -i ~/.ssh/oracle_key backend/nginx.conf.production ubuntu@<oracle-ip>:~/numztrak/
scp -i ~/.ssh/oracle_key backend/conf/traccar.xml ubuntu@<oracle-ip>:~/numztrak/conf/
scp -i ~/.ssh/oracle_key backend/conf/traccar-admin.xml ubuntu@<oracle-ip>:~/numztrak/conf/
scp -i ~/.ssh/oracle_key backend/cert.pem ubuntu@<oracle-ip>:~/numztrak/
scp -i ~/.ssh/oracle_key backend/key.pem ubuntu@<oracle-ip>:~/numztrak/
```

### 2.2 Or clone from GitHub (if repo is public)

```bash
cd ~
git clone https://github.com/Numzn/NUMZGPS.git
cp NUMZGPS/backend/docker-compose.backend-only.yml ~/numztrak/
cp NUMZGPS/backend/nginx.conf.production ~/numztrak/
cp NUMZGPS/backend/conf/traccar.xml ~/numztrak/conf/
cp NUMZGPS/backend/cert.pem ~/numztrak/
cp NUMZGPS/backend/key.pem ~/numztrak/
```

### 2.3 Verify files exist

```bash
cd ~/numztrak
ls -la
# Should show: docker-compose.backend-only.yml, nginx.conf.production, cert.pem, key.pem
ls -la conf/
# Should show: traccar.xml, traccar-admin.xml
```

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Create .env file

```bash
cd ~/numztrak
cat > .env << 'EOF'
# ========================
# Database Passwords
# ========================
# CHANGE THESE to strong random passwords!
MYSQL_ROOT_PASSWORD=traccar_root_very_secure_password_123
MYSQL_PASSWORD=traccar_db_very_secure_password_456
POSTGRES_PASSWORD=fuel_postgres_very_secure_password_789

# ========================
# Fuel API Configuration
# ========================
SESSION_SECRET=your_very_secure_session_secret_change_me_12345
CORS_ORIGIN=https://your-netlify-domain.netlify.app
TRACCAR_SERVER_URL=http://traccar-server:8082

# ========================
# Optional: Traccar Admin Password
# ========================
# TRACCAR_ADMIN_PASSWORD=admin_password_change_me
EOF
```

### 3.2 Generate strong passwords (recommended)

```bash
# Generate random passwords
openssl rand -base64 16
openssl rand -base64 16
openssl rand -base64 16
openssl rand -base64 16

# Edit .env with actual values
nano .env
```

### 3.3 Update CORS_ORIGIN with your Netlify domain

```bash
# Replace with your actual Netlify URL:
# https://your-site-name.netlify.app
```

---

## 📋 Step 4: Verify SSL Certificates

### 4.1 Check if certs exist

```bash
cd ~/numztrak
ls -la cert.pem key.pem
```

### 4.2 If certs don't exist, generate self-signed (dev only)

```bash
# WARNING: Self-signed certs cause browser warnings
# For production, use Let's Encrypt or buy from CA

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/CN=your-oracle-ip-or-domain"

ls -la cert.pem key.pem
```

### 4.3 For production with Let's Encrypt (recommended)

```bash
# Install certbot
sudo apt-get install certbot

# Generate cert (requires domain pointing to your IP)
sudo certbot certonly --standalone -d your-domain.com

# Copy to ~/numztrak
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/numztrak/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/numztrak/key.pem
sudo chown $USER:$USER ~/numztrak/cert.pem ~/numztrak/key.pem
```

---

## 🐳 Step 5: Start Docker Containers

### 5.1 Build and start services

```bash
cd ~/numztrak

# Pull latest images
docker-compose -f docker-compose.backend-only.yml pull

# Start all services
docker-compose -f docker-compose.backend-only.yml up -d

# Watch logs (optional)
docker-compose -f docker-compose.backend-only.yml logs -f
```

### 5.2 Verify services are running

```bash
docker ps

# Should show 5 containers:
# - numztrak-mysql
# - numztrak-postgres
# - numztrak-traccar
# - numztrak-fuel-api
# - numztrak-nginx
```

### 5.3 Check health

```bash
docker-compose -f docker-compose.backend-only.yml ps

# Wait for all services to show "healthy"
# May take 1-2 minutes for databases to initialize
```

---

## ✅ Step 6: Verify Backend is Working

### 6.1 Test Fuel API health check

```bash
curl -k https://localhost/health

# Expected response:
# {"status":"ok"}
```

### 6.2 Test Traccar API

```bash
curl -k https://localhost/api/traccar/server

# Expected response:
# {"id":"...","status":"online",...}
```

### 6.3 Test from external IP

```bash
# Replace YOUR_ORACLE_IP with your actual public IP
curl -k https://YOUR_ORACLE_IP/health
curl -k https://YOUR_ORACLE_IP/api/traccar/server
```

---

## 🌐 Step 7: Configure Netlify Frontend

### 7.1 Copy .env.production template

From your local machine:
```bash
cp traccar-fleet-system/frontend/.env.production.template \
   traccar-fleet-system/frontend/.env.production
```

### 7.2 Edit with your Oracle IP/domain

```bash
nano traccar-fleet-system/frontend/.env.production

# Update this line:
VITE_API_BASE_URL=https://YOUR_ORACLE_PUBLIC_IP_OR_DOMAIN

# Example:
VITE_API_BASE_URL=https://123.45.67.89
# OR
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 7.3 Commit and push to GitHub

```bash
git add traccar-fleet-system/frontend/.env.production
git commit -m "Configure production API endpoint for Netlify"
git push origin main
```

### 7.4 Redeploy on Netlify

- Go to **Netlify Dashboard** → Your Site
- Click **Deployments**
- Click **Trigger Deploy** → **Clear cache and deploy site**
- Wait for build to complete

### 7.5 Verify frontend works

- Open https://your-site-name.netlify.app
- Login with your Traccar credentials
- Check browser console (F12) for API errors
- Should see successful API calls to your Oracle backend

---

## 🔧 Step 8: Maintenance & Monitoring

### 8.1 View logs

```bash
cd ~/numztrak

# All services
docker-compose -f docker-compose.backend-only.yml logs -f

# Specific service
docker logs -f numztrak-traccar
docker logs -f numztrak-fuel-api
docker logs -f numztrak-nginx

# Follow only errors
docker-compose -f docker-compose.backend-only.yml logs -f | grep -i error
```

### 8.2 Restart services

```bash
# Restart all
docker-compose -f docker-compose.backend-only.yml restart

# Restart specific service
docker-compose -f docker-compose.backend-only.yml restart numztrak-fuel-api

# Restart with rebuild
docker-compose -f docker-compose.backend-only.yml restart --build
```

### 8.3 Stop services

```bash
# Stop (doesn't delete data)
docker-compose -f docker-compose.backend-only.yml stop

# Stop and remove containers (keeps volumes)
docker-compose -f docker-compose.backend-only.yml down

# Full cleanup (WARNING: deletes databases!)
docker-compose -f docker-compose.backend-only.yml down -v
```

### 8.4 Backup databases

```bash
# MySQL backup
docker exec numztrak-mysql mysqldump -u traccar -p$MYSQL_PASSWORD traccar > traccar_backup.sql

# PostgreSQL backup
docker exec numztrak-postgres pg_dump -U numztrak numztrak_fuel > fuel_backup.sql

# Copy to local machine
scp ubuntu@your-oracle-ip:~/numztrak/traccar_backup.sql ./
scp ubuntu@your-oracle-ip:~/numztrak/fuel_backup.sql ./
```

### 8.5 Monitor disk space

```bash
# Check disk usage
df -h

# Check Docker volumes
docker volume ls
docker volume inspect numztrak_traccar_mysql_data

# Prune unused resources (be careful!)
docker system prune -a
```

---

## 🚨 Troubleshooting

### Issue: "Unexpected token '<'" in Netlify frontend

**Cause:** Frontend can't reach backend APIs

**Fix:**
```bash
# Verify nginx is running
docker ps | grep nginx

# Check nginx logs
docker logs numztrak-nginx

# Test API from your computer
curl -k https://YOUR_ORACLE_IP/health

# Update .env.production with correct IP/domain
nano traccar-fleet-system/frontend/.env.production
```

### Issue: Containers not starting

**Cause:** Port conflicts or resource limits

**Fix:**
```bash
# Check what's using the ports
sudo netstat -tlnp | grep -E ':(80|443|3001|8082|3306|5432)'

# Stop conflicting services
sudo systemctl stop nginx

# Restart Docker
docker-compose -f docker-compose.backend-only.yml down
docker-compose -f docker-compose.backend-only.yml up -d
```

### Issue: SSL certificate errors

**Cause:** Self-signed cert or expired cert

**Fix:**
```bash
# For development/testing, ignore cert errors:
curl -k https://localhost/health  # -k = insecure

# For production, use Let's Encrypt (see Step 4.3)

# Check cert expiration
openssl x509 -in cert.pem -text -noout | grep -A 2 "Validity"
```

### Issue: Database connection errors

**Cause:** Services starting before databases are ready

**Fix:**
```bash
# Wait 30-60 seconds for databases to fully initialize
sleep 60

# Check health
docker-compose -f docker-compose.backend-only.yml ps

# Restart services
docker-compose -f docker-compose.backend-only.yml restart

# Check logs
docker logs numztrak-fuel-api
docker logs numztrak-traccar
```

---

## 📞 Support

If you encounter issues:

1. **Check logs:** `docker logs <container-name>`
2. **Test connectivity:** `curl -k https://YOUR_IP/health`
3. **Verify config:** Check `.env` for correct passwords
4. **Check firewall:** Ensure ports 80, 443 are open on Oracle
5. **Review GitHub issues:** https://github.com/Numzn/NUMZGPS/issues

---

## 🎉 You're Done!

Your backend is now running on Oracle Cloud, and your Netlify frontend can call the APIs securely over HTTPS.

**Next steps:**
- ✅ Monitor service health via health endpoints
- ✅ Set up automated backups
- ✅ Configure DNS domain (optional, for cleaner URLs)
- ✅ Monitor costs in Oracle Cloud Console

Enjoy! 🚀
