# Updating Frontend API Configuration for Production

## 📋 Problem

Your current `vite.config.js` has hardcoded API URLs for Docker:
```javascript
const traccarUrl = isLocalDev ? 'http://localhost:8082' : 'http://traccar-server:8082';
const fuelApiUrl = isLocalDev ? 'http://localhost:3001' : 'http://fuel-api:3001';
```

For **Netlify production**, the frontend needs to call your **Oracle Cloud backend** via HTTPS, not Docker internal URLs.

---

## ✅ Solution

### Option 1: Update vite.config.js to use environment variables (Recommended)

Replace the hardcoded URLs with environment variable references:

**File:** `traccar-fleet-system/frontend/vite.config.js`

```javascript
// Line 16-17 (replace this)
const traccarUrl = isLocalDev ? 'http://localhost:8082' : 'http://traccar-server:8082';
const fuelApiUrl = isLocalDev ? 'http://localhost:3001' : 'http://fuel-api:3001';

// With this:
const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost';
const traccarUrl = isLocalDev ? 'http://localhost:8082' : `${apiBaseUrl}/api/traccar`;
const fuelApiUrl = isLocalDev ? 'http://localhost:3001' : `${apiBaseUrl}/api/fuel`;
```

---

### Option 2: Create separate config for production

Add a build-time environment check:

```javascript
// Check if building for production (Netlify)
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost';

const traccarUrl = isProd 
  ? `${apiBaseUrl}/api/traccar` 
  : (isLocalDev ? 'http://localhost:8082' : 'http://traccar-server:8082');

const fuelApiUrl = isProd 
  ? `${apiBaseUrl}/api/fuel` 
  : (isLocalDev ? 'http://localhost:3001' : 'http://fuel-api:3001');
```

---

## 🔧 Update Frontend Environment Files

### For Local Development (unchanged)
**File:** `traccar-fleet-system/frontend/.env.local`
```
LOCAL_DEV=true
```

### For Docker Development
**File:** `traccar-fleet-system/frontend/.env.docker`
```
LOCAL_DEV=false
```

### For Netlify Production (NEW)
**File:** `traccar-fleet-system/frontend/.env.production`
```
VITE_API_BASE_URL=https://your-oracle-public-ip-or-domain
VITE_LOCAL_DEV=false
```

---

## 🚀 How It Works

### Local Development
```
Frontend (localhost:3002)
  → vite.config.js checks LOCAL_DEV=true
  → Uses http://localhost:8082 (Docker or local backend)
```

### Docker Development
```
Frontend container (3002)
  → vite.config.js checks LOCAL_DEV=false
  → Uses http://traccar-server:8082 (Docker network)
```

### Netlify Production
```
Frontend (Netlify)
  → vite.config.js checks NODE_ENV=production
  → Uses VITE_API_BASE_URL env var
  → Routes to https://your-oracle-ip/api/traccar, /api/fuel
```

---

## 📝 Complete Updated vite.config.js Section

Replace lines 1-35 in your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  // Allow configurable HMR host for mobile device access
  const hmrHost = process.env.VITE_HMR_EXTERNAL || process.env.VITE_HMR_HOST || 'localhost';
  const hmrPort = process.env.VITE_HMR_PORT || 3002;

  // Detect environment
  const isLocalDev = process.env.LOCAL_DEV === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost';

  // Determine backend URLs
  let traccarUrl, fuelApiUrl;
  
  if (isProd) {
    // Production (Netlify)
    traccarUrl = `${apiBaseUrl}/api/traccar`;
    fuelApiUrl = `${apiBaseUrl}/api/fuel`;
    console.log('🌐 [Vite] Running in PRODUCTION mode (Netlify)');
    console.log(`   API Base: ${apiBaseUrl}`);
  } else if (isLocalDev) {
    // Local development
    traccarUrl = 'http://localhost:8082';
    fuelApiUrl = 'http://localhost:3001';
    console.log('🔧 [Vite] Running in LOCAL development mode');
    console.log(`   Traccar: ${traccarUrl}`);
    console.log(`   Fuel API: ${fuelApiUrl}`);
  } else {
    // Docker development
    traccarUrl = 'http://traccar-server:8082';
    fuelApiUrl = 'http://fuel-api:3001';
    console.log('🐳 [Vite] Running in DOCKER mode');
    console.log(`   Traccar: ${traccarUrl}`);
    console.log(`   Fuel API: ${fuelApiUrl}`);
  }

  return {
    // ... rest of config
  };
});
```

---

## 🔄 How to Deploy

### 1. Update vite.config.js locally
```bash
cd traccar-fleet-system/frontend
# Edit vite.config.js with the changes above
```

### 2. Create .env.production
```bash
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://your-oracle-public-ip-or-domain
EOF
```

### 3. Test locally with .env.production
```bash
# Set NODE_ENV to production (not recommended for local testing)
# Instead, just verify the config is correct

# View the logs when building:
npm run build
# Should show: "Running in PRODUCTION mode (Netlify)"
```

### 4. Commit and push
```bash
git add traccar-fleet-system/frontend/vite.config.js
git add traccar-fleet-system/frontend/.env.production
git commit -m "Configure production API URLs for Netlify deployment"
git push origin main
```

### 5. Redeploy Netlify
- Go to Netlify Dashboard
- Click "Trigger Deploy" → "Clear cache and deploy site"
- Frontend will build with `NODE_ENV=production`
- Will use `VITE_API_BASE_URL` from `.env.production`
- Will call your Oracle backend APIs

---

## ✅ Verification Checklist

After updating and deploying:

- [ ] vite.config.js updated with environment-based routing
- [ ] .env.production created with correct Oracle IP/domain
- [ ] Changes committed and pushed to main branch
- [ ] Netlify triggered a new deploy
- [ ] Build logs show "PRODUCTION mode"
- [ ] Frontend loads without errors
- [ ] Browser console shows API calls to your Oracle IP (not localhost)
- [ ] Login works with Traccar credentials
- [ ] Fuel requests load and display

---

## 🆘 Debug Tips

If APIs still don't connect after updating:

### Check build environment
```bash
# Netlify build logs should show:
# "🌐 [Vite] Running in PRODUCTION mode (Netlify)"
# "API Base: https://your-ip"
```

### Verify env variable in Netlify
```
Netlify Dashboard → Site Settings → Build & Deploy → Environment
Should have: VITE_API_BASE_URL=https://your-oracle-ip
```

### Test API from browser console
```javascript
// Open browser DevTools (F12) → Console
fetch('https://your-oracle-ip/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

### Check Network tab
```
DevTools → Network tab
Filter for API calls
Should see: https://your-oracle-ip/api/...
NOT: http://localhost or http://traccar-server
```

---

## 📊 Before vs After

**Before (broken on Netlify):**
```
Netlify Frontend → calls http://localhost:8082 → FAILS (localhost doesn't exist)
```

**After (working on Netlify):**
```
Netlify Frontend → calls https://your-oracle-ip/api/traccar → ✅ SUCCESS
```

---

Done! Your frontend will now properly connect to your Oracle Cloud backend. 🎉
