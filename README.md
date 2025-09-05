# Wealth Wars - Current Alpha
**The premium financial strategy game on Solana blockchain**

Build your financial empire, wage economic wars, and dominate the markets with elegant gold-bordered interfaces and Adventure Capitalist-style gameplay mechanics.

## � Current Alpha Features

### **Premium Dark Theme with Gold Borders**
- **Elegant Gold Accents**: Consistent #ffd700 gold borders throughout the interface
- **Dark Theme**: Professional slate gray backgrounds with excellent contrast
- **Premium Feel**: Gold-tinted shadows and hover effects for luxury gaming experience
- **Visual Hierarchy**: Gold borders clearly distinguish interactive elements

### **Adventure Capitalist-Style Business Management**
- **Vertical Business Layout**: Clean, organized business rows with progress tracking
- **Outlet System**: Purchase multiple instances of each business for exponential growth
- **Manager System**: Hire managers for automated collection and passive income
- **Milestone Bonuses**: Achievement system with profit multipliers at key thresholds
- **Bulk Buying**: Efficient purchasing with ×1, ×10, ×100 quantity selectors

### **Core Gameplay Mechanics**
- **Asset Management**: Build and upgrade various business assets
- **Economic Warfare**: Strategic takeovers and defense systems
- **Liquidity Management**: Balance risk and reward in asset conditions
- **Prestige System**: Long-term progression and clan features
- **Real-time Updates**: Live profit tracking and automated collection

### **Technical Architecture**
- **Frontend**: Next.js 15 with React 18, TypeScript, and styled-jsx
- **State Management**: Zustand for efficient game state handling
- **Blockchain**: Solana Web3.js integration for wallet connectivity
- **Responsive Design**: Mobile-first approach with automatic device detection
- **Real-time Systems**: 250ms tick system for smooth progress animations

## 🚀 Quick Start (Current Alpha)

### Ready to Play Immediately
The current alpha is fully configured and ready to run with all the premium styling and features from this development session.

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
- Main business simulation interface
- Adventure Capitalist-style vertical layout
- Real-time profit tracking and automation
- Manager hiring and outlet purchasing

### **Trade Mode** (`/trade`)
- Asset trading and marketplace
- Economic analysis tools
- Strategic investment opportunities

## 🏗️ Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── game/page.tsx      # Main game interface
│   │   ├── trade/page.tsx     # Trading interface
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
