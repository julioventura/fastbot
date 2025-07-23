param(
    [string]$SupabaseUrl = "https://supabase.cirurgia.com.br",
    [string]$SupabaseKey = $env:SUPABASE_ANON_KEY
)

Write-Host "🚀 Adicionando campos avançados na tabela mychatbot_2..." -ForegroundColor Green

if (-not $SupabaseKey) {
    Write-Host "❌ Erro: SUPABASE_ANON_KEY não encontrada nas variáveis de ambiente" -ForegroundColor Red
    Write-Host "Execute: `$env:SUPABASE_ANON_KEY = 'sua_chave_aqui'" -ForegroundColor Yellow
    exit 1
}

# Ler o arquivo SQL
$sqlContent = Get-Content -Path ".\adicionar_campos_avancados_chatbot.sql" -Raw

# Dividir em comandos individuais (por ponto e vírgula)
$sqlCommands = $sqlContent -split "(?<=;)\s*\n" | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith("--") }

$headers = @{
    "apikey" = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

$successCount = 0
$errorCount = 0

foreach ($command in $sqlCommands) {
    $command = $command.Trim()
    if (-not $command -or $command.StartsWith("--") -or $command.StartsWith("COMMENT") -or $command.StartsWith("SELECT")) {
        continue
    }

    try {
        Write-Host "Executando: $($command.Substring(0, [Math]::Min(50, $command.Length)))..." -ForegroundColor Cyan
        
        $body = @{
            query = $command
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
        Write-Host "✅ Sucesso" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "⚠️  Comando pode ter falhado (possível coluna já existe): $($_.Exception.Message)" -ForegroundColor Yellow
        $errorCount++
    }
}

Write-Host "`n📊 Resumo da execução:" -ForegroundColor Blue
Write-Host "✅ Comandos executados com sucesso: $successCount" -ForegroundColor Green
Write-Host "⚠️  Comandos com possíveis erros: $errorCount" -ForegroundColor Yellow

# Verificar se as colunas foram criadas
Write-Host "`n🔍 Verificando colunas criadas..." -ForegroundColor Blue

$verifyQuery = @"
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
AND column_name IN (
    'formality_level', 'use_emojis', 'memorize_user_name', 'paragraph_size',
    'main_topic', 'allowed_topics', 'source_strictness', 'allow_internet_search',
    'confidence_threshold', 'fallback_action', 'response_time_promise', 'fallback_message',
    'main_link', 'mandatory_link', 'uploaded_documents',
    'mandatory_phrases', 'auto_link', 'max_list_items', 'list_style',
    'ask_for_name', 'name_usage_frequency', 'remember_context', 'returning_user_greeting',
    'response_speed', 'debug_mode', 'chat_color'
)
ORDER BY column_name;
"@

try {
    $verifyBody = @{
        query = $verifyQuery
    } | ConvertTo-Json
    
    $columns = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $verifyBody
    
    if ($columns) {
        Write-Host "✅ Colunas encontradas na tabela:" -ForegroundColor Green
        $columns | ForEach-Object {
            Write-Host "  - $($_.column_name) ($($_.data_type))" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Não foi possível verificar as colunas" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Erro ao verificar colunas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Script executado! Agora você pode testar o formulário novamente." -ForegroundColor Green
Write-Host "💡 Se ainda houver erros, execute o SQL manualmente no Supabase Dashboard." -ForegroundColor Yellow
