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
import Configure from "./pages/Configure";

// Constante queryClient
const queryClient = new QueryClient();

// Componente AppLayout que decide quando mostrar Header/Footer
const AppLayout = () => {
  const location = useLocation();
  const isPublicChatbot = location.pathname.startsWith('/chat/');

  return (
    <>
      {!isPublicChatbot && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/account" element={<Account />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/my-chatbot" element={<MyChatbotPage />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/base-de-dados" element={<BaseDeDados />} />
        <Route path="/conversation-history" element={<ConversationHistoryPage />} />
        <Route path="/chat/:chatbotSlug" element={<PublicChatbotPage />} />
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
