// 🧪 Teste específico para upload webhook
// Para testar o modo webhook sem depender da interface

const testWebhookUpload = async () => {
  console.log('🧪 INICIANDO TESTE WEBHOOK UPLOAD');
  
  // Simular dados do teste
  const testFile = new File(['Conteúdo de teste para upload webhook'], 'teste-webhook.txt', {
    type: 'text/plain'
  });
  
  const formData = new FormData();
  formData.append('data', testFile);
  formData.append('chatbot', 'teste-chatbot');
  formData.append('userid', 'test-user-123');
  formData.append('filename', testFile.name);
  formData.append('filesize', testFile.size.toString());
  formData.append('filetype', testFile.type);
  formData.append('timestamp', new Date().toISOString());

  const webhookUrl = 'https://marte.cirurgia.com.br/webhook/InserirRAG';
  
  console.log('📤 Dados do teste:', {
    url: webhookUrl,
    filename: testFile.name,
    size: testFile.size,
    type: testFile.type,
    chatbot: 'teste-chatbot',
    userid: 'test-user-123'
  });

  try {
    console.log('🚀 Enviando para N8N...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();

    console.log('📥 Resposta completa:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      ok: response.ok
    });

    if (!response.ok) {
      console.error('❌ ERRO HTTP:', response.status, response.statusText);
      console.error('❌ Corpo da resposta:', responseText);
      return;
    }

    // Tentar fazer parse do JSON
    try {
      const result = JSON.parse(responseText);
      console.log('✅ JSON válido:', result);
      
      // Verificar estrutura esperada
      const checks = {
        hasSuccess: result.hasOwnProperty('success'),
        successValue: result.success,
        hasDocumentId: result.hasOwnProperty('document_id'),
        hasStatus: result.hasOwnProperty('status'),
        hasError: result.hasOwnProperty('error')
      };
      
      console.log('🔍 Verificações:', checks);
      
    } catch (jsonError) {
      console.error('❌ JSON inválido:', jsonError.message);
      console.error('❌ Resposta raw:', responseText);
    }

  } catch (error) {
    console.error('❌ ERRO NA REQUISIÇÃO:', error);
  }
};

// Executar teste
testWebhookUpload();
