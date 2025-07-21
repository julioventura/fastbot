# Fix Markdown Lint Issues
# This script fixes common markdownlint errors in all .md files

Write-Host "Fixing Markdown Lint Issues..." -ForegroundColor Yellow

# Get all markdown files
$markdownFiles = Get-ChildItem -Path "." -Filter "*.md" -File

foreach ($file in $markdownFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix MD026: Remove trailing punctuation from headings
    $content = $content -replace '(#{1,6}\s+.*?):(\s*\r?\n)', '$1$2'
    
    # Fix MD031: Add blank lines around fenced code blocks
    $content = $content -replace '([^\r\n])\r?\n```', '$1' + [Environment]::NewLine + [Environment]::NewLine + '```'
    $content = $content -replace '```\r?\n([^\r\n])', '```' + [Environment]::NewLine + [Environment]::NewLine + '$1'
    
    # Fix MD022: Add blank lines around headings
    # Before headings (except at start of file)
    $content = $content -replace '([^\r\n])\r?\n(#{1,6}\s+)', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    # After headings (except before lists or code blocks)
    $content = $content -replace '(#{1,6}\s+.*?)\r?\n([^\r\n#\-\*\+\d\s`])', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    
    # Fix MD032: Add blank lines around lists
    # Before lists
    $content = $content -replace '([^\r\n])\r?\n(\s*[\-\*\+]\s+)', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    $content = $content -replace '([^\r\n])\r?\n(\s*\d+\.\s+)', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    # After lists
    $content = $content -replace '(\s*[\-\*\+]\s+.*?)\r?\n([^\r\n\s\-\*\+\d#`])', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    $content = $content -replace '(\s*\d+\.\s+.*?)\r?\n([^\r\n\s\-\*\+\d#`])', '$1' + [Environment]::NewLine + [Environment]::NewLine + '$2'
    
    # Fix MD034: Wrap bare URLs in angle brackets (but not in markdown links)
    $content = $content -replace '(\s)(https?://[^\s\)>\]]+)(\s)', '$1<$2>$3'
    $content = $content -replace '^(https?://[^\s\)>\]]+)(\s)', '<$1>$2'
    $content = $content -replace '(\s)(https?://[^\s\)>\]]+)$', '$1<$2>'
    
    # Clean up multiple consecutive blank lines
    $content = $content -replace '\r?\n\r?\n\r?\n+', [Environment]::NewLine + [Environment]::NewLine
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  Fixed" -ForegroundColor Green
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host "Markdown fixing complete!" -ForegroundColor Green
Write-Host "Run npm run lint:md to verify fixes" -ForegroundColor Yellow
