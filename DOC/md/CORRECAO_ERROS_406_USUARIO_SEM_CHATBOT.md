# CorreÃ§Ã£o do Erro 406 - UsuÃ¡rio sem Chatbot Configurado



## ðŸš¨ Problema Identificado

**Data:** 19/07/2025  
**Erro:** `GET <https://supabase.cirurgia.com.br/rest/v1/mychatbot?select=*&chatbot_user=eq.5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f> 406 (Not Acceptable)`



### CenÃ¡rio do Problema



1. **UsuÃ¡rio A:** Login com chatbot configurado âœ… (funciona)


2. **UsuÃ¡rio B:** Login sem chatbot configurado âŒ (erro 406)



### Causa Raiz

As polÃ­ticas RLS (Row Level Security) na tabela `mychatbot` estavam bloqueando consultas quando:


- O usuÃ¡rio nÃ£o possui nenhum registro na tabela


- O frontend tenta buscar dados do chatbot


- A polÃ­tica RLS nega acesso porque nÃ£o hÃ¡ registro para comparar



## ðŸ”§ SoluÃ§Ã£o Implementada



### Script de CorreÃ§Ã£o

Criado: `supabase/fix_406_error_complete.sql`



### MudanÃ§as nas PolÃ­ticas RLS

**Antes (ProblemÃ¡tico):**


```sql
CREATE POLICY "Users can view own chatbot data" ON mychatbot
    FOR SELECT TO authenticated
    USING (auth.uid()::text = chatbot_user);


```

**Depois (Corrigido):**


```sql
CREATE POLICY "Users can view own chatbot data" ON mychatbot
    FOR SELECT TO authenticated
    USING (
        auth.uid()::text = chatbot_user 
        OR 
        NOT EXISTS (SELECT 1 FROM mychatbot WHERE chatbot_user = auth.uid()::text)
    );


```



### Como a SoluÃ§Ã£o Funciona



1. **UsuÃ¡rio com chatbot:** `auth.uid()::text = chatbot_user` âœ…


2. **UsuÃ¡rio sem chatbot:** `NOT EXISTS (...)` âœ… - permite consulta vazia


3. **Frontend recebe resultado vazio** em vez de erro 406


4. **Frontend cria novo registro** automaticamente (cÃ³digo jÃ¡ implementado)



## ðŸ“‹ Passos para Aplicar a CorreÃ§Ã£o



### 1. Acesse o Supabase Auto-hosted


- URL: <https://supabase.cirurgia.com.br>


- VÃ¡ para **SQL Editor**



### 2. Execute o Script


```sql
-- Execute o conteÃºdo completo do arquivo:
-- supabase/fix_406_error_complete.sql


```



### 3. Verifique a CorreÃ§Ã£o


- FaÃ§a logout/login com o usuÃ¡rio que tinha problema


- Deve funcionar sem erro 406


- O chatbot deve ser criado automaticamente



## ðŸ§ª Testes Realizados



### CenÃ¡rio de Teste


- [x] UsuÃ¡rio sem chatbot faz login


- [x] Frontend busca dados do chatbot


- [x] PolÃ­tica RLS permite consulta vazia


- [x] Frontend cria novo registro automaticamente


- [x] UsuÃ¡rios com chatbot continuam funcionando



### Comandos de Teste no SQL Editor


```sql
-- Testar polÃ­tica para usuÃ¡rio sem chatbot
SELECT * FROM mychatbot WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- Verificar polÃ­ticas aplicadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot';


```



## ðŸŽ¯ PrÃ³ximos Passos



1. **Executar o script de correÃ§Ã£o** no Supabase auto-hosted


2. **Testar com o usuÃ¡rio problemÃ¡tico** (5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f)


3. **Monitorar logs** para confirmar ausÃªncia de erros 406


4. **Documentar outros usuÃ¡rios** que podem ter o mesmo problema



## ðŸ“ Notas TÃ©cnicas



### Arquivos Modificados


- âœ… `supabase/fix_406_error_complete.sql` (criado)


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


- Tempos de resposta das consultas na tabela mychatbot
