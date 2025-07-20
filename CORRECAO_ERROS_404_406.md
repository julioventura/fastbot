# Guia de Correção dos Erros 404 e 406

## ✅ Problemas Corrigidos

### 1. **Erro 404 - favicon.ico**

**Problema:** O Vite estava configurado com `base: '/fastbot/'`, fazendo com que o favicon fosse procurado em `/fastbot/favicon.ico` em vez de `/favicon.ico`.

**Solução:** 

- Comentei temporariamente a linha `base: '/fastbot/'` no `vite.config.ts`
- Para desenvolvimento local, isso resolve o problema
- Para produção, você precisará descomentar essa linha quando deployar

### 2. **Erro 406 - Supabase**

**Problema:** RLS (Row Level Security) configurado incorretamente na tabela `mychatbot_2` do seu Supabase auto-hosted.

**Soluções:**

#### Opção A - Usar Supabase Cloud (Recomendado para desenvolvimento)

- Configurei o `.env` para usar o Supabase Cloud como padrão
- Mais estável para desenvolvimento
- Sem problemas de configuração RLS

#### Opção B - Corrigir o Supabase Auto-hosted

Execute o script `supabase/fix_406_error.sql` no seu Supabase auto-hosted:

1. Abra <https://supabase.cirurgia.com.br/>
2. Vá para SQL Editor
3. Execute o script criado

## 🔧 Configuração Atual

**Servidor:** <http://localhost:8083/>
**Supabase:** Cloud (gyhklifdpebujlvgwldi.supabase.co)

## 🚀 Próximos Passos

1. **Teste no navegador:** <http://localhost:8083/>
2. **Se ainda houver erro 406:** Execute o script SQL no Supabase auto-hosted
3. **Para voltar ao auto-hosted:** Troque os comentários no `.env`

## 📝 Notas Importantes

- O favicon agora deve carregar corretamente
- Os erros 406 devem ser resolvidos com o Supabase Cloud
- Para produção, lembre-se de ajustar o `base` no vite.config.ts
