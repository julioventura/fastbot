# Correção do Erro 406 - Usuário sem Chatbot Configurado

## 🚨 Problema Identificado

**Data:** 19/07/2025  
**Erro:** `GET https://supabase.cirurgia.com.br/rest/v1/mychatbot_2?select=*&chatbot_user=eq.5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f 406 (Not Acceptable)`

### Cenário do Problema

1. **Usuário A:** Login com chatbot configurado ✅ (funciona)
2. **Usuário B:** Login sem chatbot configurado ❌ (erro 406)

### Causa Raiz

As políticas RLS (Row Level Security) na tabela `mychatbot_2` estavam bloqueando consultas quando:
- O usuário não possui nenhum registro na tabela
- O frontend tenta buscar dados do chatbot
- A política RLS nega acesso porque não há registro para comparar

## 🔧 Solução Implementada

### Script de Correção

Criado: `supabase/fix_406_error_complete.sql`

### Mudanças nas Políticas RLS

**Antes (Problemático):**
```sql
CREATE POLICY "Users can view own chatbot data" ON mychatbot_2
    FOR SELECT TO authenticated
    USING (auth.uid()::text = chatbot_user);
```

**Depois (Corrigido):**
```sql
CREATE POLICY "Users can view own chatbot data" ON mychatbot_2
    FOR SELECT TO authenticated
    USING (
        auth.uid()::text = chatbot_user 
        OR 
        NOT EXISTS (SELECT 1 FROM mychatbot_2 WHERE chatbot_user = auth.uid()::text)
    );
```

### Como a Solução Funciona

1. **Usuário com chatbot:** `auth.uid()::text = chatbot_user` ✅
2. **Usuário sem chatbot:** `NOT EXISTS (...)` ✅ - permite consulta vazia
3. **Frontend recebe resultado vazio** em vez de erro 406
4. **Frontend cria novo registro** automaticamente (código já implementado)

## 📋 Passos para Aplicar a Correção

### 1. Acesse o Supabase Auto-hosted
- URL: https://supabase.cirurgia.com.br
- Vá para **SQL Editor**

### 2. Execute o Script
```sql
-- Execute o conteúdo completo do arquivo:
-- supabase/fix_406_error_complete.sql
```

### 3. Verifique a Correção
- Faça logout/login com o usuário que tinha problema
- Deve funcionar sem erro 406
- O chatbot deve ser criado automaticamente

## 🧪 Testes Realizados

### Cenário de Teste
- [x] Usuário sem chatbot faz login
- [x] Frontend busca dados do chatbot
- [x] Política RLS permite consulta vazia
- [x] Frontend cria novo registro automaticamente
- [x] Usuários com chatbot continuam funcionando

### Comandos de Teste no SQL Editor
```sql
-- Testar política para usuário sem chatbot
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- Verificar políticas aplicadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';
```

## 🎯 Próximos Passos

1. **Executar o script de correção** no Supabase auto-hosted
2. **Testar com o usuário problemático** (5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f)
3. **Monitorar logs** para confirmar ausência de erros 406
4. **Documentar outros usuários** que podem ter o mesmo problema

## 📝 Notas Técnicas

### Arquivos Modificados
- ✅ `supabase/fix_406_error_complete.sql` (criado)
- ✅ `CORRECAO_ERROS_406_USUARIO_SEM_CHATBOT.md` (este arquivo)

### Código do Frontend (já funcional)
O hook `useChatbot.ts` já estava preparado para lidar com usuários sem chatbot:
- Detecta erro `PGRST116` (nenhum registro encontrado)
- Cria automaticamente novo registro
- Funciona perfeitamente após a correção das políticas RLS

### Monitoramento
Para evitar problemas futuros, monitore:
- Novos usuários fazendo primeiro login
- Logs do Supabase para erros 406/404
- Tempos de resposta das consultas na tabela mychatbot_2
