# Wealth Wars - Current Alpha
**Gamified Financial Literacy Platform on Solana Blockchain**

Build your financial empire through engaging daily work mechanics that naturally teach real-world financial concepts. Wealth Wars combines premium gaming experiences with inherent financial education through meaningful daily actions.

## 📚 **Project Documentation**

### **Core Documents**
- 📖 **[Whitepaper](./wiki-content/Whitepaper.md)** - Complete project vision, mechanics, and tokenomics
- 💰 **[Tokenomics Analysis](./TOKENOMICS.md)** - Economic model and revenue projections  
- 🛣️ **[Technical Roadmap](./wiki-content/Development-Roadmap.md)** - Development phases and implementation strategy
- 📋 **[Session Summary](./SESSION_SUMMARY.md)** - Development history and feature evolution
- 🎨 **[Art & Motion Bible](./ART_MOTION_BIBLE.md)** - Neo‑Pixel visual + animation standards, tokens, FX roadmap

### **Quick Links**
- 🎮 **Game**: `/game` - Daily work system with business empire building
- 📊 **Forbes List**: `/forbes` - Global leaderboard and player profiles
- ℹ️ **About**: `/about` - Project information and navigation

## 🌟 Current Alpha Features

### **Premium Dark Theme with Gold Borders**
- **Elegant Gold Accents**: Consistent #ffd700 gold borders throughout the interface
- **Dark Theme**: Professional slate gray backgrounds with excellent contrast
- **Premium Feel**: Gold-tinted shadows and hover effects for luxury gaming experience
- **Visual Hierarchy**: Gold borders clearly distinguish interactive elements

### **Daily Work System & Tokenomics**
- **Credit Balance**: Clean credit accumulation with meaningful work actions
- **Daily Work Actions**: Single powerful work action per day with 24-hour cooldown
- **Work Value Growth**: Work becomes more valuable with streak bonuses and business multipliers
- **Frequency Unlocks**: Progress from 24h → 18h → 12h → 8h → 6h work cooldowns
- **Business Multipliers**: Businesses multiply work effectiveness (not just passive income)
- **Token Integration**: Strategic credit-to-$WEALTH conversion system with premium business purchases requiring $WEALTH

### **Business Empire Building**
- **Premium Businesses**: Purchase advanced businesses with $WEALTH tokens for enhanced work multipliers
- **Automation Factory**: Advanced facility that reduces work cooldowns dramatically (500 $WEALTH)
- **Investment Bank**: Financial institution providing compound interest on $WEALTH holdings (600 $WEALTH)
- **Security Firm**: Protection services defending against hostile takeovers (250 $WEALTH)
- **Progressive Investment**: Each business purchase multiplies work effectiveness
- **Strategic Portfolio**: Manage business slots and synergy bonuses for maximum efficiency

### **Treasury & Token Swap System**
- **Dual Mode Operation**: Demo mode for testing, Solana mode for real transactions
- **Credit ↔ $WEALTH Swaps**: Bidirectional token conversion through treasury
- **Real-time Rates**: Dynamic exchange rates based on treasury reserves
- **Blockchain Integration**: Full Solana program support when deployed
- **User-Friendly Interface**: Clean swap cards with input validation

### **Forbes List Leaderboard System**
- **Global Rankings**: Track top players by $WEALTH, work actions, and business empire value
- **Interactive Profiles**: Click any player to view detailed business strategies and $WEALTH portfolios
- **Top 3 Podium**: Special highlighting for the highest-performing $WEALTH accumulator
- **Comprehensive Stats**: $WEALTH balance, work actions, streak days, work frequency tiers
- **Business Analysis**: View other players' premium business portfolios and strategies
- **Real-time Activity**: Track when players were last active and their portfolio changes
- **Prestige System**: Long-term progression based on $WEALTH accumulation and clan features
- **Real-time Updates**: Live $WEALTH tracking and automated business collection

### **Technical Architecture**
- **Frontend**: Next.js 15 with React 18, TypeScript, and styled-jsx
- **State Management**: Zustand for efficient game state handling
- **Blockchain**: Solana Web3.js integration for wallet connectivity
- **Responsive Design**: Mobile-first approach with automatic device detection
- **Real-time Systems**: 250ms tick system for smooth progress animations

## 🚀 Quick Start (Current Alpha)

### ⚡ One-Command Setup
```bash
# Clone and start immediately 
git clone https://github.com/SerStakeAlot/Wealth-Wars.git
cd Wealth-Wars
./quick-start.sh
```

### Manual Setup (If Preferred)
```bash
# Clone the current alpha
git clone https://github.com/SerStakeAlot/Wealth-Wars.git
cd Wealth-Wars

# Install and run (everything is pre-configured)
cd apps/web
npm install
npm run dev
```

**🎯 Access the game at: `http://localhost:3000/game`**
**🏆 View leaderboard at: `http://localhost:3000/forbes`**

### Full Solana Integration (Optional)
To enable real blockchain transactions:

```bash
# Automated setup (includes Solana CLI, Anchor, deployment)
./deploy.sh
```

## 💎 Current Alpha Status

### ✅ **Fully Implemented (Ready to Use)**
- **Premium UI**: Gold borders, dark theme, professional styling
- **Game Mechanics**: Business management, asset purchasing, profit tracking  
- **Real-time Systems**: 250ms tick updates, smooth progress animations
- **Responsive Design**: Works perfectly on all devices
- **State Management**: Persistent game state with Zustand
- **Wallet Integration**: Phantom wallet connectivity ready
- **Development Tools**: Auto-deployment scripts and setup automation

### 🔄 **Next Phase Development**
- **Blockchain Deployment**: Full Solana program integration (demo mode ready)
- **Multiplayer Features**: Clan wars and competitive gameplay
- **Advanced Mechanics**: Manager upgrades, milestone bonuses
- **NFT Integration**: Cosmetic items and achievements

### 🎯 **Perfect Starting Point**
This current alpha provides everything you need to:
- Experience the full game interface and mechanics
- Develop new features on a solid foundation  
- Deploy to production when ready
- Showcase the premium game experience to users/investors

## 🎯 Game Modes

### **Play Mode** (`/game`)
- Main business simulation interface with credit-based tokenomics
- Clean card-based layout for business investments and treasury operations
- Real-time credit tracking with streak bonuses
- Integrated treasury system for credit-to-$WEALTH swaps
- Dual mode operation (Demo/Solana) for testing and production

### **Forbes List** (`/forbes`)
- Global leaderboard tracking top players and their strategies
- Interactive player profiles with business empire breakdowns
- Top 3 podium display with special styling
- Comprehensive stats: credits earned, $WEALTH holdings, work actions, streaks, clan affiliations
- Click-to-view detailed player analysis and business portfolios

## 🏗️ Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── game/page.tsx      # Main game interface
│   │   ├── forbes/page.tsx    # Forbes List leaderboard
│   │   ├── lib/
│   │   │   ├── store.ts       # Game state management
│   │   │   ├── types.ts       # TypeScript interfaces
│   │   │   └── balance.ts     # Game calculations
│   │   └── providers/
│   │       └── SolanaProviders.tsx
│   ├── components/
│   │   ├── BusinessRow.tsx    # Business display component
│   │   ├── BulkBar.tsx        # Bottom action bar
│   │   ├── AvatarButton.tsx   # Player avatar menu
│   │   └── MenuSheet.tsx      # Navigation menu
│   └── idl/
│       └── wwars.json         # Solana program IDL
├── public/                    # Static assets
└── package.json

wwars/                          # Solana program
├── programs/wwars/src/         # Rust smart contracts
├── Anchor.toml                 # Anchor configuration
└── Cargo.toml                  # Rust dependencies
```

## 🎨 UI Components

### **BusinessRow Component**
- Progress bar visualization
- Outlet and manager management
- Milestone tracking
- Responsive grid layout

### **BulkBar Component**
- Quantity selection (×1, ×10, ×100)
- Navigation shortcuts
- Fixed bottom positioning

### **AvatarButton Component**
- Player profile access
- Dropdown menu system
- Wallet integration

## 🔧 Game Systems

### **State Management**
```typescript
interface GameState {
  level: number;
  xp: number;
  wealth: number;
  liquidity: number;
  assets: Asset[];
  derived: {
    profitPerSecond: number;
  };
}
```

### **Asset Structure**
```typescript
interface Asset {
  id: string;
  name: string;
  level: number;
  yieldPerTick: number;
  outlets?: number;           // AdCap: multiple instances
  costPerOutlet?: number;     // AdCap: outlet pricing
  cycleMs?: number;           // AdCap: production time
  nextReadyTs?: number;       // AdCap: next collection time
  managerHired?: boolean;     // AdCap: automation flag
  milestones?: number[];      // AdCap: achievement thresholds
  multiplier?: number;        // AdCap: bonus multipliers
}
```

### **Manager System**
- **Hiring**: Toggle automation for individual businesses
- **Auto-Collection**: Automatic profit generation
- **Passive Income**: Contributes to profit-per-second calculations
- **Strategic Choice**: Players decide which businesses to automate

## 🌐 Blockchain Integration

### **Solana Features**
- Wallet connectivity (Phantom)
- Devnet SOL airdrops for testing
- Real-time balance updates
- Transaction confirmations

### **Smart Contracts**
- Asset ownership verification
- Economic warfare mechanics
- Clan system integration
- Achievement tracking

## 📱 Responsive Design

### **Breakpoint Strategy**
- **Mobile** (< 768px): Stacked layout, touch-optimized
- **Tablet** (768px - 1024px): Adaptive spacing
- **Desktop** (> 1024px): Full horizontal layout

### **Device Detection**
- Automatic responsive behavior
- Touch-friendly interactions
- Optimized performance across devices

## 🎯 Development Roadmap

### **Phase 1** ✅ (Current)
- [x] Adventure Capitalist-style interface
- [x] Manager and outlet systems
- [x] Responsive design implementation
- [x] Real-time profit calculations

### **Phase 2** 🔄 (Next)
- [ ] Manager costs and upgrades
- [ ] Advanced milestone system
- [ ] Clan warfare mechanics
- [ ] Multiplayer features

### **Phase 3** 📋 (Future)
- [ ] Cross-chain asset trading
- [ ] NFT integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by *Adventure Capitalist* business simulation mechanics
- Built with Next.js, React, and Solana
- Community-driven development approach

---

**🎮 Ready to experience the premium Wealth Wars alpha? Just run `npm run dev` and visit [localhost:3000/game](http://localhost:3000/game)!**

## 🏆 Why This Alpha Stands Out

### **Professional Quality UI**
- **Gold Standard Design**: Carefully crafted gold borders (#ffd700) create a premium, luxury feel
- **Adventure Capitalist Inspiration**: Vertical business layout with clean progress tracking
- **Consistent Theming**: Dark backgrounds with gold accents throughout every component
- **Smooth Interactions**: Real-time animations and hover effects for engaging gameplay

### **Production-Ready Architecture** 
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Zustand state management
- **Responsive Design**: Automatically adapts to desktop, tablet, and mobile devices  
- **Performance Optimized**: 250ms tick system for smooth real-time updates
- **Scalable Structure**: Clean component architecture ready for feature expansion

### **Complete Game Experience**
- **Business Empire Building**: Purchase outlets, hire managers, upgrade assets
- **Real-time Profit Tracking**: Live wealth accumulation with profit-per-second display
- **Interactive Elements**: Gold-bordered buttons, progress bars, and status indicators
- **Wallet Integration**: Phantom wallet support ready for Solana blockchain features

### **Developer Experience**
- **One-Command Setup**: `./deploy.sh` handles all Solana CLI and Anchor installation
- **Hot Reload Development**: Turbopack-powered development server for instant updates
- **Type Safety**: Full TypeScript integration with proper type definitions
- **Clean Architecture**: Well-organized components, hooks, and state management

## 🟩 Pixel UI Migration (Feature Flag)

The new pixel-styled interface (quests, achievements, battle feed, clans, chat) originally available at `/pixel` can now replace the legacy Spark UI at `/game` when you set:

```
NEXT_PUBLIC_PIXEL_UI=1
```

When enabled, `/game` renders `PixelWrapper` which composes:
- `PixelProfileHeader`: Player stats, clan tag, wallet connect placeholder, LIVE status badge.
- `WealthWarsPixelApp`: Core pixel gameplay panels & floating dock.

### LIVE Status Endpoint (Optional)
Add an AWS (or any) health endpoint via:
```
NEXT_PUBLIC_LIVE_STATUS_URL=https://status.example.com/health
```
The header polls every 15s and derives a status:
| Latency/Result | Status |
| -------------- | ------ |
| < 400ms 200 OK | ONLINE |
| < 1500ms or !OK | DEGRADED |
| Timeout / error | OFFLINE |
| No endpoint set | UNKNOWN |

### Wallet Connect Placeholder
`PixelProfileHeader` currently simulates a wallet connect. Replace the stub with your real Solana wallet adapter (e.g. Phantom) inside `apps/web/src/pixel/components/PixelProfileHeader.tsx`.

### Stability Note (React 19)
All pixel selectors are constrained to primitive outputs to satisfy React 19 `getSnapshot` caching. When adding new panels or store slices, avoid returning fresh arrays/objects directly from `useGameStore` selectors—either return a primitive (length, boolean, numeric counter) or derive arrays locally after reading state once.

### Keyboard Shortcuts (Pixel UI)
When the Pixel UI is active, you can toggle panels instantly:

| Key | Panel | Description |
| --- | ----- | ----------- |
| Q | Quests | View active quests & claim rewards |
| A | Achievements | View tiered achievements |
| B | Battle | Open battle feed / attack info |
| C | Clans | Clan panel (invites, membership) |
| T | Chat | Global + clan chat panel |
| H | Help (placeholder) | Shows a toast with shortcut reminder |

Shortcuts are disabled while typing inside inputs / textareas / contenteditable regions and ignore modifier keys.

### Chat Unread Badges & Persistence
Unread counts are tracked for both global and clan chat:
* Store fields: `lastSeenGlobalChatCount` and `lastSeenClanChatCounts[clanId]`.
* Opening the Chat panel marks messages read (post-render effect to avoid mid-render store updates).
* Dock badges display aggregate unread counts; counts derived as primitives to keep React 19 selectors stable.
* Chat, invites, and unread counters are persisted via Zustand's persist middleware (length-capped lists for memory safety).

### Automatic Clan XP Gain
If a player is in a clan, certain personal progression events contribute to clan XP:
* Manual Work Action: clan gains 20% of the personal XP awarded (minimum 1). Automated manager ticks do not contribute.
* Quest Claim: clan gains 50% of quest XP reward; if XP is 0 but credits awarded, clan gains `max(1, floor(credits / 50))`.
* Leveling & Expansion: Clan leveling threshold = `level * 500` XP; XP rolls over. Every 5 clan levels increases max members by 5 and triggers a notification.

### Live Status Pulse & Health Endpoint
The LIVE badge now includes a pulsing colored indicator:
* Green (ONLINE) < 400ms
* Amber (DEGRADED) < 1500ms or non-200 HTTP
* Red (OFFLINE) timeout / fetch error
* Gray (UNKNOWN) no endpoint configured

Add a quick internal health endpoint (already included):
```
NEXT_PUBLIC_LIVE_STATUS_URL=/api/live-status
```
Or point to an external status service. If left unset you'll see `LIVE UNKNOWN` plus a hint to set the env var.

### Wallet Adapter Integration Notes
`PixelProfileHeader` uses the Solana wallet adapter UI (`WalletMultiButton`). To support more wallets, ensure you configure the providers in `SolanaProviders.tsx` (Phantom, Solflare, Backpack, etc.). Player initialization updates the in-game identity when the public key changes.

### Persistence Overview
Key persisted slices include player core stats, chat, clan invites, unread counters, enhanced businesses, and NPC bots. Avoid persisting transient animation flags to keep local storage light. When adding new state, ensure serializable primitives or concise objects.

### Lint & Type Safety Status
TypeScript passes (`npm run typecheck`). ESLint currently reports a large number of `any` and unused variable warnings from legacy/experimental files; critical new Pixel UI additions (shortcuts, pulse, clan XP) do not introduce type errors. Future cleanup: gradually replace `any` with domain types and remove unused scaffolding.
