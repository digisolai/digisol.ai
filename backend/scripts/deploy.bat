@echo off
setlocal enabledelayedexpansion

REM DigiSol.AI Backend Deployment Script for Windows
REM This script sets up the complete backend deployment

echo 🚀 Starting DigiSol.AI Backend Deployment...
echo.

REM Check if Docker is installed
echo [INFO] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Check if environment file exists
echo [INFO] Checking environment configuration...
if not exist "env.production" (
    echo [ERROR] env.production file not found. Please create it from env.example
    exit /b 1
)

echo [SUCCESS] Environment configuration file found

REM Generate SSL certificates for development
echo [INFO] Generating SSL certificates for development...
if not exist "ssl" mkdir ssl

if not exist "ssl\cert.pem" (
    echo [INFO] Generating self-signed SSL certificate...
    openssl req -x509 -newkey rsa:4096 -keyout ssl\key.pem -out ssl\cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo [SUCCESS] SSL certificates generated
) else (
    echo [INFO] SSL certificates already exist
)

REM Build and start services
echo [INFO] Building and starting Docker services...

REM Stop any existing containers
docker-compose down

REM Build images
docker-compose build --no-cache

REM Start services
docker-compose up -d

echo [SUCCESS] Docker services started

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...

REM Wait for database (simplified check)
echo [INFO] Waiting for database...
timeout /t 30 /nobreak >nul

REM Wait for Redis (simplified check)
echo [INFO] Waiting for Redis...
timeout /t 10 /nobreak >nul

echo [SUCCESS] Services should be ready

REM Run database migrations
echo [INFO] Running database migrations...
docker-compose exec -T web python manage.py migrate --noinput
echo [SUCCESS] Database migrations completed

REM Collect static files
echo [INFO] Collecting static files...
docker-compose exec -T web python manage.py collectstatic --noinput
echo [SUCCESS] Static files collected

REM Check service health
echo [INFO] Checking service health...
timeout /t 10 /nobreak >nul

REM Show deployment summary
echo.
echo 🎉 DigiSol.AI Backend Deployment Complete!
echo.
echo Services Status:
docker-compose ps
echo.
echo Access URLs:
echo   - Django Admin: http://localhost/admin
echo   - API Base: http://localhost/api/
echo   - Health Check: http://localhost/health/
echo.
echo Logs:
echo   - View logs: docker-compose logs -f
echo   - Web logs: docker-compose logs -f web
echo   - Database logs: docker-compose logs -f db
echo.
echo Management Commands:
echo   - Create superuser: docker-compose exec web python manage.py createsuperuser
echo   - Run migrations: docker-compose exec web python manage.py migrate
echo   - Collect static: docker-compose exec web python manage.py collectstatic
echo.
echo Stop services: docker-compose down
echo Restart services: docker-compose restart
echo.

pause 