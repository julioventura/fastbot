// Componente: ProfileForm
// Funcionalidade:
// Este componente renderiza um formulário para o usuário visualizar e editar
// suas informações de perfil. Ele inclui campos para nome, email (somente leitura),
// WhatsApp, profissão, sexo, data de nascimento, cidade, estado, e checkboxes
// para indicar se o usuário é estudante ou professor.
// O formulário interage com o Supabase para buscar e salvar os dados do perfil.
// Utiliza toasts para fornecer feedback ao usuário sobre o sucesso ou falha
// das operações de salvamento.
//
// Funções e Constantes Principais:
// - ProfileFormProps (Interface): Define as propriedades esperadas pelo componente.
//   - userId (string): O ID do usuário logado.
//   - userData (objeto): Contém os dados atuais do perfil do usuário.
//     - name, email, whatsapp, profession, gender, birthDate, city, state (strings)
//     - isStudent, isProfessor (booleans)
//   - onUpdate (function, opcional): Callback executado após a atualização bem-sucedida do perfil.
// - ProfileForm (Componente): Componente funcional React que renderiza o formulário.
//   - Props: `userId`, `userData`, `onUpdate`.
//   - Estados:
//     - name, email, whatsapp, profession, gender, birthDate, city, state (strings): Armazenam os valores dos campos do formulário.
//     - isStudent, isProfessor (booleans): Armazenam os estados dos checkboxes.
//     - isSaving (boolean): Indica se o processo de salvamento está em andamento.
//   - Hooks:
//     - useState: Para gerenciar o estado dos campos do formulário e o estado de salvamento.
//     - useEffect: Para atualizar o estado do formulário quando `userData` muda.
//     - useToast: Para exibir notificações (toasts).
//   - Funções:
//     - handleUpdateProfile (async function): Manipula a submissão do formulário.
//       - Prepara os dados do perfil para serem enviados ao Supabase.
//       - Verifica se um perfil já existe para o usuário.
//       - Cria um novo perfil (insert) ou atualiza um existente (update) na tabela 'profiles'.
//       - Exibe toasts de feedback.
//       - Chama `onUpdate` se fornecido e a operação for bem-sucedida.

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { User, Mail, Phone, UserPlus, GraduationCap, Palette } from "lucide-react";
import { ThemePalette } from "@/contexts/theme-context";

// Interface ProfileFormProps
// Define as propriedades que o componente ProfileForm aceita.
interface ProfileFormProps {
  profile: {
    id: string;
    name: string | null;
    email: string;
    whatsapp: string | null;
    is_student: boolean;
    is_professor: boolean;
    theme_preference?: string;
    created_at: string;
    updated_at: string;
  };
  onSave: (updatedProfile: {
    id: string;
    name: string | null;
    email: string;
    whatsapp: string | null;
    is_student: boolean;
    is_professor: boolean;
    theme_preference?: string;
    created_at: string;
    updated_at: string;
  }) => Promise<void>;
  loading: boolean;
}

// Componente ProfileForm
// Renderiza e gerencia o formulário de edição de perfil do usuário.
const ProfileForm = ({ profile, onSave, loading }: ProfileFormProps) => {
  // Hook do tema
  const { setTheme } = useTheme();

  // Estados apenas para campos que existem na tabela
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [isStudent, setIsStudent] = useState(profile.is_student || false);
  const [isProfessor, setIsProfessor] = useState(profile.is_professor || false);
  const [themePreference, setThemePreference] = useState<ThemePalette>(
    (profile.theme_preference as ThemePalette) || 'blue-dark'
  );

  // Hook para exibir notificações (toasts).
  const { toast } = useToast();

  // Efeito useEffect
  // Atualiza o estado interno do formulário se a prop `profile` mudar.
  // Isso garante que o formulário reflita os dados mais recentes se eles forem atualizados externamente.
  useEffect(() => {
    console.log("=== DEBUG ProfileForm ===");
    console.log("profile recebido:", profile);
    
    setName(profile.name || "");
    setEmail(profile.email || "");
    setWhatsapp(profile.whatsapp || "");
    setIsStudent(profile.is_student || false);
    setIsProfessor(profile.is_professor || false);
    setThemePreference((profile.theme_preference as ThemePalette) || 'blue-dark');
    
    console.log("Estados após setState:", { 
      name: profile.name || "", 
      whatsapp: profile.whatsapp || "",
      isStudent: profile.is_student || false,
      isProfessor: profile.is_professor || false,
      themePreference: profile.theme_preference || 'blue-dark'
    });
  }, [profile]); // Usar profile como dependência

  // Função handleUpdateProfile
  // Chamada quando o formulário é submetido para salvar as alterações do perfil.
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;
    
    try {
      // Preparar os dados atualizados do perfil
      const updatedProfile = {
        ...profile,
        name: name || null,
        whatsapp: whatsapp || null,
        is_student: Boolean(isStudent),
        is_professor: Boolean(isProfessor),
        theme_preference: themePreference,
        updated_at: new Date().toISOString(),
      };

      console.log("Dados que serão enviados:", updatedProfile);
      
      // Chamar a função onSave do componente pai
      await onSave(updatedProfile);
      
      // Aplicar o tema se mudou
      if (themePreference !== profile.theme_preference) {
        setTheme(themePreference);
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
    }
  };

  // Função para lidar com mudança de tema
  const handleThemeChange = (newTheme: string) => {
    const theme = newTheme as ThemePalette;
    setThemePreference(theme);
    // Aplicar o tema imediatamente
    setTheme(theme);
  };

  // Renderização do formulário de perfil.
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Campo Nome */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Nome</Label>
        <div className="relative">
          <User className="absolute left-2 top-2.5 h-4 w-4 text-theme-accent" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading} // Desabilita durante o salvamento.
          />
        </div>
      </div>
      
      {/* Campo Email (Somente Leitura) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-theme-accent" />
          <Input
            id="email"
            value={email}
            readOnly // Campo não pode ser editado.
            disabled // Desabilita visualmente o campo.
            className="pl-8 bg-background border-border text-muted-foreground"
          />
        </div>
        <p className="text-sm text-muted-foreground">O email não pode ser alterado.</p>
      </div>
      
      {/* Campo WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-foreground">WhatsApp</Label>
        <div className="relative">
          <Phone className="absolute left-2 top-2.5 h-4 w-4 text-theme-accent" />
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Seu número de WhatsApp"
            className="pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Checkboxes para Estudante e Professor */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="is_student" 
            checked={isStudent} 
            onCheckedChange={(checked) => setIsStudent(checked === true)} // Garante que o valor seja boolean.
            className="border-primary data-[state=checked]:bg-primary"
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="is_student" className="text-foreground flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-theme-accent" />
              <span>Estudante</span>
            </Label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="is_professor" 
            checked={isProfessor} 
            onCheckedChange={(checked) => setIsProfessor(checked === true)} // Garante que o valor seja boolean.
            className="border-primary data-[state=checked]:bg-primary"
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="is_professor" className="text-foreground flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-theme-accent" />
              <span>Professor</span>
            </Label>
          </div>
        </div>
      </div>
      
      {/* Seletor de Tema */}
      <div className="space-y-2">
        <Label htmlFor="theme" className="text-foreground flex items-center space-x-2">
          <Palette className="h-4 w-4 text-theme-accent" />
          <span>Tema da Interface</span>
        </Label>
        <Select 
          value={themePreference} 
          onValueChange={handleThemeChange}
          disabled={loading}
        >
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Selecione um tema" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="blue-dark" className="text-foreground hover:bg-accent">
              🌙 Azul Escuro
            </SelectItem>
            <SelectItem value="blue-light" className="text-foreground hover:bg-accent">
              ☀️ Azul Claro
            </SelectItem>
            <SelectItem value="purple-dark" className="text-foreground hover:bg-accent">
              🌙 Roxo Escuro
            </SelectItem>
            <SelectItem value="purple-light" className="text-foreground hover:bg-accent">
              ☀️ Roxo Claro
            </SelectItem>
            <SelectItem value="gray-dark" className="text-foreground hover:bg-accent">
              🌙 Cinza Escuro
            </SelectItem>
            <SelectItem value="gray-light" className="text-foreground hover:bg-accent">
              ☀️ Cinza Claro
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Escolha o tema que será aplicado quando você fizer login
        </p>
      </div>
      
      {/* Botão de Submissão do Formulário */}
      <Button 
        type="submit" 
        disabled={loading} // Desabilita o botão durante o salvamento.
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      >
        {loading ? "Salvando..." : "Salvar alterações"} {/* Texto do botão muda durante o salvamento. */}
      </Button>
    </form>
  );
};

export default ProfileForm;
