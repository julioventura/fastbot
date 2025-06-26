// Componente: ProfileTimestamps
// Funcionalidade:
// Este componente renderiza um card que exibe as datas de criação ("Criado em")
// e da última atualização ("Atualizado em") do perfil do usuário.
// Ele recebe as strings de data como props, formata-as para um padrão
// legível (dd-MM-yyyy (HH:mm)) e as apresenta de forma organizada,
// utilizando ícones e componentes de UI do shadcn/ui.
//
// Funções e Constantes Principais:
// - ProfileTimestampsProps (Interface): Define as propriedades esperadas pelo componente.
//   - createdAt (string | null): A data de criação do perfil, como string ou nulo.
//   - updatedAt (string | null): A data da última atualização do perfil, como string ou nulo.
// - ProfileTimestamps (Componente): Componente funcional React que renderiza o card com os timestamps.
//   - Props: `createdAt`, `updatedAt`.
//   - formatDateTime (função interna): Formata uma string de data para o formato "dd-MM-yyyy (HH:mm)".
//     Retorna "-" se a data for nula ou inválida, e loga erros de formatação.

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Copy } from "lucide-react"; // Adicionar ícone Copy
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast"; // Importar toast para feedback


// Interface ProfileTimestampsProps
// Define as propriedades que o componente ProfileTimestamps aceita.
interface ProfileTimestampsProps {
  userId: string; // ID do usuário para automações
  createdAt: string | null; // Data de criação do perfil. Pode ser uma string ISO ou null.
  updatedAt: string | null; // Data da última atualização do perfil. Pode ser uma string ISO ou null.
}


// Componente ProfileTimestamps
// Renderiza um card exibindo as datas de criação e atualização do perfil + ID do usuário
const ProfileTimestamps = ({ userId, createdAt, updatedAt }: ProfileTimestampsProps) => {
  const { toast } = useToast(); // Hook para exibir notificações


  // Função formatDateTime
  // Formata uma string de data para o padrão "dd-MM-yyyy (HH:mm)".
  // Parâmetros:
  //   - dateString (string | null): A string da data a ser formatada.
  // Retorna:
  //   - string: A data formatada, ou "-" se a entrada for nula, ou a string original em caso de erro.
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"; // Retorna "-" se a string da data for nula ou vazia.
    try {
      const date = new Date(dateString); // Tenta criar um objeto Date a partir da string.
      return format(date, "dd-MM-yyyy (HH:mm)"); // Formata a data.
    } catch (error) {
      console.error("Erro ao formatar data:", error); // Loga o erro no console.
      return dateString; // Retorna a string original em caso de erro na formatação.
    }
  };


  // Função copyToClipboard
  // Copia o ID do usuário para a área de transferência
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast({
        title: "ID Copiado!",
        description: "O ID do usuário foi copiado para a área de transferência.",
      });
    } catch (error) {
      console.error("Erro ao copiar ID:", error);
      // Fallback para navegadores que não suportam navigator.clipboard
      try {
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "ID Copiado!",
          description: "O ID do usuário foi copiado para a área de transferência.",
        });
      } catch (fallbackError) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível copiar o ID. Copie manualmente.",
        });
      }
    }
  };


  // Renderização do card com os timestamps.
  return (
    <Card className="bg-theme-card border border-theme-accent/50 backdrop-blur-sm text-foreground mb-8">
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-white">Informações do Perfil</CardTitle>
        <CardDescription className="text-gray-300">Detalhes da criação e atualização do seu perfil</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Seção "ID do Usuário" - COM FUNCIONALIDADE DE COPY */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-foreground">
            <User size={16} className="text-theme-accent" />
            <span className="text-sm">ID do Usuário</span>
          </div>
          {/* Div para exibir o ID do usuário com botão de copy */}
          <div className="flex items-center justify-between px-4 py-2 bg-background border border-border rounded">
            <span className="text-foreground font-mono text-sm flex-1 truncate pr-2">
              {userId}
            </span>
            {/* Botão de Copy */}
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-theme-accent hover:bg-theme-hover rounded transition-colors group"
              title="Copiar ID"
            >
              <Copy 
                size={16} 
                className="group-hover:scale-110 transition-transform" 
              />
            </button>
          </div>
          <p className="text-xs text-gray-400">Use este ID para automações e configurações do chatbot</p>
        </div>
        
        {/* Seção "Criado em" */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-foreground">
            <Clock size={16} className="text-theme-accent" />
            <span className="text-sm">Criado em</span>
          </div>
          <div className="px-4 py-2 bg-background border border-border rounded text-foreground">
            {formatDateTime(createdAt)}
          </div>
        </div>
        
        {/* Seção "Atualizado em" */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-foreground">
            <Clock size={16} className="text-theme-accent" />
            <span className="text-sm">Atualizado em</span>
          </div>
          <div className="px-4 py-2 bg-background border border-border rounded text-foreground">
            {formatDateTime(updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTimestamps;
