/**
 * Utilitários para geração automática de system_message
 */

import { ChatbotData } from '@/interfaces';

/**
 * Gera o system_message automaticamente baseado nos dados do chatbot
 * @param data - Dados do chatbot
 * @returns string - System message formatado
 */
export function generateSystemMessage(data: ChatbotData): string {
  const sections: string[] = [];

  // Cabeçalho obrigatório
  sections.push("Você é um chatbot de atendimento online via web e deve utilizar as seguintes informações e diretivas:");
  sections.push("");

  // 1. IDENTIDADE E BOAS VINDAS
  const identityItems: string[] = [];
  if (data.chatbot_name?.trim()) {
    identityItems.push(`- Seu nome é: ${data.chatbot_name}`);
  }
  if (data.welcome_message?.trim()) {
    identityItems.push(`- Use como mensagem de boas-vindas, onde conveniente: ${data.welcome_message}`);
  }

  if (identityItems.length > 0) {
    sections.push("1. IDENTIDADE E BOAS VINDAS:");
    sections.push(...identityItems);
    sections.push("");
  }

  // 2. INSTRUÇÕES GERAIS
  if (data.system_instructions?.trim()) {
    sections.push("2. INSTRUÇÕES GERAIS:");
    sections.push('""""');
    sections.push(data.system_instructions);
    sections.push('""""');
    sections.push("");
  }

  // 3. PERSONALIDADE
  const personalityItems: string[] = [];
  if (data.formality_level !== undefined && data.formality_level !== null) {
    personalityItems.push(`- Nível de Formalidade (0-100): ${data.formality_level}`);
  }
  if (data.memorize_user_name !== undefined && data.memorize_user_name !== null) {
    personalityItems.push(`- Memorizar nome do usuário: ${data.memorize_user_name ? 'Sim' : 'Não'}`);
  }
  if (data.use_emojis !== undefined && data.use_emojis !== null) {
    personalityItems.push(`- Uso de emojis nas mensagens: ${data.use_emojis ? 'Sim' : 'Não'}`);
  }
  if (data.paragraph_size !== undefined && data.paragraph_size !== null) {
    personalityItems.push(`- Tamanho de parágrafos (0-100): ${data.paragraph_size}`);
  }

  if (personalityItems.length > 0) {
    sections.push("3. PERSONALIDADE:");
    sections.push(...personalityItems);
    sections.push("");
  }

  // 4. COMPORTAMENTO
  const behaviorItems: string[] = [];
  if (data.main_topic?.trim()) {
    behaviorItems.push(`- Tema principal: ${data.main_topic}`);
  }
  if (data.allowed_topics && data.allowed_topics.length > 0) {
    behaviorItems.push(`- Temas permitidos: ${data.allowed_topics.join(', ')}`);
  }
  if (data.source_strictness !== undefined && data.source_strictness !== null) {
    behaviorItems.push(`- Rigidez nas fontes (0-100): ${data.source_strictness}`);
  }
  if (data.confidence_threshold !== undefined && data.confidence_threshold !== null) {
    behaviorItems.push(`- Confiança mínima para resposta: ${data.confidence_threshold}%`);
  }
  if (data.fallback_action) {
    const actionText = data.fallback_action === 'human' ? 'Encaminhar para humano' : 
                       data.fallback_action === 'search' ? 'Buscar na internet' : 'Enviar link de ajuda';
    behaviorItems.push(`- Ação quando não souber responder: ${actionText}`);
  }
  if (data.mandatory_phrases && data.mandatory_phrases.length > 0) {
    behaviorItems.push(`- Frases obrigatórias (finalizações): ${data.mandatory_phrases.join(', ')}`);
  }
  if (data.fallback_message?.trim()) {
    behaviorItems.push(`- Mensagem para encaminhamento: ${data.fallback_message}`);
  }
  if (data.list_style) {
    const styleText = data.list_style === 'numbered' ? 'Numerada' : 
                      data.list_style === 'bullets' ? 'Marcadores' : 'Simples';
    behaviorItems.push(`- Estilo de listas: ${styleText}`);
  }
  if (data.max_list_items !== undefined && data.max_list_items !== null) {
    behaviorItems.push(`- Máximo de itens por lista: ${data.max_list_items}`);
  }
  if (data.allow_internet_search !== undefined && data.allow_internet_search !== null) {
    behaviorItems.push(`- Permitir busca na internet: ${data.allow_internet_search ? 'Sim' : 'Não'}`);
  }

  if (behaviorItems.length > 0) {
    sections.push("4. COMPORTAMENTO:");
    sections.push(...behaviorItems);
    sections.push("");
  }

  // 5. RODAPÉ
  const footerItems: string[] = [];
  if (data.footer_message?.trim()) {
    footerItems.push(`- Rodapé das mensagens: ${data.footer_message}`);
  }
  if (data.main_link?.trim()) {
    footerItems.push(`- Link adicional para o rodapé: ${data.main_link}`);
  }
  if (data.mandatory_link !== undefined && data.mandatory_link !== null) {
    footerItems.push(`- Link obrigatório nas respostas: ${data.mandatory_link ? 'Sim' : 'Não'}`);
  }
  if (data.uploaded_images && data.uploaded_images.length > 0) {
    footerItems.push(`- Imagens anexadas ao rodapé: ${data.uploaded_images.length} imagem(ns)`);
  }

  if (footerItems.length > 0) {
    sections.push("5. RODAPÉ:");
    sections.push(...footerItems);
    sections.push("");
  }

  // 6. ESTILO E INTERAÇÃO
  const styleItems: string[] = [];
  if (data.response_speed !== undefined && data.response_speed !== null) {
    styleItems.push(`- Velocidade de resposta (1-100): ${data.response_speed}`);
  }
  if (data.name_usage_frequency !== undefined && data.name_usage_frequency !== null) {
    styleItems.push(`- Frequência de uso do nome (1-100): ${data.name_usage_frequency}`);
  }
  if (data.ask_for_name !== undefined && data.ask_for_name !== null) {
    styleItems.push(`- Solicitar o nome: ${data.ask_for_name ? 'Sim' : 'Não'}`);
  }
  if (data.remember_context !== undefined && data.remember_context !== null) {
    styleItems.push(`- Lembrar contexto: ${data.remember_context ? 'Sim' : 'Não'}`);
  }
  if (data.auto_link !== undefined && data.auto_link !== null) {
    styleItems.push(`- Auto-link (inclui links automaticamente): ${data.auto_link ? 'Sim' : 'Não'}`);
  }
  if (data.debug_mode !== undefined && data.debug_mode !== null) {
    styleItems.push(`- Modo debug (mostra fontes das respostas): ${data.debug_mode ? 'Sim' : 'Não'}`);
  }
  if (data.returning_user_greeting?.trim()) {
    styleItems.push(`- Saudação para usuários retornantes: ${data.returning_user_greeting}`);
  }

  if (styleItems.length > 0) {
    sections.push("6. ESTILO E INTERAÇÃO:");
    sections.push(...styleItems);
    sections.push("");
  }

  // 7. INFORMAÇÕES DE CONTATO (se disponível)
  const contactItems: string[] = [];
  if (data.office_address?.trim()) {
    contactItems.push(`- Endereço do consultório: ${data.office_address}`);
  }
  if (data.office_hours?.trim()) {
    contactItems.push(`- Horário de funcionamento: ${data.office_hours}`);
  }
  if (data.specialties?.trim()) {
    contactItems.push(`- Especialidades: ${data.specialties}`);
  }
  if (data.whatsapp?.trim()) {
    contactItems.push(`- WhatsApp: ${data.whatsapp}`);
  }

  if (contactItems.length > 0) {
    sections.push("7. INFORMAÇÕES DE CONTATO:");
    sections.push(...contactItems);
    sections.push("");
  }

  // Adiciona instruções finais se houver promessa de resposta
  if (data.response_time_promise?.trim()) {
    sections.push("IMPORTANTE:");
    sections.push(`- Tempo de resposta prometido: ${data.response_time_promise}`);
    sections.push("");
  }

  return sections.join('\n').trim();
}

/**
 * Valida se os dados estão em formato adequado para gerar o system_message
 * @param data - Dados do chatbot
 * @returns boolean - True se válido
 */
export function validateChatbotData(data: ChatbotData): boolean {
  // Pelo menos um campo deve estar preenchido além do system_message
  const hasContent = data.chatbot_name?.trim() || 
                    data.system_instructions?.trim() || 
                    data.welcome_message?.trim() ||
                    data.main_topic?.trim();
  
  return Boolean(hasContent);
}
