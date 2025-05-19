
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface ProfileTimestampsProps {
  createdAt: string | null;
  updatedAt: string | null;
}

const ProfileTimestamps = ({ createdAt, updatedAt }: ProfileTimestampsProps) => {
  // Função para formatar datas no padrão solicitado
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd-MM-yyyy (HH:mm)");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  return (
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white mb-8">
      <CardHeader>
        <CardTitle className="text-white">Informações do Perfil</CardTitle>
        <CardDescription className="text-gray-300">Detalhes da criação do seu perfil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock size={16} className="text-[#4f9bff]" />
            <span className="text-sm">Criado em</span>
          </div>
          <div className="px-4 py-2 bg-[#0a1629]/80 border border-[#2a4980]/50 rounded text-gray-300">
            {formatDateTime(createdAt)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock size={16} className="text-[#4f9bff]" />
            <span className="text-sm">Atualizado em</span>
          </div>
          <div className="px-4 py-2 bg-[#0a1629]/80 border border-[#2a4980]/50 rounded text-gray-300">
            {formatDateTime(updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTimestamps;
