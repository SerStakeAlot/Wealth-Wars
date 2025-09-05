#!/bin/bash

# Wealth Wars Deployment Helper
echo "🚀 Wealth Wars Deployment Helper"
echo "==============================="

# Set PATH for Solana CLI
export PATH="$HOME/.local/share/solana/install/solana-release/bin:$PATH"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please run: bash scripts/install-solana.sh"
    exit 1
else
    echo "✅ Solana CLI found: $(solana --version)"
fi

# Configure for devnet
echo "⚙️ Configuring for devnet..."
solana config set --url https://api.devnet.solana.com

# Check/create keypair
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating new keypair..."
    mkdir -p ~/.config/solana
    solana-keygen new --outfile ~/.config/solana/id.json --no-passphrase
else
    echo "✅ Keypair already exists"
fi

# Get balance and airdrop if needed
echo "💰 Checking balance..."
BALANCE=$(solana balance 2>/dev/null | grep -o '[0-9.]*' | head -1 || echo "0")
echo "💰 Current balance: $BALANCE SOL"

if [ -z "$BALANCE" ] || [ "$(echo "$BALANCE < 1" | bc -l 2>/dev/null || echo "1")" -eq 1 ]; then
    echo "💰 Requesting airdrop..."
    solana airdrop 2
    sleep 15
    NEW_BALANCE=$(solana balance 2>/dev/null | grep -o '[0-9.]*' | head -1 || echo "0")
    echo "✅ New balance: $NEW_BALANCE SOL"
else
    echo "💰 Sufficient balance available"
fi

# Build and deploy the program
cd /workspaces/Wealth-Wars/wwars

# Check if Anchor is available
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Check if program is already deployed
echo "🔍 Checking if program is already deployed..."
if solana program show EhN1NGXmhGyzN1qTPRRc7ZRA9yZuJdvVhJPE4AkRWMu &>/dev/null; then
    echo "✅ Program already deployed at: EhN1NGXmhGyzN1qTPRRc7ZRA9yZuJdvVhJPE4AkRWMu"
    echo "⏭️ Skipping build and deployment..."
    DEPLOYED=true
else
    echo "📦 Program not found, building and deploying..."
    DEPLOYED=false
fi

# Build and deploy only if not already deployed
if [ "$DEPLOYED" = false ]; then
    echo "🔨 Building Anchor program..."
    # Build the program (skip lint to avoid issues)
    if anchor build --skip-lint; then
        echo "✅ Anchor build successful"
    else
        echo "❌ Anchor build failed"
        exit 1
    fi
    
    # Deploy the program
    echo "🚀 Deploying to devnet..."
    if anchor deploy; then
        echo "✅ Deployment successful!"
        echo "📋 Program ID: EhN1NGXmhGyzN1qTPRRc7ZRA9yZuJdvVhJPE4AkRWMu"
        
        # Copy IDL to web app
        echo "📄 Copying IDL to web app..."
        if [ -f "target/idl/wwars.json" ]; then
            cp target/idl/wwars.json ../apps/web/src/idl/wwars.json
            echo "✅ IDL copied to web app"
        else
            echo "⚠️ IDL file not found, but deployment was successful"
        fi
    else
        echo "❌ Deployment failed"
        exit 1
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "📋 Program ID: EhN1NGXmhGyzN1qTPRRc7ZRA9yZuJdvVhJPE4AkRWMu"
echo ""
echo "Next steps:"
echo "1. Start the web app: cd ../apps/web && npm run dev"
echo "2. Visit http://localhost:3001 to play Wealth Wars!"
echo "3. Connect your Solana wallet to interact with the live program"
