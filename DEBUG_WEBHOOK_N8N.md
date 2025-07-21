# 🔍 DEBUG: Erro no Webhook N8N - FASTBOT

## 📊 **Status Atual**
- **Data**: 2025-07-20 13:38
- **Problema**: Webhook responde com 200 OK, mas retorna conteúdo vazio
- **Resultado**: ChatBot cai no fallback (resposta local)

## 🧪 **Testes Realizados**

### 1. **Conectividade**
```bash
# ✅ SUCESSO - Webhook acessível
StatusCode: 200
Content-Type: application/json
Content: (vazio)
```

### 2. **Logs do Browser**
```
13:23:31.796 - PAYLOAD ENVIADO (correto)
13:23:41.943 - Fallback ativado após ~1.2s
```

## 🕵️ **Possíveis Causas**

### **Causa 1: N8N Workflow Não Configurado**
- N8N recebe a requisição mas não tem workflow ativo
- Retorna 200 OK mas sem processar

### **Causa 2: N8N Workflow Com Erro**
- Workflow existe mas tem erro interno
- Falha silenciosa, retorna vazio

### **Cause 3: Timeout do N8N**
- Processamento demora mais que esperado
- Browser cancela a requisição

### **Causa 4: Problema de Formato da Resposta**
- N8N retorna resposta, mas em formato não esperado
- ChatBot não consegue ler `data.response` ou `data.message`

## 🔧 **Próximos Passos para Diagnóstico**

### **1. Verificar N8N Workflow**
- Acessar dashboard N8N em https://marte.cirurgia.com.br
- Verificar se workflow FASTBOT está ativo
- Verificar logs de execução

### **2. Testar Resposta Esperada**
- Webhook deve retornar: `{"response": "sua mensagem aqui"}`
- Ou: `{"message": "sua mensagem aqui"}`

### **3. Debug Detalhado**
- Logs adicionados para capturar erro específico
- Verificar tipo de erro (network, parsing, timeout)

## 📋 **Estrutura Esperada da Resposta**

### **✅ Formato Correto**
```json
{
  "response": "Olá! O curso oferecido é de Especialização em Saúde Coletiva..."
}
```

### **❌ Problema Atual**
```json
{
  // vazio ou formato incorreto
}
```

## 🚀 **Ações Recomendadas**

1. **Verificar N8N Dashboard**: Confirmar workflow ativo
2. **Testar webhook manualmente**: Com curl/Postman
3. **Verificar logs N8N**: Para erros internos
4. **Configurar resposta padrão**: Em caso de falha

---
*Documento gerado automaticamente - 2025-07-20 16:38*
