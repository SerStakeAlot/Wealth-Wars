#!/bin/bash

# Demo Site Deployment Script
# Deploys a demo-only version to demo.wealthwars.io

echo "🎮 Deploying Wealth Wars Demo Site..."

# Set demo environment
export NEXT_PUBLIC_DEMO_ONLY=true
export NEXT_PUBLIC_DEMO_URL=https://demo.wealthwars.io
export NEXT_PUBLIC_SITE_NAME="Wealth Wars Demo"

# Copy demo environment
cp .env.demo .env.local

echo "📦 Building demo site..."
npm run build

echo "🚀 Deploying to demo subdomain..."
# Replace with your deployment command
# Examples:

# Vercel deployment with custom domain
# vercel --prod --env NEXT_PUBLIC_DEMO_ONLY=true

# Netlify deployment
# netlify deploy --prod --dir=.next

# Custom server deployment
# rsync -avz .next/ user@demo.wealthwars.io:/var/www/demo/

# Docker deployment
# docker build -t wealth-wars-demo .
# docker tag wealth-wars-demo your-registry/wealth-wars-demo:latest
# docker push your-registry/wealth-wars-demo:latest

echo "✅ Demo site deployed!"
echo "🌐 Visit: https://demo.wealthwars.io"

# Clean up
rm .env.local
