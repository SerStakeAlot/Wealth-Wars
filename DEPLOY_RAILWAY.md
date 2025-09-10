# Railway Deployment Guide

## 🚂 Railway Deployment (Simple & Fast)

### Step 1: One-Click Deploy
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Connect your repository
4. Select the `apps/web` folder as root

### Step 2: Environment Variables
Add in Railway dashboard:
```
NEXT_PUBLIC_DEMO_ONLY=true
NEXT_PUBLIC_DEMO_URL=https://demo.wealthwars.io
NODE_ENV=production
```

### Step 3: Custom Domain
1. Go to Settings > Domains
2. Add custom domain: `demo.wealthwars.io`
3. Update your DNS:
```
Type: CNAME
Name: demo
Target: your-project.railway.app
```

### Step 4: Deploy Commands
```bash
# Or deploy via CLI
npm install -g @railway/cli
railway login
railway link
railway up
```

## ✨ Benefits
- Free tier available
- Automatic HTTPS
- Git-based deployment
- Built-in monitoring
