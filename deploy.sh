#!/bin/bash

# MediTeach AI Deployment Script
# This script builds and deploys the application to Cloudflare Pages

set -e

echo "🚀 Starting MediTeach AI deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Copy _redirects file to dist (for SPA routing)
echo "📁 Copying SPA routing configuration..."
cp _redirects dist/

# Verify build output
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: Build failed - index.html not found in dist/"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Statistics:"
ls -lh dist/assets/ | grep -E '\.(js|css)$' || echo "No assets found"
echo ""
echo "📁 Built files:"
find dist -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "_redirects" | sort
echo ""

# Check if wrangler is available and authenticated
if command -v wrangler &> /dev/null; then
    echo "🔍 Checking Wrangler authentication..."
    if wrangler whoami | grep -q "not authenticated"; then
        echo "⚠️  Wrangler not authenticated. Run 'wrangler login' first."
        echo "📋 Manual deployment steps:"
        echo "   1. Run: wrangler login"
        echo "   2. Run: wrangler pages deploy dist --project-name mediteach-ai"
    else
        echo "🚀 Deploying to Cloudflare Pages..."
        wrangler pages deploy dist --project-name mediteach-ai
        echo "✅ Deployment completed!"
        echo "🌐 Your app should be available at: https://mediteach-ai.pages.dev"
    fi
else
    echo "📋 Wrangler CLI not found. For manual deployment:"
    echo "   1. Install Wrangler: npm install -g wrangler"
    echo "   2. Login: wrangler login"
    echo "   3. Deploy: wrangler pages deploy dist --project-name mediteach-ai"
    echo ""
    echo "🌐 Or deploy via Cloudflare Dashboard:"
    echo "   1. Go to https://dash.cloudflare.com/pages"
    echo "   2. Connect GitHub repository: jaanibrahim-hub/googleaimed"
    echo "   3. Configure build: 'npm run build' -> 'dist'"
    echo "   4. Deploy!"
fi

echo ""
echo "🎉 MediTeach AI is ready for deployment!"
echo "📚 See DEPLOYMENT.md for detailed instructions"