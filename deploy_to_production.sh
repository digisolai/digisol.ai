#!/bin/bash

# 🚀 DigiSol.AI Production Deployment Script
# This script helps deploy your application to production on Render

echo "🚀 Starting DigiSol.AI Production Deployment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check git status
echo "📋 Step 1: Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    git status
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    echo "✅ No uncommitted changes found"
fi

# Step 2: Check if we're on main branch
echo "📋 Step 2: Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're currently on branch: $CURRENT_BRANCH"
    read -p "Do you want to switch to main branch? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    echo "✅ Currently on main branch"
fi

# Step 3: Commit changes if needed
echo "📋 Step 3: Committing changes..."
git add .
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Production deployment: PostgreSQL, S3, Celery setup"
    echo "✅ Changes committed"
else
    echo "✅ No changes to commit"
fi

# Step 4: Push to remote
echo "📋 Step 4: Pushing to remote repository..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully"
else
    echo "❌ Failed to push code"
    exit 1
fi

# Step 5: Display next steps
echo ""
echo "🎉 Deployment initiated successfully!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Monitor Render Dashboard: https://dashboard.render.com"
echo "2. Wait for services to become 'Live':"
echo "   - PostgreSQL Database (digisol-postgres)"
echo "   - Redis Service (digisol-redis)"
echo "   - Celery Worker (digisol-celery-worker)"
echo "   - Web Service (digisol-backend)"
echo ""
echo "3. Configure Environment Variables on Render:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_STORAGE_BUCKET_NAME"
echo "   - GOOGLE_GEMINI_API_KEY"
echo ""
echo "4. Run migration script on Render:"
echo "   - Access Render Shell"
echo "   - Run: python migrate_to_postgresql.py"
echo ""
echo "5. Test everything:"
echo "   - Frontend: https://digisolai.netlify.app"
echo "   - Backend: https://digisol-backend.onrender.com/health/"
echo "   - Admin: https://digisol-backend.onrender.com/admin/"
echo ""
echo "📖 For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Deployment script completed!"
