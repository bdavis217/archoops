@echo off
echo.
echo 🏀 Starting ArcHoops Development Environment...
echo =============================================

REM Set environment variables
set DATABASE_URL=file:./apps/api/prisma/dev.db
set JWT_SECRET=dev-secret-key-change-in-production
set NODE_ENV=development
set PORT=3001

echo.
echo 🔧 Environment Configuration:
echo   DATABASE_URL: %DATABASE_URL%
echo   JWT_SECRET: [HIDDEN FOR SECURITY]
echo   NODE_ENV: %NODE_ENV%
echo   API PORT: %PORT%

echo.
echo 🚀 Starting Services:
echo   📡 API Server: http://localhost:3001
echo   🌐 Web App: http://localhost:5173 (or next available port)

echo.
echo 📋 Available API Endpoints:
echo   GET  http://localhost:3001/api/health
echo   GET  http://localhost:3001/api/test
echo   POST http://localhost:3001/api/auth/signup
echo   POST http://localhost:3001/api/auth/login

echo.
echo ⚡ Both services will start together. Use Ctrl+C to stop both.
echo =============================================
echo.

REM Start both services
npm run dev

pause
