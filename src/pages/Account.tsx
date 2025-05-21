
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import ProfileForm from "@/components/account/ProfileForm";
import ProfileTimestamps from "@/components/account/ProfileTimestamps";
import SecurityCard from "@/components/account/SecurityCard";
import LoadingScreen from "@/components/account/LoadingScreen";

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    isStudent: false,
    isProfessor: false,
    profession: "",
    gender: "",
    birthDate: "",
    city: "",
    state: "",
  });
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }

    if (user) {
      setProfileData(prev => ({...prev, email: user.email || ""}));
      
      // Tenta obter dados do perfil se existir
      const fetchProfile = async () => {
        setIsProfileLoading(true);
        try {
          console.log("Fetching profile for user ID:", user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          console.log("Profile data:", data);
          console.log("Profile error:", error);
          
          if (data && !error) {
            setProfileData({
              name: data.name || "",
              email: user.email || "",
              whatsapp: data.whatsapp || "",
              isStudent: data.is_student || false,
              isProfessor: data.is_professor || false,
              profession: data.profession || "",
              gender: data.gender || "",
              birthDate: data.birth_date || "",
              city: data.city || "",
              state: data.state || "",
            });
            setCreatedAt(data.created_at || null);
            setUpdatedAt(data.updated_at || null);
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        } finally {
          setIsProfileLoading(false);
        }
      };
      
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    // Recarregar os dados do perfil após atualização
    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("created_at, updated_at")
          .eq("user_id", user.id)
          .single();
        
        if (data && !error) {
          setCreatedAt(data.created_at || null);
          setUpdatedAt(data.updated_at || null);
        }
      } catch (error) {
        console.error("Erro ao buscar timestamps atualizados:", error);
      }
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 gradient-text">Minha Conta</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Seus dados profissionais</CardTitle>
                <CardDescription className="text-gray-300"> </CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                ) : user && (
                  <ProfileForm 
                    userId={user.id}
                    userData={profileData}
                    onUpdate={handleProfileUpdate}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
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
