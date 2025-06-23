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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, UserPlus, GraduationCap } from "lucide-react";

// Interface ProfileFormProps
// Define as propriedades que o componente ProfileForm aceita.
interface ProfileFormProps {
  userId: string; // ID do usuário, usado para buscar e salvar o perfil.
  userData: { // Dados iniciais do perfil do usuário.
    name: string;
    email: string;
    whatsapp: string;
    isStudent: boolean;
    isProfessor: boolean;
    // Remover campos que não existem na tabela
    profession?: string;
    gender?: string;
    birthDate?: string;
    city?: string;
    state?: string;
  };
  onUpdate?: () => void; // Callback opcional chamado após a atualização bem-sucedida do perfil.
}

// Componente ProfileForm
// Renderiza e gerencia o formulário de edição de perfil do usuário.
const ProfileForm = ({ userId, userData, onUpdate }: ProfileFormProps) => {
  // Estados apenas para campos que existem na tabela
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [whatsapp, setWhatsapp] = useState(userData.whatsapp || "");
  const [isStudent, setIsStudent] = useState(userData.isStudent || false);
  const [isProfessor, setIsProfessor] = useState(userData.isProfessor || false);

  // Estado para indicar se o formulário está sendo salvo.
  const [isSaving, setIsSaving] = useState(false);

  // Hook para exibir notificações (toasts).
  const { toast } = useToast();

  // Efeito useEffect
  // Atualiza o estado interno do formulário se a prop `userData` mudar.
  // Isso garante que o formulário reflita os dados mais recentes se eles forem atualizados externamente.
  useEffect(() => {
    console.log("=== DEBUG ProfileForm ===");
    console.log("userData recebido:", userData);
    
    setName(userData.name || "");
    setEmail(userData.email || "");
    setWhatsapp(userData.whatsapp || "");
    setIsStudent(userData.isStudent || false);
    setIsProfessor(userData.isProfessor || false);
    
    console.log("Estados após setState:", { 
      name: userData.name || "", 
      whatsapp: userData.whatsapp || "",
      isStudent: userData.isStudent || false,
      isProfessor: userData.isProfessor || false
    });
  }, [userData]); // Manter apenas userData como dependência

  // Função handleUpdateProfile
  // Chamada quando o formulário é submetido para salvar as alterações do perfil.
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setIsSaving(true);
    
    try {
      // Forçar os valores boolean e garantir que whatsapp seja string
      const profileData = {
        name: name || '',
        whatsapp: whatsapp || '',
        is_student: Boolean(isStudent), // Forçar boolean
        is_professor: Boolean(isProfessor), // Forçar boolean
      };

      console.log("Dados que serão enviados:", profileData);
      console.log("Estado atual:", { name, whatsapp, isStudent, isProfessor });
      
      // Verificar se já existe um perfil para este usuário
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle(); // Usar maybeSingle em vez de single

      if (checkError) {
        console.error("Erro ao verificar perfil existente:", checkError);
        throw checkError;
      }
      
      let result;
      
      if (existingProfile) {
        console.log("Atualizando perfil existente...");
        // Atualiza o perfil existente
        result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", userId)
          .select(); // Adicionar select para ver o resultado
      } else {
        console.log("Criando novo perfil...");
        // Cria um novo perfil se não existir
        result = await supabase
          .from("profiles")
          .insert([{ id: userId, ...profileData }])
          .select(); // Adicionar select para ver o resultado
      }
      
      console.log("Resultado da operação:", result);
      
      if (result.error) {
        console.error("Erro ao salvar perfil:", result.error);
        throw result.error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      // Chamar o callback APÓS confirmar que salvou com sucesso
      if (onUpdate) {
        console.log("Chamando callback onUpdate...");
        await onUpdate(); // Aguardar o callback completar
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

  // Renderização do formulário de perfil.
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Campo Nome */}
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
            disabled={isSaving} // Desabilita durante o salvamento.
          />
        </div>
      </div>
      
      {/* Campo Email (Somente Leitura) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
          <Input
            id="email"
            value={email}
            readOnly // Campo não pode ser editado.
            disabled // Desabilita visualmente o campo.
            className="pl-8 bg-[#0a1629] border-[#2a4980]/50 text-gray-400"
          />
        </div>
        <p className="text-sm text-gray-400">O email não pode ser alterado.</p>
      </div>
      
      {/* Campo WhatsApp */}
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
            disabled={isSaving}
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
            className="border-[#4f9bff] data-[state=checked]:bg-[#4f9bff]"
            disabled={isSaving}
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
            onCheckedChange={(checked) => setIsProfessor(checked === true)} // Garante que o valor seja boolean.
            className="border-[#4f9bff] data-[state=checked]:bg-[#4f9bff]"
            disabled={isSaving}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="is_professor" className="text-gray-300 flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-[#4f9bff]" />
              <span>Professor</span>
            </Label>
          </div>
        </div>
      </div>
      
      {/* Botão de Submissão do Formulário */}
      <Button 
        type="submit" 
        disabled={isSaving} // Desabilita o botão durante o salvamento.
        className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      >
        {isSaving ? "Salvando..." : "Salvar alterações"} {/* Texto do botão muda durante o salvamento. */}
      </Button>
    </form>
  );
};

export default ProfileForm;
