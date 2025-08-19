# ArcHoops Development Server Startup Script
# This script starts both the API server and web frontend together

Write-Host "🏀 Starting ArcHoops Development Environment..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Set environment variables for the API server
$env:DATABASE_URL = "file:./apps/api/prisma/dev.db"
$env:JWT_SECRET = "dev-secret-key-change-in-production"
$env:NODE_ENV = "development"
$env:PORT = "3001"

Write-Host ""
Write-Host "🔧 Environment Configuration:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "  JWT_SECRET: [HIDDEN FOR SECURITY]" -ForegroundColor Cyan
Write-Host "  NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "  API PORT: $env:PORT" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Starting Services:" -ForegroundColor Yellow
Write-Host "  📡 API Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  🌐 Web App: http://localhost:5173 (or next available port)" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Available API Endpoints:" -ForegroundColor Yellow
Write-Host "  GET  http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host "  GET  http://localhost:3001/api/test" -ForegroundColor Cyan
Write-Host "  POST http://localhost:3001/api/auth/signup" -ForegroundColor Cyan
Write-Host "  POST http://localhost:3001/api/auth/login" -ForegroundColor Cyan

Write-Host ""
Write-Host "⚡ Both services will start together. Use Ctrl+C to stop both." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# Start both services with concurrently
npm run dev