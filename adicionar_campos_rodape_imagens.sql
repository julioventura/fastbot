-- Adicionar novos campos à tabela mychatbot_2
-- Data: Janeiro 2025
-- Campos: footer_message (rodapé das mensagens) e uploaded_images (imagens anexadas)

-- Adicionar campo para rodapé das mensagens
ALTER TABLE mychatbot_2 
ADD COLUMN IF NOT EXISTS footer_message TEXT;

-- Adicionar campo para imagens anexadas (array de strings/URLs)
ALTER TABLE mychatbot_2 
ADD COLUMN IF NOT EXISTS uploaded_images TEXT[];

-- Comentários para documentação
COMMENT ON COLUMN mychatbot_2.footer_message IS 'Texto que aparece no final de cada mensagem do chatbot';
COMMENT ON COLUMN mychatbot_2.uploaded_images IS 'Array de URLs/base64 das imagens anexadas no chatbot';

-- Verificar se os campos foram criados
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
  AND column_name IN ('footer_message', 'uploaded_images')
ORDER BY column_name;
