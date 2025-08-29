import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  File,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Maximize2,
  Minimize2,
  Cloud,
  Cpu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { useVectorStore } from "@/hooks/useVectorStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

interface UploadedDocument {
  id: string;
  filename: string;
  status: "processing" | "completed" | "error";
  file_size: number;
  upload_date: string;
  summary?: string;
  chatbot_name?: string;
  file_type?: string;
}

interface ChatbotConfig {
  chatbot_name: string;
  chatbot_user: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
}) => {
  // 🚀 Detectar modo de processamento
  const useLocalProcessing = import.meta.env.VITE_USE_LOCAL_AI === 'true';

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  // Estado da expansão salvo no localStorage, padrão sempre expandido
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('documentsExpanded');
      return saved !== null ? JSON.parse(saved) : true; // padrão expandido
    } catch {
      return true; // padrão expandido em caso de erro
    }
  });
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(
    new Set()
  );
  const [generatingPreviews, setGeneratingPreviews] = useState<Set<string>>(
    new Set()
  );

  // Estados do modal de preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewFilename, setPreviewFilename] = useState("");
  const [previewUploadDate, setPreviewUploadDate] = useState("");
  const [isModalMaximized, setIsModalMaximized] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const { processDocumentEmbeddings, isProcessing } = useVectorStore();

  // Função para alternar o estado de expansão e salvar no localStorage
  const toggleDocumentsExpansion = useCallback(() => {
    setIsDocumentsExpanded(prev => {
      const newState = !prev;
      try {
        localStorage.setItem('documentsExpanded', JSON.stringify(newState));
      } catch (error) {
        console.warn('Erro ao salvar estado de expansão no localStorage:', error);
      }
      return newState;
    });
  }, []);

  // 🔄 Carregar configuração do chatbot
  useEffect(() => {
    const loadChatbotConfig = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('mychatbot')
          .select('chatbot_name, chatbot_user')
          .eq('chatbot_user', user.id)
          .maybeSingle(); // Use maybeSingle instead of single

        if (!error && data) {
          setChatbotConfig(data);
        } else if (error) {
          console.warn('Erro ao carregar config do chatbot:', error);
          // Fallback para config vazia
          setChatbotConfig({ chatbot_name: '', chatbot_user: user.id });
        }
      } catch (err) {
        console.warn('Erro ao carregar configuração do chatbot:', err);
        // Fallback para config vazia
        setChatbotConfig({ chatbot_name: '', chatbot_user: user.id });
      }
    };

    loadChatbotConfig();
  }, [user]);  // 📂 Carregar documentos - Modo Local
  const loadLocalDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chatbot_documents")
        .select("id, filename, status, file_size, upload_date, summary")
        .eq("chatbot_user", user.id)
        .order("filename", { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Erro ao carregar documentos locais:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
      });
    }
  }, [user, toast]);

  // 📂 Carregar documentos - Modo Webhook
  const loadWebhookDocuments = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar documentos do usuário
      let { data, error } = await supabase
        .from("documents_details")
        .select("id, filename, status, file_size, upload_date, summary, chatbot_name, file_type, chatbot_user")
        .eq("chatbot_user", user.id)
        .order("upload_date", { ascending: false });

      // ✅ CORREÇÃO: Garantir que documentos de documents_details tenham status completed
      // e verificar se documentos "processing" já foram processados
      if (!error && data && data.length > 0) {
        data = await Promise.all(data.map(async (doc) => {
          let finalStatus = doc.status || "completed";

          // Se o documento está marcado como "processing", verificar se já foi processado
          if (finalStatus === "processing") {
            try {
              // Verificar se existem chunks na tabela documents para este arquivo
              const { data: chunks, error: chunksError } = await supabase
                .from("documents")
                .select("id")
                .not("metadata", "is", null)
                .limit(1);

              if (!chunksError && chunks && chunks.length > 0) {
                // Se há chunks, verificar se algum pertence a este documento
                const { data: relatedChunks, error: relatedError } = await supabase
                  .from("documents")
                  .select("id, metadata")
                  .not("metadata", "is", null)
                  .limit(5);

                if (!relatedError && relatedChunks && relatedChunks.length > 0) {
                  const hasRelatedChunk = relatedChunks.some(chunk => {
                    if (!chunk.metadata) return false;
                    const metadata = chunk.metadata;
                    const chunkUserId = metadata.usuario || metadata.chatbot_user;
                    const chunkFilename = metadata.file_name || metadata.filename;

                    return chunkUserId === user.id && chunkFilename === doc.filename;
                  });

                  if (hasRelatedChunk) {
                    // Se encontrou chunks relacionados, o documento foi processado
                    finalStatus = "completed";

                    // Atualizar no banco também
                    await supabase
                      .from("documents_details")
                      .update({ status: "completed" })
                      .eq("id", doc.id);
                  }
                }
              }
            } catch (err) {
              console.warn("Erro ao verificar status do documento:", err);
              // Em caso de erro, assumir completed se o documento existe há mais de 5 minutos
              const uploadTime = new Date(doc.upload_date);
              const now = new Date();
              const minutesSinceUpload = (now.getTime() - uploadTime.getTime()) / (1000 * 60);

              if (minutesSinceUpload > 5) {
                finalStatus = "completed";

                // Atualizar no banco
                await supabase
                  .from("documents_details")
                  .update({ status: "completed" })
                  .eq("id", doc.id);
              }
            }
          }

          return {
            ...doc,
            status: finalStatus
          };
        }));
      }

      // Se documents_details estiver vazio (não há erro, mas sem dados), buscar de documents
      if (!error && (!data || data.length === 0)) {
        // Buscar documentos únicos da tabela documents usando metadata
        const { data: docsData, error: docsError } = await supabase
          .from("documents")
          .select("id, metadata")
          .not("metadata", "is", null)
          .order("id", { ascending: false });

        if (docsError) {
          error = docsError;
        } else if (docsData && docsData.length > 0) {
          // Processar e agrupar documentos por metadata
          const documentsMap = new Map();

          docsData.forEach(doc => {
            if (doc.metadata) {
              const metadata = doc.metadata;
              const userId = metadata.usuario || metadata.chatbot_user;

              // Filtrar apenas documentos do usuário atual
              if (userId === user.id) {
                const filename = metadata.file_name || metadata.filename;
                const chatbotName = metadata.chatbot_name || '';

                if (filename && !documentsMap.has(filename)) {
                  documentsMap.set(filename, {
                    id: doc.id,
                    filename: filename,
                    status: "completed", // Assumir completed se está na tabela documents
                    file_size: parseInt(metadata.file_size) || 0,
                    upload_date: metadata.upload_date || new Date().toISOString(), // Usar data do metadata se disponível
                    summary: `Documento processado via N8N`,
                    chatbot_name: chatbotName,
                    file_type: metadata.file_type || 'text/plain'
                  });
                }
              }
            }
          });

          data = Array.from(documentsMap.values());
        }
      }

      // Se documents_details não funcionar, tenta documents como fallback (apenas para compatibilidade)
      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("documents")
          .select("id, filename, status, file_size, upload_date, summary, chatbot_name, file_type")
          .eq("chatbot_user", user.id)
          .order("upload_date", { ascending: false });

        // ✅ CORREÇÃO: Garantir que documentos tenham status completed
        data = fallbackData?.map(doc => ({
          ...doc,
          chatbot_user: user.id,
          status: doc.status || "completed" // Se não tem status, assumir completed
        }));
        error = fallbackError;
      }

      if (error) {
        console.warn("⚠️ Erro ao carregar documentos webhook:", error);
        setDocuments([]);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.warn("⚠️ Erro ao carregar documentos webhook:", error);
      setDocuments([]);
    }
  }, [user]);

  const fetchDocuments = useCallback(async () => {
    if (useLocalProcessing) {
      loadLocalDocuments();
    } else {
      loadWebhookDocuments();
    }
  }, [useLocalProcessing, loadLocalDocuments, loadWebhookDocuments]);

  // Carregar documentos existentes
  React.useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const generateSummary = (content: string): string => {
    // Limpar o conteúdo removendo quebras de linha excessivas e espaços
    const cleanContent = content.replace(/\s+/g, " ").trim();

    // Pegar as primeiras 50 palavras
    const words = cleanContent.split(" ").slice(0, 20);
    let summary = words.join(" ");

    // Se o conteúdo original tinha mais de 20 palavras, adicionar "..."
    if (cleanContent.split(" ").length > 20) {
      summary += "...";
    }

    return summary || "Resumo não disponível";
  };

  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file, "utf-8");
    });
  };

  // 📤 Upload Modo Local - Processamento direto no Supabase
  const uploadDocumentLocal = useCallback(
    async (file: File) => {
      if (!user) return;

      setIsUploading(true);
      try {
        // Ler conteúdo do arquivo
        const content = await processFile(file);
        const summary = generateSummary(content);

        // Inserir documento no banco (tabela local)
        const { data: document, error: insertError } = await supabase
          .from("chatbot_documents")
          .insert({
            chatbot_user: user.id,
            filename: file.name,
            content: content,
            summary: summary,
            file_size: file.size,
            status: "processing",
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Processar embeddings localmente
        try {
          const result = await processDocumentEmbeddings(document.id, content);
          console.log("Embeddings processados:", result);

          if (!result.success) {
            throw new Error(result.error || "Erro no processamento");
          }

          // Atualizar status para completed
          await supabase
            .from("chatbot_documents")
            .update({ status: "completed" })
            .eq("id", document.id);

          toast({
            title: "Processamento concluído!",
            description: `${result.chunks_processed || 0} chunks processados com sucesso.`,
          });
        } catch (embeddingError) {
          console.error("Erro ao processar embeddings:", embeddingError);

          // Atualizar status do documento para erro
          await supabase
            .from("chatbot_documents")
            .update({ status: "error" })
            .eq("id", document.id);

          const errorMessage =
            embeddingError instanceof Error
              ? embeddingError.message
              : "Erro desconhecido no processamento";

          toast({
            variant: "destructive",
            title: "Erro no processamento",
            description: `Não foi possível processar o documento: ${errorMessage}`,
          });
        }

        toast({
          title: "SUCESSO",
          description: `Arquivo "${file.name}" enviado!`,
        });

        fetchDocuments(); // Recarregar lista
        onUploadComplete?.(document.id);
      } catch (error) {
        console.error("Erro no upload local:", error);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: "Não foi possível processar o arquivo.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [user, toast, fetchDocuments, onUploadComplete, processDocumentEmbeddings]
  );

  // 📤 Upload Modo Webhook - Envio para N8N
  const uploadDocumentWebhook = useCallback(
    async (file: File) => {
      if (!user) return;

      // Se não há config do chatbot, usa valores padrão
      const chatbotName = chatbotConfig?.chatbot_name || '';

      setIsUploading(true);
      try {
        // Preparar FormData para envio ao N8N
        const formData = new FormData();
        formData.append('data', file);
        formData.append('chatbot', chatbotName);
        formData.append('userid', user.id);

        // 📝 Adicionar informações complementares do arquivo
        formData.append('filename', file.name);
        formData.append('filesize', file.size.toString());
        formData.append('filetype', file.type || 'text/plain');
        formData.append('timestamp', new Date().toISOString());

        const webhookUrl = import.meta.env.VITE_WEBHOOK_N8N_INSERT_RAG_URL;

        if (!webhookUrl) {
          throw new Error('URL do webhook não configurada');
        }

        console.log('📤 Enviando arquivo para webhook:', {
          url: webhookUrl,
          filename: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          chatbotName,
          userId: user.id,
          timestamp: new Date().toISOString()
        });

        // Enviar para N8N
        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        // Verificar se há conteúdo na resposta antes de tentar fazer parse JSON
        const responseText = await response.text();
        console.log('📥 Resposta do webhook:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        });

        let result;

        try {
          // Tentar fazer parse do JSON apenas se há conteúdo
          if (responseText.trim()) {
            result = JSON.parse(responseText);
          } else {
            // Se não há resposta, assumir sucesso (webhook pode não retornar nada)
            result = { success: true };
          }
        } catch (jsonError) {
          console.warn('Resposta do webhook não é JSON válido:', responseText);
          // Se não conseguir fazer parse, mas o HTTP foi 200, assumir sucesso
          result = { success: true };
        }

        // Verificar se o processamento foi bem-sucedido
        const isSuccess = result?.success !== false;

        if (isSuccess) {
          // Mensagem de sucesso personalizada com base na resposta
          const successMessage = result?.message || `Arquivo "${file.name}" enviado para processamento no N8N.`;
          const chunks = result?.chunks_processed;

          toast({
            title: "Upload realizado!",
            description: chunks ?
              `${successMessage} (${chunks} chunks processados)` :
              successMessage,
          });

          console.log('✅ Arquivo processado pelo N8N:', {
            filename: file.name,
            document_id: result?.document_id,
            status: result?.status,
            chunks_processed: result?.chunks_processed,
            processing_time: result?.processing_time_ms
          });

          // Recarregar lista após um pequeno delay para mostrar o status atualizado
          setTimeout(() => {
            fetchDocuments();
          }, 1500);

          onUploadComplete?.(result?.document_id || result?.documentId || file.name);
        } else {
          // Tratar erro retornado pelo N8N
          const errorMessage = result?.error || result?.message || 'Erro no processamento do N8N';
          const errorCode = result?.error_code ? ` (${result.error_code})` : '';

          throw new Error(`${errorMessage}${errorCode}`);
        }
      } catch (error) {
        console.error("Erro no upload webhook:", error);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: `Não foi possível enviar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [user, chatbotConfig, toast, fetchDocuments, onUploadComplete]
  );  // 📤 Função de upload condicional
  const uploadDocument = useCallback(
    async (file: File) => {
      if (useLocalProcessing) {
        await uploadDocumentLocal(file);
      } else {
        await uploadDocumentWebhook(file);
      }
    },
    [useLocalProcessing, uploadDocumentLocal, uploadDocumentWebhook]
  );

  const deleteDocument = async (documentId: string) => {
    if (!user) return;

    try {
      if (useLocalProcessing) {
        // Modo Local: deletar embeddings e chatbot_documents
        const { error: embeddingsError } = await supabase
          .from("chatbot_embeddings")
          .delete()
          .eq("document_id", documentId)
          .eq("chatbot_user", user.id);

        if (embeddingsError) {
          console.error("Erro ao deletar embeddings:", embeddingsError);
        }

        const { error } = await supabase
          .from("chatbot_documents")
          .delete()
          .eq("id", documentId)
          .eq("chatbot_user", user.id);

        if (error) throw error;
      } else {
        // Modo Webhook: estratégia mais robusta para deletar
        console.log('🗑️ Iniciando exclusão WEBHOOK para documento ID:', documentId);

        let deletedFromDetails = false;
        let deletedFromDocuments = false;
        let totalDeletedChunks = 0;

        // Primeiro: encontrar o documento na lista atual para obter informações
        const currentDoc = documents.find(d => d.id === documentId);
        console.log('📋 Documento encontrado na lista:', currentDoc);

        // Estratégia 1: Deletar de documents_details usando a MESMA lógica da listagem
        if (currentDoc) {
          try {
            console.log('🔍 Buscando documento em documents_details por filename:', currentDoc.filename);

            // Usar exatamente a mesma busca que funciona na listagem
            const { data: detailsData, error: searchError } = await supabase
              .from("documents_details")
              .select("id, filename, status, file_size, upload_date, summary, chatbot_name, file_type")
              .eq("chatbot_user", user.id)
              .eq("filename", currentDoc.filename);

            console.log('� Resultado da busca em documents_details:', {
              found: detailsData?.length || 0,
              error: searchError?.message || 'nenhum erro',
              data: detailsData
            });

            if (!searchError && detailsData && detailsData.length > 0) {
              const detailsId = detailsData[0].id;
              console.log('📋 ID encontrado em documents_details:', detailsId);

              const { error: detailsError, count: detailsCount } = await supabase
                .from("documents_details")
                .delete({ count: 'exact' })
                .eq("id", detailsId);

              if (!detailsError && detailsCount && detailsCount > 0) {
                deletedFromDetails = true;
                console.log('✅ Deletado de documents_details:', detailsCount, 'registros');
              } else {
                console.error('❌ Erro ao deletar de documents_details:', detailsError?.message || 'count zero');
              }
            } else {
              console.log('⚠️ Nenhum registro encontrado em documents_details para:', currentDoc.filename);
              console.log('🔍 Erro de busca:', searchError?.message);
            }
          } catch (err) {
            console.warn('⚠️ Erro ao buscar/deletar em documents_details:', err);
          }
        }

        // Estratégia 2: Deletar TODOS os chunks relacionados ao arquivo da tabela documents
        if (currentDoc) {
          try {
            console.log('🧹 Buscando todos os chunks do arquivo:', currentDoc.filename);

            // Buscar todos os chunks deste arquivo para deletar
            const { data: chunksToDelete, error: searchError } = await supabase
              .from("documents")
              .select("id, metadata")
              .not("metadata", "is", null);

            console.log('🔍 Chunks encontrados para análise:', chunksToDelete?.length || 0);

            if (!searchError && chunksToDelete && chunksToDelete.length > 0) {
              // Filtrar chunks que pertencem ao mesmo arquivo e usuário
              const relatedChunkIds = chunksToDelete
                .filter(chunk => {
                  if (!chunk.metadata) return false;
                  const metadata = chunk.metadata;
                  const chunkUserId = metadata.usuario || metadata.chatbot_user;
                  const chunkFilename = metadata.file_name || metadata.filename;

                  return chunkUserId === user.id && chunkFilename === currentDoc.filename;
                })
                .map(chunk => chunk.id);

              console.log('🎯 IDs dos chunks relacionados:', relatedChunkIds);

              if (relatedChunkIds.length > 0) {
                // Deletar todos os chunks relacionados
                const { error: deleteError, count: deleteCount } = await supabase
                  .from("documents")
                  .delete({ count: 'exact' })
                  .in("id", relatedChunkIds);

                if (!deleteError) {
                  deletedFromDocuments = true;
                  totalDeletedChunks = deleteCount || 0;
                  console.log('✅ Deletados', totalDeletedChunks, 'chunks da tabela documents');
                } else {
                  console.error('❌ Erro ao deletar chunks:', deleteError);
                }
              } else {
                console.log('⚠️ Nenhum chunk relacionado encontrado para deletar');
                // Se não há chunks para deletar, marcar como "sucesso" porque a tabela está vazia
                deletedFromDocuments = true;
                console.log('✅ Tabela documents vazia - considerando sucesso');
              }
            } else {
              console.warn('⚠️ Erro ao buscar chunks ou nenhum chunk encontrado:', searchError?.message || 'tabela vazia');
              // Se a tabela documents está vazia, marcar como sucesso
              deletedFromDocuments = true;
              console.log('✅ Tabela documents vazia - considerando sucesso');
            }
          } catch (err) {
            console.warn('⚠️ Erro na estratégia de deletar chunks:', err);
            // Em caso de erro, assumir que a tabela documents não tem dados relacionados
            deletedFromDocuments = true;
            console.log('✅ Assumindo que documents não tem dados relacionados');
          }
        }

        // Verificar se conseguiu deletar pelo menos de documents_details
        if (!deletedFromDetails) {
          throw new Error(`Não foi possível deletar o documento "${currentDoc?.filename || documentId}" da tabela documents_details`);
        }

        console.log('🎉 Exclusão concluída:', {
          deletedFromDetails,
          deletedFromDocuments,
          totalDeletedChunks,
          filename: currentDoc?.filename,
          note: deletedFromDocuments && totalDeletedChunks > 0
            ? 'Deletado de ambas as tabelas'
            : 'Deletado de documents_details (documents estava vazia ou sem dados relacionados)'
        });
      }

      toast({
        title: "Documento removido",
        description: "O documento e seus dados (incluindo embeddings) foram excluídos completamente.",
      });

      fetchDocuments(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o documento completamente.",
      });
    }
  };

  const downloadDocument = async (documentId: string, filename: string) => {
    if (!user) return;

    try {
      let documentData = null;
      let error = null;

      if (useLocalProcessing) {
        // Modo Local: buscar em chatbot_documents
        const result = await supabase
          .from("chatbot_documents")
          .select("content, filename")
          .eq("id", documentId)
          .eq("chatbot_user", user.id)
          .single();

        documentData = result.data;
        error = result.error;
      } else {
        // Modo Webhook: buscar primeiro em documents_details, depois em documents
        let result = await supabase
          .from("documents_details")
          .select("content, filename")
          .eq("id", documentId)
          .eq("chatbot_user", user.id)
          .single();

        if (result.error) {
          // Fallback para documents
          result = await supabase
            .from("documents")
            .select("content, filename")
            .eq("id", documentId)
            .eq("chatbot_user", user.id)
            .single();
        }

        documentData = result.data;
        error = result.error;
      }

      if (error || !documentData) {
        throw new Error("Documento não encontrado ou você não tem permissão para acessá-lo.");
      }

      // Criar um blob com o conteúdo do documento
      const blob = new Blob([documentData.content], { type: 'text/plain;charset=utf-8' });

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);

      // Criar elemento link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Usar o nome original do arquivo

      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL temporária
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: `O arquivo "${filename}" foi baixado com sucesso.`,
      });

    } catch (error) {
      console.error("Erro ao fazer download do documento:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Não foi possível baixar o documento.",
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          uploadDocument(file);
        } else {
          toast({
            variant: "destructive",
            title: "Formato não suportado",
            description: "Apenas arquivos .txt são suportados no momento.",
          });
        }
      });
    },
    [uploadDocument, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
    },
    multiple: true,
    disabled: isUploading,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processDocument = async (documentId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado.",
      });
      return;
    }

    // Buscar o documento no banco para obter o conteúdo
    try {
      setProcessingDocuments((prev) => new Set([...prev, documentId]));

      const { data: document, error } = await supabase
        .from("chatbot_documents")
        .select("id, content, filename")
        .eq("id", documentId)
        .eq("chatbot_user", user.id)
        .single();

      if (error || !document) {
        throw new Error(
          "Documento não encontrado ou você não tem permissão para acessá-lo."
        );
      }

      // Atualizar status para processing
      await supabase
        .from("chatbot_documents")
        .update({ status: "processing" })
        .eq("id", documentId);

      toast({
        title: "Processamento iniciado",
        description: `Processando embeddings para "${document.filename}"...`,
      });

      // Recarregar lista para mostrar status de processamento
      fetchDocuments();

      // Processar embeddings
      try {
        const result = await processDocumentEmbeddings(
          document.id,
          document.content
        );
        console.log("Embeddings processados:", result);

        if (!result.success) {
          throw new Error(result.error || "Erro no processamento");
        }

        // Atualizar status para completed
        await supabase
          .from("chatbot_documents")
          .update({ status: "completed" })
          .eq("id", document.id);

        toast({
          title: "Processamento concluído!",
          description: `"${document.filename}" foi processado com sucesso. ${result.chunks_processed || 0
            } chunks criados.`,
        });
      } catch (embeddingError) {
        console.error("Erro ao processar embeddings:", embeddingError);

        // Atualizar status do documento para erro
        await supabase
          .from("chatbot_documents")
          .update({ status: "error" })
          .eq("id", document.id);

        const errorMessage =
          embeddingError instanceof Error
            ? embeddingError.message
            : "Erro desconhecido no processamento";

        toast({
          variant: "destructive",
          title: "Erro no processamento",
          description: `Falha ao processar "${document.filename}": ${errorMessage}`,
        });
      }

      fetchDocuments(); // Recarregar lista com status atualizado
    } catch (error) {
      console.error("Erro ao processar documento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setProcessingDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const generatePreview = async (documentId: string) => {
    if (!user) return;

    try {
      setGeneratingPreviews((prev) => new Set([...prev, documentId]));

      let document = null;
      let error = null;
      let content = "";

      if (useLocalProcessing) {
        // Modo Local: buscar em chatbot_documents
        const result = await supabase
          .from("chatbot_documents")
          .select("content, filename, upload_date")
          .eq("id", documentId)
          .eq("chatbot_user", user.id)
          .single();

        document = result.data;
        error = result.error;
        content = document?.content || "";
      } else {
        // Modo Webhook: estratégia em várias etapas para obter conteúdo
        console.log('🔍 generatePreview WEBHOOK: Buscando documento ID:', documentId);

        // Primeiro: tentar documents_details
        const detailsResult = await supabase
          .from("documents_details")
          .select("content, filename, upload_date")
          .eq("id", documentId)
          .eq("chatbot_user", user.id)
          .single();

        console.log('📊 Resultado documents_details:', detailsResult);

        if (!detailsResult.error && detailsResult.data) {
          document = detailsResult.data;
          content = detailsResult.data.content || "";
          console.log('✅ Conteúdo encontrado em documents_details');
        } else {
          console.log('📝 Tentando buscar em documents com metadata...');

          // Fallback 1: buscar documento na tabela documents usando documentId
          const docsResult = await supabase
            .from("documents")
            .select("content, metadata")
            .eq("id", documentId)
            .single();

          console.log('📄 Resultado documents (por ID):', docsResult);

          if (!docsResult.error && docsResult.data) {
            const metadata = docsResult.data.metadata || {};
            const filename = metadata.file_name || metadata.filename || 'documento_sem_nome.txt';
            const uploadDate = metadata.upload_date || new Date().toISOString();

            document = {
              filename: filename,
              upload_date: uploadDate,
              content: docsResult.data.content || ""
            };
            content = docsResult.data.content || "";
            console.log('✅ Documento encontrado por ID na tabela documents');
          } else {
            console.log('🔍 Buscando chunks do documento para reconstituir conteúdo...');

            // Fallback 2: buscar todos os chunks relacionados ao arquivo e reconstituir
            // Primeiro, encontrar o nome do arquivo através da listagem atual
            const currentDoc = documents.find(d => d.id === documentId);
            if (currentDoc) {
              console.log('📋 Documento encontrado na lista atual:', currentDoc.filename);

              // Buscar todos os chunks deste arquivo
              const { data: chunks, error: chunksError } = await supabase
                .from("documents")
                .select("content, metadata")
                .not("metadata", "is", null)
                .order("id", { ascending: true });

              console.log('🧩 Chunks encontrados:', chunks?.length || 0);

              if (!chunksError && chunks && chunks.length > 0) {
                // Filtrar chunks do mesmo arquivo e usuário
                const fileChunks = chunks.filter(chunk => {
                  if (!chunk.metadata) return false;
                  const metadata = chunk.metadata;
                  const chunkUserId = metadata.usuario || metadata.chatbot_user;
                  const chunkFilename = metadata.file_name || metadata.filename;

                  return chunkUserId === user.id && chunkFilename === currentDoc.filename;
                });

                console.log('🧩 Chunks filtrados para o arquivo:', fileChunks.length);

                if (fileChunks.length > 0) {
                  // Reconstituir conteúdo a partir dos chunks
                  content = fileChunks
                    .map(chunk => chunk.content || "")
                    .filter(text => text.trim().length > 0)
                    .join("\n\n");

                  // Usar metadados do primeiro chunk para informações do arquivo
                  const firstChunk = fileChunks[0];
                  const metadata = firstChunk.metadata || {};

                  document = {
                    filename: currentDoc.filename,
                    upload_date: currentDoc.upload_date,
                    content: content
                  };

                  console.log('✅ Conteúdo reconstituído a partir de', fileChunks.length, 'chunks');
                } else {
                  throw new Error("Nenhum chunk encontrado para este documento");
                }
              } else {
                throw new Error("Erro ao buscar chunks do documento");
              }
            } else {
              throw new Error("Documento não encontrado na lista atual");
            }
          }
        }

        error = !document ? new Error("Documento não encontrado") : null;
      }

      if (error || !document) {
        throw new Error("Documento não encontrado");
      }

      // Abrir modal com o conteúdo
      setPreviewContent(content || "Conteúdo não disponível");
      setPreviewFilename(document.filename);
      setPreviewUploadDate(document.upload_date);
      setIsModalMaximized(false); // Resetar estado de maximização
      setPreviewModalOpen(true);

      console.log('🎉 Preview gerado com sucesso:', {
        filename: document.filename,
        contentLength: content.length,
        uploadDate: document.upload_date
      });

    } catch (error) {
      console.error("🚫 Erro ao gerar preview:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar o preview.",
      });
    } finally {
      setGeneratingPreviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const processAllDocuments = async () => {
    const unprocessedDocs = documents.filter(
      (doc) => doc.status !== "completed" && doc.status !== "processing"
    );

    if (unprocessedDocs.length === 0) {
      toast({
        title: "Nenhum documento para processar",
        description:
          "Todos os documentos já foram processados ou estão em processamento.",
      });
      return;
    }

    toast({
      title: "Processamento em lote iniciado",
      description: `Processando ${unprocessedDocs.length} documento(s)...`,
    });

    // Processar documentos sequencialmente para evitar sobrecarga
    for (const doc of unprocessedDocs) {
      await processDocument(doc.id);
      // Pequena pausa entre processamentos
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const getStatusLabel = (status: string): { label: string; color: string } => {
    switch (status) {
      case "completed":
        return { label: "Concluído", color: "text-green-500" };
      case "error":
        return { label: "Erro", color: "text-red-500" };
      case "processing":
        return { label: "Processando", color: "text-green-500 font-semibold" };
      default:
        return { label: "CARREGANDO", color: "text-green-500 font-bold text-lg" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle className="w-8 h-8 mr-2 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Documento processado com sucesso e pronto para busca</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "error":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Erro no processamento - Documento não disponível para busca
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "processing":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <RefreshCw className="w-5 h-5 text-green-500 animate-spin" />
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
                <RefreshCw className="w-6 h-6 text-green-500 animate-spin font-bold" />
              </TooltipTrigger>
              <TooltipContent>
                <p>CARREGANDO... Sincronizando arquivo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-gray-950/60">
        <CardHeader className="pl-8 pt-4 pb-0">
          <CardTitle className="flex items-center gap-4 text-base md:text-lg">
            <Upload className="w-6 h-6" />
            Upload de Documentos
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${useLocalProcessing
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
              {useLocalProcessing ? 'LOCAL' : 'WEBHOOK'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {/* Descrição do modo ativo */}
          <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">
                {useLocalProcessing ? (
                  <>
                    <span className="text-blue-400 font-medium">Modo Local:</span> Arquivos processados localmente com embeddings salvos no Supabase.
                  </>
                ) : (
                  <>
                    <span className="text-purple-400 font-medium">Modo Webhook:</span> Arquivos enviados para N8N que processa e registra automaticamente nas tabelas.
                  </>
                )}
              </p>

              {/* Botão de Debug - apenas no modo WEBHOOK */}
              {!useLocalProcessing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    console.log('🔍 DEBUG: Iniciando diagnóstico completo...');
                    console.log('👤 Usuário atual:', user?.id);
                    console.log('🌐 Modo:', useLocalProcessing ? 'LOCAL' : 'WEBHOOK');

                    if (user) {
                      try {
                        // 1. Teste básico de conexão
                        console.log('===== 1. TESTE DE CONEXÃO =====');
                        const { data: connectionTest, error: connectionError } = await supabase
                          .from('documents_details')
                          .select('count', { count: 'exact', head: true });

                        console.log('📊 Total de registros em documents_details:', connectionTest);
                        console.log('🔌 Erro de conexão:', connectionError);

                        // 2. Teste sem filtro (deve mostrar todos os registros)
                        console.log('===== 2. TESTE SEM FILTRO =====');
                        const { data: allData, error: allError } = await supabase
                          .from("documents_details")
                          .select("*")
                          .limit(10);

                        console.log('📋 Registros sem filtro (primeiros 10):');
                        console.log('Data:', allData);
                        console.log('Error:', allError);
                        console.log('Quantidade encontrada:', allData?.length || 0);

                        // 3. Teste com filtro do usuário
                        console.log('===== 3. TESTE COM FILTRO DE USUÁRIO =====');
                        const { data: userData, error: userError } = await supabase
                          .from("documents_details")
                          .select("*")
                          .eq("chatbot_user", user.id);

                        console.log('📋 Registros do usuário:', user.id);
                        console.log('Data:', userData);
                        console.log('Error:', userError);
                        console.log('Quantidade encontrada:', userData?.length || 0);

                        // 4. Teste na tabela documents
                        console.log('===== 4. TESTE TABELA DOCUMENTS =====');
                        const { data: docsData, error: docsError } = await supabase
                          .from("documents")
                          .select("id, metadata")
                          .not("metadata", "is", null)
                          .limit(10);

                        console.log('📄 Chunks na tabela documents:');
                        console.log('Data:', docsData);
                        console.log('Error:', docsError);
                        console.log('Quantidade encontrada:', docsData?.length || 0);

                        // 5. Análise dos usuários na tabela documents_details
                        if (allData && allData.length > 0) {
                          console.log('===== 5. ANÁLISE DE USUÁRIOS =====');
                          const usuarios = [...new Set(allData.map(doc => doc.chatbot_user))];
                          console.log('� Usuários únicos em documents_details:', usuarios);
                          console.log('🎯 Seu ID está na lista?', usuarios.includes(user.id));

                          // Verificar se há correspondência exata
                          const matchingDocs = allData.filter(doc => doc.chatbot_user === user.id);
                          console.log('📄 Documentos que deveriam aparecer para você:', matchingDocs);
                        }

                        // 6. Teste de contexto de autenticação
                        console.log('===== 6. CONTEXTO DE AUTENTICAÇÃO =====');
                        const { data: authData, error: authError } = await supabase.auth.getUser();
                        console.log('🔐 Usuário autenticado:', authData?.user?.id);
                        console.log('🔐 Erro de auth:', authError);
                        console.log('✅ IDs coincidem?', authData?.user?.id === user.id);

                        // 7. Resumo do diagnóstico
                        console.log('===== 7. RESUMO DO DIAGNÓSTICO =====');
                        const totalRegistros = allData?.length || 0;
                        const registrosUsuario = userData?.length || 0;
                        const chunksDocuments = docsData?.length || 0;

                        console.log(`📊 Total de registros em documents_details: ${totalRegistros}`);
                        console.log(`� Registros do seu usuário: ${registrosUsuario}`);
                        console.log(`📄 Chunks em documents: ${chunksDocuments}`);

                        if (totalRegistros === 0) {
                          console.log('❌ PROBLEMA: Tabela documents_details está vazia!');
                          console.log('💡 SOLUÇÃO: Verificar workflow do N8N ou inserir dados de teste');
                        } else if (registrosUsuario === 0) {
                          console.log('❌ PROBLEMA: Usuário não tem acesso aos registros!');
                          console.log('💡 SOLUÇÃO: Verificar políticas RLS ou campo chatbot_user');
                        } else {
                          console.log('✅ Tudo parece estar funcionando!');
                        }

                      } catch (error) {
                        console.error('❌ Erro durante o diagnóstico:', error);
                      }
                    }
                  }}
                  className="text-yellow-400 border-yellow-600 hover:bg-yellow-600/20"
                >
                  🔍 Debug
                </Button>
              )}
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-400 hover:border-green-400 hover:bg-green-600/10"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <RefreshCw className="w-8 h-8 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 text-green-500 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400" />
            )}
            {isDragActive ? (
              <p className="text-sm md:text-base">Solte os arquivos aqui...</p>
            ) : (
              <div>
                {isUploading ? (
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-lg md:text-2xl font-bold text-green-500">CARREGANDO...</p>
                    <p className="text-sm md:text-lg text-green-400">Processando seu arquivo, aguarde...</p>
                  </div>
                ) : (
                  <Button variant="outline" disabled={isUploading} className="text-yellow-500 text-md px-3 md:px-4 py-2 border-0 bg-transparent hover:bg-transparent">
                    Arraste arquivos .txt ou clique para selecionar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card className="bg-black/10">
          <CardHeader className="p-3 md:p-6">
            <CardTitle>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-lg">Documentos Enviados ({documents.length})</span>
                </div>

                {/* Botão de recolher/expandir */}
                <div className="flex items-center gap-2">
                  {/* Botão de recarregar - apenas no modo WEBHOOK */}
                  {!useLocalProcessing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔄 Forçando recarregamento manual...');
                        fetchDocuments();
                      }}
                      className="text-blue-400 border-blue-600 hover:bg-blue-600/20"
                      title="Recarregar documentos manualmente"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={toggleDocumentsExpansion}
                    className="h-12 w-12 p-0 hover:bg-green-800"
                    title={isDocumentsExpanded ? "Recolher lista" : "Expandir lista"}
                  >
                    {isDocumentsExpanded ? (
                      <ChevronUp className="h-12 w-12" />
                    ) : (
                      <ChevronDown className="h-12 w-12" />
                    )}
                  </Button>
                </div>
              </div>

              {isDocumentsExpanded && (
                <div className="space-y-2">
                  {/* Layout responsivo: uma linha no desktop, duas linhas no mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left">
                    <span className="text-lg text-green-500">
                      • Processados:{" "}
                      {documents.filter((d) => d.status === "completed").length}
                    </span>
                    <span className="text-lg text-red-500">
                      • Com erro:{" "}
                      {documents.filter((d) => d.status === "error").length}
                    </span>
                    <span className="text-lg text-gray-400">
                      • Processando:{" "}
                      {documents.filter((d) => d.status === "processing").length}
                    </span>

                    {documents.filter((d) => d.status === "error").length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                          const errorDocs = documents.filter(
                            (d) => d.status === "error"
                          );
                          errorDocs.forEach((doc) => deleteDocument(doc.id));
                        }}
                        className="self-start sm:ml-auto"
                      >
                        🗑️ Limpar Erros
                      </Button>
                    )}
                  </div>
                </div>
              )}

            </CardTitle>
          </CardHeader>

          <CardContent>
            {isDocumentsExpanded && (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const statusInfo = getStatusLabel(doc.status);

                  return (
                    <div key={doc.id} className="bg-black/30 border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(doc.status)}

                          <div className="flex-1">
                            <p className="font-medium text-lg">{doc.filename}</p>

                            <p className="pt-1 text-sx text-gray-400">
                              {doc.upload_date
                                ? new Date(doc.upload_date).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "Data não disponível"}
                              <span> - {formatFileSize(doc.file_size)} </span>
                            </p>

                          </div>
                        </div>

                        {/* Botões Preview, Download e Excluir lado a lado */}
                        <div className="flex-shrink-0 flex flex-row gap-2">
                          {/* Botão Preview */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePreview(doc.id)}
                            disabled={generatingPreviews.has(doc.id)}
                            className="border border-violet-600 hover:border-violet-700 text-violet-400 hover:bg-violet-800"
                            title="Visualizar conteúdo do documento"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>

                          {/* Botão Baixar */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(doc.id, doc.filename)}
                            className="border border-blue-600 hover:border-blue-700 text-blue-400 hover:bg-blue-800"
                            title="Fazer download do documento original"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>

                          {/* Botão Excluir */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={processingDocuments.has(doc.id)}
                                className="border border-red-800 hover:border-red-900 text-red-700 hover:bg-red-800"
                                title="Excluir documento"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza de que deseja excluir o documento "{doc.filename}"?
                                  Esta ação não pode ser desfeita e removerá permanentemente o documento
                                  e todos os seus dados processados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDocument(doc.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir documento
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Botões de ação - embaixo, com separação visual */}
                      {(doc.status === "error" || processingDocuments.has(doc.id) || (doc.status !== "completed" && doc.status !== "processing")) && (
                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-700">
                          {/* Botão de Processar Individual */}
                          {doc.status !== "completed" &&
                            doc.status !== "processing" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => processDocument(doc.id)}
                                disabled={
                                  processingDocuments.has(doc.id) || isProcessing
                                }
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Processar
                              </Button>
                            )}

                          {/* Botão de Reprocessar se houve erro */}
                          {doc.status === "error" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => processDocument(doc.id)}
                              disabled={
                                processingDocuments.has(doc.id) || isProcessing
                              }
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Preview */}
      <Dialog
        open={previewModalOpen}
        onOpenChange={(open) => {
          setPreviewModalOpen(open);
          if (!open) setIsModalMaximized(false); // Resetar maximização ao fechar
        }}
      >
        <DialogContent
          className={`p-0 gap-0 [&>button]:hidden ${isModalMaximized
            ? "fixed inset-0 w-screen h-screen max-w-none max-h-none m-0 rounded-none border-0"
            : "max-w-4xl max-h-[80vh]"
            }`}
          style={isModalMaximized ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            transform: 'none',
            zIndex: 50,
            backgroundColor: '#f8fafc', // Fundo claro para melhor legibilidade
          } : {
            backgroundColor: '#1e293b',
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Preview do Documento</DialogTitle>
          </DialogHeader>
          {/* Header customizado seguindo padrão Windows */}
          <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-600 bg-slate-800 ${isModalMaximized ? 'rounded-none' : 'rounded-t-lg'
            }`}>
            <h2 className="text-lg font-semibold text-white">Preview do Documento</h2>
            <div className="flex items-center gap-1">
              {/* Botão Maximizar/Restaurar */}
              <button
                onClick={() => setIsModalMaximized(!isModalMaximized)}
                className="flex items-center justify-center w-8 h-8 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors rounded"
                title={isModalMaximized ? "Restaurar tamanho" : "Maximizar"}
                aria-label={isModalMaximized ? "Restaurar tamanho" : "Maximizar"}
              >
                {isModalMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              {/* Botão Fechar */}
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="flex items-center justify-center w-8 h-8 text-gray-300 hover:bg-red-600 hover:text-white transition-colors rounded"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          </div>

          {/* Container principal do conteúdo */}
          <div className={`flex flex-col ${isModalMaximized ? 'flex-1 min-h-0' : 'flex-1'}`}>
            {/* Informações do arquivo reorganizadas */}
            <div className="mx-6 mt-4 p-3 bg-blue-900 text-gray-200 rounded-lg border space-y-2 flex-shrink-0">
              {/* Primeira linha: Nome do arquivo ocupando toda a largura */}
              <div className="w-full">
                <p className="font-medium text-gray-200 text-left">
                  {previewFilename}
                </p>
              </div>

              {/* Segunda linha: Upload à esquerda, palavras e caracteres à direita */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-200">
                  Upload: {previewUploadDate ? new Date(previewUploadDate).toLocaleString('pt-BR') : 'Data não disponível'}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-200">
                    {previewContent.split(/\s+/).filter(word => word.length > 0).length} palavras
                  </span>
                  <span className="text-sm text-gray-200">
                    {previewContent.length} caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Conteúdo do documento */}
            <div className={`flex-1 mx-6 my-4 ${isModalMaximized ? 'min-h-0 overflow-auto' : 'overflow-auto'}`}>
              <div className={`p-6 rounded-lg border ${isModalMaximized
                ? 'bg-white text-gray-900 min-h-full'
                : 'bg-gray-200 text-gray-800'
                }`}>
                <pre className={`whitespace-pre-wrap text-sm font-mono leading-relaxed ${isModalMaximized ? 'text-gray-900' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUpload;
