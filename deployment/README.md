# Deployment Scripts

Scripts and guides for deploying NumzTrak to Oracle Cloud Infrastructure (OCI).

## Essential Files

- **`oci-server-setup.sh`** - Initial server setup (Docker, Node.js, firewall, etc.)
- **`oci-deploy.sh`** - Deploy backend services to OCI
- **`deploy-backend-only-final.sh`** - Complete backend-only deployment (recommended)
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment documentation
- **`BACKEND_ONLY_DEPLOYMENT.md`** - Backend-only deployment guide
- **`FRONTEND_DEPLOYMENT.md`** - Frontend deployment options

## Quick Start

### Quick Deployment (Recommended)

```bash
# From project root using Git Bash
bash deployment/deploy-backend-only-final.sh
```

Or with custom parameters:
```bash
bash deployment/deploy-backend-only-final.sh 129.151.163.95 ~/.ssh/oci_instance_key ubuntu
```

### Manual Deployment

1. **Connect to server:**
   ```bash
   ssh -i ~/.ssh/oci_instance_key ubuntu@129.151.163.95
   ```

2. **Run initial setup:**
   ```bash
   bash deployment/oci-server-setup.sh
   ```

3. **Clone repository:**
   ```bash
   cd ~
   git clone https://github.com/Numzn/NUMZGPS.git
   cd NUMZGPS
   ```

4. **Configure environment:**
   ```bash
   cd backend
   cp env.template .env
   nano .env  # Edit with your production values
   ```

5. **Deploy:**
   ```bash
   cd ~/NUMZGPS
   bash deployment/oci-deploy.sh
   ```

## Documentation

- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions
- See [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) for frontend deployment options

## Requirements

- OCI Ubuntu instance (20.04 or 22.04)
- SSH access with key file
- Git repository access

## Support

For issues, check:
1. Deployment logs: `docker-compose logs`
2. Service status: `docker-compose ps`
3. Documentation in project root

