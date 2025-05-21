// Componente: SecurityCard
// Funcionalidade:
// Este componente renderiza um card com opções relacionadas à segurança da conta do usuário.
// Ele inclui um botão para "Alterar senha" (atualmente sem funcionalidade implementada
// diretamente neste componente) e um botão para "Sair da conta", que executa a função
// `onSignOut` fornecida via props.
// Utiliza componentes de UI do shadcn/ui para a estrutura do card e botões.
//
// Funções e Constantes Principais:
// - SecurityCardProps (Interface): Define as propriedades esperadas pelo componente.
//   - onSignOut (function): Função assíncrona chamada quando o usuário clica no botão "Sair da conta".
// - SecurityCard (Componente): Componente funcional React que renderiza o card de segurança.
//   - Props: `onSignOut`.

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react"; // Ícone de cadeado.


// Interface SecurityCardProps
// Define as propriedades que o componente SecurityCard aceita.
interface SecurityCardProps {
  onSignOut: () => Promise<void>; // Função assíncrona para lidar com o logout do usuário.
}


// Componente SecurityCard
// Renderiza um card com opções de segurança, como alterar senha e sair da conta.
const SecurityCard = ({ onSignOut }: SecurityCardProps) => {
  return (
    // Card principal com estilos de fundo, borda e backdrop-filter.
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
      
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-white">Segurança</CardTitle>
        <CardDescription className="text-gray-300">Gerencie sua senha e segurança da conta</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Seção "Senha" */}
        <div className="flex items-center space-x-2 text-gray-300">
          <Lock size={16} className="text-[#4f9bff]" /> {/* Ícone de cadeado */}
          <span className="text-sm">Senha</span>
        </div>
        
        {/* Botão "Alterar senha" */}
        {/* TODO: Implementar a funcionalidade de alteração de senha ou navegação para a página correspondente. */}
        <Button 
          variant="outline" 
          className="w-full border-[#2a4980]/50 text-[#4f9bff] hover:bg-[#2a4980]/30"
          // onClick={() => { /* Lógica para alterar senha */ }} // Exemplo de onde a lógica seria adicionada
        >
          Alterar senha
        </Button>
        
        {/* Divisor e Botão "Sair da conta" */}
        {/* 'border-t' cria uma linha divisória. 'pt-4' adiciona padding acima do botão. */}
        <div className="border-t border-[#2a4980]/50 pt-4">
          <Button
            variant="destructive" // Variante de botão para ações destrutivas (como sair).
            className="w-full bg-red-500/80 hover:bg-red-600/80" // Estilos customizados para o botão de sair.
            onClick={onSignOut} // Chama a função onSignOut ao ser clicado.
          >
            Sair da conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
