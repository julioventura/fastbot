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

  // Função para gerar embedding de uma query usando OpenAI
  const generateQueryEmbedding = useCallback(async (query: string): Promise<number[]> => {
    console.log('🔧 [DEBUG] Gerando embedding para query:', query.substring(0, 50) + '...');
    
    // Usar servidor local temporariamente
    const localServerUrl = 'http://localhost:3001';
    
    try {
      const response = await fetch(`${localServerUrl}/functions/v1/generate-embedding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Erro na resposta do servidor:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [DEBUG] Embedding gerado com sucesso');
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate embedding');
      }

      return data.embedding;
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
      console.log('🔧 [DEBUG] Usando servidor local para processamento');
      
      // Usar servidor local temporariamente
      const localServerUrl = 'http://localhost:3001';
      
      const response = await fetch(`${localServerUrl}/functions/v1/process-embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          content
        })
      });

      const responseData = await response.json();
      
      console.log('🔧 [DEBUG] Local server response:', {
        status: response.status,
        data: responseData
      });

      if (!response.ok) {
        console.error('🔧 [DEBUG] Local server error:', responseData);
        throw new Error(`Server error: ${response.status} - ${responseData.error || 'Unknown error'}`);
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to process embeddings');
      }

      console.log('🔧 [DEBUG] Processamento bem-sucedido:', responseData);
      return responseData as ProcessEmbeddingsResponse;
      
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
    threshold: number = 0.78,
    limit: number = 10
  ): Promise<SearchResult[]> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsSearching(true);
    try {
      // Gerar embedding da query
      const queryEmbedding = await generateQueryEmbedding(query);

      // Buscar documentos similares usando a função RPC
      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        user_id: user.id,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) {
        throw error;
      }

      const results = data as SearchResult[];
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
      const results = await searchSimilarDocuments(userMessage, 0.75, 5);
      
      if (results.length === 0) {
        return '';
      }

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
