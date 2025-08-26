# FastBot External Server

Servidor Node.js com TypeScript para processamento externo de webhooks, integrando banco de dados Supabase e OpenAI API.

## 🚀 Características

- ✅ **TypeScript** - Tipagem estática e robustez
- ✅ **Express.js** - Framework web moderno
- ✅ **Supabase** - Integração com banco de dados PostgreSQL
- ✅ **OpenAI API** - Processamento de IA
- ✅ **Docker** - Containerização para deploy fácil
- ✅ **Winston** - Sistema de logs avançado
- ✅ **Zod** - Validação de dados
- ✅ **Helmet** - Segurança HTTP
- ✅ **CORS** - Configuração de origens permitidas

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose (para deploy)
- Chaves de API:
  - OpenAI API Key
  - Supabase URL e Service Role Key

## 🛠️ Instalação

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
NODE_ENV=production
PORT=3000

# OpenAI
OPENAI_API_KEY=sk-proj-sua_chave_aqui

# Supabase
SUPABASE_URL=https://supabase.cirurgia.com.br
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui

# Segurança
API_KEY=sua_chave_api_segura_aqui
ALLOWED_ORIGINS=https://seudominio.com,http://localhost:3000

# Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### 2. Instalação local (desenvolvimento)

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

### 3. Deploy com Docker

```bash
# Build da imagem
docker build -t fastbot-external-server .

# Executar com docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🔗 Endpoints

### Webhook Principal
`POST /webhook`

Endpoint principal para integração com N8N. Recebe o payload conforme especificação do `WEBHOOK_SPECIFICATION.json`.

**Headers necessários:**
```
Content-Type: application/json
X-API-Key: sua_chave_api_aqui
```

**Exemplo de payload:**
```json
{
  "message": "Quais são os horários de atendimento?",
  "page": "/my-chatbot",
  "pageContext": "página Meu Chatbot do FastBot",
  "timestamp": "2025-08-25T15:30:45.123Z",
  "sessionId": 1721485845123,
  "userId": "5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f",
  "userEmail": "dr.silva@exemplo.com",
  "systemMessage": "Você é um assistente virtual...",
  "chatbotConfig": {
    "office_hours": "Segunda a Sexta: 8h às 18h",
    "office_address": "Rua das Flores, 123",
    "specialties": "Ortodontia, Clínica Geral"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "response": "Nossos horários de atendimento são...",
    "metadata": {
      "userId": "5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f",
      "sessionId": 1721485845123,
      "timestamp": "2025-08-25T15:30:45.123Z",
      "processed": true
    }
  },
  "timestamp": "2025-08-25T15:30:45.123Z"
}
```

### Chat Direto
`POST /api/chat/message`

Alternativa ao webhook para integração direta.

### Health Check
`GET /health` - Health check básico
`GET /health/detailed` - Health check com validação de serviços

### Teste
`POST /webhook/test` - Endpoint de teste

## 🔐 Segurança

### Autenticação
O servidor usa autenticação por API Key. Configure a variável `API_KEY` no `.env` e envie o header:

```
X-API-Key: sua_chave_api_aqui
```

### CORS
Configure as origens permitidas na variável `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://seudominio.com,https://outrodominio.com
```

## 📊 Monitoramento

### Logs
Os logs são salvos em `./logs/app.log` em produção e no console em desenvolvimento.

Níveis de log: `error`, `warn`, `info`, `debug`

### Health Checks
- `/health` - Status básico do servidor
- `/health/detailed` - Verifica OpenAI, Supabase e configurações

### Docker Health Check
O container possui health check automático verificando o endpoint `/health`.

## 🚀 Deploy na VPS

### 1. Upload dos arquivos
```bash
# Copiar projeto para VPS
scp -r external-server/ user@sua-vps:/home/user/fastbot-server/
```

### 2. Configurar no servidor
```bash
# Conectar na VPS
ssh user@sua-vps

# Navegar para o diretório
cd /home/user/fastbot-server/

# Configurar .env
cp .env.example .env
nano .env

# Executar com Docker
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs -f
```

### 3. Proxy Reverso (Nginx)

Configuração recomendada para Nginx:

```nginx
server {
    listen 80;
    server_name webhook.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. HTTPS com Certbot
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d webhook.seudominio.com
```

## 🔧 Desenvolvimento

### Scripts disponíveis
- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm start` - Executar versão buildada
- `npm test` - Executar testes
- `npm run lint` - Verificar código

### Estrutura do projeto
```
src/
├── api/           # Endpoints/rotas
├── config/        # Configurações
├── middleware/    # Middlewares Express
├── services/      # Lógica de negócio
├── types/         # Tipos TypeScript
├── utils/         # Funções utilitárias
└── index.ts       # Ponto de entrada
```

## 🐛 Troubleshooting

### Verificar status dos serviços
```bash
# Health check
curl http://localhost:3000/health/detailed

# Logs do container
docker-compose logs fastbot-server

# Status do container
docker-compose ps
```

### Problemas comuns

1. **Erro de conexão OpenAI**
   - Verificar se `OPENAI_API_KEY` está correta
   - Verificar conectividade internet

2. **Erro de conexão Supabase**
   - Verificar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
   - Verificar se o banco está acessível

3. **Erro 401 Unauthorized**
   - Verificar se `X-API-Key` está sendo enviado
   - Verificar se `API_KEY` está configurada no `.env`

## 📞 Suporte

Para problemas ou dúvidas, verificar:
1. Logs do servidor (`docker-compose logs -f`)
2. Health check detalhado (`GET /health/detailed`)
3. Configurações no arquivo `.env`
