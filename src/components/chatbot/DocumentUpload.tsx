import React, { useCallback, useState, useEffect, useRef } from "react";
import "./preview-scroll.css";
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
  DialogDescription,
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

  // Ref para o container de scroll do preview
  const previewScrollRef = useRef<HTMLDivElement>(null);

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
    if (!user) {
      setDocuments([]); // Limpar documentos se o usuário fizer logout
      return;
    }

    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log('🔍 loadWebhookDocuments: Usuário:', user.id);
    }
    setDocuments([]); // Limpar estado anterior para evitar mostrar dados antigos

    try {
      const { data, error } = await supabase
        .from("documents_details")
        .select("id, filename, status, file_size, upload_date, summary, chatbot_name, file_type")
        .eq("chatbot_user", user.id)
        .order("upload_date", { ascending: false });

      if (error) {
        // Não jogue o erro, apenas logue. A interface mostrará a lista vazia.
        console.error("⚠️ Erro ao carregar documentos do webhook:", error);
        toast({
          variant: "destructive",
          title: "Erro ao Carregar Documentos",
          description: "Não foi possível buscar os documentos. Verifique sua conexão e tente recarregar.",
        });
        setDocuments([]); // Garantir que a lista está vazia em caso de erro
        return;
      }

      // Forçar o status para 'completed' para todos os documentos no modo webhook
      const documentsWithCompletedStatus = (data || []).map(doc => ({
        ...doc,
        status: 'completed' as const,
      }));

      const isDev = import.meta.env.DEV;
      if (isDev && documentsWithCompletedStatus.length > 0) {
        console.log('✅ Documentos webhook carregados:', documentsWithCompletedStatus.length);
      }
      setDocuments(documentsWithCompletedStatus);

    } catch (error) {
      console.error("🔥 Erro catastrófico ao carregar documentos do webhook:", error);
      setDocuments([]); // Garantir que a lista está vazia em caso de erro
    }
  }, [user, toast]); const fetchDocuments = useCallback(async () => {
    // Log apenas em desenvolvimento ou quando há mudança significativa
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log('🔄 fetchDocuments: Modo', useLocalProcessing ? 'LOCAL' : 'WEBHOOK');
    }

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

  // Auto-focus no preview quando abrir
  React.useEffect(() => {
    if (previewModalOpen && previewScrollRef.current) {
      const timer = setTimeout(() => {
        const container = previewScrollRef.current;
        if (container) {
          container.focus();
          // Garantir que o container está no topo
          container.scrollTo({ top: 0, behavior: 'instant' });

          // Se não pode fazer scroll, forçar altura menor (apenas em dev)
          const canScroll = container.scrollHeight > container.clientHeight;
          if (!canScroll && container.scrollHeight > 300 && import.meta.env.DEV) {
            console.log('🔧 Forçando altura para habilitar scroll');
            container.style.height = '300px';
            container.style.maxHeight = '300px';
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [previewModalOpen]); const generateSummary = (content: string): string => {
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

        // Se não há propriedade success ou ela é undefined, assumir sucesso se HTTP foi OK
        const isSuccess = result?.success !== false;

        if (isSuccess) {
          toast({
            title: "Upload realizado!",
            description: `Arquivo "${file.name}" enviado para processamento no N8N.`,
          });

          // 📝 N8N é responsável por preencher as tabelas documents e documents_details
          console.log('✅ Arquivo enviado para N8N, aguardando processamento...');

          // Recarregar lista após um pequeno delay para dar tempo do N8N processar
          setTimeout(() => {
            fetchDocuments();
          }, 2000);

          onUploadComplete?.(result?.documentId || file.name);
        } else {
          throw new Error(result?.error || 'Erro no processamento do N8N');
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
        // Modo Webhook: deletar de documents_details e documents
        let deletedFromDetails = false;
        let deletedFromDocuments = false;

        // Tentar deletar de documents_details
        try {
          const { error: detailsError } = await supabase
            .from("documents_details")
            .delete()
            .eq("id", documentId)
            .eq("chatbot_user", user.id);

          if (!detailsError) {
            deletedFromDetails = true;
            console.log('✅ Deletado de documents_details');
          }
        } catch (err) {
          console.warn('⚠️ Erro ao deletar de documents_details:', err);
        }

        // Tentar deletar de documents
        try {
          const { error: documentsError } = await supabase
            .from("documents")
            .delete()
            .eq("id", documentId)
            .eq("chatbot_user", user.id);

          if (!documentsError) {
            deletedFromDocuments = true;
            console.log('✅ Deletado de documents');
          }
        } catch (err) {
          console.warn('⚠️ Erro ao deletar de documents:', err);
        }

        // Se não conseguiu deletar de nenhuma tabela, lançar erro
        if (!deletedFromDetails && !deletedFromDocuments) {
          throw new Error("Não foi possível deletar o documento de nenhuma tabela");
        }
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
        // Modo Webhook: buscar o conteúdo através do documento na lista atual
        // console.log('🔍 generatePreview WEBHOOK: Buscando documento ID:', documentId);

        // Encontrar o documento na lista atual
        const currentDoc = documents.find(d => d.id === documentId);
        if (!currentDoc) {
          throw new Error("Documento não encontrado na lista atual");
        }

        console.log('� Documento encontrado na lista:', currentDoc.filename);

        // Estratégia 1: Tentar buscar diretamente em documents_details
        const detailsResult = await supabase
          .from("documents_details")
          .select("content, filename, upload_date")
          .eq("id", documentId)
          .eq("chatbot_user", user.id)
          .single();

        console.log('� Resultado documents_details:', {
          error: detailsResult.error,
          hasData: !!detailsResult.data,
          contentLength: detailsResult.data?.content?.length || 0
        });

        if (!detailsResult.error && detailsResult.data && detailsResult.data.content) {
          document = detailsResult.data;
          content = detailsResult.data.content;
          console.log('✅ Conteúdo encontrado em documents_details');
        } else {
          // Estratégia 2: Buscar chunks na tabela documents e reconstituir
          console.log('� Buscando chunks para reconstituir conteúdo...');

          const { data: chunks, error: chunksError } = await supabase
            .from("documents")
            .select("content, metadata")
            .not("metadata", "is", null)
            .order("id", { ascending: true });

          console.log('🧩 Total de chunks encontrados:', chunks?.length || 0);

          if (!chunksError && chunks && chunks.length > 0) {
            // Filtrar chunks do mesmo arquivo e usuário
            const fileChunks = chunks.filter(chunk => {
              if (!chunk.metadata) return false;
              const metadata = chunk.metadata;
              const chunkUserId = metadata.usuario || metadata.chatbot_user;
              const chunkFilename = metadata.file_name || metadata.filename;

              return chunkUserId === user.id && chunkFilename === currentDoc.filename;
            });

            console.log('🧩 Chunks filtrados para o arquivo:', {
              filename: currentDoc.filename,
              userId: user.id,
              totalChunks: fileChunks.length
            });

            if (fileChunks.length > 0) {
              // Reconstituir conteúdo a partir dos chunks
              content = fileChunks
                .map(chunk => chunk.content || "")
                .filter(text => text.trim().length > 0)
                .join("\n\n");

              // Usar dados do documento da lista atual
              document = {
                filename: currentDoc.filename,
                upload_date: currentDoc.upload_date,
                content: content
              };

              console.log('✅ Conteúdo reconstituído:', {
                chunks: fileChunks.length,
                contentLength: content.length,
                contentPreview: content.substring(0, 100) + '...'
              });
            } else {
              // Estratégia 3: Usar fallback com placeholder
              console.log('⚠️ Nenhum chunk encontrado, usando fallback');
              content = `Conteúdo do arquivo "${currentDoc.filename}" não está disponível para preview no momento.

Possíveis motivos:
- O arquivo ainda está sendo processado
- O arquivo foi enviado em modo webhook e o conteúdo não foi armazenado localmente
- Erro na sincronização com o banco de dados

Informações do arquivo:
- Nome: ${currentDoc.filename}
- Data de upload: ${currentDoc.upload_date ? new Date(currentDoc.upload_date).toLocaleString('pt-BR') : 'Não disponível'}
- Tamanho: ${currentDoc.file_size ? Math.round(currentDoc.file_size / 1024) + ' KB' : 'Desconhecido'}
- Status: ${currentDoc.status}

Para visualizar o conteúdo completo, faça o download do arquivo.`;

              document = {
                filename: currentDoc.filename,
                upload_date: currentDoc.upload_date,
                content: content
              };

              console.log('📝 Usando conteúdo de fallback');
            }
          } else {
            throw new Error("Erro ao buscar chunks do documento");
          }
        }

        error = !document ? new Error("Documento não encontrado") : null;
      }

      if (error || !document) {
        throw new Error("Documento não encontrado");
      }

      // Verificar se o conteúdo é muito pequeno e melhorar a mensagem
      if (content && content.trim().length < 10) {
        console.log('⚠️ Conteúdo muito pequeno detectado:', {
          length: content.length,
          trimmedLength: content.trim().length,
          content: JSON.stringify(content)
        });

        content = `ARQUIVO MUITO PEQUENO OU VAZIO

Arquivo: ${document.filename}
Tamanho: ${content.length} caracteres
Conteúdo bruto: "${content}"
Conteúdo (sem espaços): "${content.trim()}"

⚠️ POSSÍVEIS CAUSAS:
- O arquivo original está realmente vazio ou quase vazio
- O N8N não processou o conteúdo corretamente
- Erro no upload ou processamento

📋 AÇÕES SUGERIDAS:
1. Verifique o arquivo original no seu computador
2. Tente fazer upload novamente
3. Verifique se o N8N está processando corretamente

Para visualizar o arquivo original, use o botão "Baixar".`;
      }

      // Abrir modal com o conteúdo
      setPreviewContent(content || "Conteúdo não disponível");
      setPreviewFilename(document.filename);
      setPreviewUploadDate(document.upload_date);
      setIsModalMaximized(false); // Resetar estado de maximização
      setPreviewModalOpen(true);

      // Dar foco ao container de scroll após um pequeno delay
      setTimeout(() => {
        if (previewScrollRef.current) {
          previewScrollRef.current.focus();
        }
      }, 100);

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
                <div className="flex items-center gap-2 ml-2">
                  <File className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-lg">Documentos Enviados &nbsp; ( {documents.length} )</span>
                </div>

                {/* Botão de recolher/expandir */}
                <div className="flex items-center gap-2">

                  {/* Botão de recarregar - apenas no modo WEBHOOK */}
                  {/* {!useLocalProcessing && (
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
                  )} */}

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

            </CardTitle>

          </CardHeader>

          <CardContent>
            {isDocumentsExpanded && (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const statusInfo = getStatusLabel(doc.status);

                  return (
                    <div key={doc.id} className="bg-black/30 border rounded-lg p-4">
                      {/* Layout responsivo: desktop = linha única, mobile = duas linhas */}
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">

                        {/* Informações do documento */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getStatusIcon(doc.status)}

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-lg truncate">{doc.filename}</p>

                            <p className="pt-1 text-sm text-gray-400">
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

                        {/* Botões de ação - responsivos */}
                        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2 lg:flex-shrink-0">
                          {/* Botão Preview */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePreview(doc.id)}
                            disabled={generatingPreviews.has(doc.id)}
                            className="border border-violet-600 hover:border-violet-700 text-violet-400 hover:bg-violet-800 flex-1 sm:flex-none"
                            title="Visualizar conteúdo do documento"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Preview</span>
                            <span className="sm:hidden">Ver</span>
                          </Button>

                          {/* Botão Baixar */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(doc.id, doc.filename)}
                            className="border border-blue-600 hover:border-blue-700 text-blue-400 hover:bg-blue-800 flex-1 sm:flex-none"
                            title="Fazer download do documento original"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Baixar</span>
                            <span className="sm:hidden">Down</span>
                          </Button>

                          {/* Botão Excluir */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={processingDocuments.has(doc.id)}
                                className="border border-red-800 hover:border-red-900 text-red-700 hover:bg-red-800 flex-1 sm:flex-none"
                                title="Excluir documento"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Excluir</span>
                                <span className="sm:hidden">Del</span>
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
            ? "fixed inset-4 w-auto h-auto max-w-none max-h-none rounded-lg border"
            : "max-w-5xl max-h-[90vh] w-[95vw]"
            } flex flex-col overflow-hidden`}
          style={isModalMaximized ? {
            position: 'fixed',
            top: '2rem',
            left: '2rem',
            right: '2rem',
            bottom: '2rem',
            width: 'auto',
            height: 'auto',
            margin: 0,
            transform: 'none',
            zIndex: 50,
            backgroundColor: '#1e293b',
          } : {
            backgroundColor: '#1e293b',
          }}
        >
          {/* DialogTitle e DialogDescription ocultos para acessibilidade */}
          <div className="sr-only">
            <DialogTitle>Preview do Documento {previewFilename}</DialogTitle>
            <DialogDescription>
              Visualização do conteúdo do documento {previewFilename}.
              Use as setas do teclado ou mouse para navegar pelo conteúdo.
            </DialogDescription>
          </div>

          {/* Header customizado seguindo padrão Windows */}
          <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-600 bg-slate-800 flex-shrink-0 ${isModalMaximized ? 'rounded-t-lg' : 'rounded-t-lg'
            }`}>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-white">Preview do Documento</h2>
              <p className="text-xs text-gray-300 mt-1">
                💡 Clique no conteúdo e use as setas ↑↓ ou Page Up/Down para navegar
              </p>
            </div>
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
          <div className="preview-modal-body flex flex-col flex-1 min-h-0 overflow-hidden">
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
                  {previewContent.length > 500 && (
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                      ⬆️⬇️ Rolável
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo do documento com scroll otimizado */}
            <div className="flex-1 mx-6 my-4 overflow-hidden">
              <div className="h-full bg-gray-200 text-gray-800 rounded-lg border shadow-inner">
                <div
                  ref={previewScrollRef}
                  className="preview-scroll-container h-full p-6 overflow-y-auto overflow-x-hidden focus:outline-none cursor-text"
                  tabIndex={0}
                  role="textbox"
                  aria-label="Conteúdo do documento"
                  aria-multiline="true"
                  aria-readonly="true"
                  data-testid="preview-scroll-container"
                  onKeyDown={(e) => {
                    const container = e.currentTarget;
                    const step = 60; // Aumentado para melhor resposta

                    console.log('🎹 Tecla pressionada:', e.key, 'Container:', {
                      scrollTop: container.scrollTop,
                      scrollHeight: container.scrollHeight,
                      clientHeight: container.clientHeight,
                      canScroll: container.scrollHeight > container.clientHeight
                    });

                    switch (e.key) {
                      case 'ArrowUp':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollBy({ top: -step, behavior: 'smooth' });
                        console.log('⬆️ Scroll up:', container.scrollTop);
                        break;
                      case 'ArrowDown':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollBy({ top: step, behavior: 'smooth' });
                        console.log('⬇️ Scroll down:', container.scrollTop);
                        break;
                      case 'PageUp':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollBy({
                          top: -container.clientHeight * 0.85,
                          behavior: 'smooth'
                        });
                        break;
                      case 'PageDown':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollBy({
                          top: container.clientHeight * 0.85,
                          behavior: 'smooth'
                        });
                        break;
                      case 'Home':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                      case 'End':
                        e.preventDefault();
                        e.stopPropagation();
                        container.scrollTo({
                          top: container.scrollHeight,
                          behavior: 'smooth'
                        });
                        break;
                    }
                  }}
                  onWheel={(e) => {
                    // Garantir que o scroll funciona com mouse wheel
                    e.stopPropagation();
                  }}
                  onClick={() => {
                    // Auto-focus quando clicar
                    if (previewScrollRef.current) {
                      previewScrollRef.current.focus();
                    }
                  }}
                  style={{
                    minHeight: '300px',
                    maxHeight: '60vh',
                    height: '50vh',
                    scrollBehavior: 'smooth',
                  }}
                >
                  <div
                    className="min-h-full"
                    style={{
                      lineHeight: '1.6',
                      letterSpacing: '0.025em'
                    }}
                  >
                    <pre
                      className="whitespace-pre-wrap text-sm font-mono text-gray-800 select-text m-0 p-0"
                      style={{
                        fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto',
                        tabSize: 2,
                      }}
                    >
                      {previewContent}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUpload;
