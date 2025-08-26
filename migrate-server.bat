@echo off
REM Script para migrar external-server para projeto separado (Windows)

echo 🚀 Migração FastBot External Server para projeto separado
echo =========================================================

REM 1. Criar diretório do novo projeto
set "NEW_PROJECT_DIR=..\fastbot-external-server"
echo 📁 Criando novo projeto em: %NEW_PROJECT_DIR%

if not exist "%NEW_PROJECT_DIR%" (
    mkdir "%NEW_PROJECT_DIR%"
    echo ✅ Diretório criado
) else (
    echo ⚠️  Diretório já existe
)

REM 2. Copiar todos os arquivos do external-server
echo 📋 Copiando arquivos...
xcopy /E /I /H external-server "%NEW_PROJECT_DIR%"
echo ✅ Arquivos copiados

REM 3. Criar .gitignore se não existir
if not exist "%NEW_PROJECT_DIR%\.gitignore" (
    echo # Dependencies > "%NEW_PROJECT_DIR%\.gitignore"
    echo node_modules/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo npm-debug.log* >> "%NEW_PROJECT_DIR%\.gitignore"
    echo yarn-debug.log* >> "%NEW_PROJECT_DIR%\.gitignore"
    echo yarn-error.log* >> "%NEW_PROJECT_DIR%\.gitignore"
    echo. >> "%NEW_PROJECT_DIR%\.gitignore"
    echo # Production builds >> "%NEW_PROJECT_DIR%\.gitignore"
    echo dist/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo build/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo. >> "%NEW_PROJECT_DIR%\.gitignore"
    echo # Environment variables >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .env >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .env.local >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .env.development.local >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .env.test.local >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .env.production.local >> "%NEW_PROJECT_DIR%\.gitignore"
    echo. >> "%NEW_PROJECT_DIR%\.gitignore"
    echo # Logs >> "%NEW_PROJECT_DIR%\.gitignore"
    echo logs/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo *.log >> "%NEW_PROJECT_DIR%\.gitignore"
    echo. >> "%NEW_PROJECT_DIR%\.gitignore"
    echo # OS generated files >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .DS_Store >> "%NEW_PROJECT_DIR%\.gitignore"
    echo Thumbs.db >> "%NEW_PROJECT_DIR%\.gitignore"
    echo. >> "%NEW_PROJECT_DIR%\.gitignore"
    echo # IDE >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .vscode/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo .idea/ >> "%NEW_PROJECT_DIR%\.gitignore"
    echo *.swp >> "%NEW_PROJECT_DIR%\.gitignore"
    echo *.swo >> "%NEW_PROJECT_DIR%\.gitignore"
    
    echo ✅ .gitignore criado
)

REM 4. Criar README.md específico
echo # FastBot External Server > "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo Servidor Node.js + TypeScript para processamento externo do FastBot via webhooks. >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo ## 🚀 Quick Start >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo ```bash >> "%NEW_PROJECT_DIR%\README.md"
echo # Instalar dependências >> "%NEW_PROJECT_DIR%\README.md"
echo npm install >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo # Configurar environment >> "%NEW_PROJECT_DIR%\README.md"
echo copy .env.example .env >> "%NEW_PROJECT_DIR%\README.md"
echo # Editar .env com suas credenciais >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo # Desenvolvimento >> "%NEW_PROJECT_DIR%\README.md"
echo npm run dev >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo # Build para produção >> "%NEW_PROJECT_DIR%\README.md"
echo npm run build >> "%NEW_PROJECT_DIR%\README.md"
echo npm start >> "%NEW_PROJECT_DIR%\README.md"
echo ``` >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo ## 🔗 Endpoints >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo - **Health Check:** `GET /health` >> "%NEW_PROJECT_DIR%\README.md"
echo - **Webhook:** `POST /webhook` >> "%NEW_PROJECT_DIR%\README.md"
echo - **Chat direto:** `POST /api/chat` >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo ## 📖 Documentação >> "%NEW_PROJECT_DIR%\README.md"
echo. >> "%NEW_PROJECT_DIR%\README.md"
echo Veja `DEPLOY_INSTRUCTIONS.md` para instruções completas de deploy. >> "%NEW_PROJECT_DIR%\README.md"

echo ✅ README.md criado

REM 5. Inicializar git
cd "%NEW_PROJECT_DIR%"
if not exist ".git" (
    git init
    echo ✅ Git inicializado
) else (
    echo ⚠️  Git já inicializado
)

REM 6. Criar commit inicial
git add .
git commit -m "feat: initial commit - FastBot External Server"

echo ✅ Commit inicial criado

echo.
echo 🎉 MIGRAÇÃO CONCLUÍDA!
echo ========================
echo.
echo 📁 Novo projeto em: %NEW_PROJECT_DIR%
echo.
echo 🔄 Próximos passos:
echo 1. cd %NEW_PROJECT_DIR%
echo 2. npm install
echo 3. copy .env.example .env
echo 4. Editar .env com suas credenciais
echo 5. npm run dev
echo.
echo 🐙 Para GitHub:
echo 1. Criar novo repositório: fastbot-external-server
echo 2. git remote add origin ^<URL_DO_REPO^>
echo 3. git push -u origin main
echo.
echo 🧹 Limpeza (opcional):
echo - Remover pasta external-server\ do projeto principal
echo - Atualizar .gitignore do FastBot principal

pause
