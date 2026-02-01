@echo off
echo StyloFit Quick Setup
echo.

echo [1/3] Setting up Database...
mysql -u root -p < setup-database.sql

echo.
echo [2/3] Installing Python Dependencies...
cd ai-service
pip install -r requirements.txt
cd ..

echo.
echo [3/3] Installing Frontend Dependencies...
cd frontend
npm install
cd ..

echo.
echo Setup Complete! Run 'start-stylofit.bat' to start all services.
pause