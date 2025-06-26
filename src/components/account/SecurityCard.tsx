// Componente: SecurityCard
// Funcionalidade:
// Este componente renderiza um card com opções relacionadas à segurança da conta do usuário.
// Ele inclui apenas um botão para "Alterar senha" (atualmente sem funcionalidade implementada
// diretamente neste componente).
// Utiliza componentes de UI do shadcn/ui para a estrutura do card e botão.
//
// Funções e Constantes Principais:
// - SecurityCard (Componente): Componente funcional React que renderiza o card de segurança.

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react"; // Ícone de cadeado.

// Componente SecurityCard
// Renderiza um card com opções de segurança, como alterar senha.
const SecurityCard = () => {
  return (
    // Card principal com estilos de fundo, borda e backdrop-filter + MARGEM INFERIOR.
    <Card className="bg-theme-card border border-theme-accent/50 text-foreground mb-8 shadow-lg">
      
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-white">Senha</CardTitle>
        <CardDescription className="text-gray-300">Altere sua senha regularmente</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Seção "Senha" */}
        <div className="flex items-center space-x-2 text-foreground">
          <Lock size={16} className="text-theme-accent" /> {/* Ícone de cadeado */}
          <span className="text-sm">Alterar senha</span>
        </div>
        
        {/* Botão "Alterar senha" */}
        {/* TODO: Implementar a funcionalidade de alteração de senha ou navegação para a página correspondente. */}
        <Button 
          variant="outline" 
          className="w-full bg-primary border-border text-primary-foreground hover:bg-primary/90 hover:border-primary"
          // onClick={() => { /* Lógica para alterar senha */ }} // Exemplo de onde a lógica seria adicionada
        >
          Alterar senha
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
