-- Corrigir políticas do mychatbot_2 para usar authenticated role

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can insert own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can update own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can delete own chatbot data" ON mychatbot_2;

-- Criar políticas para authenticated role (como na tabela profiles)
CREATE POLICY "Users can view own chatbot data" ON mychatbot_2
    FOR SELECT TO authenticated
    USING (auth.uid()::text = chatbot_user);

CREATE POLICY "Users can insert own chatbot data" ON mychatbot_2
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = chatbot_user);

CREATE POLICY "Users can update own chatbot data" ON mychatbot_2
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = chatbot_user)
    WITH CHECK (auth.uid()::text = chatbot_user);

CREATE POLICY "Users can delete own chatbot data" ON mychatbot_2
    FOR DELETE TO authenticated
    USING (auth.uid()::text = chatbot_user);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';
