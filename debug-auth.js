// Script para debug de autenticação
// Execute: node debug-auth.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.cirurgia.com.br';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔍 Testando configuração de autenticação...');
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('\n1. Testando conexão...');
    const { data, error } = await supabase.auth.getSession();
    console.log('Conexão:', error ? '❌ Erro' : '✅ OK');
    if (error) console.log('Erro:', error.message);
    
    // Teste 2: Tentar criar conta de teste
    console.log('\n2. Testando criação de conta...');
    const testEmail = `test-${Date.now()}@test.com`;
    const testPassword = 'teste123456';
    
    const signUpResult = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:8081/fastbot/'
      }
    });
    
    console.log('Resultado do cadastro:');
    console.log('User criado:', signUpResult.data?.user ? '✅ Sim' : '❌ Não');
    console.log('Erro:', signUpResult.error ? `❌ ${signUpResult.error.message}` : '✅ Nenhum');
    
    if (signUpResult.data?.user) {
      console.log('ID do usuário:', signUpResult.data.user.id);
      console.log('Email confirmado:', signUpResult.data.user.email_confirmed_at ? '✅ Sim' : '❌ Não');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

testAuth();
