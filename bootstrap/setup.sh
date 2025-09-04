#!/bin/bash

# Wealth Wars Devnet Setup Helper
# This script helps set up Solana CLI and configure for devnet

echo "🚀 Wealth Wars Devnet Setup"
echo "=========================="

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "📦 Installing Solana CLI..."
    curl -sSfL https://release.solana.com/v1.18.26/install | sh
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "✅ Solana CLI installed!"
else
    echo "✅ Solana CLI already installed"
fi

# Configure for devnet
echo "⚙️ Configuring for devnet..."
solana config set --url https://api.devnet.solana.com

# Check if keypair exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating new keypair..."
    solana-keygen new --outfile ~/.config/solana/id.json
else
    echo "✅ Keypair already exists"
fi

# Show current config
echo ""
echo "📋 Current Configuration:"
solana config get

# Get balance and airdrop if needed
BALANCE=$(solana balance 2>/dev/null | grep -o '[0-9.]*' | head -1)
if [ -z "$BALANCE" ] || [ "$(echo "$BALANCE < 1" | bc -l)" -eq 1 ]; then
    echo ""
    echo "💰 Requesting airdrop..."
    solana airdrop 2
    echo "✅ Airdrop requested!"
else
    echo "💰 Current balance: $BALANCE SOL"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit scripts/devnet_bootstrap.ts to enable real transactions"
echo "2. Run: npm run start"
echo ""
echo "Happy gaming! 🎮"
