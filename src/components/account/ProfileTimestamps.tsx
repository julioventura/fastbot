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
import { Clock } from "lucide-react"; // Ícone de relógio.
import { format } from "date-fns"; // Biblioteca para formatação de datas.


// Interface ProfileTimestampsProps
// Define as propriedades que o componente ProfileTimestamps aceita.
interface ProfileTimestampsProps {
  createdAt: string | null; // Data de criação do perfil. Pode ser uma string ISO ou null.
  updatedAt: string | null; // Data da última atualização do perfil. Pode ser uma string ISO ou null.
}


// Componente ProfileTimestamps
// Renderiza um card exibindo as datas de criação e atualização do perfil.
const ProfileTimestamps = ({ createdAt, updatedAt }: ProfileTimestampsProps) => {

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


  // Renderização do card com os timestamps.
  return (
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white mb-8">
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-white">Informações do Perfil</CardTitle>
        <CardDescription className="text-gray-300">Detalhes da criação e atualização do seu perfil</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Seção "Criado em" */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock size={16} className="text-[#4f9bff]" /> {/* Ícone de relógio */}
            <span className="text-sm">Criado em</span>
          </div>
          {/* Div para exibir a data formatada de criação */}
          <div className="px-4 py-2 bg-[#0a1629]/80 border border-[#2a4980]/50 rounded text-gray-300">
            {formatDateTime(createdAt)}
          </div>
        </div>
        
        {/* Seção "Atualizado em" */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock size={16} className="text-[#4f9bff]" /> {/* Ícone de relógio */}
            <span className="text-sm">Atualizado em</span>
          </div>
          {/* Div para exibir a data formatada da última atualização */}
          <div className="px-4 py-2 bg-[#0a1629]/80 border border-[#2a4980]/50 rounded text-gray-300">
            {formatDateTime(updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTimestamps;
