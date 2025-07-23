import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';

interface SearchResult {
  id: string;
  document_id: string;
  chunk_text: string;
  similarity: number;
  metadata: Record<string, unknown>;
  filename: string;
}

interface ProcessEmbeddingsResponse {
  success: boolean;
  documentId: string;
  chunks_processed: number;
  chunks_failed: number;
  total_chunks: number;
  status: string;
  error?: string;
}

export const useVectorStore = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  // Função para dividir texto em chunks
  const splitTextIntoChunks = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
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
  };

  // Função para gerar embedding usando OpenAI
  const generateEmbedding = async (text: string): Promise<number[]> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  };

  // Função para gerar embedding de uma query usando OpenAI
  const generateQueryEmbedding = useCallback(async (query: string): Promise<number[]> => {
    console.log('🔧 [DEBUG] Gerando embedding para query:', query.substring(0, 50) + '...');
    
    // Usar OpenAI API diretamente ao invés do servidor local
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
          model: 'text-embedding-ada-002',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      
      console.log('✅ [DEBUG] Embedding gerado com sucesso:', {
        queryLength: query.length,
        embeddingDimensions: embedding.length
      });
      
      return embedding;
      
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao gerar embedding:', error);
      throw error;
    }
  }, []);

  // Função para processar embeddings de um documento
  const processDocumentEmbeddings = useCallback(async (
    documentId: string, 
    content: string
  ): Promise<ProcessEmbeddingsResponse> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);
    console.log('🔧 [DEBUG] Iniciando processamento de embeddings:', {
      documentId,
      contentLength: content.length,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    try {
      console.log('🔧 [DEBUG] Processamento direto via cliente (contornando Edge Function)');
      
      // Processar chunks diretamente
      const chunks = splitTextIntoChunks(content);
      console.log(`🔧 [DEBUG] Dividindo texto em ${chunks.length} chunks`);
      
      let chunksProcessed = 0;
      let chunksFailed = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          // Gerar embedding usando OpenAI diretamente
          const embedding = await generateEmbedding(chunk);
          
          // Salvar no Supabase
          const { error: insertError } = await supabase
            .from('chatbot_embeddings')
            .insert({
              document_id: documentId,
              chatbot_user: user.id,
              chunk_text: chunk,
              chunk_index: i,
              embedding: embedding,
              metadata: {
                chunk_length: chunk.length,
                chunk_position: i,
                total_chunks: chunks.length
              }
            });
            
          if (insertError) {
            console.error(`🔧 [DEBUG] Erro ao inserir chunk ${i}:`, insertError);
            chunksFailed++;
          } else {
            chunksProcessed++;
            console.log(`🔧 [DEBUG] Chunk ${i + 1}/${chunks.length} processado`);
          }
          
        } catch (chunkError) {
          console.error(`🔧 [DEBUG] Erro ao processar chunk ${i}:`, chunkError);
          chunksFailed++;
        }
      }
      
      const response = {
        success: chunksProcessed > 0,
        documentId,
        chunks_processed: chunksProcessed,
        chunks_failed: chunksFailed,
        total_chunks: chunks.length,
        status: chunksProcessed === chunks.length ? 'completed' : 'partial'
      };
      
      console.log('🔧 [DEBUG] Processamento direto concluído:', response);
      return response as ProcessEmbeddingsResponse;
      
    } catch (error) {
      console.error('🔧 [DEBUG] Error in processDocumentEmbeddings:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Edge Function returned a non-2xx status code');
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Função para buscar documentos similares
  const searchSimilarDocuments = useCallback(async (
    query: string,
    threshold: number = 0.5, // Reduzido de 0.78 para 0.5
    limit: number = 10
  ): Promise<SearchResult[]> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('🔍 [VectorStore] searchSimilarDocuments iniciada');
    console.log('🔍 [VectorStore] Parâmetros:', { query, threshold, limit, userId: user.id });

    setIsSearching(true);
    try {
      // Gerar embedding da query
      console.log('🔧 [VectorStore] Gerando embedding para a query...');
      const queryEmbedding = await generateQueryEmbedding(query);
      console.log('✅ [VectorStore] Embedding gerado, dimensões:', queryEmbedding.length);

      // Buscar documentos similares usando a função RPC
      console.log('🔧 [VectorStore] Chamando função match_embeddings no Supabase...');
      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        user_id: user.id,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) {
        console.error('❌ [VectorStore] Erro na busca RPC:', error);
        throw error;
      }

      const results = data as SearchResult[];
      console.log('✅ [VectorStore] Busca RPC concluída:', {
        resultCount: results.length,
        threshold,
        limit
      });
      
      if (results.length > 0) {
        console.log('📊 [VectorStore] Primeira similaridade encontrada:', (results[0].similarity * 100).toFixed(1) + '%');
      }
      
      setSearchResults(results);
      return results;
    } finally {
      setIsSearching(false);
    }
  }, [user, generateQueryEmbedding]);

  // Função para obter contexto relevante para o chatbot
  const getChatbotContext = useCallback(async (
    userMessage: string,
    maxTokens: number = 3000
  ): Promise<string> => {
    try {
      console.log('🔍 [VectorStore] Iniciando busca por contexto relevante...');
      console.log('🔍 [VectorStore] Query:', userMessage);
      console.log('🔍 [VectorStore] Threshold: 0.5 (reduzido para melhor matching), Limite: 5 documentos');
      
      const results = await searchSimilarDocuments(userMessage, 0.5, 5);
      
      console.log('📊 [VectorStore] Resultados encontrados:', results.length);
      
      if (results.length === 0) {
        console.log('❌ [VectorStore] Nenhum resultado encontrado na busca vetorial');
        return '';
      }

      // Mostrar detalhes dos resultados encontrados
      results.forEach((result, index) => {
        console.log(`📄 [VectorStore] Resultado ${index + 1}:`, {
          filename: result.filename,
          similarity: (result.similarity * 100).toFixed(1) + '%',
          chunkPreview: result.chunk_text.substring(0, 100) + '...'
        });
      });

      // Ordenar por similaridade e construir contexto
      const sortedResults = results.sort((a, b) => b.similarity - a.similarity);
      
      let context = '';
      let tokenCount = 0;
      
      for (const result of sortedResults) {
        const chunkTokens = Math.ceil(result.chunk_text.length / 4); // Aproximação: 4 chars = 1 token
        
        if (tokenCount + chunkTokens > maxTokens) {
          break;
        }
        
        context += `\n\n--- Fonte: ${result.filename} (Similaridade: ${(result.similarity * 100).toFixed(1)}%) ---\n`;
        context += result.chunk_text;
        
        tokenCount += chunkTokens;
      }

      return context.trim();
    } catch (error) {
      console.error('Error getting chatbot context:', error);
      return '';
    }
  }, [searchSimilarDocuments]);

  // Função para deletar embeddings de um documento
  const deleteDocumentEmbeddings = useCallback(async (documentId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('chatbot_embeddings')
      .delete()
      .eq('document_id', documentId)
      .eq('chatbot_user', user.id);

    if (error) {
      throw error;
    }
  }, [user]);

  return {
    isProcessing,
    isSearching,
    searchResults,
    processDocumentEmbeddings,
    searchSimilarDocuments,
    getChatbotContext,
    deleteDocumentEmbeddings
  };
};
