-- Temporariamente desabilitar RLS para teste

-- IMPORTANTE: Execute isso apenas para teste, depois reabilite com políticas corretas

-- Desabilitar RLS na tabela mychatbot_2
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS na tabela profiles (se necessário)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- LEMBRE-SE: Depois de testar, reabilite o RLS com:
-- ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
