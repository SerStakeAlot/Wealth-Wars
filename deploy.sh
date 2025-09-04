#!/bin/bash

# Wealth Wars Deployment Helper
echo "🚀 Wealth Wars Deployment Helper"
echo "==============================="

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

# Check/create keypair
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating new keypair..."
    solana-keygen new --outfile ~/.config/solana/id.json
else
    echo "✅ Keypair already exists"
fi

# Get balance and airdrop if needed
echo "💰 Checking balance..."
BALANCE=$(solana balance 2>/dev/null | grep -o '[0-9.]*' | head -1)
if [ -z "$BALANCE" ] || [ "$(echo "$BALANCE < 1" | bc -l)" -eq 1 ]; then
    echo "💰 Requesting airdrop..."
    solana airdrop 2
    sleep 10
    echo "✅ Airdrop requested!"
else
    echo "💰 Current balance: $BALANCE SOL"
fi

# Build and deploy the program
echo "🔨 Building Anchor program..."
cd /workspaces/Wealth-Wars/wwars
anchor build

echo "🚀 Deploying to devnet..."
anchor deploy

echo "🎉 Deployment complete!"
echo "📋 Program ID: BgiPAjcP224ppYDPYDponbWDFkBcHya8EPCbycJ9YYwL"
echo ""
echo "Next steps:"
echo "1. Run bootstrap: cd ../bootstrap && npm run start"
echo "2. Refresh the demo page to enable real transactions"
