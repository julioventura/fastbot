-- Configurar políticas de RLS para a tabela mychatbot_2

-- Habilitar RLS na tabela mychatbot_2
ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own chatbot data" ON mychatbot_2
    FOR SELECT USING (auth.uid()::text = chatbot_user);

-- Política para permitir que usuários insiram apenas seus próprios dados
CREATE POLICY "Users can insert own chatbot data" ON mychatbot_2
    FOR INSERT WITH CHECK (auth.uid()::text = chatbot_user);

-- Política para permitir que usuários atualizem apenas seus próprios dados
CREATE POLICY "Users can update own chatbot data" ON mychatbot_2
    FOR UPDATE USING (auth.uid()::text = chatbot_user)
    WITH CHECK (auth.uid()::text = chatbot_user);

-- Política para permitir que usuários deletem apenas seus próprios dados
CREATE POLICY "Users can delete own chatbot data" ON mychatbot_2
    FOR DELETE USING (auth.uid()::text = chatbot_user);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';
