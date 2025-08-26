# 🚀 Instruções de Deploy - FastBot External Server

## 📋 Checklist Pré-Deploy

### ✅ Preparação

- [ ] Node.js 18+ instalado na VPS
- [ ] Docker e Docker Compose instalados
- [ ] Nginx configurado (opcional, mas recomendado)
- [ ] Domínio configurado (ex: webhook.seudominio.com)
- [ ] Certificado SSL configurado

### ✅ Credenciais Necessárias

- [ ] OpenAI API Key
- [ ] Supabase URL
- [ ] Supabase Service Role Key
- [ ] API Key personalizada para segurança

---

## 🖥️ Deploy na VPS

### 1. Upload do Projeto

```bash
# Na sua máquina local, fazer upload via SCP
scp -r external-server/ user@sua-vps:/home/user/fastbot-server/

# Ou clonar diretamente na VPS (se usando Git)
ssh user@sua-vps
cd /home/user/
git clone seu-repositorio
cd seu-repositorio/external-server/
```

### 2. Configuração na VPS

```bash
# Conectar na VPS
ssh user@sua-vps
cd /home/user/fastbot-server/

# Copiar e configurar .env
cp .env.example .env
nano .env
```

**Configure o arquivo `.env`:**

```env
NODE_ENV=production
PORT=3000

# OpenAI
OPENAI_API_KEY=sk-proj-sua_chave_openai_aqui

# Supabase (use suas credenciais atuais)
SUPABASE_URL=https://supabase.cirurgia.com.br
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui

# Segurança - GERE UMA CHAVE FORTE!
API_KEY=SuaChaveAPISeguraAqui123!@#

# Origens permitidas
ALLOWED_ORIGINS=https://seudominio.com,https://webhook.seudominio.com

# Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### 3. Executar Deploy

```bash
# Dar permissão ao script (Linux)
chmod +x deploy.sh

# Executar deploy em produção
./deploy.sh prod

# Ou no Windows
deploy.bat prod
```

### 4. Verificar se está funcionando

```bash
# Verificar status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar health check
curl http://localhost:3000/health
```

---

## 🔒 Configuração do Nginx (Recomendado)

### 1. Instalar Nginx (se não tiver)

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/fastbot-webhook
```

**Conteúdo do arquivo:**

```nginx
server {
    listen 80;
    server_name webhook.seudominio.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=10r/m;
    
    location / {
        limit_req zone=webhook burst=5;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (sem rate limit)
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Ativar e testar configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/fastbot-webhook /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 4. Configurar SSL com Certbot

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d webhook.seudominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

---

## 🔧 Configuração do N8N

### 1. URL do Webhook

```
https://webhook.seudominio.com/webhook
```

### 2. Headers necessários

```
Content-Type: application/json
X-API-Key: SuaChaveAPISeguraAqui123!@#
```

### 3. Exemplo de configuração no N8N

**HTTP Request Node:**

- **Method:** POST
- **URL:** `https://webhook.seudominio.com/webhook`
- **Headers:**
  - `Content-Type`: `application/json`
  - `X-API-Key`: `SuaChaveAPISeguraAqui123!@#`
- **Body:** Use o payload conforme `WEBHOOK_SPECIFICATION.json`

---

## 📊 Monitoramento e Manutenção

### Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Verificar status dos containers
docker-compose ps

# Reiniciar serviço
docker-compose restart

# Parar serviço
docker-compose down

# Atualizar e reiniciar
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver uso de recursos
docker stats
```

### Health Checks

```bash
# Health check básico
curl https://webhook.seudominio.com/health

# Health check detalhado
curl https://webhook.seudominio.com/health/detailed

# Teste do webhook
curl -X POST https://webhook.seudominio.com/webhook/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SuaChaveAPISeguraAqui123!@#" \
  -d '{"test": "message"}'
```

### Backup e Logs

```bash
# Backup dos logs
sudo cp /home/user/fastbot-server/logs/app.log /backup/fastbot-logs-$(date +%Y%m%d).log

# Rotação de logs (adicionar ao crontab)
echo "0 2 * * * /usr/bin/find /home/user/fastbot-server/logs -name '*.log' -mtime +7 -delete" | sudo crontab -
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia

```bash
# Verificar logs
docker-compose logs

# Verificar .env
cat .env

# Reconstruir imagem
docker-compose build --no-cache
```

#### 2. Erro 401 Unauthorized

- Verificar se `X-API-Key` está sendo enviado
- Verificar se `API_KEY` no `.env` está correta

#### 3. Erro de conexão OpenAI

```bash
# Testar manualmente
curl -H "Authorization: Bearer sua_openai_key" https://api.openai.com/v1/models
```

#### 4. Erro de conexão Supabase

- Verificar URL e chaves no `.env`
- Verificar conectividade de rede

#### 5. Nginx erro 502 Bad Gateway

```bash
# Verificar se o container está rodando
docker-compose ps

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Logs Importantes

```bash
# Logs da aplicação
docker-compose logs fastbot-server

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u docker
```

---

## ✅ Validação Final

Após o deploy, execute:

1. **Health check:** `curl https://webhook.seudominio.com/health/detailed`
2. **Teste do webhook:** Use o script `test-webhook.sh` ou `test-webhook.bat`
3. **Integração N8N:** Configure e teste no N8N
4. **Monitoramento:** Configure alertas se necessário

---

## 📞 Suporte

Para problemas:

1. Verificar logs: `docker-compose logs -f`
2. Health check: `curl https://webhook.seudominio.com/health/detailed`
3. Testar conectividade: Scripts de teste incluídos
4. Verificar configurações do Nginx e SSL
