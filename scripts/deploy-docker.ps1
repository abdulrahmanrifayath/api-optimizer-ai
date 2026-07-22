# API Optimizer AI - Automated Docker Deployment Script (PowerShell)

Write-Host "🚀 Starting API Optimizer AI Docker Deployment..." -ForegroundColor Cyan

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed or not available in PATH." -ForegroundColor Red
    Exit 1
}

# Stop existing containers
Write-Host "⏹️ Stopping existing containers..." -ForegroundColor Yellow
docker compose down

# Build & launch containers
Write-Host "🔨 Building & orchestrating containers with Docker Compose..." -ForegroundColor Green
docker compose up --build -d

# Check status
Write-Host "🔍 Checking service health & container status..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
docker compose ps

Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Frontend Control Center: http://localhost" -ForegroundColor Yellow
Write-Host "⚙️ FastAPI OpenAPI Docs:    http://localhost:8000/docs" -ForegroundColor Yellow
