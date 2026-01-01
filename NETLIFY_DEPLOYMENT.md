# 🚀 Netlify Frontend Deployment Guide

## 📋 Configuration Complete!

Your frontend is now configured to use the domain-shared backend:

### ✅ **Files Updated:**
- `traccar-fleet-system/frontend/.env.production` → Backend URL: `https://api.numz.site`
- `netlify.toml` → Deployment configuration with security headers

### 🌐 **Domain Structure:**
- **Backend**: `https://api.numz.site` (Oracle Cloud) ✅ Working
- **Frontend**: `https://app.numz.site` (Netlify) 🔧 Ready to deploy

---

## 🚀 **Deployment Steps:**

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Configure frontend for domain sharing with api.numz.site"
git push origin main
```

### 2. **Deploy to Netlify**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. **Import from Git** → Select your GitHub repo
3. **Build settings** (should auto-detect from netlify.toml):
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Base directory: `traccar-fleet-system/frontend`

### 3. **Configure Custom Domain**
1. In Netlify dashboard → **Domain management**
2. **Add custom domain**: `app.numz.site`
3. Netlify will show DNS instructions
4. **Add CNAME record** in Hostinger DNS:
   ```
   Type: CNAME
   Name: app
   Value: <your-netlify-site>.netlify.app
   ```

### 4. **Enable HTTPS**
- Netlify will automatically provision SSL certificate for `app.numz.site`
- Force HTTPS redirect in Netlify settings

---

## 🔧 **Expected Result:**

After deployment:
- **Frontend**: `https://app.numz.site` → Netlify-hosted React app
- **Backend**: `https://api.numz.site` → Oracle Cloud APIs
- **Communication**: Frontend makes CORS-enabled requests to backend APIs

---

## 🧪 **Testing After Deployment:**

1. **Visit**: `https://app.numz.site`
2. **Check API connectivity** in browser DevTools → Network tab
3. **Verify requests go to**: `https://api.numz.site/api/*`

---

## 🎯 **Domain Sharing Complete!**

Both platforms now share the `numz.site` domain:
- ✅ **Oracle Cloud** → `api.numz.site` (Backend APIs)
- 🚀 **Netlify** → `app.numz.site` (Frontend React App)

Ready to deploy? Run the git commands above to push your changes!