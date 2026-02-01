@echo off
echo Starting StyloFit System...

echo.
echo [1/4] Starting MySQL Database...
net start mysql80

echo.
echo [2/4] Starting Spring Boot Backend...
start "StyloFit Backend" cmd /k "cd backend && mvn spring-boot:run"

echo.
echo [3/4] Starting Python AI Service...
start "StyloFit AI Service" cmd /k "cd ai-service && python main.py"

echo.
echo [4/4] Starting React Frontend...
start "StyloFit Frontend" cmd /k "cd frontend && npm start"

echo.
echo StyloFit is starting up...
echo Backend: http://localhost:8080
echo AI Service: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause