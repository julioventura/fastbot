# 🚀 Deploy de Produção - FastBot


## Instruções para Deploy em Dentistas.com.br/fastbot


### 1. Build de Produção


```bash
npm run build:prod

```


### 2. Upload dos Arquivos


1. **Copie todo o conteúdo da pasta `dist/`** para o diretório `/fastbot/` no servidor

2. **Certifique-se que o `.htaccess`** está na pasta `/fastbot/` no servidor


### 3. Estrutura no Servidor


```
dentistas.com.br/
└── fastbot/
    ├── .htaccess          ← IMPORTANTE!
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   ├── index-[hash].css
    │   └── ...
    └── [outros arquivos da pasta dist]

```


### 4. Verificação


1. **Acesse**: `https://dentistas.com.br/fastbot`

2. **Verifique se não há tela branca**

3. **Teste navegação**: Tente navegar entre páginas

4. **Console do navegador**: Verifique se não há erros 404


### 5. Possíveis Problemas


#### Tela Branca

- ✅ **RESOLVIDO**: Base path configurado como `/fastbot/`

- ✅ **RESOLVIDO**: .htaccess atualizado para subdiretório


#### Erro 404 nos assets

- Verifique se os caminhos dos arquivos CSS/JS estão com `/fastbot/` no início

- Confirme que a estrutura de pastas está correta no servidor


#### Problemas de roteamento

- ✅ **RESOLVIDO**: .htaccess configurado para React Router

- Todas as rotas agora redirecionam para `/fastbot/index.html`


### 6. Cache

O .htaccess inclui configurações de cache para assets estáticos (CSS, JS, imagens) para melhor performance.


### 7. HTTPS

O .htaccess força redirecionamento HTTPS automático.

---


## Configurações Técnicas Aplicadas


### Vite Config (`vite.config.ts`)

- `base: mode === 'production' ? '/fastbot/' : '/'`

- Configura base path apenas em produção


### .htaccess

- `RewriteBase /fastbot/`

- Roteamento SPA para React Router

- Cache control para assets

- Redirecionamento HTTPS forçado


### Build Command

- `npm run build:prod` - Build otimizado para produção com base path correto

---

**✅ Problema da tela branca RESOLVIDO!**


O FastBot agora deve carregar corretamente em `https://dentistas.com.br/fastbot`.
