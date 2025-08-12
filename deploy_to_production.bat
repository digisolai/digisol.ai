@echo off
REM 🚀 DigiSol.AI Production Deployment Script (Windows)
REM This script helps deploy your application to production on Render

echo 🚀 Starting DigiSol.AI Production Deployment
echo ==========================================

REM Check if we're in the right directory
if not exist "backend\manage.py" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Step 1: Check git status
echo 📋 Step 1: Checking git status...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  You have uncommitted changes. Please commit them first:
    git status
    echo.
    set /p "continue=Do you want to continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo ❌ Deployment cancelled
        pause
        exit /b 1
    )
) else (
    echo ✅ No uncommitted changes found
)

REM Step 2: Check if we're on main branch
echo 📋 Step 2: Checking current branch...
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo ⚠️  You're currently on branch: %CURRENT_BRANCH%
    set /p "switch=Do you want to switch to main branch? (y/N): "
    if /i "%switch%"=="y" (
        git checkout main
    ) else (
        echo ❌ Deployment cancelled
        pause
        exit /b 1
    )
) else (
    echo ✅ Currently on main branch
)

REM Step 3: Commit changes if needed
echo 📋 Step 3: Committing changes...
git add .
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    git commit -m "Production deployment: PostgreSQL, S3, Celery setup"
    echo ✅ Changes committed
) else (
    echo ✅ No changes to commit
)

REM Step 4: Push to remote
echo 📋 Step 4: Pushing to remote repository...
git push origin main
if %errorlevel% equ 0 (
    echo ✅ Code pushed successfully
) else (
    echo ❌ Failed to push code
    pause
    exit /b 1
)

REM Step 5: Display next steps
echo.
echo 🎉 Deployment initiated successfully!
echo ==================================
echo.
echo 📋 Next Steps:
echo 1. Monitor Render Dashboard: https://dashboard.render.com
echo 2. Wait for services to become 'Live':
echo    - PostgreSQL Database (digisol-postgres)
echo    - Redis Service (digisol-redis)
echo    - Celery Worker (digisol-celery-worker)
echo    - Web Service (digisol-backend)
echo.
echo 3. ✅ Environment Variables Already Configured on Render
echo    - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME
echo    - GOOGLE_GEMINI_API_KEY
echo.
echo 4. Run migration script on Render:
echo    - Access Render Shell
echo    - Run: python migrate_to_postgresql.py
echo.
echo 5. Test everything:
echo    - Frontend: https://digisolai.netlify.app
echo    - Backend: https://digisol-backend.onrender.com/health/
echo    - Admin: https://digisol-backend.onrender.com/admin/
echo.
echo 📖 For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md
echo.
echo ✅ Deployment script completed!
pause
