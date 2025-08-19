# PowerShell script to start the API server with environment variables
$env:DATABASE_URL="file:./prisma/dev.db"
$env:JWT_SECRET="dev-secret-key-change-in-production"
$env:NODE_ENV="development"
$env:PORT="3001"

Write-Host "🏀 Starting ArcHoops API server..." -ForegroundColor Green
Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "  JWT_SECRET: [HIDDEN]" -ForegroundColor Cyan
Write-Host "  NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "  PORT: $env:PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "The server will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "Test endpoints:" -ForegroundColor Yellow
Write-Host "  GET  http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host "  GET  http://localhost:3001/api/test" -ForegroundColor Cyan
Write-Host "  POST http://localhost:3001/api/auth/signup" -ForegroundColor Cyan
Write-Host ""

npm run dev
