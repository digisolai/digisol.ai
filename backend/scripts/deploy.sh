#!/bin/bash

# DigiSol.AI Backend Deployment Script
# This script sets up the complete backend deployment

set -e  # Exit on any error

echo "🚀 Starting DigiSol.AI Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if environment file exists
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "env.production" ]; then
        print_error "env.production file not found. Please create it from env.example"
        exit 1
    fi
    
    # Check for required environment variables
    source env.production
    
    required_vars=(
        "SECRET_KEY"
        "ALLOWED_HOSTS"
        "DB_NAME"
        "DB_USER"
        "DB_PASSWORD"
        "REDIS_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [[ "${!var}" == *"your-"* ]]; then
            print_error "Please configure $var in env.production"
            exit 1
        fi
    done
    
    print_success "Environment configuration is valid"
}

# Generate SSL certificates for development
generate_ssl_certs() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
    fi
    
    # Generate self-signed certificate for development
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting Docker services..."
    
    # Stop any existing containers
    docker-compose down
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    print_success "Docker services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while ! docker-compose exec -T db pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; do
        if [ $timeout -le 0 ]; then
            print_error "Database failed to start within 60 seconds"
            exit 1
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    print_success "Database is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        if [ $timeout -le 0 ]; then
            print_error "Redis failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    print_success "Redis is ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker-compose exec -T web python manage.py migrate --noinput
    
    print_success "Database migrations completed"
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    
    docker-compose exec -T web python manage.py collectstatic --noinput
    
    print_success "Static files collected"
}

# Create superuser if needed
create_superuser() {
    print_status "Checking for superuser..."
    
    # Check if superuser exists
    if ! docker-compose exec -T web python manage.py shell -c "from accounts.models import CustomUser; print('Superuser exists:', CustomUser.objects.filter(is_superuser=True).exists())" 2>/dev/null | grep -q "True"; then
        print_warning "No superuser found. You can create one manually with:"
        echo "docker-compose exec web python manage.py createsuperuser"
    else
        print_success "Superuser already exists"
    fi
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Check web service
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        print_success "Web service is healthy"
    else
        print_error "Web service health check failed"
        exit 1
    fi
    
    # Check nginx
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Nginx is running"
    else
        print_warning "Nginx health check failed (this might be normal if SSL is required)"
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    echo "🎉 DigiSol.AI Backend Deployment Complete!"
    echo ""
    echo "Services Status:"
    docker-compose ps
    echo ""
    echo "Access URLs:"
    echo "  - Django Admin: http://localhost/admin"
    echo "  - API Base: http://localhost/api/"
    echo "  - Health Check: http://localhost/health/"
    echo ""
    echo "Logs:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Web logs: docker-compose logs -f web"
    echo "  - Database logs: docker-compose logs -f db"
    echo ""
    echo "Management Commands:"
    echo "  - Create superuser: docker-compose exec web python manage.py createsuperuser"
    echo "  - Run migrations: docker-compose exec web python manage.py migrate"
    echo "  - Collect static: docker-compose exec web python manage.py collectstatic"
    echo ""
    echo "Stop services: docker-compose down"
    echo "Restart services: docker-compose restart"
}

# Main deployment process
main() {
    echo "=========================================="
    echo "  DigiSol.AI Backend Deployment Script"
    echo "=========================================="
    echo ""
    
    check_docker
    check_environment
    generate_ssl_certs
    deploy_services
    wait_for_services
    run_migrations
    collect_static
    create_superuser
    check_health
    show_summary
}

# Run main function
main "$@" 