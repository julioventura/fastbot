#!/bin/bash
# Script para migrar external-server para projeto separado

echo "🚀 Migração FastBot External Server para projeto separado"
echo "========================================================="

# 1. Criar diretório do novo projeto
NEW_PROJECT_DIR="../fastbot-external-server"
echo "📁 Criando novo projeto em: $NEW_PROJECT_DIR"

if [ ! -d "$NEW_PROJECT_DIR" ]; then
    mkdir -p "$NEW_PROJECT_DIR"
    echo "✅ Diretório criado"
else
    echo "⚠️  Diretório já existe"
fi

# 2. Copiar todos os arquivos do external-server
echo "📋 Copiando arquivos..."
cp -r external-server/* "$NEW_PROJECT_DIR/"
cp external-server/.env.example "$NEW_PROJECT_DIR/" 2>/dev/null || true
cp external-server/.gitignore "$NEW_PROJECT_DIR/" 2>/dev/null || true

echo "✅ Arquivos copiados"

# 3. Criar .gitignore se não existir
if [ ! -f "$NEW_PROJECT_DIR/.gitignore" ]; then
    cat > "$NEW_PROJECT_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker
.dockerignore
EOF
    echo "✅ .gitignore criado"
fi

# 4. Criar README.md específico
cat > "$NEW_PROJECT_DIR/README.md" << 'EOF'
# FastBot External Server

Servidor Node.js + TypeScript para processamento externo do FastBot via webhooks.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar environment
cp .env.example .env
# Editar .env com suas credenciais

# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🔗 Endpoints

- **Health Check:** `GET /health`
- **Webhook:** `POST /webhook`
- **Chat direto:** `POST /api/chat`

## 📖 Documentação

Veja `DEPLOY_INSTRUCTIONS.md` para instruções completas de deploy.

## 🐳 Docker

```bash
# Build
docker build -t fastbot-external-server .

# Run
docker-compose up -d
```

## 🔧 Configuração

Configure as variáveis em `.env`:

- `OPENAI_API_KEY`: Sua chave da OpenAI
- `SUPABASE_URL`: URL do seu projeto Supabase  
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key
- `API_KEY`: Chave para autenticação dos webhooks

EOF

echo "✅ README.md criado"

# 5. Inicializar git
cd "$NEW_PROJECT_DIR"
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git inicializado"
else
    echo "⚠️  Git já inicializado"
fi

# 6. Criar commit inicial
git add .
git commit -m "feat: initial commit - FastBot External Server

- Node.js + TypeScript server
- OpenAI integration
- Supabase integration  
- Webhook endpoints
- Docker configuration
- Health check endpoints
- Comprehensive documentation"

echo "✅ Commit inicial criado"

echo ""
echo "🎉 MIGRAÇÃO CONCLUÍDA!"
echo "========================"
echo ""
echo "📁 Novo projeto em: $NEW_PROJECT_DIR"
echo ""
echo "🔄 Próximos passos:"
echo "1. cd $NEW_PROJECT_DIR"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. Editar .env com suas credenciais"
echo "5. npm run dev"
echo ""
echo "🐙 Para GitHub:"
echo "1. Criar novo repositório: fastbot-external-server"
echo "2. git remote add origin <URL_DO_REPO>"
echo "3. git push -u origin main"
echo ""
echo "🧹 Limpeza (opcional):"
echo "- Remover pasta external-server/ do projeto principal"
echo "- Atualizar .gitignore do FastBot principal"
EOF