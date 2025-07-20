-- Script SQL para deletar usuários específicos do Auth
-- ATENÇÃO: Esta operação é irreversível!

-- ========================================================
-- DELETAR USUÁRIOS SELECIONADOS DO AUTH.USERS
-- ========================================================

-- 1. Verificar os usuários antes de deletar
SELECT 'USUÁRIOS A SEREM DELETADOS:' as info;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE id IN (
    '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a',  -- julio@dentistas.com.br
    '4886a864-3bf0-41e9-85e7-6cd8e992251a'   -- juliocesarventuraacardoso@gmail.com
);

-- 2. Deletar dados relacionados primeiro (se houver foreign keys)
-- Deletar da tabela profiles (se existir)
DELETE FROM public.profiles 
WHERE id IN (
    '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a',
    '4886a864-3bf0-41e9-85e7-6cd8e992251a'
);

-- Deletar da tabela mychatbot_2 (se existir)
DELETE FROM public.mychatbot_2 
WHERE chatbot_user IN (
    '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a',
    '4886a864-3bf0-41e9-85e7-6cd8e992251a'
);

-- 3. Deletar os usuários do auth.users
DELETE FROM auth.users 
WHERE id IN (
    '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a',  -- julio@dentistas.com.br
    '4886a864-3bf0-41e9-85e7-6cd8e992251a'   -- juliocesarventuraacardoso@gmail.com
);

-- 4. Verificar que foram deletados
SELECT 'VERIFICAÇÃO PÓS-DELEÇÃO:' as info;
SELECT COUNT(*) as usuarios_restantes FROM auth.users;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- ========================================================
-- SCRIPT ALTERNATIVO MAIS SEGURO (COMENTADO)
-- ========================================================

/*
Se preferir deletar um de cada vez para maior segurança:

-- Deletar primeiro usuário
DELETE FROM public.profiles WHERE id = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';
DELETE FROM public.mychatbot_2 WHERE chatbot_user = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';
DELETE FROM auth.users WHERE id = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';

-- Verificar
SELECT * FROM auth.users WHERE email = 'julio@dentistas.com.br';

-- Deletar segundo usuário  
DELETE FROM public.profiles WHERE id = '4886a864-3bf0-41e9-85e7-6cd8e992251a';
DELETE FROM public.mychatbot_2 WHERE chatbot_user = '4886a864-3bf0-41e9-85e7-6cd8e992251a';
DELETE FROM auth.users WHERE id = '4886a864-3bf0-41e9-85e7-6cd8e992251a';

-- Verificar
SELECT * FROM auth.users WHERE email = 'juliocesarventuraacardoso@gmail.com';
*/

-- ========================================================
-- NOTAS IMPORTANTES
-- ========================================================

/*
ANTES DE EXECUTAR:

1. Faça backup do banco se necessário
2. Confirme que são realmente os usuários corretos
3. Verifique se não há dados importantes vinculados
4. Execute primeiro apenas as consultas SELECT para verificar

APÓS EXECUTAR:

1. Os usuários não conseguirão mais fazer login
2. Todos os dados relacionados serão perdidos
3. Os emails ficarão disponíveis para novo cadastro
4. Não há como reverter esta operação

TABELAS QUE PODEM TER DADOS RELACIONADOS:
- public.profiles
- public.mychatbot_2
- Outras tabelas que usem user_id como foreign key
*/
