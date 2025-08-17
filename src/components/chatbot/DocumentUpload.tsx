import React, { useCallback, useState } from "react";
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
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chatbot_documents")
        .select("id, filename, status, file_size, upload_date, summary")
        .eq("chatbot_user", user.id)
        .order("filename", { ascending: true }); // Ordenação alfabética por nome do arquivo

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
      });
    }
  }, [user, toast]);

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

  const uploadDocument = useCallback(
    async (file: File) => {
      if (!user) return;

      setIsUploading(true);
      try {
        // Ler conteúdo do arquivo
        const content = await processFile(file);
        const summary = generateSummary(content);

        // Inserir documento no banco
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

        // Processar embeddings
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
            description: `${result.chunks_processed || 0
              } chunks processados com sucesso.`,
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
          title: "Sucesso!",
          description: `Arquivo "${file.name}" foi enviado e está sendo processado.`,
        });

        fetchDocuments(); // Recarregar lista
        onUploadComplete?.(document.id);
      } catch (error) {
        console.error("Erro no upload:", error);
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

  const deleteDocument = async (documentId: string) => {
    if (!user) return;

    try {
      // Primeiro, deletar os embeddings relacionados ao documento
      const { error: embeddingsError } = await supabase
        .from("chatbot_embeddings")
        .delete()
        .eq("document_id", documentId)
        .eq("chatbot_user", user.id);

      if (embeddingsError) {
        console.error("Erro ao deletar embeddings:", embeddingsError);
        // Continua com a deleção do documento mesmo se houver erro nos embeddings
      }

      // Depois, deletar o documento principal
      const { error } = await supabase
        .from("chatbot_documents")
        .delete()
        .eq("id", documentId)
        .eq("chatbot_user", user.id);

      if (error) throw error;

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
      // Buscar o conteúdo do documento
      const { data: documentData, error } = await supabase
        .from("chatbot_documents")
        .select("content, filename")
        .eq("id", documentId)
        .eq("chatbot_user", user.id)
        .single();

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

      // Buscar o conteúdo do documento
      const { data: document, error } = await supabase
        .from("chatbot_documents")
        .select("content, filename")
        .eq("id", documentId)
        .eq("chatbot_user", user.id)
        .single();

      if (error || !document) {
        throw new Error("Documento não encontrado");
      }

      // Gerar o resumo
      const summary = generateSummary(document.content);

      // Atualizar o documento com o resumo
      const { error: updateError } = await supabase
        .from("chatbot_documents")
        .update({ summary })
        .eq("id", documentId);

      if (updateError) throw updateError;

      toast({
        title: "Preview gerado!",
        description: `Preview do documento "${document.filename}" foi criado com sucesso.`,
      });

      // Recarregar a lista para mostrar o novo resumo
      fetchDocuments();
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
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
        return { label: "Processando", color: "text-gray-400" };
      default:
        return { label: "Carregando", color: "text-gray-600" };
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
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p>Solte os arquivos aqui...</p>
            ) : (
              <div>
                <Button variant="outline" disabled={isUploading} className="text-yellow-500">
                  {isUploading ? "Processando..." : "Arraste arquivos .txt ou clique para selecionar"}
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
            <CardTitle>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5" />
                  Documentos Enviados ({documents.length})
                </div>

                {/* Botão de recolher/expandir */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleDocumentsExpansion}
                  className="h-8 w-8 p-0 hover:bg-blue-800"
                  title={isDocumentsExpanded ? "Recolher lista" : "Expandir lista"}
                >
                  {isDocumentsExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {isDocumentsExpanded && (
                <div className="space-y-2">
                  {/* Layout responsivo: uma linha no desktop, duas linhas no mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left">
                    <span className="text-sm text-green-500">
                      • Processados:{" "}
                      {documents.filter((d) => d.status === "completed").length}
                    </span>
                    <span className="text-sm text-red-500">
                      • Com erro:{" "}
                      {documents.filter((d) => d.status === "error").length}
                    </span>
                    <span className="text-sm text-gray-400">
                      • Processando:{" "}
                      {documents.filter((d) => d.status === "processing").length}
                    </span>

                    {documents.filter((d) => d.status === "error").length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
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
                    <div key={doc.id} className="bg-blue-950 border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(doc.status)}

                          <div className="flex-1">
                            <p className="font-medium text-lg">{doc.filename}</p>

                            <p className="pt-1 text-sx text-gray-400">
                              {new Date(doc.upload_date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>

                            <p className="pt-1 text-sx text-gray-400">
                              {formatFileSize(doc.file_size)}
                            </p>

                          </div>
                        </div>

                        {/* Botões Download e Excluir centralizados verticalmente */}
                        <div className="flex-shrink-0 flex flex-col gap-2">
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
                              >
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
    </div>
  );
};

export default DocumentUpload;
