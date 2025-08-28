// Script para testar acesso à tabela documents_details
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.cirurgia.com.br';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

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
