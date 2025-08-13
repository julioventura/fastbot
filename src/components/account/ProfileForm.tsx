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
import { User, Mail, Phone, UserPlus, GraduationCap } from "lucide-react";

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
    is_dentist: boolean;
    is_other: boolean;
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
    is_dentist: boolean;
    is_other: boolean;
    created_at: string;
    updated_at: string;
  }) => Promise<void>;
  loading: boolean;
}

// Componente ProfileForm
// Renderiza e gerencia o formulário de edição de perfil do usuário.
const ProfileForm = ({ profile, onSave, loading }: ProfileFormProps) => {
  // Estados apenas para campos que existem na tabela
  const [name, setName] = useState(profile.name || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [isStudent, setIsStudent] = useState(profile.is_student || false);
  const [isProfessor, setIsProfessor] = useState(profile.is_professor || false);
  const [isDentist, setIsDentist] = useState(profile.is_dentist || false);
  const [isOther, setIsOther] = useState(profile.is_other || false);

  // Hook para exibir notificações (toasts).
  const { toast } = useToast();

  // Efeito useEffect
  // Atualiza o estado interno do formulário se a prop `profile` mudar.
  // Isso garante que o formulário reflita os dados mais recentes se eles forem atualizados externamente.
  useEffect(() => {
    console.log("=== DEBUG ProfileForm ===");
    console.log("profile recebido:", profile);
    
    setName(profile.name || "");
    setWhatsapp(profile.whatsapp || "");
    setIsStudent(profile.is_student || false);
    setIsProfessor(profile.is_professor || false);
    setIsDentist(profile.is_dentist || false);
    setIsOther(profile.is_other || false);
    
    console.log("Estados após setState:", { 
      name: profile.name || "", 
      whatsapp: profile.whatsapp || "",
      isStudent: profile.is_student || false,
      isProfessor: profile.is_professor || false,
      isDentist: profile.is_dentist || false,
      isOther: profile.is_other || false
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
        is_dentist: Boolean(isDentist),
        is_other: Boolean(isOther),
        updated_at: new Date().toISOString(),
      };

      console.log("Dados que serão enviados:", updatedProfile);
      
      // Chamar a função onSave do componente pai
      await onSave(updatedProfile);
      
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

  // Renderização do formulário de perfil.
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-8">

      
      {/* Campo Nome */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-foreground text-lg font-medium">Nome</Label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-5 w-5 text-theme-accent" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="pl-12 py-3 text-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            disabled={loading} // Desabilita durante o salvamento.
          />
        </div>
      </div>
      
      {/* Campo WhatsApp */}
      <div className="space-y-3">
        <Label htmlFor="whatsapp" className="text-foreground text-lg font-medium">WhatsApp</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-theme-accent" />
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(00) 00000-0000"
            className="pl-12 py-3 text-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            disabled={loading}
          />
        </div>
        <p className="text-sm text-muted-foreground">Usado para contato e configuração do chatbot</p>
      </div>
      
      {/* Campo Email (somente leitura) */}
      <div className="space-y-3">
        <Label htmlFor="email" className="text-foreground text-lg font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-theme-accent" />
          <Input
            id="email"
            value={profile.email}
            placeholder="Seu email"
            className="pl-12 py-3 text-lg bg-muted/50 border-border text-foreground placeholder:text-muted-foreground cursor-not-allowed"
            disabled={true}
            readOnly
          />
        </div>
        <p className="text-sm text-muted-foreground">Email usado para login na conta (não editável)</p>
      </div>

      {/* Seleção de Tipo de Perfil */}
      <div className="space-y-6">
        <div>
          <Label className="text-foreground text-lg font-medium">Tipo de Perfil</Label>
          <p className="text-sm text-muted-foreground mt-1">Selecione uma ou mais opções que descrevem seu perfil</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Checkbox Estudante */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <Checkbox
              id="is_student"
              checked={isStudent}
              onCheckedChange={(checked) => setIsStudent(Boolean(checked))}
              className="border-primary data-[state=checked]:bg-primary w-5 h-5"
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <Label htmlFor="is_student" className="text-foreground text-base font-medium flex items-center space-x-2 cursor-pointer">
                <GraduationCap className="h-5 w-5 text-theme-accent" />
                <span>Estudante</span>
              </Label>
              <p className="text-xs text-muted-foreground">Estudante de graduação ou pós-graduação</p>
            </div>
          </div>

          {/* Checkbox Professor */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <Checkbox
              id="is_professor"
              checked={isProfessor}
              onCheckedChange={(checked) => setIsProfessor(Boolean(checked))}
              className="border-primary data-[state=checked]:bg-primary w-5 h-5"
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <Label htmlFor="is_professor" className="text-foreground text-base font-medium flex items-center space-x-2 cursor-pointer">
                <UserPlus className="h-5 w-5 text-theme-accent" />
                <span>Professor</span>
              </Label>
              <p className="text-xs text-muted-foreground">Professor ou educador</p>
            </div>
          </div>

          {/* Checkbox Dentista */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <Checkbox
              id="is_dentist"
              checked={isDentist}
              onCheckedChange={(checked) => setIsDentist(Boolean(checked))}
              className="border-primary data-[state=checked]:bg-primary w-5 h-5"
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <Label htmlFor="is_dentist" className="text-foreground text-base font-medium flex items-center space-x-2 cursor-pointer">
                <User className="h-5 w-5 text-theme-accent" />
                <span>Dentista</span>
              </Label>
              <p className="text-xs text-muted-foreground">Profissional da odontologia</p>
            </div>
          </div>

          {/* Checkbox Outro */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <Checkbox
              id="is_other"
              checked={isOther}
              onCheckedChange={(checked) => setIsOther(Boolean(checked))}
              className="border-primary data-[state=checked]:bg-primary w-5 h-5"
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <Label htmlFor="is_other" className="text-foreground text-base font-medium flex items-center space-x-2 cursor-pointer">
                <UserPlus className="h-5 w-5 text-theme-accent" />
                <span>Outro</span>
              </Label>
              <p className="text-xs text-muted-foreground">Outro tipo de profissional</p>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Botão de Submissão do Formulário */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={loading} // Desabilita o botão durante o salvamento.
          className="w-full py-4 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        >
          {loading ? "Salvando..." : "Salvar alterações"} {/* Texto do botão muda durante o salvamento. */}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
