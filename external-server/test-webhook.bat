@echo off
REM Script para testar o webhook do FastBot External Server (Windows)
REM Uso: test-webhook.bat [URL] [API_KEY]

setlocal EnableDelayedExpansion

set "URL=%1"
if "%URL%"=="" set "URL=http://localhost:3000"

set "API_KEY=%2"
if "%API_KEY%"=="" set "API_KEY=your_api_key_here"

echo 🧪 Testing FastBot External Server...
echo URL: %URL%
echo API Key: %API_KEY:~0,8%...

REM Teste 1: Health Check
echo.
echo 1️⃣  Testing health check...
curl -s -X GET "%URL%/health"

REM Teste 2: Detailed Health Check
echo.
echo 2️⃣  Testing detailed health check...
curl -s -X GET "%URL%/health/detailed"

REM Teste 3: Webhook Test
echo.
echo 3️⃣  Testing webhook test endpoint...
for /f %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'"') do set timestamp=%%i
curl -s -X POST "%URL%/webhook/test" -H "Content-Type: application/json" -H "X-API-Key: %API_KEY%" -d "{\"test\": \"message\", \"timestamp\": \"%timestamp%\"}"

REM Teste 4: Webhook Principal
echo.
echo 4️⃣  Testing main webhook...
for /f %%i in ('powershell -Command "[DateTimeOffset]::Now.ToUnixTimeMilliseconds()"') do set sessionId=%%i
curl -s -X POST "%URL%/webhook" -H "Content-Type: application/json" -H "X-API-Key: %API_KEY%" -d "{\"message\": \"Quais são os horários de atendimento?\", \"page\": \"/test\", \"pageContext\": \"Test page\", \"timestamp\": \"%timestamp%\", \"sessionId\": %sessionId%, \"userId\": \"123e4567-e89b-12d3-a456-426614174000\", \"userEmail\": \"test@example.com\", \"systemMessage\": \"Você é um assistente virtual de um dentista. Responda de forma profissional e cordial. Os horários de atendimento são de segunda a sexta das 8h às 18h.\", \"chatbotConfig\": {\"office_hours\": \"Segunda a Sexta: 8h às 18h\", \"office_address\": \"Rua Teste, 123 - Centro\", \"specialties\": \"Ortodontia, Clínica Geral\", \"whatsapp\": \"+55 11 99999-9999\"}}"

echo.
echo ✅ Tests completed!
