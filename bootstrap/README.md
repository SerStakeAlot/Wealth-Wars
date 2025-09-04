# Wealth Wars Devnet Bootstrap

This script sets up and demonstrates the Wealth Wars Solana program on devnet.

## 🚀 Quick Start (Demo Mode)

```bash
cd bootstrap
npm install
npm run start
```

This will show you exactly what the setup process looks like without making real transactions.

## 🎯 Real Setup (with Solana CLI)

### 1. Install Solana CLI
```bash
curl -sSfL https://release.solana.com/v1.18.26/install | sh
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 2. Configure for Devnet
```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2
```

### 3. Enable Real Transactions
Edit `scripts/devnet_bootstrap.ts` and uncomment the real transaction code (remove the DEMO sections).

### 4. Run Bootstrap
```bash
npm run start
```

## 🎮 What Gets Set Up

- ✅ WEALTH SPL token mint
- ✅ Game configuration with parameters
- ✅ Player account creation
- ✅ Asset classes (Lemonade Stand, Coffee Shop)
- ✅ Test WEALTH tokens for gameplay
- ✅ Sample asset purchase
- ✅ Upgrade queuing demonstration

## 🎯 Game Mechanics

### Asset Classes
- **Lemonade Stand** (ID: 0): Entry-level business
- **Coffee Shop** (ID: 1): Mid-tier business

### Available Commands
- `buy_asset(class_id)` - Purchase business assets
- `queue_upgrade(class_id)` - Start asset upgrade (requires WEALTH)
- `finish_upgrade(class_id)` - Complete upgrade after cooldown
- `defend(class_id, amount)` - Protect assets from takeover
- `takeover(target_player, class_id)` - Attempt to steal another player's assets

### Game Features
- ⏰ Upgrade cooldowns prevent instant progression
- 🛡️ Defense system protects valuable assets
- ⚔️ Takeover mechanics for competitive gameplay
- 💰 WEALTH token economy for all transactions

## 🔧 Configuration

Edit the constants at the top of `scripts/devnet_bootstrap.ts`:

```typescript
const GAME_PARAMS = {
  fee_bps: 500,           // 5% transaction fees
  default_upgrade_cd: 3600, // 1 hour cooldowns
  // ... more settings
};
```

## 📊 Monitoring

After setup, monitor your game on Solana Explorer:
- Program ID: `BgiPAjcP224ppYDPYDponbWDFkBcHya8EPCbycJ9YYwL`
- View transactions: https://explorer.solana.com/address/YOUR_ADDRESS?cluster=devnet

## 🐛 Troubleshooting

- **"No such file or directory"**: Ensure you're in the bootstrap directory
- **"Transaction simulation failed"**: Your account needs SOL funding
- **Network errors**: Check your internet connection and devnet status

## 🎉 Ready to Play!

Once bootstrapped, your Wealth Wars game is live on Solana devnet. Start buying assets, upgrading businesses, and competing with other players!
