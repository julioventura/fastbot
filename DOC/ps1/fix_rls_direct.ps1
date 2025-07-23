# Script PowerShell para executar SQL via API REST do Supabase
$supabaseUrl = "https://supabase.cirurgia.com.br"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"

Write-Host "🔍 DIAGNÓSTICO: Verificando status RLS da tabela mychatbot_2..."

# Verificar status RLS
$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
    "apikey" = $serviceRoleKey
}

try {
    # Desabilitar RLS via SQL
    Write-Host "🛠️ Desabilitando RLS na tabela mychatbot_2..."
    
    $sqlQuery = "ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY"
    $body = @{
        query = $sqlQuery
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec" -Method Post -Headers $headers -Body $body
    Write-Host "✅ RLS desabilitado com sucesso"
    
    # Testar consulta que estava falhando
    Write-Host "🧪 Testando consulta que estava com erro 406..."
    
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/mychatbot_2?select=*&chatbot_user=eq.5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f" -Method Get -Headers $headers
    Write-Host "✅ Consulta funcionou! Dados encontrados: $($testResponse.Count) registros"
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)"
    Write-Host "Resposta: $($_.Exception.Response)"
}

Write-Host "🎯 PRÓXIMO PASSO: Teste agora no frontend fazendo logout/login"
