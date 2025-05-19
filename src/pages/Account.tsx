
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Lock, Phone, CalendarIcon, MapPin, Building, Briefcase, UserPlus, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [profession, setProfession] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }

    if (user) {
      setEmail(user.email || "");
      
      // Tenta obter dados do perfil se existir
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          if (data && !error) {
            setName(data.name || "");
            setWhatsapp(data.whatsapp || "");
            setIsStudent(data.is_student || false);
            setIsProfessor(data.is_professor || false);
            setProfession(data.profession || "");
            setGender(data.gender || "");
            setBirthDate(data.birth_date || "");
            setCity(data.city || "");
            setState(data.state || "");
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        }
      };
      
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Prepara os dados do perfil com os tipos corretos conforme a tabela
      const profileData = {
        name,
        whatsapp,
        is_student: isStudent, // boolean
        is_professor: isProfessor, // boolean
        profession,
        gender,
        birth_date: birthDate || null, // data ou null
        city,
        state
      };

      console.log("Dados a serem salvos:", profileData);
      
      // Verifica se o perfil existe
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      let result;
      
      if (existingProfile) {
        // Atualiza perfil existente
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);
      } else {
        // Cria novo perfil
        result = await supabase
          .from("profiles")
          .insert([{ user_id: user.id, ...profileData }]);
      }
      
      if (result.error) {
        console.error("Erro ao salvar perfil:", result.error);
        throw result.error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Por favor, tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <g opacity="0.4" filter="url(#filter0_f_101_3)">
              <circle cx="1079" cy="540" r="359" fill="#0063F7" />
            </g>
            <g opacity="0.3" filter="url(#filter1_f_101_3)">
              <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
            </g>
            <defs>
              <filter id="filter0_f_101_3" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
              </filter>
              <filter id="filter1_f_101_3" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
              </filter>
            </defs>
          </svg>
        </div>
        
        {/* Grid overlay pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="h-full w-full grid"
            style={{
              gridTemplateRows: 'repeat(20, 1fr)',
              gridTemplateColumns: 'repeat(20, 1fr)',
            }}
          >
            {/* Horizontal lines */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`h-${index}`}
                className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                style={{ top: `${(index * 100) / 20}%` }}
              />
            ))}

            {/* Vertical lines */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`v-${index}`}
                className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                style={{ left: `${(index * 100) / 20}%` }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      {/* SVG Glow Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <g opacity="0.4" filter="url(#filter0_f_101_3)">
            <circle cx="1079" cy="540" r="359" fill="#0063F7" />
          </g>
          <g opacity="0.3" filter="url(#filter1_f_101_3)">
            <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
          </g>
          <defs>
            <filter id="filter0_f_101_3" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
            <filter id="filter1_f_101_3" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* Grid overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full grid"
          style={{
            gridTemplateRows: 'repeat(20, 1fr)',
            gridTemplateColumns: 'repeat(20, 1fr)',
          }}
        >
          {/* Horizontal lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`h-${index}`}
              className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
              style={{ top: `${(index * 100) / 20}%` }}
            />
          ))}

          {/* Vertical lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`v-${index}`}
              className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
              style={{ left: `${(index * 100) / 20}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 gradient-text">Minha Conta</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Informações Pessoais</CardTitle>
                <CardDescription className="text-gray-300">Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        disabled
                        className="pl-8 bg-[#0a1629] border-[#2a4980]/50 text-gray-400"
                      />
                    </div>
                    <p className="text-sm text-gray-400">O email não pode ser alterado.</p>
                  </div>
                  
                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                      <Input
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Seu número de WhatsApp"
                        className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Profissão */}
                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-gray-300">Profissão</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                      <Input
                        id="profession"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="Sua profissão"
                        className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Sexo */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Sexo</Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          id="masculino" 
                          value="masculino" 
                          className="border-[#4f9bff] text-[#4f9bff]" 
                        />
                        <Label htmlFor="masculino" className="text-gray-300">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          id="feminino" 
                          value="feminino" 
                          className="border-[#4f9bff] text-[#4f9bff]" 
                        />
                        <Label htmlFor="feminino" className="text-gray-300">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          id="outro" 
                          value="outro" 
                          className="border-[#4f9bff] text-[#4f9bff]" 
                        />
                        <Label htmlFor="outro" className="text-gray-300">Outro</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Data de Nascimento */}
                  <div className="space-y-2">
                    <Label htmlFor="birth_date" className="text-gray-300">Nascimento</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                      <Input
                        id="birth_date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-300">Cidade</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Sua cidade"
                          className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-300">Estado</Label>
                      <div className="relative">
                        <Building className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Seu estado"
                          className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Checkbox para Estudante e Professor */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_student" 
                        checked={isStudent} 
                        onCheckedChange={(checked) => setIsStudent(checked === true)}
                        className="border-[#4f9bff] data-[state=checked]:bg-[#4f9bff]"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="is_student" className="text-gray-300 flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-[#4f9bff]" />
                          <span>Estudante</span>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_professor" 
                        checked={isProfessor} 
                        onCheckedChange={(checked) => setIsProfessor(checked === true)}
                        className="border-[#4f9bff] data-[state=checked]:bg-[#4f9bff]"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="is_professor" className="text-gray-300 flex items-center space-x-2">
                          <UserPlus className="h-4 w-4 text-[#4f9bff]" />
                          <span>Professor</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Segurança</CardTitle>
                <CardDescription className="text-gray-300">Gerencie sua senha e segurança da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Lock size={16} className="text-[#4f9bff]" />
                  <span className="text-sm">Senha</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#2a4980]/50 text-[#4f9bff] hover:bg-[#2a4980]/30"
                >
                  Alterar senha
                </Button>
                
                <div className="border-t border-[#2a4980]/50 pt-4">
                  <Button
                    variant="destructive"
                    className="w-full bg-red-500/80 hover:bg-red-600/80"
                    onClick={handleSignOut}
                  >
                    Sair da conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
