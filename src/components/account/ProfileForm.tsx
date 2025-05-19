
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, CalendarIcon, MapPin, Building, Briefcase, UserPlus, GraduationCap } from "lucide-react";

interface ProfileFormProps {
  userId: string;
  userData: {
    name: string;
    email: string;
    whatsapp: string;
    isStudent: boolean;
    isProfessor: boolean;
    profession: string;
    gender: string;
    birthDate: string;
    city: string;
    state: string;
  };
  onUpdate?: () => void;
}

const ProfileForm = ({ userId, userData, onUpdate }: ProfileFormProps) => {
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [whatsapp, setWhatsapp] = useState(userData.whatsapp);
  const [isStudent, setIsStudent] = useState(userData.isStudent);
  const [isProfessor, setIsProfessor] = useState(userData.isProfessor);
  const [profession, setProfession] = useState(userData.profession);
  const [gender, setGender] = useState(userData.gender);
  const [birthDate, setBirthDate] = useState(userData.birthDate);
  const [city, setCity] = useState(userData.city);
  const [state, setState] = useState(userData.state);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
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
        .eq("user_id", userId)
        .single();
      
      let result;
      
      if (existingProfile) {
        // Atualiza perfil existente
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", userId);
      } else {
        // Cria novo perfil
        result = await supabase
          .from("profiles")
          .insert([{ user_id: userId, ...profileData }]);
      }
      
      if (result.error) {
        console.error("Erro ao salvar perfil:", result.error);
        throw result.error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      if (onUpdate) {
        onUpdate();
      }
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

  return (
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
  );
};

export default ProfileForm;
