// Script para testar acesso à tabela documents_details
// Configure as variáveis no .env antes de executar
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://supabase.cirurgia.com.br';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão configuradas
if (!supabaseKey) {
  console.error('❌ ERRO: VITE_SUPABASE_ANON_KEY não configurada no arquivo .env');
  console.log('📋 Configure o arquivo .env com:');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentsDetails() {
    console.log('🔍 Testando acesso à tabela documents_details...');
    
    // Teste 1: Listar todos os registros (sem filtro de usuário)
    const { data: allData, error: allError } = await supabase
        .from('documents_details')
        .select('*');
    
    console.log('📊 Todos os registros em documents_details:');
    console.log('Data:', allData);
    console.log('Error:', allError);
    
    // Teste 2: Verificar estrutura da tabela
    const { data: structure, error: structureError } = await supabase
        .from('documents_details')
        .select('*')
        .limit(1);
    
    console.log('🏗️ Estrutura da tabela:');
    console.log('Structure:', structure);
    console.log('Error:', structureError);
    
    // Teste 3: Contar registros
    const { count, error: countError } = await supabase
        .from('documents_details')
        .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total de registros:');
    console.log('Count:', count);
    console.log('Error:', countError);
}

testDocumentsDetails();
