# Netlify Deployment Guide for Demo Site

## 🌐 Netlify Deployment (Great for Static Sites)

### Step 1: Build Your Project
```bash
cd /workspaces/Wealth-Wars/apps/web

# Set demo environment
export NEXT_PUBLIC_DEMO_ONLY=true
export NEXT_PUBLIC_DEMO_URL=https://demo-wealthwars.netlify.app

# Build
npm run build
npm run export  # If you want static export
```

### Step 2: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=out  # or --dir=.next for server-side
```

### Step 3: Configure Environment Variables
In Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_DEMO_ONLY` = `true`
   - `NEXT_PUBLIC_DEMO_URL` = `https://demo.wealthwars.io`

### Step 4: Custom Domain
1. Netlify Dashboard → Domain Settings
2. Add custom domain: `demo.wealthwars.io`
3. Configure DNS at your provider:
```
Type: CNAME
Name: demo
Target: your-site.netlify.app
```

## 🔄 Auto-Deploy from GitHub
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next` or `out`
4. Add environment variables in Netlify dashboard
