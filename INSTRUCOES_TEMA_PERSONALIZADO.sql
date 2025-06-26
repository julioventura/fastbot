-- Instruções para implementar a funcionalidade de tema personalizado
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna theme_preference na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'blue-dark';

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN profiles.theme_preference IS 'Preferência de tema do usuário: blue-dark, blue-light, purple-dark, purple-light, gray-dark, gray-light';

-- 3. Adicionar constraint para valores válidos (corrigido)
-- Primeiro verificar se a constraint já existe, se não existir, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_theme_preference'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT valid_theme_preference 
        CHECK (theme_preference IN ('blue-dark', 'blue-light', 'purple-dark', 'purple-light', 'gray-dark', 'gray-light'));
    END IF;
END $$;

-- 4. Atualizar políticas RLS se necessário (permitir que usuários atualizem seu próprio tema)
-- Esta política já deve existir se você já tem RLS configurado para profiles

-- 5. Verificar se a tabela foi atualizada corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'theme_preference';

-- 6. Teste: verificar se consegue inserir/atualizar dados
-- SELECT id, theme_preference FROM profiles LIMIT 5;
