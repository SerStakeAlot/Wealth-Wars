#!/bin/bash

# Wealth Wars Current Alpha - Quick Start Script
echo "🚀 Wealth Wars Current Alpha - Quick Start"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Wealth Wars root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
cd apps/web
npm install

echo "🎮 Starting development server..."
echo ""
echo "🌟 Current Alpha Features:"
echo "  ✨ Premium gold-bordered dark theme"
echo "  🎯 Adventure Capitalist-style gameplay"
echo "  📊 Real-time profit tracking"
echo "  💰 Business management system"
echo "  📱 Responsive design"
echo ""
echo "🎯 Game will be available at: http://localhost:3001/game"
echo "🏠 Landing page at: http://localhost:3001"
echo ""
echo "⌨️  Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
