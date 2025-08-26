#!/bin/bash

# Script para testar o webhook do FastBot External Server
# Uso: ./test-webhook.sh [URL] [API_KEY]

URL=${1:-"http://localhost:3000"}
API_KEY=${2:-"your_api_key_here"}

echo "🧪 Testing FastBot External Server..."
echo "URL: $URL"
echo "API Key: ${API_KEY:0:8}..."

# Teste 1: Health Check
echo ""
echo "1️⃣  Testing health check..."
curl -s -X GET "$URL/health" | python3 -m json.tool || echo "Health check failed"

# Teste 2: Detailed Health Check
echo ""
echo "2️⃣  Testing detailed health check..."
curl -s -X GET "$URL/health/detailed" | python3 -m json.tool || echo "Detailed health check failed"

# Teste 3: Webhook Test
echo ""
echo "3️⃣  Testing webhook test endpoint..."
curl -s -X POST "$URL/webhook/test" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"test": "message", "timestamp": "'$(date -Iseconds)'"}' | python3 -m json.tool || echo "Webhook test failed"

# Teste 4: Webhook Principal
echo ""
echo "4️⃣  Testing main webhook..."
curl -s -X POST "$URL/webhook" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "message": "Quais são os horários de atendimento?",
    "page": "/test",
    "pageContext": "Test page",
    "timestamp": "'$(date -Iseconds)'",
    "sessionId": '$(date +%s)'000,
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userEmail": "test@example.com",
    "systemMessage": "Você é um assistente virtual de um dentista. Responda de forma profissional e cordial. Os horários de atendimento são de segunda a sexta das 8h às 18h.",
    "chatbotConfig": {
      "office_hours": "Segunda a Sexta: 8h às 18h",
      "office_address": "Rua Teste, 123 - Centro",
      "specialties": "Ortodontia, Clínica Geral",
      "whatsapp": "+55 11 99999-9999"
    }
  }' | python3 -m json.tool || echo "Main webhook test failed"

echo ""
echo "✅ Tests completed!"
