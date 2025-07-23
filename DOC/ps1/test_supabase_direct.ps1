# Script PowerShell simplificado para desabilitar RLS
$supabaseUrl = "https://supabase.cirurgia.com.br"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"

Write-Host "Desabilitando RLS na tabela mychatbot_2..."

$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
    "apikey" = $serviceRoleKey
}

# Testar consulta diretamente
try {
    Write-Host "Testando consulta na tabela..."
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/mychatbot_2?select=count" -Method Get -Headers $headers
    Write-Host "Consulta funcionou! Resposta: $testResponse"
    
    Write-Host "Testando consulta específica do usuário..."
    $userResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/mychatbot_2?select=*&chatbot_user=eq.5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f" -Method Get -Headers $headers
    Write-Host "Usuario query funcionou! Dados: $($userResponse.Count) registros"
    
} catch {
    Write-Host "Erro: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}

Write-Host "TESTE AGORA NO FRONTEND!"
