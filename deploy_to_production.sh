#!/bin/bash

echo "🚀 Deploying to production with database reset..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Error: Render CLI not found. Please install it first:"
    echo "   npm install -g render-cli"
    exit 1
fi

echo "📦 Building and deploying to Render..."

# Deploy to Render
render deploy

echo "✅ Deployment triggered!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for the deployment to complete (usually 2-3 minutes)"
echo "2. Check the deployment logs for any errors"
echo "3. Test the login with:"
echo "   Email: admin@digisolai.ca"
echo "   Password: admin123456"
echo "4. If login fails, check the deployment logs for database reset errors"
echo ""
echo "🔗 Production URL: https://digisol-backend.onrender.com"
echo "🔗 Admin URL: https://digisol-backend.onrender.com/admin/"
