#!/bin/bash

# DigiSol.AI Backend Railway Deployment Script
# This script deploys the Django backend to Railway

set -e  # Exit on any error

echo "🚀 Starting DigiSol.AI Backend Railway Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if Railway CLI is installed
check_railway_cli() {
    print_status "Checking Railway CLI installation..."
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
        if ! command -v railway &> /dev/null; then
            print_error "Failed to install Railway CLI. Please install manually: npm install -g @railway/cli"
            exit 1
        fi
    fi
    print_success "Railway CLI is installed"
}

# Check if user is logged in to Railway
check_railway_login() {
    print_status "Checking Railway login status..."
    if ! railway whoami &> /dev/null; then
        print_warning "Not logged in to Railway. Please log in..."
        railway login
        if ! railway whoami &> /dev/null; then
            print_error "Failed to log in to Railway"
            exit 1
        fi
    fi
    print_success "Logged in to Railway"
}

# Create Railway project
create_railway_project() {
    print_status "Creating Railway project..."
    if [ ! -f "railway.json" ]; then
        railway init
        print_success "Railway project initialized"
    else
        print_status "Railway project already exists"
    fi
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if env.production exists
    if [ ! -f "env.production" ]; then
        print_error "env.production file not found. Please create it first."
        exit 1
    fi
    
    # Set environment variables in Railway
    print_status "Setting environment variables in Railway..."
    
    # Read from env.production and set in Railway
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
            continue
        fi
        
        # Remove leading/trailing whitespace
        key=$(echo $key | xargs)
        value=$(echo $value | xargs)
        
        # Skip if value is empty or contains placeholder
        if [[ -n $value ]] && [[ $value != *"your-"* ]]; then
            print_status "Setting $key"
            railway variables set "$key=$value"
        fi
    done < env.production
    
    print_success "Environment variables configured"
}

# Deploy to Railway
deploy_to_railway() {
    print_status "Deploying to Railway..."
    railway up
    print_success "Deployment completed"
}

# Get the deployment URL
get_deployment_url() {
    print_status "Getting deployment URL..."
    DEPLOYMENT_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_success "Backend deployed at: $DEPLOYMENT_URL"
        echo ""
        echo "🎉 Next steps:"
        echo "1. Copy this URL: $DEPLOYMENT_URL"
        echo "2. Go to Netlify Dashboard → Site settings → Environment variables"
        echo "3. Add: VITE_BACKEND_URL=$DEPLOYMENT_URL/api"
        echo "4. Redeploy your frontend"
        echo ""
        echo "🔗 Your backend API will be available at: $DEPLOYMENT_URL/api/"
    else
        print_warning "Could not get deployment URL. Check Railway dashboard."
    fi
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    railway run python manage.py migrate --settings=digisol_ai.settings_production
    print_success "Migrations completed"
}

# Create superuser
create_superuser() {
    print_status "Creating superuser..."
    read -p "Do you want to create a superuser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway run python manage.py createsuperuser --settings=digisol_ai.settings_production
        print_success "Superuser created"
    else
        print_status "Skipping superuser creation"
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    check_railway_cli
    check_railway_login
    create_railway_project
    setup_environment
    deploy_to_railway
    run_migrations
    create_superuser
    get_deployment_url
    
    print_success "🎉 Backend deployment completed!"
    print_status "Don't forget to update your Netlify environment variables!"
}

# Run the main function
main 