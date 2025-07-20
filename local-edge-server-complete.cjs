const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar variáveis de ambiente
const OPENAI_API_KEY = "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";
const SUPABASE_URL = "https://supabase.cirurgia.com.br";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Função para dividir texto em chunks
function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const sentences = text.split(/[.!?]+\s/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    const sentenceWithPunctuation = sentence.trim() + '.';
    
    if (currentSize + sentenceWithPunctuation.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Criar overlap pegando as últimas palavras do chunk anterior
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 10));
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
  
  return chunks.filter(chunk => chunk.length > 50);
}

// Função para gerar embedding usando OpenAI
async function generateEmbedding(text, apiKey) {
  console.log('🔧 Generating embedding for text:', text.substring(0, 50) + '...');
  
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
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Rota debug-env
app.post('/functions/v1/debug-env', async (req, res) => {
  console.log('🔧 Debug-env called');
  
  try {
    const envCheck = {
      openai_configured: !!OPENAI_API_KEY,
      supabase_url_configured: !!SUPABASE_URL,
      service_key_configured: !!SUPABASE_SERVICE_ROLE_KEY,
      openai_key_preview: OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : null,
      supabase_url_preview: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : null,
      timestamp: new Date().toISOString()
    };

    // Testar conectividade com OpenAI
    if (OPENAI_API_KEY) {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        });
        
        envCheck.openai_api_status = testResponse.ok ? 'working' : `error_${testResponse.status}`;
      } catch (openaiError) {
        envCheck.openai_api_status = 'connection_failed';
        envCheck.openai_error = openaiError.message;
      }
    }

    res.json({
      success: true,
      environment_check: envCheck
    });
    
  } catch (error) {
    console.error('❌ Error in debug-env:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota generate-embedding
app.post('/functions/v1/generate-embedding', async (req, res) => {
  console.log('🔧 Generate-embedding called');
  
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text parameter is required'
      });
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Gerar embedding
    const embedding = await generateEmbedding(text, OPENAI_API_KEY);

    res.json({
      success: true,
      embedding: embedding,
      text_length: text.length
    });
    
  } catch (error) {
    console.error('❌ Error in generate-embedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota process-embeddings
app.post('/functions/v1/process-embeddings', async (req, res) => {
  console.log('🔧 Process-embeddings called');
  
  try {
    const { documentId, content } = req.body;
    
    if (!documentId || !content) {
      return res.status(400).json({
        success: false,
        error: 'documentId and content parameters are required'
      });
    }

    // Buscar informações do documento
    const { data: document, error: docError } = await supabase
      .from('chatbot_documents')
      .select('chatbot_user, filename')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Dividir o texto em chunks
    const chunks = splitTextIntoChunks(content);
    console.log(`Processing ${chunks.length} chunks for document ${documentId}`);

    let chunksProcessed = 0;
    let chunksFailed = 0;

    // Processar cada chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunk = chunks[i];
        
        // Gerar embedding
        const embedding = await generateEmbedding(chunk, OPENAI_API_KEY);
        
        // Criar metadata
        const metadata = {
          filename: document.filename,
          chunk_index: i,
          total_chunks: chunks.length,
          chunk_length: chunk.length
        };

        // Salvar no banco de dados
        const { error: insertError } = await supabase
          .from('chatbot_embeddings')
          .insert({
            document_id: documentId,
            chatbot_user: document.chatbot_user,
            chunk_text: chunk,
            chunk_index: i,
            embedding: `[${embedding.join(',')}]`,
            metadata: metadata
          });

        if (insertError) {
          console.error('Error inserting embedding:', insertError);
          chunksFailed++;
        } else {
          chunksProcessed++;
        }
        
        console.log(`Processed chunk ${i + 1}/${chunks.length}`);
        
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        chunksFailed++;
      }
    }

    // Atualizar status do documento
    const status = chunksFailed === 0 ? 'processed' : 
                   chunksProcessed > 0 ? 'partially_processed' : 'failed';

    const { error: updateError } = await supabase
      .from('chatbot_documents')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
    }

    res.json({
      success: true,
      documentId: documentId,
      chunks_processed: chunksProcessed,
      chunks_failed: chunksFailed,
      total_chunks: chunks.length,
      status: status
    });
    
  } catch (error) {
    console.error('❌ Error in process-embeddings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Instalar dependência e iniciar servidor
console.log('🔧 Installing @supabase/supabase-js if needed...');

app.listen(port, () => {
  console.log(`🚀 Local Edge Functions server running at http://localhost:${port}`);
  console.log(`🔧 Debug endpoint: http://localhost:${port}/functions/v1/debug-env`);
  console.log(`🔧 Embedding endpoint: http://localhost:${port}/functions/v1/generate-embedding`);
  console.log(`🔧 Process endpoint: http://localhost:${port}/functions/v1/process-embeddings`);
});

module.exports = app;
