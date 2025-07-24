# Sistema de Geração Automática de System Message

## 📋 Funcionalidade Implementada

O sistema agora gera automaticamente o campo `system_message` da tabela `mychatbot` baseado na concatenação estruturada dos dados preenchidos no formulário.

## 🔧 Como Funciona

### 1. **Geração Automática**

- Ao salvar o formulário, o `system_message` é gerado automaticamente
- Utiliza todos os campos preenchidos da interface `ChatbotData`
- Omite seções vazias para manter o conteúdo limpo e relevante

### 2. **Preview em Tempo Real**

- Botão "Visualizar System Message Gerado" na página do chatbot
- Mostra como ficará o `system_message` antes de salvar
- Atualiza automaticamente conforme os campos são preenchidos

### 3. **Estrutura do System Message**

```
Você é um chatbot de atendimento online via web e deve utilizar as seguintes informações e diretivas:

1. IDENTIDADE E BOAS VINDAS:
- Seu nome é: {chatbot_name}
- Use como mensagem de boas-vindas: {welcome_message}

2. INSTRUÇÕES GERAIS:
"""
{system_instructions}
"""

3. PERSONALIDADE:
- Nível de Formalidade (0-100): {formality_level}
- Memorizar nome do usuário: {memorize_user_name}
- Uso de emojis nas mensagens: {use_emojis}
- Tamanho de parágrafos (0-100): {paragraph_size}

4. COMPORTAMENTO:
- Tema principal: {main_topic}
- Temas permitidos: {allowed_topics}
- Rigidez nas fontes (0-100): {source_strictness}
- Confiança mínima para resposta: {confidence_threshold}%
- Ação quando não souber responder: {fallback_action}
- [... outros campos ...]

5. RODAPÉ:
- Rodapé das mensagens: {footer_message}
- Link adicional para o rodapé: {main_link}
- [... outros campos ...]

6. ESTILO E INTERAÇÃO:
- Velocidade de resposta (1-100): {response_speed}
- Frequência de uso do nome (1-100): {name_usage_frequency}
- [... outros campos ...]

7. INFORMAÇÕES DE CONTATO:
- Endereço do consultório: {office_address}
- Horário de funcionamento: {office_hours}
- Especialidades: {specialties}
- WhatsApp: {whatsapp}
```

## 📁 Arquivos Criados/Modificados

### ✨ Novos Arquivos

- `src/lib/chatbot-utils.ts` - Funções de geração do system_message
- `src/lib/chatbot-utils.test.ts` - Testes unitários (6 testes passando)

### 🔧 Arquivos Modificados

- `src/pages/MyChatbotPage.tsx` - Integração da geração automática
- `src/interfaces/chatbot.ts` - Interface já estava atualizada

## 🧪 Testes

Todos os 6 testes unitários estão passando:

- ✅ Geração de system_message completo
- ✅ Geração de system_message mínimo
- ✅ Omissão de seções vazias
- ✅ Validação de dados suficientes
- ✅ Validação de dados insuficientes
- ✅ Validação com system_instructions

## 🚀 Como Usar

1. **Preencher o formulário** na página "Meu Chatbot"
2. **Visualizar o preview** clicando em "Visualizar System Message Gerado"
3. **Salvar o formulário** - o system_message será gerado automaticamente
4. **Verificar o resultado** - o campo será atualizado na base de dados

## 💡 Exemplo Prático

### Dados de Entrada

```json
{
  "chatbot_name": "Dr. Silva Bot",
  "system_instructions": "Você é um assistente médico especializado.",
  "welcome_message": "Olá! Como posso ajudar?",
  "formality_level": 80,
  "use_emojis": true,
  "main_topic": "Medicina",
  "office_address": "Rua das Flores, 123"
}
```

### System Message Gerado

```
Você é um chatbot de atendimento online via web e deve utilizar as seguintes informações e diretivas:

1. IDENTIDADE E BOAS VINDAS:
- Seu nome é: Dr. Silva Bot
- Use como mensagem de boas-vindas, onde conveniente: Olá! Como posso ajudar?

2. INSTRUÇÕES GERAIS:
"""
Você é um assistente médico especializado.
"""

3. PERSONALIDADE:
- Nível de Formalidade (0-100): 80
- Uso de emojis nas mensagens: Sim

4. COMPORTAMENTO:
- Tema principal: Medicina

7. INFORMAÇÕES DE CONTATO:
- Endereço do consultório: Rua das Flores, 123
```

## 🎯 Benefícios

- ⚡ **Automático**: Sem necessidade de escrever manualmente
- 🎨 **Estruturado**: Formato consistente e organizado
- 🔍 **Inteligente**: Omite seções vazias
- 👀 **Transparente**: Preview antes de salvar
- ✅ **Testado**: Cobertura completa de testes unitários
