@echo off
echo Starting DigiSol.AI Development Servers...
echo.

echo Starting Backend Server (Django)...
start "Backend Server" cmd /k "cd backend && python manage.py runserver"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server (Vite)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script (servers will continue running)
pause > nul 