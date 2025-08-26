#!/bin/bash

# Script de deploy para FastBot External Server
# Uso: ./deploy.sh [dev|prod]

set -e

ENV=${1:-dev}
PROJECT_NAME="fastbot-external-server"

echo "🚀 Deploying FastBot External Server in $ENV mode..."

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your credentials and run this script again."
    exit 1
fi

# Build da imagem
echo "🔨 Building Docker image..."
docker build -t $PROJECT_NAME .

if [ "$ENV" = "prod" ]; then
    echo "🏭 Starting in PRODUCTION mode..."
    
    # Parar containers existentes
    docker-compose down 2>/dev/null || true
    
    # Iniciar em modo produção
    docker-compose up -d
    
    echo "⏳ Waiting for service to be ready..."
    sleep 10
    
    # Verificar health check
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Service is healthy and ready!"
        echo "🌐 Available at: http://localhost:3000"
        echo "📊 Health check: http://localhost:3000/health/detailed"
        echo "📋 Webhook endpoint: http://localhost:3000/webhook"
    else
        echo "❌ Service health check failed. Check logs:"
        docker-compose logs
        exit 1
    fi
    
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop service: docker-compose down"
    echo "  - Restart: docker-compose restart"
    
else
    echo "🛠️  Starting in DEVELOPMENT mode..."
    
    # Instalar dependências se não existirem
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Iniciar em modo desenvolvimento
    echo "🔄 Starting development server..."
    npm run dev
fi
