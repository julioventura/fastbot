/**
 * Utilitários para geração automática de system_message
 */

// Interface local para ChatbotConfig
interface ChatbotConfig {
  system_instructions?: string;
  system_message?: string;
  office_address?: string;
  office_hours?: string;
  specialties?: string;
  chatbot_name?: string;
  welcome_message?: string;
  whatsapp?: string;
  remember_context?: boolean;
  
  // Configurações de personalidade
  formality_level?: number;
  use_emojis?: boolean;
  paragraph_size?: number;
  
  // Configurações de comportamento
  main_topic?: string;
  allowed_topics?: string[];
  source_strictness?: number;
  confidence_threshold?: number;
  fallback_action?: string;
  fallback_message?: string;
  list_style?: string;
  allow_internet_search?: boolean;
  mandatory_phrases?: string[];
  
  // Configurações de rodapé
  mandatory_link?: boolean;
  footer_message?: string;
  main_link?: string;
  uploaded_images?: string[];
  
  // Configurações de estilo e interação
  response_speed?: number;
  name_usage_frequency?: number;
  ask_for_name?: boolean;
  returning_user_greeting?: string;
  response_time_promise?: string;

  // Novos campos obrigatórios para configuração avançada
  personality?: string;
  behavior?: string;
  style?: string;
  interaction?: string;
  footer?: string;
}

/**
 * Gera o system_message automaticamente baseado nos dados do chatbot com valores padrão
 * @param data - Dados do chatbot (ChatbotConfig)
 * @returns string - System message formatado
 */
export function generateSystemMessage(data: ChatbotConfig): string {
  // Aplicar valores padrão
  const config = {
    ...data,
    personality: data.personality || "Profissional, empático e prestativo",
    behavior: data.behavior || "Sempre busque entender a necessidade específica do usuário antes de responder. Seja claro e direto, mas mantenha um tom acolhedor",
    style: data.style || "Comunicação clara e objetiva, evitando jargões técnicos desnecessários", 
    interaction: data.interaction || "Faça uma pergunta por vez quando precisar de esclarecimentos. Use emojis moderadamente para humanizar a conversa",
    footer: data.footer || "Posso ajudar com mais alguma coisa? 😊",
    ask_for_name: data.ask_for_name !== undefined ? data.ask_for_name : true,
    remember_context: data.remember_context !== undefined ? data.remember_context : true
  };

  const sections: string[] = [];

  // Cabeçalho obrigatório
  sections.push("Você é um chatbot de atendimento online via web e deve utilizar as seguintes informações e diretivas:");
  sections.push("");

  // 1. IDENTIDADE E BOAS VINDAS
  const identityItems: string[] = [];
  if (config.chatbot_name?.trim()) {
    identityItems.push(`- Seu nome é: ${config.chatbot_name}`);
  }
  if (config.welcome_message?.trim()) {
    identityItems.push(`- Use como mensagem de boas-vindas, onde conveniente: ${config.welcome_message}`);
  }

  if (identityItems.length > 0) {
    sections.push("1. IDENTIDADE E BOAS VINDAS:");
    sections.push(...identityItems);
    sections.push("");
  }

  // 2. INSTRUÇÕES GERAIS
  if (config.system_instructions?.trim()) {
    sections.push("2. INSTRUÇÕES GERAIS:");
    sections.push('""""');
    sections.push(config.system_instructions);
    sections.push('""""');
    sections.push("");
  }

  // 3. PERSONALIDADE
  sections.push("3. PERSONALIDADE:");
  sections.push(`- Personalidade: ${config.personality}`);
  
  const personalityItems: string[] = [];
  if (config.formality_level !== undefined && config.formality_level !== null) {
    personalityItems.push(`- Nível de Formalidade (0-100): ${config.formality_level}`);
  }
  if (config.use_emojis !== undefined && config.use_emojis !== null) {
    personalityItems.push(`- Uso de emojis nas mensagens: ${config.use_emojis ? 'Sim' : 'Não'}`);
  }
  if (config.paragraph_size !== undefined && config.paragraph_size !== null) {
    personalityItems.push(`- Tamanho de parágrafos (0-100): ${config.paragraph_size}`);
  }
  
  if (personalityItems.length > 0) {
    sections.push(...personalityItems);
  }
  sections.push("");

  // 4. COMPORTAMENTO
  sections.push("4. COMPORTAMENTO:");
  sections.push(`- Comportamento Específico: ${config.behavior}`);
  
  const behaviorItems: string[] = [];
  if (config.main_topic?.trim()) {
    behaviorItems.push(`- Tema principal: ${config.main_topic}`);
  }
  if (config.allowed_topics && config.allowed_topics.length > 0) {
    behaviorItems.push(`- Temas permitidos: ${config.allowed_topics.join(', ')}`);
  }
  if (config.source_strictness !== undefined && config.source_strictness !== null) {
    behaviorItems.push(`- Rigidez nas fontes (0-100): ${config.source_strictness}`);
  }
  if (config.confidence_threshold !== undefined && config.confidence_threshold !== null) {
    behaviorItems.push(`- Confiança mínima para resposta: ${config.confidence_threshold}%`);
  }
  if (config.fallback_action) {
    const actionText = config.fallback_action === 'human' ? 'Encaminhar para humano' : 
                       config.fallback_action === 'search' ? 'Buscar na internet' : 'Enviar link de ajuda';
    behaviorItems.push(`- Ação quando não souber responder: ${actionText}`);
  }
  if (config.mandatory_phrases && config.mandatory_phrases.length > 0) {
    behaviorItems.push(`- Frases obrigatórias (finalizações): ${config.mandatory_phrases.join(', ')}`);
  }
  if (config.fallback_message?.trim()) {
    behaviorItems.push(`- Mensagem para encaminhamento: ${config.fallback_message}`);
  }
  if (config.list_style) {
    const styleText = config.list_style === 'numbered' ? 'Numerada' : 
                      config.list_style === 'bullets' ? 'Marcadores' : 'Simples';
    behaviorItems.push(`- Estilo de listas: ${styleText}`);
  }
  if (config.allow_internet_search !== undefined && config.allow_internet_search !== null) {
    behaviorItems.push(`- Permitir busca na internet: ${config.allow_internet_search ? 'Sim' : 'Não'}`);
  }

  if (behaviorItems.length > 0) {
    sections.push(...behaviorItems);
  }
  sections.push("");

  // 5. ESTILO DE COMUNICAÇÃO
  sections.push("5. ESTILO DE COMUNICAÇÃO:");
  sections.push(`- Estilo: ${config.style}`);
  
  const styleItems: string[] = [];
  if (config.response_speed !== undefined && config.response_speed !== null) {
    styleItems.push(`- Velocidade de resposta (1-100): ${config.response_speed}`);
  }
  if (config.name_usage_frequency !== undefined && config.name_usage_frequency !== null) {
    styleItems.push(`- Frequência de uso do nome (1-100): ${config.name_usage_frequency}`);
  }
  // Estes campos sempre terão valores devido aos padrões aplicados
  styleItems.push(`- Solicitar o nome: ${config.ask_for_name ? 'Sim' : 'Não'}`);
  styleItems.push(`- Lembrar contexto: ${config.remember_context ? 'Sim' : 'Não'}`);
  if (config.returning_user_greeting?.trim()) {
    styleItems.push(`- Saudação para usuários retornantes: ${config.returning_user_greeting}`);
  }
  
  if (styleItems.length > 0) {
    sections.push(...styleItems);
  }
  sections.push("");

  // 6. FORMA DE INTERAÇÃO
  sections.push("6. FORMA DE INTERAÇÃO:");
  sections.push(`- Interação: ${config.interaction}`);
  sections.push("");

  // 7. RODAPÉ DAS MENSAGENS
  sections.push("7. RODAPÉ DAS MENSAGENS:");
  sections.push(`- Rodapé padrão: ${config.footer}`);
  
  const footerItems: string[] = [];
  if (config.footer_message?.trim()) {
    footerItems.push(`- Rodapé adicional: ${config.footer_message}`);
  }
  if (config.main_link?.trim()) {
    footerItems.push(`- Link adicional para o rodapé: ${config.main_link}`);
  }
  if (config.mandatory_link !== undefined && config.mandatory_link !== null) {
    footerItems.push(`- Link obrigatório nas respostas: ${config.mandatory_link ? 'Sim' : 'Não'}`);
  }
  if (config.uploaded_images && config.uploaded_images.length > 0) {
    footerItems.push(`- Imagens anexadas ao rodapé: ${config.uploaded_images.length} imagem(ns)`);
  }

  if (footerItems.length > 0) {
    sections.push(...footerItems);
  }
  sections.push("");

  // 8. INFORMAÇÕES DE CONTATO (se disponível)
  const contactItems: string[] = [];
  if (config.office_address?.trim()) {
    contactItems.push(`- Endereço do consultório: ${config.office_address}`);
  }
  if (config.office_hours?.trim()) {
    contactItems.push(`- Horário de funcionamento: ${config.office_hours}`);
  }
  if (config.specialties?.trim()) {
    contactItems.push(`- Especialidades: ${config.specialties}`);
  }
  if (config.whatsapp?.trim()) {
    contactItems.push(`- WhatsApp: ${config.whatsapp}`);
  }

  if (contactItems.length > 0) {
    sections.push("8. INFORMAÇÕES DE CONTATO:");
    sections.push(...contactItems);
    sections.push("");
  }

  // Adiciona instruções finais se houver promessa de resposta
  if (config.response_time_promise?.trim()) {
    sections.push("IMPORTANTE:");
    sections.push(`- Tempo de resposta prometido: ${config.response_time_promise}`);
    sections.push("");
  }

  return sections.join('\n').trim();
}

/**
 * Valida se os dados estão em formato adequado para gerar o system_message
 * @param data - Dados do chatbot
 * @returns boolean - True se válido
 */
export function validateChatbotData(data: ChatbotConfig): boolean {
  // Pelo menos um campo deve estar preenchido além do system_message
  const hasContent = data.chatbot_name?.trim() || 
                    data.system_instructions?.trim() || 
                    data.welcome_message?.trim() ||
                    data.main_topic?.trim();
  
  return Boolean(hasContent);
}
