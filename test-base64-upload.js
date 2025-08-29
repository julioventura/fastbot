// 🧪 Teste alternativo: Envio como JSON Base64
// Para casos onde FormData causa problemas de header

const testBase64Upload = async (file, webhookUrl, chatbotName, userId) => {
  console.log('🧪 TESTE: Enviando como JSON Base64');
  
  // Converter arquivo para base64
  const reader = new FileReader();
  const base64Promise = new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const base64Data = await base64Promise;
  
  // Sanitizar filename
  const sanitizedFilename = file.name
    .replace(/[^\w\s.-]/g, '_')
    .replace(/\s+/g, '_');
  
  // Preparar dados JSON
  const jsonData = {
    data: base64Data, // Base64 do arquivo
    chatbot: chatbotName,
    userid: userId,
    filename: sanitizedFilename,
    original_filename: file.name,
    filesize: file.size,
    filetype: file.type || 'text/plain',
    timestamp: new Date().toISOString(),
    encoding: 'base64'
  };
  
  console.log('📤 Dados JSON:', {
    ...jsonData,
    data: `${base64Data.substring(0, 50)}...` // Mostrar só início do base64
  });
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });
    
    const responseText = await response.text();
    
    console.log('📥 Resposta JSON upload:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });
    
    return { response, responseText };
    
  } catch (error) {
    console.error('❌ Erro no upload JSON:', error);
    throw error;
  }
};

// Função para testar no console do browser:
// testBase64Upload(file, 'https://marte.cirurgia.com.br/webhook/InserirRAG', 'LGPD-BOT', 'user-id');
