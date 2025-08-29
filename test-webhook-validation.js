#!/usr/bin/env node

// Teste rápido da lógica de validação do webhook
// Simula as diferentes respostas que o N8N pode retornar

function testWebhookResponse(responseText, description) {
  console.log(`\n🧪 TESTE: ${description}`);
  console.log(`📥 Entrada: "${responseText}"`);
  
  try {
    let result;

    // Parse da resposta JSON - SEM FALLBACKS
    try {
      if (!responseText.trim()) {
        throw new Error('N8N retornou resposta vazia');
      }
      
      result = JSON.parse(responseText);
    } catch (jsonError) {
      throw new Error(`N8N retornou resposta inválida (não é JSON): "${responseText.substring(0, 100)}..."`);
    }

    // Verificar sucesso - SEM ASSUMIR NADA
    if (result.success !== true) {
      const errorMessage = result?.error || result?.message || 'Erro desconhecido do N8N';
      const errorCode = result?.error_code ? ` (${result.error_code})` : '';
      throw new Error(`N8N reportou falha: ${errorMessage}${errorCode}`);
    }

    // Validar campos obrigatórios da resposta
    if (!result.document_id) {
      throw new Error('N8N não retornou document_id na resposta');
    }

    if (!result.status) {
      throw new Error('N8N não retornou status na resposta');
    }

    console.log('✅ SUCESSO:', result);
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
}

// Casos de teste
testWebhookResponse('', 'Resposta vazia');

testWebhookResponse('invalid json', 'JSON inválido');

testWebhookResponse('{"success": false, "error": "Arquivo muito grande"}', 'Erro reportado pelo N8N');

testWebhookResponse('{"success": true}', 'Sucesso sem campos obrigatórios');

testWebhookResponse('{"success": true, "document_id": "123"}', 'Sucesso sem status');

testWebhookResponse(JSON.stringify({
  success: true,
  document_id: "doc-123-456",
  status: "completed",
  chunks_processed: 15,
  message: "Documento processado com sucesso"
}), 'Sucesso completo');

testWebhookResponse(JSON.stringify({
  success: false,
  error: "Erro de processamento específico",
  error_code: "PROC_ERROR_001"
}), 'Erro com código');

console.log('\n🎉 Todos os testes executados!');
