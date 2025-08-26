# Usar imagem oficial do Node.js LTS
FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar timezone
ENV TZ=America/Sao_Paulo

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fastbot -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Stage de dependências
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage de build
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage de produção
FROM base AS production

# Copiar dependências
COPY --from=deps --chown=fastbot:nodejs /app/node_modules ./node_modules

# Copiar aplicação buildada
COPY --from=build --chown=fastbot:nodejs /app/dist ./dist
COPY --from=build --chown=fastbot:nodejs /app/package.json ./

# Criar diretório para logs
RUN mkdir -p /app/logs && chown fastbot:nodejs /app/logs

# Mudar para usuário não-root
USER fastbot

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
