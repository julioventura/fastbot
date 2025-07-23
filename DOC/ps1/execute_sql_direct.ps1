# Script PowerShell para executar SQL direto via API
$supabaseUrl = "https://supabase.cirurgia.com.br"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"

$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
    "apikey" = $serviceRoleKey
}

Write-Host "Executando comandos SQL diretos..."

# Array de comandos SQL para executar
$sqlCommands = @(
    "ALTER TABLE public.mychatbot_2 DISABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS 'Enable read for authenticated users' ON public.mychatbot_2;",
    "DROP POLICY IF EXISTS 'Enable insert for own records' ON public.mychatbot_2;", 
    "DROP POLICY IF EXISTS 'Enable update for own records' ON public.mychatbot_2;",
    "DROP POLICY IF EXISTS 'Enable delete for own records' ON public.mychatbot_2;",
    "DROP POLICY IF EXISTS 'Simple policy for authenticated users' ON public.mychatbot_2;",
    "GRANT ALL ON public.mychatbot_2 TO authenticated;",
    "GRANT ALL ON public.mychatbot_2 TO anon;"
)

foreach ($sql in $sqlCommands) {
    try {
        Write-Host "Executando: $sql"
        
        # Usar RPC para executar SQL
        $body = @{
            sql = $sql
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "OK"
        
    } catch {
        Write-Host "Erro: $($_.Exception.Message)"
        # Continuar com próximo comando mesmo se houver erro
    }
}

# Testar consulta final
try {
    Write-Host "Testando consulta final..."
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/mychatbot_2?select=*&chatbot_user=eq.5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f" -Method Get -Headers $headers
    Write-Host "SUCESSO! Consulta funcionou. Registros: $($testResponse.Count)"
} catch {
    Write-Host "Ainda com erro: $($_.Exception.Message)"
}

Write-Host "TESTE NO FRONTEND AGORA!"
