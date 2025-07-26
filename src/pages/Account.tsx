// Componente: Account
// Funcionalidade:
// Esta página permite que usuários autenticados visualizem e gerenciem
// as informações do seu perfil, incluindo dados pessoais e profissionais.
// Ela busca dados da tabela 'profiles' no Supabase, permite a edição
// através do componente ProfileForm, e exibe informações de segurança e timestamps.
//
// Funções e Constantes Principais:
// - Account (Componente): Componente funcional principal da página.
// - user (const): Objeto contendo informações do usuário autenticado, obtido do hook useAuth.
// - loading (const): Booleano indicando se o estado de autenticação ainda está carregando, obtido do hook useAuth.
// - signOut (const): Função para deslogar o usuário, obtida do hook useAuth.
// - navigate (const): Função para navegação programática, obtida do hook useNavigate.
// - profileData (estado): Objeto que armazena os dados do perfil do usuário.
// - setProfileData (função de estado): Atualiza o estado profileData.
// - createdAt (estado): String (ou null) armazenando a data de criação do perfil.
// - setCreatedAt (função de estado): Atualiza o estado createdAt.
// - updatedAt (estado): String (ou null) armazenando a data da última atualização do perfil.
// - setUpdatedAt (função de estado): Atualiza o estado updatedAt.
// - isProfileLoading (estado): Booleano que controla a exibição do indicador de carregamento dos dados do perfil.
// - setIsProfileLoading (função de estado): Atualiza o estado isProfileLoading.
// - useEffect (hook):
//   - Responsável por verificar o estado de autenticação do usuário. Se não estiver autenticado, redireciona para a home.
//   - Se autenticado, busca os dados do perfil do usuário no Supabase através da função interna fetchProfile.
// - fetchProfile (função interna no useEffect): Função assíncrona para buscar os dados do perfil do usuário na tabela 'profiles'.
// - handleSignOut (função): Manipulador para o evento de logout do usuário.
// - handleProfileUpdate (função): Manipulador chamado após a atualização do perfil, para buscar os timestamps atualizados.

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import ProfileForm from "@/components/account/ProfileForm";
import ProfileTimestamps from "@/components/account/ProfileTimestamps";
import SecurityCard from "@/components/account/SecurityCard";
import CloseAccount from "@/components/account/CloseAccount"; // Importar o novo componente
import LoadingScreen from "@/components/account/LoadingScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, User, Clock, Lock, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  whatsapp: string | null;
  is_student: boolean;
  is_professor: boolean;
  is_dentist: boolean;
  is_other: boolean;
  created_at: string;
  updated_at: string;
}

// Componente Account
// Define a lógica e a estrutura da página de gerenciamento de conta do usuário.
const Account = () => {
  // --- Hooks e Contextos ---
  // user: Objeto do usuário autenticado.
  // loading: Estado de carregamento da autenticação.
  // signOut: Função para deslogar o usuário.
  const { user, loading: authLoading, signOut } = useAuth();

  // navigate: Função para navegação programática.
  const navigate = useNavigate();
  const { toast } = useToast();


  // --- Estados do Componente ---
  // profileData: Armazena os dados do perfil do usuário.
  const [profileData, setProfileData] = useState<Profile | null>(null);

  // loading: Estado de carregamento para operações de perfil.
  const [loading, setLoading] = useState(true);

  // error: Mensagem de erro para exibição.
  const [error, setError] = useState<string | null>(null);

  // saving: Estado de carregamento ao salvar o perfil.
  const [saving, setSaving] = useState(false);

  // Estados para controlar expansão dos componentes da coluna direita
  const [expandedSections, setExpandedSections] = useState({
    profileInfo: false,
    security: false,
    closeAccount: false
  });


  // --- Componente CollapsibleCard ---
  // Wrapper para cards colapsáveis
  const CollapsibleCard = ({ 
    title, 
    description, 
    isExpanded, 
    onToggle, 
    children 
  }: {
    title: string;
    description: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => {
    return (
      <Card className="bg-theme-card border border-theme-accent/50 text-foreground mb-8 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">{title}</CardTitle>
              <CardDescription className="text-gray-300">{description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-theme-hover text-theme-accent hover:text-theme-accent-light"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  // --- Função toggleSection ---
  // Alterna o estado de expansão de uma seção específica
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // --- Função loadProfile ---
  // Carrega os dados do perfil do usuário autenticado.
  const loadProfile = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Erro ao carregar perfil:", profileError);
        setError("Erro ao carregar dados do perfil");
        return;
      }

      if (data) {
        setProfileData({
          ...data,
        });
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };


  // --- Função handleSaveProfile ---
  // Salva as alterações no perfil do usuário.
  const handleSaveProfile = async (updatedProfile: Profile) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: updatedProfile.name,
          whatsapp: updatedProfile.whatsapp,
          is_student: updatedProfile.is_student,
          is_professor: updatedProfile.is_professor,
          is_dentist: updatedProfile.is_dentist,
          is_other: updatedProfile.is_other,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Erro ao salvar perfil:", updateError);
        toast({
          title: "Erro",
          description: "Erro ao salvar dados do perfil",
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      setProfileData(updatedProfile);

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (err) {
      console.error("Erro inesperado ao salvar:", err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  // --- Função handleProfileUpdate ---
  // Atualiza o perfil localmente para refletir mudanças em tempo real.
  const handleProfileUpdateCallback = (updatedProfile: Profile) => {
    setProfileData(prev => ({
      ...prev,
      name: updatedProfile.name || '',
      whatsapp: updatedProfile.whatsapp || '',
      is_student: Boolean(updatedProfile.is_student),
      is_professor: Boolean(updatedProfile.is_professor),
      is_dentist: Boolean(updatedProfile.is_dentist),
      is_other: Boolean(updatedProfile.is_other)
    }));
  };


  // --- Efeito useEffect para Scroll ao Topo ---
  // Garante que a página inicie sempre no topo quando acessada
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Efeito useEffect para Carregamento Inicial, Autenticação e Busca de Dados do Perfil ---
  // Executado na montagem do componente e quando 'user', 'loading' ou 'navigate' mudam.
  // Responsável por:
  // 1. Redirecionar para a home se o usuário não estiver autenticado e o carregamento da auth tiver terminado.
  // 2. Preencher o email no estado 'profileData' com o email do usuário autenticado.
  // 3. Buscar os dados detalhados do perfil do Supabase se o usuário estiver autenticado.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/"); // Redireciona se não houver usuário e o carregamento da autenticação terminou.
    }

    if (user) {
      // Preenche o email no estado local assim que o usuário estiver disponível.
      setProfileData((prev) => ({ ...prev, email: user.email || "" }));

      // --- Função fetchProfile ---
      // Busca os dados do perfil do usuário na tabela 'profiles' do Supabase.
      const fetchProfile = async () => {
        setLoading(true);
        try {
          console.log("Fetching profile for user ID:", user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id) // CORREÇÃO: usar 'id' em vez de 'user_id'
            .single();

          console.log("Profile data:", data); // Log para depuração.
          console.log("Profile error:", error); // Log para depuração.

          // Se dados forem encontrados e não houver erro, atualiza o estado 'profileData' e os timestamps.
          if (data && !error) {
            console.log("Dados do perfil carregados:", data);

            setProfileData({
              id: data.id,
              name: data.name || "",
              email: user.email || "", // Garante que o email do auth seja usado.
              whatsapp: data.whatsapp || "",
              is_student: Boolean(data.is_student), // Forçar boolean
              is_professor: Boolean(data.is_professor), // Forçar boolean
              is_dentist: Boolean(data.is_dentist || false), // Forçar boolean
              is_other: Boolean(data.is_other || false), // Forçar boolean
              created_at: data.created_at,
              updated_at: data.updated_at,
            });
          }
          // Nota: Erros 'PGRST116' (nenhum registro encontrado) são tratados implicitamente
          // pois 'data' será null e o estado não será atualizado com novos dados,
          // mantendo os valores iniciais ou o email do usuário.
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
          // Poderia adicionar um toast de erro aqui se necessário.
        } finally {
          setLoading(false); // Finaliza o estado de carregamento dos dados do perfil.
        }
      };

      fetchProfile(); // Chama a função para buscar os dados.
    }
  }, [user, authLoading, navigate]); // Dependências do useEffect.


  // --- Função handleAccountDeletion ---
  // Manipulador para exclusão permanente da conta do usuário.
  // Desloga o usuário e redireciona para a página inicial após exclusão.
  const handleAccountDeletion = async () => {
    try {
      // Fazer logout do usuário
      await signOut();
      // Redirecionar para a página inicial
      navigate("/");
    } catch (error) {
      console.error("Erro ao processar exclusão da conta:", error);
      navigate("/");
    }
  };


  // --- Função handleDataRefresh ---
  // Chamada como callback pelo componente ProfileForm após uma atualização bem-sucedida do perfil.
  // Responsável por buscar novamente os dados do perfil para refletir as mudanças.
  const handleDataRefresh = async () => {
    if (user) {
      try {
        // Buscar todos os dados do perfil atualizado
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          console.log("Dados do perfil atualizados:", data);

          // Atualizar os dados do perfil
          setProfileData({
            id: data.id,
            name: data.name || "",
            email: user.email || "",
            whatsapp: data.whatsapp || "",
            is_student: Boolean(data.is_student),
            is_professor: Boolean(data.is_professor),
            is_dentist: Boolean(data.is_dentist || false),
            is_other: Boolean(data.is_other || false),
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados atualizados do perfil:", error);
      }
    }
  };


  // --- Condicional de Carregamento Global ---
  // Exibe a tela de carregamento se o estado de autenticação inicial ainda estiver carregando.
  if (authLoading || loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar logado para acessar esta página.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Dados do perfil não encontrados.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // --- Renderização do Componente ---
  // Estrutura JSX da página de conta do usuário.
  return (
    <div className="relative overflow-hidden bg-theme-gradient min-h-screen">
      <BackgroundDecoration />

      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 gradient-text">
          Minha Conta
        </h1>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Coluna Principal (Formulário de Perfil) */}
          <div className="md:col-span-2">
            <Card className="bg-theme-card border border-theme-accent/50 text-foreground shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Seus dados profissionais
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Mantenha suas informações atualizadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exibe indicador de carregamento para o formulário ou o formulário em si */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                ) : user && ( // Garante que o usuário exista antes de renderizar o ProfileForm
                  <ProfileForm
                    profile={profileData}
                    onSave={handleSaveProfile}
                    loading={saving}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral (Timestamps e Segurança) */}
          <div>
            {/* Informações do Perfil - Colapsável */}
            <CollapsibleCard
              title="Informações do Perfil"
              description="Detalhes técnicos do seu perfil"
              isExpanded={expandedSections.profileInfo}
              onToggle={() => toggleSection('profileInfo')}
            >
              <div className="space-y-4">
                {/* Seção "ID do Usuário" */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-foreground">
                    <User size={16} className="text-theme-accent" />
                    <span className="text-sm">ID do Usuário</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-background border border-border rounded">
                    <span className="text-foreground font-mono text-sm flex-1 truncate pr-2">
                      {user.id}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(user.id);
                        toast({
                          title: "ID Copiado!",
                          description: "O ID do usuário foi copiado para a área de transferência.",
                        });
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-theme-accent hover:bg-theme-hover"
                      title="Copiar ID"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
                    {profileData.created_at ? format(new Date(profileData.created_at), "dd-MM-yyyy (HH:mm)") : "-"}
                  </div>
                </div>
                
                {/* Seção "Atualizado em" */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-foreground">
                    <Clock size={16} className="text-theme-accent" />
                    <span className="text-sm">Atualizado em</span>
                  </div>
                  <div className="px-4 py-2 bg-background border border-border rounded text-foreground">
                    {profileData.updated_at ? format(new Date(profileData.updated_at), "dd-MM-yyyy (HH:mm)") : "-"}
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            {/* Senha - Colapsável */}
            <CollapsibleCard
              title="Senha"
              description="Altere sua senha regularmente"
              isExpanded={expandedSections.security}
              onToggle={() => toggleSection('security')}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-foreground">
                  <Lock size={16} className="text-theme-accent" />
                  <span className="text-sm">Alterar senha</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full bg-primary border-border text-primary-foreground hover:bg-primary/90 hover:border-primary"
                >
                  Alterar senha
                </Button>
              </div>
            </CollapsibleCard>

            {/* Fechar Conta - Colapsável */}
            <CollapsibleCard
              title="Fechar Conta"
              description="Exclua permanentemente sua conta"
              isExpanded={expandedSections.closeAccount}
              onToggle={() => toggleSection('closeAccount')}
            >
              <CloseAccount
                userEmail={user?.email || ""}
                onAccountDeleted={handleAccountDeletion}
              />
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
