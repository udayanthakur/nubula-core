@echo off
echo ========================================
echo Starting Nebula Core Server...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo Starting server...
node server.js

pause


