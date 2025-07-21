# ðŸ” DEBUG: Erro no Webhook N8N - FASTBOT


## ðŸ“Š **Status Atual**

- **Data**: 2025-07-20 13:38

- **Problema**: Webhook responde com 200 OK, mas retorna conteÃºdo vazio

- **Resultado**: ChatBot cai no fallback (resposta local)


## ðŸ§ª **Testes Realizados**


### 1. **Conectividade**

```bash

# âœ… SUCESSO - Webhook acessÃ­vel
StatusCode: 200
Content-Type: application/json
Content: (vazio)

```


### 2. **Logs do Browser**

```
13:23:31.796 - PAYLOAD ENVIADO (correto)
13:23:41.943 - Fallback ativado apÃ³s ~1.2s

```


## ðŸ•µï¸ **PossÃ­veis Causas**


### **Causa 1: N8N Workflow NÃ£o Configurado**

- N8N recebe a requisiÃ§Ã£o mas nÃ£o tem workflow ativo

- Retorna 200 OK mas sem processar


### **Causa 2: N8N Workflow Com Erro**

- Workflow existe mas tem erro interno

- Falha silenciosa, retorna vazio


### **Cause 3: Timeout do N8N**

- Processamento demora mais que esperado

- Browser cancela a requisiÃ§Ã£o


### **Causa 4: Problema de Formato da Resposta**

- N8N retorna resposta, mas em formato nÃ£o esperado

- ChatBot nÃ£o consegue ler `data.response` ou `data.message`


## ðŸ”§ **PrÃ³ximos Passos para DiagnÃ³stico**


### **1. Verificar N8N Workflow**

- Acessar dashboard N8N em <https://marte.cirurgia.com.br>

- Verificar se workflow FASTBOT estÃ¡ ativo

- Verificar logs de execuÃ§Ã£o


### **2. Testar Resposta Esperada**

- Webhook deve retornar: `{"response": "sua mensagem aqui"}`

- Ou: `{"message": "sua mensagem aqui"}`


### **3. Debug Detalhado**

- Logs adicionados para capturar erro especÃ­fico

- Verificar tipo de erro (network, parsing, timeout)


## ðŸ“‹ **Estrutura Esperada da Resposta**


### **âœ… Formato Correto**

```json
{
  "response": "OlÃ¡! O curso oferecido Ã© de EspecializaÃ§Ã£o em SaÃºde Coletiva..."
}

```


### **âŒ Problema Atual**

```json
{
  // vazio ou formato incorreto
}

```


## ðŸš€ **AÃ§Ãµes Recomendadas**


1. **Verificar N8N Dashboard**: Confirmar workflow ativo

2. **Testar webhook manualmente**: Com curl/Postman

3. **Verificar logs N8N**: Para erros internos

4. **Configurar resposta padrÃ£o**: Em caso de falha

---
*Documento gerado automaticamente - 2025-07-20 16:38*
