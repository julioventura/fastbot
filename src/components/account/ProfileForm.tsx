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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, CalendarIcon, MapPin, Building, Briefcase, UserPlus, GraduationCap } from "lucide-react"; // Ícones para os campos


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
    profession: string;
    gender: string;
    birthDate: string;
    city: string;
    state: string;
  };
  onUpdate?: () => void; // Callback opcional chamado após a atualização bem-sucedida do perfil.
}


// Componente ProfileForm
// Renderiza e gerencia o formulário de edição de perfil do usuário.
const ProfileForm = ({ userId, userData, onUpdate }: ProfileFormProps) => {
  // Estados para cada campo do formulário, inicializados com userData ou valores padrão.
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [whatsapp, setWhatsapp] = useState(userData.whatsapp || "");
  const [isStudent, setIsStudent] = useState(userData.isStudent || false);
  const [isProfessor, setIsProfessor] = useState(userData.isProfessor || false);
  const [profession, setProfession] = useState(userData.profession || "");
  const [gender, setGender] = useState(userData.gender || "");
  const [birthDate, setBirthDate] = useState(userData.birthDate || "");
  const [city, setCity] = useState(userData.city || "");
  const [state, setState] = useState(userData.state || "");

  // Estado para indicar se o formulário está sendo salvo.
  const [isSaving, setIsSaving] = useState(false);

  // Hook para exibir notificações (toasts).
  const { toast } = useToast();


  // Efeito useEffect
  // Atualiza o estado interno do formulário se a prop `userData` mudar.
  // Isso garante que o formulário reflita os dados mais recentes se eles forem atualizados externamente.
  useEffect(() => {
    console.log("userData in ProfileForm:", userData); // Log para depuração.
    setName(userData.name || "");
    setEmail(userData.email || "");
    setWhatsapp(userData.whatsapp || "");
    setIsStudent(userData.isStudent || false);
    setIsProfessor(userData.isProfessor || false);
    setProfession(userData.profession || "");
    setGender(userData.gender || "");
    setBirthDate(userData.birthDate || "");
    setCity(userData.city || "");
    setState(userData.state || "");
  }, [userData]); // Dependência: executa o efeito quando `userData` muda.


  // Função handleUpdateProfile
  // Chamada quando o formulário é submetido para salvar as alterações do perfil.
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.
    
    // Verifica se o userId está presente (deve estar, mas é uma boa prática).
    if (!userId) return;
    
    setIsSaving(true); // Ativa o estado de salvamento.
    
    try {
      // Prepara o objeto de dados do perfil com os nomes de coluna corretos do Supabase.
      const profileData = {
        name,
        whatsapp,
        is_student: isStudent, // boolean
        is_professor: isProfessor, // boolean
        profession,
        gender,
        birth_date: birthDate || null, // Converte string vazia para null para o tipo 'date' do Supabase.
        city,
        state
      };

      console.log("Dados a serem salvos:", profileData); // Log para depuração.
      
      // Verifica se já existe um perfil para este usuário.
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id") // Seleciona apenas o 'id' para verificar a existência.
        .eq("user_id", userId) // Filtra pelo ID do usuário.
        .single(); // Espera um único resultado (ou null se não existir).
      
      let result; // Variável para armazenar o resultado da operação do Supabase.
      
      // Se um perfil existente for encontrado.
      if (existingProfile) {
        // Atualiza o perfil existente.
        result = await supabase
          .from("profiles")
          .update(profileData) // Dados a serem atualizados.
          .eq("user_id", userId); // Condição para a atualização.
      } else {
        // Cria um novo perfil se não existir.
        result = await supabase
          .from("profiles")
          .insert([{ user_id: userId, ...profileData }]); // Dados a serem inseridos, incluindo o user_id.
      }
      
      // Se ocorrer um erro durante a operação do Supabase.
      if (result.error) {
        console.error("Erro ao salvar perfil:", result.error); // Log do erro.
        throw result.error; // Lança o erro para ser capturado pelo bloco catch.
      }
      
      // Exibe um toast de sucesso.
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      // Se uma função de callback `onUpdate` foi fornecida, chama-a.
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      // Captura erros (lançados ou inesperados).
      console.error("Erro ao atualizar perfil:", error); // Log do erro.
      // Exibe um toast de erro.
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Por favor, tente novamente.",
      });
    } finally {
      setIsSaving(false); // Desativa o estado de salvamento, independentemente do resultado.
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
      
      {/* Campo Profissão */}
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
            disabled={isSaving}
          />
        </div>
      </div>
      
      {/* Campo Sexo (RadioGroup) */}
      <div className="space-y-2">
        <Label className="text-gray-300">Sexo</Label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4" disabled={isSaving}>
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
      
      {/* Campo Data de Nascimento */}
      <div className="space-y-2">
        <Label htmlFor="birth_date" className="text-gray-300">Nascimento</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-[#4f9bff]" />
          <Input
            id="birth_date"
            type="date" // Tipo 'date' para seleção de data.
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="pl-8 bg-[#0a1629]/80 border-[#2a4980]/50 text-white placeholder:text-gray-500"
            disabled={isSaving}
          />
        </div>
      </div>
      
      {/* Campos Cidade e Estado (Grid) */}
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
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>
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
