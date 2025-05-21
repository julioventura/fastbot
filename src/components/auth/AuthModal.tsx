// Componente: AuthModal
// Funcionalidade:
// Este componente renderiza um modal de autenticação com abas para Login, Cadastro e
// Recuperação de Senha. Ele utiliza os componentes Dialog e Tabs do shadcn/ui
// para a estrutura e navegação, e formulários específicos (LoginForm, SignUpForm,
// ResetPasswordForm) para cada funcionalidade de autenticação.
// O modal também inclui um efeito visual de grade de fundo.
//
// Funções e Constantes Principais:
// - AuthModalProps (Interface): Define as propriedades esperadas pelo componente AuthModal.
//   - isOpen (boolean): Controla a visibilidade do modal.
//   - onOpenChange (function): Função callback chamada quando o estado de abertura do modal muda.
//   - defaultTab (string, opcional): Especifica a aba que deve ser exibida por padrão ('login', 'signup', ou 'reset').
// - AuthModal (Componente): Componente funcional React que renderiza o modal de autenticação.
//   - Props: `isOpen`, `onOpenChange`, `defaultTab`.
//   - activeTab (estado): String que armazena qual aba ('login', 'signup', 'reset') está atualmente ativa.
//   - setActiveTab (função de estado): Função para atualizar o estado `activeTab`.
//   - Renderiza dinamicamente o título do modal e o formulário apropriado com base na `activeTab`.
//   - Inclui um efeito de grade de fundo decorativo.

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// Interface AuthModalProps
// Define as propriedades que o componente AuthModal aceita.
interface AuthModalProps {
  isOpen: boolean; // Controla se o modal está aberto ou fechado.
  onOpenChange: (open: boolean) => void; // Função chamada quando o estado de abertura do modal deve mudar.
  defaultTab?: "login" | "signup" | "reset"; // Aba padrão a ser exibida ao abrir o modal.
}

// Componente AuthModal
// Renderiza um modal com funcionalidades de login, cadastro e recuperação de senha.
const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onOpenChange,
  defaultTab = "login", // Define 'login' como a aba padrão se nenhuma for fornecida.
}) => {
  // activeTab: Estado para controlar qual aba (login, signup, reset) está atualmente selecionada.
  // Inicializado com o valor de defaultTab.
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Retorna a estrutura JSX do modal de autenticação.
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-[#2a4980]/50 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white shadow-[0_0_15px_rgba(0,99,247,0.3)] overflow-hidden">
        {/* Efeito de Grade de Fundo (Decorativo) */}
        {/* Este div cria um padrão de grade sutil sobre o fundo do modal. */}
        {/* 'absolute inset-0 z-0 opacity-10' posiciona a grade para preencher o modal e ficar atrás do conteúdo. */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full grid">
            {/* Linhas Horizontais da Grade */}
            {/* Mapeamento para criar as linhas horizontais. */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={`h-${index}`} // Chave única para cada linha horizontal.
                className="absolute left-0 right-0 border-t border-[#4f9bff]/30" // Estilos da linha.
                style={{ top: `${(index * 100) / 9}%` }} // Posicionamento vertical da linha.
              />
            ))}

            {/* Linhas Verticais da Grade */}
            {/* Mapeamento para criar as linhas verticais. */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={`v-${index}`} // Chave única para cada linha vertical.
                className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30" // Estilos da linha.
                style={{ left: `${(index * 100) / 9}%` }} // Posicionamento horizontal da linha.
              />
            ))}
          </div>
        </div>

        {/* Cabeçalho do Modal */}
        {/* 'relative z-10' garante que o cabeçalho fique acima da grade de fundo. */}
        <DialogHeader className="relative z-10">
          {/* Título do Modal */}
          {/* O título muda dinamicamente com base na aba ativa. */}
          <DialogTitle className="text-center text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]">
            {activeTab === "login"
              ? "Acesse sua conta"
              : activeTab === "signup"
              ? "Criar nova conta"
              : "Recuperar senha"}
          </DialogTitle>
          {/* Descrição/Subtítulo do Modal */}
          <DialogDescription className="text-center text-sm text-gray-300 mt-2 pb-10">
            Ainda não tem uma conta? Cadastre-se GRÁTIS!
          </DialogDescription>
        </DialogHeader>

        {/* Sistema de Abas para Login, Cadastro e Recuperação de Senha */}
        {/* 'relative z-10' garante que as abas fiquem acima da grade de fundo. */}
        <Tabs
          value={activeTab} // Controla a aba ativa.
          onValueChange={setActiveTab} // Atualiza o estado da aba ativa quando o usuário clica em uma aba.
          className="w-full relative z-10"
        >
          {/* Lista de Triggers das Abas */}
          {/* Contém os botões que o usuário clica para mudar de aba. */}
          <TabsList className="grid w-full grid-cols-3 bg-[#0a1629]/70 border border-[#2a4980]/50">
            {/* Trigger da Aba de Login */}
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Login
            </TabsTrigger>
            {/* Trigger da Aba de Cadastro */}
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Cadastro
            </TabsTrigger>
            {/* Trigger da Aba de Recuperação de Senha */}
            <TabsTrigger
              value="reset"
              className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(79,155,255,0.5)] text-gray-300"
            >
              Recuperar
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da Aba de Login */}
          {/* Renderiza o formulário de login. */}
          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={() => onOpenChange(false)} /> {/* Fecha o modal em caso de sucesso no login. */}
          </TabsContent>

          {/* Conteúdo da Aba de Cadastro */}
          {/* Renderiza o formulário de cadastro. */}
          <TabsContent value="signup" className="mt-6">
            <SignUpForm
              onSuccess={() => {
                setActiveTab("login"); // Muda para a aba de login após o cadastro bem-sucedido.
              }}
            />
          </TabsContent>

          {/* Conteúdo da Aba de Recuperação de Senha */}
          {/* Renderiza o formulário de recuperação de senha. */}
          <TabsContent value="reset" className="mt-6">
            <ResetPasswordForm
              onSuccess={() => {
                setActiveTab("login"); // Muda para a aba de login após a solicitação de recuperação bem-sucedida.
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
