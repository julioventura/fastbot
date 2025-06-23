// Componente: CloseAccount
// Funcionalidade:
// Este componente renderiza um card com opção para sair da conta do usuário.
// Ele inclui apenas um botão para "Sair da conta", que executa a função
// `onSignOut` fornecida via props.
// Utiliza componentes de UI do shadcn/ui para a estrutura do card e botão.
//
// Funções e Constantes Principais:
// - CloseAccountProps (Interface): Define as propriedades esperadas pelo componente.
//   - onSignOut (function): Função assíncrona chamada quando o usuário clica no botão "Sair da conta".
// - CloseAccount (Componente): Componente funcional React que renderiza o card de fechamento de conta.
//   - Props: `onSignOut`.

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Interface CloseAccountProps
// Define as propriedades que o componente CloseAccount aceita.
interface CloseAccountProps {
  onSignOut: () => Promise<void>; // Função assíncrona para lidar com o logout do usuário.
}

// Componente CloseAccount
// Renderiza um card com opção para sair da conta.
const CloseAccount = ({ onSignOut }: CloseAccountProps) => {
  return (
    // Card principal com estilos de fundo, borda e backdrop-filter.
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
      
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-white">Fechar Conta</CardTitle>
        <CardDescription className="text-gray-300">Fechar sua conta de usuário</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Botão "Sair da conta" */}
        <div className="pt-4">
          <Button
            variant="destructive" // Variante de botão para ações destrutivas (como sair).
            className="w-full bg-red-500/80 border-2 border-red-800 hover:border-red-600 hover:bg-red-800/100" // Estilos customizados para o botão de sair.
            onClick={onSignOut} // Chama a função onSignOut ao ser clicado.
          >
            Fechar a conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloseAccount;