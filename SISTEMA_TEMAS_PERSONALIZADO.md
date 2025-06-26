# Sistema de Temas Personalizado

## Funcionalidades Implementadas

- ✅ Salvamento da preferência de tema no perfil do usuário
- ✅ Carregamento automático do tema após login
- ✅ Sincronização entre dispositivos
- ✅ Fallback para localStorage quando não logado

## Como Configurar

### 1. Executar Script SQL

Execute o arquivo `INSTRUCOES_TEMA_PERSONALIZADO.sql` no SQL Editor do Supabase.

### 2. Verificar Políticas RLS

Certifique-se de que as políticas RLS permitem UPDATE na tabela `profiles`.

## Como Usar

### Para o Usuário

1. Faça login na aplicação
2. Vá em "Minha Conta"
3. Selecione o tema desejado
4. Clique em "Salvar alterações"
5. O tema será aplicado e salvo no perfil

### Para o Desenvolvedor

O sistema funciona automaticamente:

- Usuário não logado → usa localStorage
- Usuário logado → carrega tema do perfil
- Mudança de tema → salva no perfil automaticamente

## Temas Disponíveis

- 🌙 Azul Escuro (`blue-dark`) - Padrão
- ☀️ Azul Claro (`blue-light`)
- 🌙 Roxo Escuro (`purple-dark`)
- ☀️ Roxo Claro (`purple-light`)
- 🌙 Cinza Escuro (`gray-dark`)
- ☀️ Cinza Claro (`gray-light`)

## Fluxo do Sistema

```text
Usuário não logado → localStorage
         ↓
Usuário faz login → Carrega tema do perfil
         ↓
Usuário altera tema → Salva no perfil + aplica
         ↓
Próximo login → Carrega tema salvo
```

## Arquivos Modificados

### Novos Arquivos

- `supabase/INSTRUCOES_TEMA_PERSONALIZADO.sql` - Script de configuração
- `SISTEMA_TEMAS_PERSONALIZADO.md` - Esta documentação

### Arquivos Alterados

- `src/components/account/ProfileForm.tsx` - Adicionado seletor de tema
- `src/contexts/ThemeContext.tsx` - Integração com perfil do usuário
- `src/pages/Account.tsx` - Suporte ao campo themePreference

## Vantagens

- **Persistência Inteligente**: Tema salvo no perfil (não apenas localStorage)
- **Sincronização**: Mantém tema em qualquer dispositivo
- **Fallback Robusto**: Funciona mesmo se usuário não estiver logado
- **Aplicação Imediata**: Tema muda instantaneamente
- **Interface Intuitiva**: Seletor com ícones e descrições claras
- **Compatibilidade**: Mantém comportamento anterior para não logados
