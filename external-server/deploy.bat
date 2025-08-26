@echo off
REM Script de deploy para Windows PowerShell
REM Uso: deploy.bat [dev|prod]

setlocal EnableDelayedExpansion

set "ENV=%1"
if "%ENV%"=="" set "ENV=dev"
set "PROJECT_NAME=fastbot-external-server"

echo 🚀 Deploying FastBot External Server in %ENV% mode...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Criar diretório de logs se não existir
if not exist "logs" mkdir logs

REM Verificar se .env existe
if not exist ".env" (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file with your credentials and run this script again.
    exit /b 1
)

REM Build da imagem
echo 🔨 Building Docker image...
docker build -t %PROJECT_NAME% .

if "%ENV%"=="prod" (
    echo 🏭 Starting in PRODUCTION mode...
    
    REM Parar containers existentes
    docker-compose down 2>nul
    
    REM Iniciar em modo produção
    docker-compose up -d
    
    echo ⏳ Waiting for service to be ready...
    timeout /t 10 /nobreak >nul
    
    REM Verificar health check
    curl -f http://localhost:3000/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Service is healthy and ready!
        echo 🌐 Available at: http://localhost:3000
        echo 📊 Health check: http://localhost:3000/health/detailed
        echo 📋 Webhook endpoint: http://localhost:3000/webhook
    ) else (
        echo ❌ Service health check failed. Check logs:
        docker-compose logs
        exit /b 1
    )
    
    echo.
    echo 📋 Useful commands:
    echo   - View logs: docker-compose logs -f
    echo   - Stop service: docker-compose down
    echo   - Restart: docker-compose restart
    
) else (
    echo 🛠️  Starting in DEVELOPMENT mode...
    
    REM Verificar se node_modules existe
    if not exist "node_modules" (
        echo 📦 Installing dependencies...
        npm install
    )
    
    REM Iniciar em modo desenvolvimento
    echo 🔄 Starting development server...
    npm run dev
)
