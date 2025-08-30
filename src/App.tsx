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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MyChatbot from "@/components/chatbot/MyChatbot";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import MyChatbotPage from "./pages/MyChatbotPage";
import PublicChatbotPage from "./pages/PublicChatbotPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConversationHistoryPage from "./pages/ConversationHistoryPage";
import { AdminPage } from "./pages/AdminPage";
import BaseDeDados from "./pages/BaseDeDados";

// Constante queryClient
const queryClient = new QueryClient();

// Lista de rotas conhecidas do sistema (que não são chatbots)
const SYSTEM_ROUTES = [
  '/',
  '/account',
  '/pricing',
  '/features',
  '/my-chatbot',
  '/base-de-dados',
  '/conversation-history',
  '/reset-password',
  '/admin',
  '/404'
];

// Função para verificar se é uma página de chatbot público
const isPublicChatbotRoute = (pathname: string): boolean => {
  // Remove o trailing slash se existir
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  // Se for uma rota do sistema, não é chatbot
  if (SYSTEM_ROUTES.includes(cleanPath)) {
    return false;
  }

  // Se começa com /, tem pelo menos um caractere e não contém barras adicionais, pode ser chatbot
  const pathParts = cleanPath.split('/').filter(part => part.length > 0);
  return pathParts.length === 1 && pathParts[0].length > 0;
};

// Componente AppLayout que decide quando mostrar Header/Footer
const AppLayout = () => {
  const location = useLocation();
  const isPublicChatbot = isPublicChatbotRoute(location.pathname);

  return (
    <>
      {!isPublicChatbot && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/account" element={<Account />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/my-chatbot" element={<MyChatbotPage />} />
        <Route path="/base-de-dados" element={<BaseDeDados />} />
        <Route path="/conversation-history" element={<ConversationHistoryPage />} />
        <Route path="/:chatbotSlug" element={<PublicChatbotPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isPublicChatbot && <Footer />}
      {!isPublicChatbot && <MyChatbot />}
    </>
  );
};

// Componente App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/fastbot">
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
