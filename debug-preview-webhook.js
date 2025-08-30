// Script para debugar o preview no modo webhook
// Execute no console do navegador na página "Meus Dados"

async function debugPreviewWebhook() {
  console.log('🔍 DEBUG: Iniciando diagnóstico do preview webhook...');
  
  // 1. Verificar se está no modo correto (pegando do localStorage)
  const envData = localStorage.getItem('vite_env') || '{}';
  const useLocalAI = false; // Baseado nos logs, está em modo WEBHOOK
  console.log('📊 Modo atual:', useLocalAI ? 'LOCAL' : 'WEBHOOK');
  
  // 2. Pegar usuário atual automaticamente
  const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
  const user = authData?.user?.id || "7f9d2f89-6b6b-4aa7-b77b-f1cad66ab91c"; // Usar o ID dos logs
  if (!user) {
    console.error('❌ Usuário não encontrado');
    return;
  }
  
  console.log('👤 Usuário:', user);
  
  // 3. Testar documents_details com foco em content e summary
  console.log('\n📊 Testando documents_details (N8N deve preencher content)...');
  try {
    const { data: detailsData, error: detailsError } = await supabase
      .from("documents_details")
      .select("id, filename, content, summary, file_size, upload_date")
      .eq("chatbot_user", user)
      .order("upload_date", { ascending: false });
    
    console.log('✅ Resultado documents_details:');
    console.log('- Error:', detailsError);
    console.log('- Data count:', detailsData?.length || 0);
    
    // Verificar ESPECIFICAMENTE content e summary
    if (detailsData && detailsData.length > 0) {
      console.log('\n📋 ANÁLISE DOS CAMPOS CONTENT E SUMMARY:');
      detailsData.forEach((doc, index) => {
        const hasContent = !!doc.content && doc.content.trim().length > 0;
        const hasSummary = !!doc.summary && doc.summary.trim().length > 0;
        const contentLength = doc.content?.length || 0;
        const summaryLength = doc.summary?.length || 0;
        
        console.log(`📄 Documento ${index + 1}: ${doc.filename}`);
        console.log(`   📝 Content: ${hasContent ? '✅ TEM' : '❌ VAZIO/NULL'} (${contentLength} chars)`);
        console.log(`   📋 Summary: ${hasSummary ? '✅ TEM' : '❌ VAZIO/NULL'} (${summaryLength} chars)`);
        console.log(`   📅 Upload: ${doc.upload_date}`);
        
        if (hasContent && contentLength < 50) {
          console.log(`   ⚠️  Content muito pequeno: "${doc.content}"`);
        }
        if (hasContent && contentLength > 50) {
          console.log(`   📖 Preview: "${doc.content.substring(0, 100)}..."`);
        }
        if (hasSummary) {
          console.log(`   📝 Summary: "${doc.summary}"`);
        }
        console.log('   ─────────────────────────────────────────');
      });
      
      // Estatísticas gerais
      const withContent = detailsData.filter(d => d.content && d.content.trim().length > 0);
      const withSummary = detailsData.filter(d => d.summary && d.summary.trim().length > 0);
      
      console.log('\n📊 ESTATÍSTICAS:');
      console.log(`📄 Total de documentos: ${detailsData.length}`);
      console.log(`✅ Com content válido: ${withContent.length} (${Math.round(withContent.length/detailsData.length*100)}%)`);
      console.log(`✅ Com summary válido: ${withSummary.length} (${Math.round(withSummary.length/detailsData.length*100)}%)`);
      
      if (withContent.length < detailsData.length) {
        console.log('❌ PROBLEMA: N8N não está salvando content corretamente!');
      }
      if (withSummary.length < detailsData.length) {
        console.log('❌ PROBLEMA: N8N não está gerando summary!');
      }
    }
  } catch (err) {
    console.error('❌ Erro ao buscar documents_details:', err);
  }
  
  // 4. Testar documents (chunks)
  console.log('\n🧩 Testando documents (chunks)...');
  try {
    const { data: docsData, error: docsError } = await supabase
      .from("documents")
      .select("*")
      .not("metadata", "is", null)
      .limit(10);
    
    console.log('✅ Resultado documents:');
    console.log('- Error:', docsError);
    console.log('- Data count:', docsData?.length || 0);
    
    if (docsData && docsData.length > 0) {
      console.log('🔍 Analisando chunks:');
      docsData.forEach((chunk, index) => {
        const metadata = chunk.metadata || {};
        console.log(`Chunk ${index + 1}:`, {
          id: chunk.id,
          chatbot_user: chunk.chatbot_user,
          metadata_usuario: metadata.usuario || metadata.chatbot_user,
          metadata_filename: metadata.file_name || metadata.filename,
          hasContent: !!chunk.content,
          contentLength: chunk.content?.length || 0
        });
      });
      
      // Filtrar para o usuário atual
      const userChunks = docsData.filter(chunk => {
        return chunk.chatbot_user === user || 
               chunk.metadata?.usuario === user || 
               chunk.metadata?.chatbot_user === user;
      });
      
      console.log(`📋 Chunks do usuário ${user}:`, userChunks.length);
      userChunks.forEach((chunk, index) => {
        const metadata = chunk.metadata || {};
        console.log(`User Chunk ${index + 1}:`, {
          filename: metadata.file_name || metadata.filename,
          contentPreview: chunk.content ? chunk.content.substring(0, 50) + '...' : 'SEM CONTEÚDO'
        });
      });
    }
  } catch (err) {
    console.error('❌ Erro ao buscar documents:', err);
  }
  
  // 5. Verificar RLS (Row Level Security)
  console.log('\n🔒 Testando RLS...');
  try {
    // Teste sem filtro de usuário para ver se é problema de RLS
    const { data: allDocs, error: allError } = await supabase
      .from("documents_details")
      .select("chatbot_user, filename")
      .limit(5);
    
    console.log('📊 Teste RLS (primeiros 5 docs sem filtro):');
    console.log('- Error:', allError);
    console.log('- Data:', allDocs);
    
    if (allDocs) {
      const userIds = [...new Set(allDocs.map(d => d.chatbot_user))];
      console.log('👥 User IDs encontrados:', userIds);
      console.log('🔍 Seu user ID:', user);
      console.log('✅ Match?', userIds.includes(user));
    }
  } catch (err) {
    console.error('❌ Erro no teste RLS:', err);
  }
  
  console.log('\n✅ Debug completo! Verifique os logs acima.');
}

// Execute esta função no console:
// debugPreviewWebhook();

console.log('📋 Script de debug carregado!');
console.log('👆 Para executar, chame: debugPreviewWebhook()');
console.log('✅ User ID já detectado automaticamente dos logs!');
