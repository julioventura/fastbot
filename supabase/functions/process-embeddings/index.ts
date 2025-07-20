// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore - Deno imports
import "https://deno.land/x/xhr@0.3.0/mod.ts";
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  documentId: string;
  content: string;
}

// Função para dividir texto em chunks
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+\s/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    const sentenceWithPunctuation = sentence.trim() + '.';
    
    if (currentSize + sentenceWithPunctuation.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Criar overlap pegando as últimas palavras do chunk anterior
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 10)); // Aproximadamente 10 chars por palavra
      currentChunk = overlapWords.join(' ') + ' ' + sentenceWithPunctuation;
      currentSize = currentChunk.length;
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentenceWithPunctuation;
      currentSize = currentChunk.length;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filtrar chunks muito pequenos
}

// Função para gerar embeddings usando OpenAI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// @ts-ignore - Deno edge function handler
serve(async (req: any) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentId, content }: RequestBody = await req.json()
    
    // Verificar se temos as variáveis de ambiente necessárias
    // @ts-ignore - Deno globals
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    // @ts-ignore - Deno globals
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno globals
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Dividir o texto em chunks
    const chunks = splitTextIntoChunks(content);
    console.log(`Processing ${chunks.length} chunks for document ${documentId}`);

    // Buscar informações do documento para pegar o chatbot_user
    const { data: document, error: docError } = await supabase
      .from('chatbot_documents')
      .select('chatbot_user, filename')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Processar cada chunk
    const embeddingPromises = chunks.map(async (chunk, index) => {
      try {
        // Gerar embedding
        const embedding = await generateEmbedding(chunk, openaiApiKey);
        
        // Criar metadata
        const metadata = {
          filename: document.filename,
          chunk_length: chunk.length,
          chunk_number: index + 1,
          total_chunks: chunks.length,
          processed_at: new Date().toISOString()
        };

        // Salvar no Supabase
        const { error: insertError } = await supabase
          .from('chatbot_embeddings')
          .insert({
            document_id: documentId,
            chatbot_user: document.chatbot_user,
            chunk_text: chunk,
            chunk_index: index,
            embedding: embedding,
            metadata: metadata
          });

        if (insertError) {
          console.error(`Error inserting chunk ${index}:`, insertError);
          throw insertError;
        }

        return { success: true, index };
      } catch (error) {
        console.error(`Error processing chunk ${index}:`, error);
        return { success: false, index, error: error.message };
      }
    });

    // Aguardar processamento de todos os chunks
    const results = await Promise.allSettled(embeddingPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Atualizar status do documento
    const finalStatus = failed === 0 ? 'completed' : 'error';
    const { error: updateError } = await supabase
      .from('chatbot_documents')
      .update({ 
        status: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunks_processed: successful,
        chunks_failed: failed,
        total_chunks: chunks.length,
        status: finalStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in process-embeddings function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
