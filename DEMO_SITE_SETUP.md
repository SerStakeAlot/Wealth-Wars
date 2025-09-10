# 🌐 Demo Site Setup Guide

## Overview
Set up a demo-only version of Wealth Wars at `demo.wealthwars.io` where users can only access the demo mode.

## 🎯 Demo Site Features

### 🎮 **Demo-Only Experience**
- Homepage redirects users to demo mode
- Main game button leads to `/demo` instead of `/game`
- Wallet features are hidden
- Demo site indicator in top-right corner

### ⚡ **7-Day Competition Sessions**
- Extended 7-day demo sessions (up from 24 hours)
- Competitive leaderboards
- Automatic session management

### 🏆 **Enhanced Competition**
- Live leaderboard with 15-second updates
- Up to 50 players shown on leaderboard
- Bot players participate in competition
- Real-time rank tracking

## 🚀 Deployment Options

### Option 1: Vercel with Custom Domain

1. **Configure Environment**:
   ```bash
   # Copy demo environment
   cp .env.demo .env.local
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy with demo environment
   vercel --prod --env NEXT_PUBLIC_DEMO_ONLY=true
   ```

3. **Set Custom Domain**:
   - In Vercel dashboard, go to your project
   - Settings → Domains
   - Add `demo.wealthwars.io`
   - Configure DNS: `CNAME demo 76.76.19.61` (Vercel's IP)

### Option 2: Netlify Deployment

1. **Build for Demo**:
   ```bash
   cp .env.demo .env.local
   npm run build
   ```

2. **Deploy**:
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=.next
   ```

3. **Configure Custom Domain**:
   - Netlify dashboard → Domain settings
   - Add custom domain `demo.wealthwars.io`

### Option 3: Custom Server (Docker)

1. **Create Dockerfile for Demo**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   ENV NEXT_PUBLIC_DEMO_ONLY=true
   ENV NEXT_PUBLIC_DEMO_URL=https://demo.wealthwars.io
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy**:
   ```bash
   docker build -t wealth-wars-demo .
   docker run -d -p 3000:3000 --name demo-site wealth-wars-demo
   ```

### Option 4: Use Deployment Script

```bash
# Make script executable
chmod +x deploy-demo.sh

# Run deployment
./deploy-demo.sh
```

## ⚙️ Configuration

### Environment Variables (.env.demo)
```env
NEXT_PUBLIC_DEMO_ONLY=true
NEXT_PUBLIC_DEMO_URL=https://demo.wealthwars.io
NEXT_PUBLIC_SITE_NAME="Wealth Wars Demo"
NEXT_PUBLIC_DEMO_SESSION_DAYS=7
NEXT_PUBLIC_LEADERBOARD_REFRESH=15000
NEXT_PUBLIC_MAX_DEMO_PLAYERS=50
```

### DNS Configuration
Set up DNS records for your demo subdomain:

```
Type: CNAME
Name: demo
Value: [your-deployment-url]
TTL: 300
```

## 🎮 User Experience Flow

### Landing on Demo Site
1. User visits `demo.wealthwars.io`
2. Sees homepage with "DEMO SITE" indicator
3. Main "PLAY" button leads to demo mode
4. No wallet connection required

### Demo Session Flow
1. Click "PLAY DEMO" → Goes to `/demo`
2. Enter player name (3-15 characters)
3. Start with 1000 $WEALTH
4. Play full game in demo mode
5. Compete on 7-day leaderboard

### Session Management
- 7-day sessions with browser storage
- Progress saved automatically
- Can reset anytime for fresh start
- Session expires after 7 days

## 🔧 Technical Details

### Route Overrides
When `NEXT_PUBLIC_DEMO_ONLY=true`:
- `/` → Shows demo-focused homepage
- `/game` → Redirects to `/game?demo=true`
- Main nav redirects to demo mode

### Feature Toggles
- Wallet UI: Hidden on demo site
- Blockchain features: Disabled
- Demo indicators: Always visible
- Leaderboard: Enhanced refresh rate

### State Management
- Demo store (`demo-store.ts`): Separate from main game
- Browser localStorage: 7-day session persistence  
- Leaderboard sync: Mock multiplayer competition

## 📊 Monitoring & Analytics

### Demo Site Metrics
- Track demo session starts
- Monitor leaderboard engagement
- Session completion rates
- User retention (return visits)

### Performance
- Faster leaderboard updates (15s vs 30s)
- Optimized for mobile users
- Progressive loading for better UX

## 🔒 Security & Limitations

### Demo Site Security
- No real money transactions
- Isolated from main game data
- Browser-only persistence
- No sensitive data collection

### Limitations
- Sessions reset after 7 days
- Progress not transferable to main game
- Limited to demo features only
- No blockchain integration

## 🎯 Marketing & Promotion

### Demo Site Benefits
- **Zero friction**: No wallet setup required
- **Instant gratification**: 1000 $WEALTH to start
- **Social proof**: Live competitive leaderboard
- **FOMO**: 7-day competitive seasons

### Call-to-Action Flow
1. **Hook**: "Try Wealth Wars with 1000 $WEALTH"
2. **Engage**: Competitive 7-day leaderboard
3. **Convert**: Link to main game after demo experience

## 🚀 Quick Setup Commands

```bash
# 1. Configure demo environment
cp .env.demo .env.local

# 2. Test locally
npm run dev
# Visit http://localhost:3000 with DEMO_ONLY=true

# 3. Deploy (choose your method)
./deploy-demo.sh  # Automated script
# OR
vercel --prod --env NEXT_PUBLIC_DEMO_ONLY=true
# OR  
netlify deploy --prod --dir=.next

# 4. Configure DNS
# Point demo.wealthwars.io to your deployment
```

## 🎮 Demo Site URL Structure

- `demo.wealthwars.io` → Demo homepage
- `demo.wealthwars.io/demo` → Demo lobby & leaderboard  
- `demo.wealthwars.io/game?demo=true` → Demo game

---

**🎯 Result**: A completely separate demo site where users can only access the competitive demo mode, perfect for onboarding and showcasing the game!
