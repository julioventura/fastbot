# Sistema de Cache do QR-Code - Documentação

## Visão Geral

O sistema de cache do QR-Code foi implementado para otimizar o desempenho e melhorar a experiência do usuário ao trabalhar com QR-Codes dos chatbots. Este sistema garante que os QR-Codes sejam gerados apenas quando necessário e mantidos atualizados automaticamente.

## Funcionamento

### 1. Cache Automático

- **Geração inicial**: Quando um QR-Code é gerado pela primeira vez, ele é automaticamente salvo no localStorage
- **Chave de cache**: Baseada no slug do nome do chatbot (`qrcode_cache_{slug}`)
- **Expiração**: Cache válido por 24 horas
- **Verificação**: Antes de gerar um novo QR-Code, o sistema verifica se existe um cache válido

### 2. Limpeza de Cache

- **Mudança de nome**: Cache é automaticamente limpo quando o nome do chatbot é alterado
- **Cache antigo**: Remove tanto o cache do nome novo quanto do nome anterior
- **Limpeza manual**: Função disponível para limpeza sob demanda

### 3. Refresh no Download

- **Download sempre atualizado**: Ao clicar em "Baixar QR-Code", o sistema força a regeneração
- **Cache atualizado**: O novo QR-Code substitui o cache anterior
- **Garantia de qualidade**: Assegura que o download contenha a versão mais recente

## Arquivos Envolvidos

### `/src/utils/qrCodeCache.ts`

Contém todas as funções utilitárias para gerenciamento de cache:

- `createSlug()`: Converte nome do chatbot em slug válido
- `getQRCodeCacheKey()`: Gera chave única para o cache
- `getQRCodeFromCache()`: Recupera QR-Code do cache se válido
- `saveQRCodeToCache()`: Salva QR-Code no localStorage
- `clearQRCodeCache()`: Remove cache específico ou geral
- `onChatbotNameSaved()`: Função específica para quando nome é salvo

### `/src/components/chatbot/AdvancedEditChatbotConfig.tsx`

Implementa o sistema de cache no componente principal:

- Geração com cache automático
- Refresh forçado no download
- Exposição de função global para limpeza

## Como Usar

### Para Desenvolvedores

#### 1. Limpar cache quando nome do chatbot for salvo

```typescript
// No componente/função que salva o chatbot
if (window.clearQRCodeCacheOnSave) {
  window.clearQRCodeCacheOnSave(newChatbotName, oldChatbotName);
}
```

#### 2. Usar funções utilitárias diretamente

```typescript
import { onChatbotNameSaved, clearQRCodeCache } from '@/utils/qrCodeCache';

// Quando salvar chatbot
onChatbotNameSaved(newName, oldName);

// Para limpeza manual
clearQRCodeCache(); // Remove todos os caches
clearQRCodeCache(chatbotName); // Remove cache específico
```

#### 3. Verificar se cache existe

```typescript
import { hasValidQRCodeCache } from '@/utils/qrCodeCache';

if (hasValidQRCodeCache(chatbotName)) {
  console.log('Cache válido disponível');
}
```

### Para Usuários

#### Comportamento Esperado

1. **Primeira visita**: QR-Code gerado e salvo no cache
2. **Visitas subsequentes**: QR-Code carregado instantaneamente do cache
3. **Mudança de nome**: Cache automaticamente renovado
4. **Download**: Sempre baixa versão mais recente e atualiza cache

## Melhores Práticas

### 1. Performance

- ✅ **Rápido acesso**: Cache elimina regenerações desnecessárias
- ✅ **Baixo armazenamento**: Apenas QR-Codes necessários são mantidos
- ✅ **Expiração automática**: Cache antigo é automaticamente removido

### 2. Consistência

- ✅ **Sempre atualizado**: Cache limpo quando nome muda
- ✅ **Download garantido**: Refresh forçado no download
- ✅ **Recuperação**: Fallback para cache atual em caso de erro

### 3. Manutenção

- ✅ **Auto-limpeza**: Cache expirado é removido automaticamente
- ✅ **Logs detalhados**: Todas as operações são logadas no console
- ✅ **Error handling**: Tratamento robusto de erros

## Estrutura do Cache

### Formato do Cache no localStorage

```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "timestamp": 1693401234567,
  "chatbotName": "Meu Chatbot"
}
```

### Chaves de Cache

- Formato: `qrcode_cache_{slug}`
- Exemplo: `qrcode_cache_meuchatbot`
- Slug: nome normalizado (sem acentos, espaços, caracteres especiais)

## Monitoramento

### Console Logs

O sistema gera logs detalhados para monitoramento:

```
QR-Code carregado do cache: qrcode_cache_meuchatbot
QR-Code salvo no cache: qrcode_cache_meuchatbot
Cache do QR-Code removido: qrcode_cache_meuchatbot
Refreshing QR-Code para download...
```

### Estatísticas do Cache

```typescript
import { getQRCodeCacheStats } from '@/utils/qrCodeCache';

const stats = getQRCodeCacheStats();
console.log('Total de caches:', stats.totalCaches);
console.log('Chaves:', stats.keys);
```

## Benefícios

1. **Performance**: Carregamento instantâneo de QR-Codes já gerados
2. **Economia de recursos**: Reduz processamento desnecessário
3. **Experiência do usuário**: Interface mais responsiva
4. **Confiabilidade**: Garantia de QR-Codes sempre atualizados
5. **Manutenibilidade**: Sistema modular e bem documentado

## Troubleshooting

### Problemas Comuns

1. **QR-Code não atualiza após mudança de nome**
   - Verificar se `onChatbotNameSaved()` está sendo chamado
   - Verificar logs no console

2. **Cache muito grande**
   - Usar `clearQRCodeCache()` para limpeza geral
   - Cache expira automaticamente em 24h

3. **Erro no localStorage**
   - Sistema continua funcionando, apenas sem cache
   - Verificar limites de armazenamento do navegador

### Debug

```typescript
// Verificar cache atual
console.log(localStorage.getItem('qrcode_cache_meuchatbot'));

// Limpar cache específico
clearQRCodeCache('Meu Chatbot');

// Estatísticas
console.log(getQRCodeCacheStats());
```
