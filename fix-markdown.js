#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing Markdown Lint Issues...');

// Find all markdown files
const markdownFiles = glob.sync('*.md', { cwd: process.cwd() });

markdownFiles.forEach(file => {
    console.log(`📝 Processing: ${file}`);
    
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix MD026: Remove trailing punctuation from headings
    content = content.replace(/(#{1,6}\s+.*?)[:]\s*$/gm, '$1');
    
    // Fix MD031: Add blank lines around fenced code blocks
    content = content.replace(/([^\n])\n```/g, '$1\n\n```');
    content = content.replace(/```\n([^\n])/g, '```\n\n$1');
    
    // Fix MD022: Add blank lines around headings
    // Before headings (except at start of file)
    content = content.replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2');
    // After headings
    content = content.replace(/(#{1,6}\s+.*?)\n([^\n#\-\*\+\d\s`])/g, '$1\n\n$2');
    
    // Fix MD032: Add blank lines around lists
    // Before lists
    content = content.replace(/([^\n])\n(\s*[-*+]\s+)/g, '$1\n\n$2');
    content = content.replace(/([^\n])\n(\s*\d+\.\s+)/g, '$1\n\n$2');
    // After lists
    content = content.replace(/(\s*[-*+]\s+.*?)\n([^\n\s\-\*\+\d#`])/g, '$1\n\n$2');
    content = content.replace(/(\s*\d+\.\s+.*?)\n([^\n\s\-\*\+\d#`])/g, '$1\n\n$2');
    
    // Fix MD034: Wrap bare URLs in angle brackets
    content = content.replace(/(\s)(https?:\/\/[^\s\)>\]]+)(\s)/g, '$1<$2>$3');
    content = content.replace(/^(https?:\/\/[^\s\)>\]]+)(\s)/gm, '<$1>$2');
    content = content.replace(/(\s)(https?:\/\/[^\s\)>\]]+)$/gm, '$1<$2>');
    
    // Clean up multiple consecutive blank lines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    // Only write if content changed
    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('  ✅ Fixed');
    } else {
        console.log('  ⏭️  No changes needed');
    }
});

console.log('🎉 Markdown fixing complete!');
console.log('📊 Run "npm run lint:md" to verify fixes');
