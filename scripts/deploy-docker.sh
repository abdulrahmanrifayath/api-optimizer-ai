#!/usr/bin/env bash
# API Optimizer AI - Automated Docker Deployment Script (Bash)

set -e

echo "🚀 Starting API Optimizer AI Docker Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not available in PATH."
    exit 1
fi

# Stop existing containers
echo "⏹️ Stopping existing containers..."
docker compose down

# Build & launch containers
echo "🔨 Building & orchestrating containers with Docker Compose..."
docker compose up --build -d

# Check status
echo "🔍 Checking service health & container status..."
sleep 5
docker compose ps

echo "✨ Deployment Complete!"
echo "🌐 Frontend Control Center: http://localhost"
echo "⚙️ FastAPI OpenAPI Docs:    http://localhost:8000/docs"
