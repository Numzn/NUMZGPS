# Frontend Deployment Guide

Options for deploying the NumzTrak frontend when backend is on OCI.

## Option 1: OCI Object Storage + CDN (Recommended)

Best for production with low latency and cost.

### Prerequisites

- OCI account with Object Storage access
- OCI CLI installed (optional, can use Console)
- Domain name for CDN

### Steps

#### 1. Build Frontend Locally

```bash
cd traccar-fleet-system/frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://your-backend-domain.com
VITE_FUEL_API_URL=https://your-backend-domain.com/fuel-api
VITE_SOCKET_URL=wss://your-backend-domain.com
EOF

# Install dependencies and build
npm install
npm run build
```

#### 2. Upload to OCI Object Storage

**Using OCI Console:**

1. Go to Object Storage → Create Bucket
2. Name: `numztrak-frontend`
3. Upload all files from `dist/` folder
4. Set public access if needed

**Using OCI CLI:**

```bash
# Install OCI CLI (if not installed)
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure OCI CLI
oci setup config

# Upload files
oci os object put \
  --bucket-name numztrak-frontend \
  --file dist/index.html \
  --name index.html \
  --content-type text/html

# Upload entire directory (using sync)
# Note: OCI CLI doesn't have sync, so upload files individually or use a script
```

#### 3. Configure OCI CDN

1. Go to Networking → CDN
2. Create CDN Distribution
3. Origin: Your Object Storage bucket
4. Domain: Your custom domain
5. Enable HTTPS
6. Configure caching rules

#### 4. Configure CORS (if needed)

In Object Storage bucket settings:
- Add CORS rule to allow your backend domain
- Allow methods: GET, HEAD, OPTIONS
- Allow headers: Content-Type, Authorization

### Cost Estimate

- Object Storage: ~$0.0255/GB/month
- CDN: ~$0.0085/GB transfer
- Total: ~$3-5/month for typical usage

---

## Option 2: Same Server (Nginx)

Simplest setup, good for testing or small deployments.

### Steps

#### 1. Build Frontend on Server

```bash
cd ~/NUMZGPS/traccar-fleet-system/frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=http://$(hostname -I | awk '{print $1}'):8082
VITE_FUEL_API_URL=http://$(hostname -I | awk '{print $1}'):3001
VITE_SOCKET_URL=ws://$(hostname -I | awk '{print $1}'):8082
EOF

npm install
npm run build
```

#### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/numztrak-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/numztrak;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Fuel API
    location /fuel-api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. Deploy Files

```bash
# Create directory
sudo mkdir -p /var/www/numztrak

# Copy build files
sudo cp -r dist/* /var/www/numztrak/

# Set permissions
sudo chown -R www-data:www-data /var/www/numztrak
sudo chmod -R 755 /var/www/numztrak

# Enable site
sudo ln -s /etc/nginx/sites-available/numztrak-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 3: Netlify

Easy deployment with great developer experience.

### Steps

#### 1. Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend-domain.com"
  VITE_FUEL_API_URL = "https://your-backend-domain.com/fuel-api"
  VITE_SOCKET_URL = "wss://your-backend-domain.com"
```

#### 2. Deploy

**Option A: Git Integration (Recommended)**

1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `traccar-fleet-system/frontend/dist`
4. Add environment variables in Netlify dashboard
5. Deploy automatically on push

**Option B: Netlify CLI**

```bash
cd traccar-fleet-system/frontend
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Configure CORS on Backend

Update your backend to allow Netlify domain:

```javascript
// In your backend CORS configuration
const allowedOrigins = [
  'https://your-netlify-app.netlify.app',
  'https://yourdomain.com'
];
```

---

## Option 4: Vercel

Similar to Netlify, great for React apps.

### Steps

#### 1. Create `vercel.json`

```json
{
  "buildCommand": "cd traccar-fleet-system/frontend && npm run build",
  "outputDirectory": "traccar-fleet-system/frontend/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-domain.com",
    "VITE_FUEL_API_URL": "https://your-backend-domain.com/fuel-api",
    "VITE_SOCKET_URL": "wss://your-backend-domain.com"
  }
}
```

#### 2. Deploy

```bash
npm install -g vercel
cd traccar-fleet-system/frontend
vercel
```

---

## Option 5: Cloudflare Pages

Excellent global CDN, free tier available.

### Steps

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `cd traccar-fleet-system/frontend && npm run build`
3. Build output directory: `traccar-fleet-system/frontend/dist`
4. Add environment variables
5. Deploy

---

## Environment Variables

All deployment options require these environment variables:

```env
VITE_API_URL=https://your-backend-domain.com
VITE_FUEL_API_URL=https://your-backend-domain.com/fuel-api
VITE_SOCKET_URL=wss://your-backend-domain.com
```

**Important:** 
- Use `https://` for production (not `http://`)
- Use `wss://` for WebSocket (not `ws://`)
- Replace `your-backend-domain.com` with your actual OCI backend domain/IP

## Comparison

| Option | Cost | Setup | Latency | Best For |
|--------|------|-------|---------|----------|
| OCI Object Storage + CDN | Low | Medium | Lowest | Production, same cloud |
| Same Server (Nginx) | Free | Easy | Low | Testing, small scale |
| Netlify | Free tier | Easy | Good | Quick deployment |
| Vercel | Free tier | Easy | Good | React apps |
| Cloudflare Pages | Free tier | Easy | Excellent | Global audience |

## Recommendation

**For OCI backend deployment:**
1. **Production:** OCI Object Storage + CDN (best integration, lowest latency)
2. **Testing/Development:** Same Server with Nginx (simplest)
3. **Quick Setup:** Netlify or Cloudflare Pages (easiest)

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure your backend allows the frontend domain:

```javascript
// Backend CORS configuration
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'https://your-netlify-app.netlify.app'
  ],
  credentials: true
}));
```

### WebSocket Connection Issues

- Ensure WebSocket URL uses `wss://` (not `ws://`) for HTTPS
- Check backend WebSocket configuration
- Verify firewall allows WebSocket connections

### API 404 Errors

- Check API URL in environment variables
- Verify backend is running and accessible
- Check Nginx proxy configuration (if using)

