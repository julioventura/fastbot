// Componente: App
// Funcionalidade:
// Este é o componente raiz da aplicação. Ele é responsável por configurar
// todos os provedores globais (como QueryClientProvider para gerenciamento de
// estado do servidor, TooltipProvider para dicas de ferramentas, AuthProvider
// para autenticação), os componentes de UI globais (como Toaster para
// notificações e Header/Footer), e o sistema de roteamento principal
// da aplicação usando React Router. Ele define as rotas para todas as
// páginas principais da aplicação, incluindo a página inicial, conta, preços,
// funcionalidades, "Meu Chatbot" e a página de "Não Encontrado" (404).
//
// Constantes e Provedores Principais:
// - queryClient (const): Instância do QueryClient do TanStack Query, usada para
//   gerenciar o cache e o estado de dados do servidor.
// - QueryClientProvider: Provedor que disponibiliza o `queryClient` para
//   todos os componentes descendentes.
// - TooltipProvider: Provedor para habilitar e gerenciar tooltips (dicas de ferramenta)
//   em toda a aplicação, geralmente de bibliotecas como shadcn/ui.
// - AuthProvider: Provedor que gerencia o estado de autenticação do usuário
//   e fornece funções relacionadas à autenticação (login, logout, etc.)
//   para os componentes da aplicação.
// - Toaster: Componente para exibir notificações globais (estilo toast tradicional).
// - Sonner (Toaster as Sonner): Componente para exibir notificações globais
//   (estilo Sonner, uma alternativa ou complemento ao Toaster tradicional).
// - BrowserRouter: Componente do React Router que habilita o roteamento
//   baseado no histórico do navegador.
// - Routes: Componente do React Router que define o contêiner para as rotas.
// - Route: Componente do React Router usado para definir cada rota individual
//   e o componente que ela renderiza.
//
// Componentes de Página Importados:
// - Index: Página inicial da aplicação.
// - NotFound: Página exibida quando uma rota não é encontrada (404).
// - Account: Página de gerenciamento da conta do usuário.
// - PricingPage: Página que exibe os planos e preços.
// - FeaturesPage: Página que exibe as funcionalidades do produto/serviço.
// - MyChatbotPage: Página dedicada à interação ou configuração do chatbot do usuário.
//
// Componentes de Layout Importados:
// - Header: Componente de cabeçalho exibido em todas as páginas.
// - Footer: Componente de rodapé exibido em todas as páginas.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Renomeado para evitar conflito de nome.
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import MyChatbotPage from "./pages/MyChatbotPage"; // Nova importação para a página do chatbot.


// Constante queryClient
// Cria uma nova instância do QueryClient para ser usada com o TanStack Query.
// Esta instância gerencia o cache de dados e o estado das requisições.
const queryClient = new QueryClient();


// Componente App
// O componente principal que envolve toda a aplicação, configurando provedores e rotas.
const App = () => (
  // QueryClientProvider: Disponibiliza o `queryClient` para o restante da aplicação.
  <QueryClientProvider client={queryClient}>
    {/* TooltipProvider: Habilita o uso de tooltips (dicas de ferramenta) em toda a aplicação. */}
    <TooltipProvider>
      {/* AuthProvider: Gerencia o estado de autenticação e fornece contexto de autenticação. */}
      <AuthProvider>
        {/* Toaster: Componente para exibir notificações globais (estilo toast tradicional). */}
        <Toaster />
        {/* Sonner: Componente para exibir notificações globais (estilo Sonner). */}
        <Sonner />
        {/* BrowserRouter: Habilita o roteamento baseado no histórico do navegador. */}
        <BrowserRouter>
          {/* Header: Componente de cabeçalho, renderizado em todas as rotas. */}
          <Header />
          {/* Routes: Contêiner para todas as definições de rotas da aplicação. */}
          <Routes>
            {/* Rota para a página inicial. */}
            <Route path="/" element={<Index />} />
            {/* Rota para a página de conta do usuário. */}
            <Route path="/account" element={<Account />} />
            {/* Rota para a página de preços. */}
            <Route path="/pricing" element={<PricingPage />} />
            {/* Rota para a página de funcionalidades. */}
            <Route path="/features" element={<FeaturesPage />} />
            {/* Rota para a página "Meu Chatbot". */}
            <Route path="/my-chatbot" element={<MyChatbotPage />} />
            {/* Rota "catch-all" para páginas não encontradas (404). 
                Deve ser a última rota definida. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Footer: Componente de rodapé, renderizado em todas as rotas. */}
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
