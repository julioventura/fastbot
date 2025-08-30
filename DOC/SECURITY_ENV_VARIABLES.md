# 🔐 Segurança - Variáveis de Ambiente

## ⚠️ IMPORTANTE: Nunca exponha chaves secretas no código

### Chaves que DEVEM estar em variáveis de ambiente

1. **VITE_SUPABASE_SERVICE_ROLE_KEY**
   - Chave de administrador do Supabase
   - Permite acesso total ao banco de dados
   - NUNCA commit no repositório

2. **VITE_SUPABASE_ANON_KEY**
   - Chave pública do Supabase
   - Pode ser commitada, mas melhor usar variável

3. **VITE_OPENAI_API_KEY**
   - Chave da API OpenAI
   - Permite uso de serviços pagos
   - NUNCA commit no repositório

### Como configurar

1. Copie o arquivo `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   ```

2. Preencha suas chaves reais no arquivo `.env`

3. O arquivo `.env` está no `.gitignore` e não será commitado

### Verificação de segurança

```bash
# Buscar chaves expostas no código
grep -r "eyJ" src/ --exclude-dir=node_modules
grep -r "sk-" src/ --exclude-dir=node_modules
```

### Correção aplicada

✅ Substituída chave hardcoded por `import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY`
✅ Adicionada verificação de existência da variável
✅ Atualizado `.env.example` com a nova variável
✅ **CORREÇÃO COMPLETA**: Removidas chaves de todos os arquivos:

  - `debug-auth.js` - Chave anon removida
  - `test-documents-details.js` - Chave anon removida  
  - `local-edge-server.js` - Chaves anon, service_role e OpenAI removidas
  - `local-edge-server-complete.cjs` - Chaves anon, service_role e OpenAI removidas
  - `DocumentUpload.tsx` - Chave service_role removida

### Arquivos protegidos

📁 **Scripts Node.js**: Agora usam `dotenv` para carregar variáveis do `.env`
📁 **Frontend React**: Usa `import.meta.env.VARIAVEL_NAME`
📁 **Validação**: Todos os scripts verificam se as variáveis existem antes de usar

### Próximos passos

1. Configure a variável `VITE_SUPABASE_SERVICE_ROLE_KEY` no seu arquivo `.env`
2. Obtenha a chave no painel do Supabase > Settings > API
3. Nunca compartilhe essa chave publicamente
