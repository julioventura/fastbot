import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, X, AlertCircle, CheckCircle, Clock, Play, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { useVectorStore } from '@/hooks/useVectorStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

interface UploadedDocument {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'error';
  file_size: number;
  upload_date: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const { processDocumentEmbeddings, isProcessing } = useVectorStore();

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_documents')
        .select('id, filename, status, file_size, upload_date')
        .eq('chatbot_user', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os documentos.',
      });
    }
  }, [user, toast]);

  // Carregar documentos existentes
  React.useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file, 'utf-8');
    });
  };

  const uploadDocument = useCallback(async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Ler conteúdo do arquivo
      const content = await processFile(file);

      // Inserir documento no banco
      const { data: document, error: insertError } = await supabase
        .from('chatbot_documents')
        .insert({
          chatbot_user: user.id,
          filename: file.name,
          content: content,
          file_size: file.size,
          status: 'processing'
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Processar embeddings
      try {
        const result = await processDocumentEmbeddings(document.id, content);
        console.log('Embeddings processados:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Erro no processamento');
        }
        
        // Atualizar status para completed
        await supabase
          .from('chatbot_documents')
          .update({ status: 'completed' })
          .eq('id', document.id);
        
        toast({
          title: 'Processamento concluído!',
          description: `${result.chunks_processed || 0} chunks processados com sucesso.`,
        });
        
      } catch (embeddingError) {
        console.error('Erro ao processar embeddings:', embeddingError);
        
        // Atualizar status do documento para erro
        await supabase
          .from('chatbot_documents')
          .update({ status: 'error' })
          .eq('id', document.id);
        
        const errorMessage = embeddingError instanceof Error 
          ? embeddingError.message 
          : 'Erro desconhecido no processamento';
          
        toast({
          variant: 'destructive',
          title: 'Erro no processamento',
          description: `Não foi possível processar o documento: ${errorMessage}`,
        });
      }

      toast({
        title: 'Sucesso!',
        description: `Arquivo "${file.name}" foi enviado e está sendo processado.`,
      });

      fetchDocuments(); // Recarregar lista
      onUploadComplete?.(document.id);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Não foi possível processar o arquivo.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, toast, fetchDocuments, onUploadComplete, processDocumentEmbeddings]);

  const deleteDocument = async (documentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chatbot_documents')
        .delete()
        .eq('id', documentId)
        .eq('chatbot_user', user.id);

      if (error) throw error;

      toast({
        title: 'Documento removido',
        description: 'O documento e seus dados foram excluídos.',
      });

      fetchDocuments(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o documento.',
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        uploadDocument(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Formato não suportado',
          description: 'Apenas arquivos .txt são suportados no momento.',
        });
      }
    });
  }, [uploadDocument, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    },
    multiple: true,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processDocument = async (documentId: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário não autenticado.',
      });
      return;
    }

    // Buscar o documento no banco para obter o conteúdo
    try {
      setProcessingDocuments(prev => new Set([...prev, documentId]));
      
      const { data: document, error } = await supabase
        .from('chatbot_documents')
        .select('id, content, filename')
        .eq('id', documentId)
        .eq('chatbot_user', user.id)
        .single();

      if (error || !document) {
        throw new Error('Documento não encontrado ou você não tem permissão para acessá-lo.');
      }

      // Atualizar status para processing
      await supabase
        .from('chatbot_documents')
        .update({ status: 'processing' })
        .eq('id', documentId);

      toast({
        title: 'Processamento iniciado',
        description: `Processando embeddings para "${document.filename}"...`,
      });

      // Recarregar lista para mostrar status de processamento
      fetchDocuments();

      // Processar embeddings
      try {
        const result = await processDocumentEmbeddings(document.id, document.content);
        console.log('Embeddings processados:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Erro no processamento');
        }
        
        // Atualizar status para completed
        await supabase
          .from('chatbot_documents')
          .update({ status: 'completed' })
          .eq('id', document.id);
        
        toast({
          title: 'Processamento concluído!',
          description: `"${document.filename}" foi processado com sucesso. ${result.chunks_processed || 0} chunks criados.`,
        });
        
      } catch (embeddingError) {
        console.error('Erro ao processar embeddings:', embeddingError);
        
        // Atualizar status do documento para erro
        await supabase
          .from('chatbot_documents')
          .update({ status: 'error' })
          .eq('id', document.id);
        
        const errorMessage = embeddingError instanceof Error 
          ? embeddingError.message 
          : 'Erro desconhecido no processamento';
          
        toast({
          variant: 'destructive',
          title: 'Erro no processamento',
          description: `Falha ao processar "${document.filename}": ${errorMessage}`,
        });
      }

      fetchDocuments(); // Recarregar lista com status atualizado
      
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const processAllDocuments = async () => {
    const unprocessedDocs = documents.filter(doc => doc.status !== 'completed' && doc.status !== 'processing');
    
    if (unprocessedDocs.length === 0) {
      toast({
        title: 'Nenhum documento para processar',
        description: 'Todos os documentos já foram processados ou estão em processamento.',
      });
      return;
    }

    toast({
      title: 'Processamento em lote iniciado',
      description: `Processando ${unprocessedDocs.length} documento(s)...`,
    });

    // Processar documentos sequencialmente para evitar sobrecarga
    for (const doc of unprocessedDocs) {
      await processDocument(doc.id);
      // Pequena pausa entre processamentos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const debugSystem = async () => {
    try {
      console.log('🔧 [DEBUG] Testando sistema...');
      
      // 1. Testar autenticação
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      console.log('✅ [DEBUG] Usuário autenticado:', user.id);
      
      // 2. Testar variáveis de ambiente
      console.log('🔧 [DEBUG] Testando variáveis de ambiente...');
      
      // Usar servidor local para debug
      const localServerUrl = 'http://localhost:3001';
      const envResponse = await fetch(`${localServerUrl}/functions/v1/debug-env`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const envCheck = await envResponse.json();
      console.log('📊 [DEBUG] Environment check:', envCheck);
      
      if (!envResponse.ok || !envCheck.success) {
        console.error('❌ [DEBUG] Erro na verificação de ambiente:', envCheck.error || 'Server error');
      }
      
      // 3. Testar Edge Function generate-embedding
      console.log('🔧 [DEBUG] Testando generate-embedding...');
      
      const embeddingResponse = await fetch(`${localServerUrl}/functions/v1/generate-embedding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Teste de embedding' })
      });
      
      const embeddingResult = await embeddingResponse.json();
      console.log('📊 [DEBUG] generate-embedding response:', embeddingResult);
      
      // 4. Se tudo estiver ok, testar process-embeddings com dados mínimos
      if (envCheck?.environment_check?.openai_configured) {
        console.log('🔧 [DEBUG] Testando process-embeddings...');
        
        // Criar um documento de teste temporário
        const { data: tempDoc, error: tempError } = await supabase
          .from('chatbot_documents')
          .insert({
            chatbot_user: user.id,
            filename: 'debug-test.txt',
            content: 'Teste de conteúdo para debug do sistema.',
            file_size: 45,
            status: 'processing'
          })
          .select('id')
          .single();
          
        if (tempError || !tempDoc) {
          throw new Error(`Erro ao criar documento de teste: ${tempError?.message}`);
        }
        
        console.log('✅ [DEBUG] Documento de teste criado:', tempDoc.id);
        
        // Testar processamento usando servidor local
        const processResponse = await fetch(`${localServerUrl}/functions/v1/process-embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: tempDoc.id,
            content: 'Teste de conteúdo para debug do sistema.'
          })
        });
        
        const processResult = await processResponse.json();
        console.log('📊 [DEBUG] process-embeddings response:', processResult);
        
        // Limpar documento de teste
        await supabase
          .from('chatbot_documents')
          .delete()
          .eq('id', tempDoc.id);
          
        console.log('🧹 [DEBUG] Documento de teste removido');
      } else {
        console.warn('⚠️ [DEBUG] Pular teste de process-embeddings - OpenAI não configurado');
      }
      
      toast({
        title: 'Debug System Completo',
        description: 'Verifique o console para detalhes completos dos testes.',
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Erro no sistema:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        variant: 'destructive',
        title: 'Debug Error',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'error': return 'Erro';
      case 'processing': return 'Processando';
      default: return 'Carregando';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Documento processado com sucesso e pronto para busca</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Erro no processamento - Documento não disponível para busca</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'processing':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Processando embeddings... Aguarde</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Carregando...</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Documentos
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={debugSystem}
              disabled={isUploading}
            >
              🔧 Debug
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 hover:border-primary'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p>Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="mb-2">Arraste arquivos .txt ou clique para selecionar</p>
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? 'Processando...' : 'Selecionar Arquivos'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Documentos Enviados ({documents.length})
                <span className="text-sm text-gray-500">
                  • {documents.filter(d => d.status === 'completed').length} processados
                  • {documents.filter(d => d.status === 'error').length} com erro
                  • {documents.filter(d => d.status === 'processing').length} processando
                </span>
              </div>
              <div className="flex gap-2">
                {documents.filter(d => d.status === 'error').length > 0 && (
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const errorDocs = documents.filter(d => d.status === 'error');
                      errorDocs.forEach(doc => deleteDocument(doc.id));
                    }}
                  >
                    🗑️ Limpar Erros
                  </Button>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={processAllDocuments}
                  disabled={isProcessing || processingDocuments.size > 0 || documents.filter(d => d.status !== 'completed').length === 0}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Processar Todos
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.file_size)} • {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Status: {getStatusLabel(doc.status)} • ID: {doc.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botão de Processar Individual */}
                    {doc.status !== 'completed' && doc.status !== 'processing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processDocument(doc.id)}
                        disabled={processingDocuments.has(doc.id) || isProcessing}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Processar
                      </Button>
                    )}
                    
                    {/* Botão de Reprocessar se houve erro */}
                    {doc.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processDocument(doc.id)}
                        disabled={processingDocuments.has(doc.id) || isProcessing}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Tentar Novamente
                      </Button>
                    )}
                    
                    {/* Indicador de processamento individual */}
                    {processingDocuments.has(doc.id) && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Processando...</span>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      disabled={processingDocuments.has(doc.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;
