# Vercel Deployment Guide for Demo Site

## 🚀 Quick Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from your project directory
```bash
cd /workspaces/Wealth-Wars/apps/web

# Deploy with demo environment
vercel --prod --env NEXT_PUBLIC_DEMO_ONLY=true --env NEXT_PUBLIC_DEMO_URL=https://demo-wealthwars.vercel.app
```

### Step 4: Set up Custom Domain
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain: `demo.wealthwars.io`
5. Vercel will provide DNS instructions

### Step 5: Configure DNS (at your domain provider)
```
Type: CNAME
Name: demo
Target: cname.vercel-dns.com
TTL: 300
```

## 🔧 Environment Variables in Vercel Dashboard
Go to Settings → Environment Variables and add:
- `NEXT_PUBLIC_DEMO_ONLY` = `true`
- `NEXT_PUBLIC_DEMO_URL` = `https://demo.wealthwars.io`
- `NEXT_PUBLIC_SITE_NAME` = `Wealth Wars Demo`

## ✅ Result
Your demo site will be live at:
- Temporary: `https://your-project.vercel.app`
- Custom: `https://demo.wealthwars.io`
