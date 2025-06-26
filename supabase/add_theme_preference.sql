-- Adicionar campo theme_preference na tabela profiles
ALTER TABLE profiles 
ADD COLUMN theme_preference VARCHAR(20) DEFAULT 'blue-dark';

-- Adicionar comentário explicativo
COMMENT ON COLUMN profiles.theme_preference IS 'Preferência de tema do usuário: blue-dark, blue-light, purple-dark, purple-light, gray-dark, gray-light';

-- Opcional: Adicionar constraint para valores válidos
ALTER TABLE profiles 
ADD CONSTRAINT valid_theme_preference 
CHECK (theme_preference IN ('blue-dark', 'blue-light', 'purple-dark', 'purple-light', 'gray-dark', 'gray-light'));
