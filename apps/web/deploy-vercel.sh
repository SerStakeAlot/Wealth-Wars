#!/bin/bash

# 🚀 Vercel Demo Deployment Script
# This script deploys the Wealth Wars demo to Vercel

echo "🎮 Deploying Wealth Wars Demo to Vercel..."

# Navigate to web app directory
cd /workspaces/Wealth-Wars/apps/web

# Ensure we have the demo environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.demo..."
    cp .env.demo .env.local
fi

echo "📋 Environment variables:"
echo "NEXT_PUBLIC_DEMO_ONLY=true"
echo "NODE_ENV=production"
echo ""

echo "🔑 Please make sure you're logged into Vercel first:"
echo "   vercel login"
echo ""

echo "🚀 Starting deployment..."
vercel --prod \
    --env NEXT_PUBLIC_DEMO_ONLY=true \
    --env NODE_ENV=production \
    --name="wealth-wars-demo" \
    --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Your demo site should be live at the provided URL"
    echo "🎯 To add custom domain (demo.wealthwars.io):"
    echo "   1. Go to your Vercel dashboard"
    echo "   2. Select the project"
    echo "   3. Go to Settings > Domains"
    echo "   4. Add 'demo.wealthwars.io'"
    echo "   5. Update your DNS with the CNAME record"
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    echo "💡 Make sure you're logged in with: vercel login"
fi
