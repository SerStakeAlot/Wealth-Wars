# 🎮 Wealth Wars Demo Mode

A fully playable demo version of Wealth Wars with fake wealth and competitive features.

## 🌟 Features

### 🚀 **Instant Start**
- Start with **1000 $WEALTH** immediately
- No wallet connection required
- No real money involved

### ⚡ **Fast-Paced Gameplay**
- **5-minute work cooldowns** (vs 4 hours in main game)
- **30-minute attack cooldowns** (vs 1 hour+ in main game)
- **2x credit multiplier** for faster progression
- Auto-refilling treasury for seamless conversions

### 🏆 **Live Competition**
- **Real-time leaderboard** with up to 20 players
- **Multiple ranking categories**: Wealth, Businesses, Battles Won, Work Sessions
- **Live rank tracking** - see your position update instantly
- **Competitive atmosphere** with other demo players

### 🎯 **Complete Game Features**
- Full business empire building system
- Tiered battle system with wealth assaults and land sieges
- Shield defense mechanisms
- Treasury credit-to-wealth conversion
- All enhanced businesses available for purchase

### 📊 **Session Management**
- **24-hour demo sessions** with auto-reset
- **Progress saving** in browser storage
- **Session restoration** if you return within 24 hours
- **Reset capability** to start fresh anytime

## 🎮 How to Play

### Starting Your Demo
1. Visit `/demo` or click "TRY DEMO" from the homepage
2. Enter a player name (3-15 characters)
3. Click "Start Demo" to begin with 1000 $WEALTH
4. Jump into the game immediately!

### Demo Game Flow
1. **Work for Credits**: Click work every 5 minutes to earn credits
2. **Convert to Wealth**: Use the treasury to convert 100 credits → 1 $WEALTH
3. **Buy Businesses**: Purchase enhanced businesses to boost earnings
4. **Battle Players**: Attack other demo players for wealth (every 30 minutes)
5. **Climb Rankings**: Compete on the live leaderboard

### Accessing the Demo Game
- **Demo Lobby**: `/demo` - View rankings, manage session, start/reset
- **Demo Game**: `/game?demo=true` - Full game interface in demo mode
- **Return to Lobby**: Click the demo banner in-game to return to lobby

## 🔧 Technical Details

### Demo vs Main Game
| Feature | Demo Mode | Main Game |
|---------|-----------|-----------|
| Starting Wealth | 1000 $WEALTH | 0 $WEALTH |
| Work Cooldown | 5 minutes | 4 hours |
| Attack Cooldown | 30 minutes | 1+ hours |
| Credit Multiplier | 2x | 1x |
| Treasury | Auto-refilling fake treasury | Real Solana treasury |
| Progress | Browser storage (24h) | Blockchain/database |
| Competition | Demo players only | All players |

### Demo Configuration
Located in `src/app/lib/demo-config.ts`:

```typescript
export const DEMO_CONFIG = {
  STARTING_WEALTH: 1000,
  STARTING_CREDITS: 50,
  STARTING_LAND_NFTS: 1,
  
  WORK_ADJUSTMENTS: {
    workCooldown: 5 * 60 * 1000, // 5 minutes
    creditMultiplier: 2
  },
  
  BATTLE_ADJUSTMENTS: {
    reducedCooldowns: true,
    standardCooldown: 30 * 60 * 1000 // 30 minutes
  },
  
  SESSION: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    canReset: true
  }
}
```

## 🏗️ Architecture

### Key Components

#### **Demo Store** (`demo-store.ts`)
- Zustand state management for demo game
- Separate from main game store
- Handles demo-specific logic and persistence

#### **Demo Configuration** (`demo-config.ts`)
- Centralized demo settings
- Easy adjustment of demo parameters
- Player name generation utilities

#### **Demo Leaderboard** (`DemoLeaderboard.tsx`)
- Real-time competitive rankings
- Multiple sorting options
- Compact and full views

#### **Demo Entry Page** (`/demo/page.tsx`)
- Player onboarding
- Session management
- Leaderboard preview

### Game Integration

#### **Game Page Modifications** (`/game/page.tsx`)
- URL parameter detection (`?demo=true`)
- Demo state integration
- Demo-specific UI elements
- Compatibility layer between demo and main game

#### **Demo Banner**
- Prominent demo mode indicator
- Quick access to lobby and reset
- Real-time rank display

## 🎯 Use Cases

### 🧪 **Testing & Development**
- Test game mechanics without blockchain complexity
- Rapid iteration on gameplay features
- Safe environment for experimenting with strategies

### 👥 **User Onboarding**
- Let new users experience the full game immediately
- No wallet setup or transaction fees required
- Risk-free learning environment

### 🏁 **Competitions & Events**
- Host short competitive sessions
- Level playing field with equal starting wealth
- Fast-paced gameplay for events

### 📱 **Demonstrations**
- Show game features to investors or partners
- Demo at conferences or meetups
- Social media content creation

## 🔮 Future Enhancements

### 🌐 **Multiplayer Sync**
- Real-time multiplayer battles
- Synchronized leaderboards across users
- WebSocket connections for live updates

### 🎉 **Tournament Mode**
- Scheduled competitive sessions
- Prizes and rewards for top players
- Bracket-style competitions

### 📊 **Enhanced Analytics**
- Detailed demo session analytics
- Player behavior tracking
- Performance optimization insights

### 🎨 **Customization**
- Different demo scenarios (themes)
- Variable starting conditions
- Custom game rules per session

## 💡 Tips for Players

### 🚀 **Quick Start Strategy**
1. **Work immediately** to get your first credits
2. **Convert credits to wealth** as soon as you have 100+
3. **Buy your first business** (Pizza Stand - 50 wealth)
4. **Work again** with business bonus for more credits
5. **Continue expanding** and **attack other players**

### 🏆 **Competitive Tips**
- **Check leaderboard frequently** to track your rank
- **Time your attacks** when cooldowns reset
- **Balance offense and defense** - buy shields when needed
- **Focus on business expansion** early for sustained growth
- **Monitor other players' wealth** to choose optimal targets

### ⏰ **Time Management**
- **Set reminders** for work cooldowns (5 minutes)
- **Plan attack windows** (30 minutes)
- **Check in regularly** to maintain competitive edge
- **Use session time efficiently** (24-hour limit)

---

**Ready to dominate the demo arena? Start your competitive journey at `/demo`!** 🎮💰🏆
