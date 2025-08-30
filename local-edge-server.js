const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar variáveis de ambiente
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://supabase.cirurgia.com.br";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Verificar se as variáveis estão configuradas
if (!OPENAI_API_KEY) {
  console.error('❌ ERRO: VITE_OPENAI_API_KEY não configurada no arquivo .env');
  process.exit(1);
}
if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: VITE_SUPABASE_ANON_KEY não configurada no arquivo .env');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: VITE_SUPABASE_SERVICE_ROLE_KEY não configurada no arquivo .env');
  process.exit(1);
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Local Edge Functions server running at http://localhost:${port}`);
  console.log(`🔧 Debug endpoint: http://localhost:${port}/functions/v1/debug-env`);
  console.log(`🔧 Embedding endpoint: http://localhost:${port}/functions/v1/generate-embedding`);
});

module.exports = app;
