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
import LoadingScreen from "@/components/account/LoadingScreen";

// Componente Account
// Define a lógica e a estrutura da página de gerenciamento de conta do usuário.
const Account = () => {
  // --- Hooks e Contextos ---
  // user: Objeto do usuário autenticado.
  // loading: Estado de carregamento da autenticação.
  // signOut: Função para deslogar o usuário.
  const { user, loading, signOut } = useAuth();

  // navigate: Função para navegação programática.
  const navigate = useNavigate();


  // --- Estados do Componente ---
  // profileData: Armazena os dados do perfil do usuário.
  const [profileData, setProfileData] = useState({
    name: "",
    email: "", // O email é preenchido inicialmente com o email do usuário autenticado.
    whatsapp: "",
    isStudent: false,
    isProfessor: false,
    profession: "",
    gender: "",
    birthDate: "",
    city: "",
    state: "",
  });

  // createdAt: Armazena a data de criação do perfil.
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  // updatedAt: Armazena a data da última atualização do perfil.
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // isProfileLoading: Controla a exibição do indicador de carregamento dos dados do perfil.
  const [isProfileLoading, setIsProfileLoading] = useState(true);


  // --- Efeito useEffect para Carregamento Inicial, Autenticação e Busca de Dados do Perfil ---
  // Executado na montagem do componente e quando 'user', 'loading' ou 'navigate' mudam.
  // Responsável por:
  // 1. Redirecionar para a home se o usuário não estiver autenticado e o carregamento da auth tiver terminado.
  // 2. Preencher o email no estado 'profileData' com o email do usuário autenticado.
  // 3. Buscar os dados detalhados do perfil do Supabase se o usuário estiver autenticado.
  useEffect(() => {
    if (!loading && !user) {
      navigate("/"); // Redireciona se não houver usuário e o carregamento da autenticação terminou.
    }

    if (user) {
      // Preenche o email no estado local assim que o usuário estiver disponível.
      setProfileData(prev => ({...prev, email: user.email || ""}));
      
      // --- Função fetchProfile ---
      // Busca os dados do perfil do usuário na tabela 'profiles' do Supabase.
      const fetchProfile = async () => {
        setIsProfileLoading(true);
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
              name: data.name || "",
              email: user.email || "", // Garante que o email do auth seja usado.
              whatsapp: data.whatsapp || "",
              isStudent: Boolean(data.is_student), // Forçar boolean
              isProfessor: Boolean(data.is_professor), // Forçar boolean
              profession: data.profession || "",
              gender: data.gender || "",
              birthDate: data.birth_date || "",
              city: data.city || "",
              state: data.state || "",
            });
            setCreatedAt(data.created_at || null);
            setUpdatedAt(data.updated_at || null);
          }
          // Nota: Erros 'PGRST116' (nenhum registro encontrado) são tratados implicitamente
          // pois 'data' será null e o estado não será atualizado com novos dados,
          // mantendo os valores iniciais ou o email do usuário.
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
          // Poderia adicionar um toast de erro aqui se necessário.
        } finally {
          setIsProfileLoading(false); // Finaliza o estado de carregamento dos dados do perfil.
        }
      };
      
      fetchProfile(); // Chama a função para buscar os dados.
    }
  }, [user, loading, navigate]); // Dependências do useEffect.


  // --- Função handleSignOut ---
  // Manipulador de evento para deslogar o usuário.
  // Chama a função signOut do contexto de autenticação e redireciona para a página inicial.
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  // --- Função handleProfileUpdate ---
  // Chamada como callback pelo componente ProfileForm após uma atualização bem-sucedida do perfil.
  // Responsável por buscar novamente os timestamps (created_at, updated_at) para refletir as mudanças.
  const handleProfileUpdate = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("created_at, updated_at")
          .eq("id", user.id) // CORREÇÃO: usar 'id' em vez de 'user_id'
          .single();
        
        if (data && !error) {
          setCreatedAt(data.created_at || null);
          setUpdatedAt(data.updated_at || null);
        }
      } catch (error) {
        console.error("Erro ao buscar timestamps atualizados:", error);
        // Poderia adicionar um toast de erro aqui se necessário.
      }
    }
  };


  // --- Condicional de Carregamento Global ---
  // Exibe a tela de carregamento se o estado de autenticação inicial ainda estiver carregando.
  if (loading) {
    return <LoadingScreen />;
  }


  // --- Renderização do Componente ---
  // Estrutura JSX da página de conta do usuário.
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 gradient-text">Minha Conta</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Coluna Principal (Formulário de Perfil) */}
          <div className="md:col-span-2">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Seus dados profissionais</CardTitle>
                <CardDescription className="text-gray-300">Mantenha suas informações atualizadas.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exibe indicador de carregamento para o formulário ou o formulário em si */}
                {isProfileLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                ) : user && ( // Garante que o usuário exista antes de renderizar o ProfileForm
                  <ProfileForm 
                    userId={user.id}
                    userData={profileData}
                    onUpdate={handleProfileUpdate} // Passa a função de callback
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna Lateral (Timestamps e Segurança) */}
          <div>
            <ProfileTimestamps
              createdAt={createdAt}
              updatedAt={updatedAt}
            />
            
            <SecurityCard onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
