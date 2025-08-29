# Variáveis de Ambiente - Fastbot

## 📁 Localização das Variáveis

Todas as variáveis de ambiente estão centralizadas no arquivo **`.env`** na raiz do projeto.

**Não há mais arquivos `.env` duplicados!**

## 🔧 Tipos de Variáveis

### 1. Variáveis para Edge Functions (Supabase)

Usadas pelas Edge Functions do Supabase, **sem prefixo VITE_**:

```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4.1-nano
SUPABASE_URL=https://supabase.cirurgia.com.br
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
```

### 2. Variáveis para Frontend (React/Vite)

Usadas pelo frontend React, **com prefixo VITE_**:

```bash
VITE_SUPABASE_URL=https://supabase.cirurgia.com.br
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SERVICE_ROLE_KEY=eyJ...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_MODEL=gpt-4.1-nano
VITE_USE_LOCAL_AI=true
```

## 🚀 Modo de Processamento

A variável `VITE_USE_LOCAL_AI` controla o modo de operação:

- `true` = Modo LOCAL (processamento local com embeddings no Supabase)
- `false` = Modo WEBHOOK (envio para N8N)

## ⚙️ Como Funciona

### No Frontend (React/Vite)

- O Vite expõe apenas variáveis com prefixo `VITE_`
- Acessíveis via `import.meta.env.VITE_NOME_VARIAVEL`

### Nas Edge Functions (Supabase)

- O Supabase expõe variáveis sem prefixo `VITE_`
- Acessíveis via `Deno.env.get('NOME_VARIAVEL')`

## 🔄 Após Mudanças

1. **Frontend**: Reinicie o servidor de desenvolvimento (`npm run dev`)
2. **Edge Functions**: Execute `supabase functions deploy` se necessário

## 📝 Histórico

- ✅ **Antes**: Dois arquivos `.env` (raiz + supabase/)
- ✅ **Agora**: Um único arquivo `.env` na raiz
- ✅ **Benefício**: Eliminada duplicação e confusão
