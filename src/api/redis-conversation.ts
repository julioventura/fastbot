/**
 * API Route para gerenciar cache de conversação no Redis
 * Implementa operações CRUD para memória de curto prazo do chatbot
 */
import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

// Simulação da conexão Redis - substitua pela sua implementação real
class RedisManager {
  private cache: Map<string, ConversationData> = new Map();
  private ttls: Map<string, NodeJS.Timeout> = new Map();

  async get(key: string): Promise<ConversationData | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: ConversationData, ttlSeconds?: number): Promise<void> {
    this.cache.set(key, value);
    
    if (ttlSeconds) {
      // Limpar TTL anterior se existir
      const existingTtl = this.ttls.get(key);
      if (existingTtl) clearTimeout(existingTtl);
      
      // Configurar novo TTL
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.ttls.delete(key);
      }, ttlSeconds * 1000);
      
      this.ttls.set(key, timeout);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    const ttl = this.ttls.get(key);
    if (ttl) {
      clearTimeout(ttl);
      this.ttls.delete(key);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }
}

const redis = new RedisManager();

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    page?: string;
    sessionId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

interface ConversationData {
  sessionId: string;
  userId: string;
  messages: ConversationMessage[];
  lastActivity: string;
  totalMessages: number;
}

// Extensão de tipos para Express
interface AuthenticatedRequest extends express.Request {
  userId: string;
}

// Middleware para validar autenticação
const validateAuth = (req: express.Request & { userId?: string }, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }

  const userId = authHeader.replace('Bearer ', '');
  if (!userId) {
    return res.status(401).json({ error: 'UserId inválido' });
  }

  req.userId = userId;
  next();
};

// Gerar chave Redis para conversação
const getConversationKey = (userId: string, sessionId: string): string => {
  return `fastbot:conversation:${userId}:${sessionId}`;
};

// GET - Buscar conversa do Redis
app.get('/api/redis/conversation', validateAuth, async (req: express.Request & { userId?: string }, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.userId!;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId é obrigatório' });
    }

    const key = getConversationKey(userId, sessionId as string);
    const data = await redis.get(key);

    if (!data) {
      return res.json({ 
        sessionId,
        userId,
        messages: [],
        lastActivity: null,
        totalMessages: 0,
        cached: false
      });
    }

    console.log(`🔍 [Redis] Conversa encontrada: ${key}, ${data.messages.length} mensagens`);

    return res.json({
      ...data,
      cached: true
    });

  } catch (error) {
    console.error('❌ [Redis] Erro ao buscar conversa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Salvar conversa no Redis
app.post('/api/redis/conversation', validateAuth, async (req, res) => {
  try {
    const { sessionId, messages, ttl = 1800 } = req.body; // TTL padrão: 30 minutos
    const userId = req.userId;

    if (!sessionId || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'sessionId e messages são obrigatórios' });
    }

    const conversationData: ConversationData = {
      sessionId,
      userId,
      messages,
      lastActivity: new Date().toISOString(),
      totalMessages: messages.length
    };

    const key = getConversationKey(userId, sessionId);
    await redis.set(key, conversationData, ttl);

    console.log(`💾 [Redis] Conversa salva: ${key}, ${messages.length} mensagens, TTL: ${ttl}s`);

    return res.json({ 
      success: true, 
      key,
      messagesCount: messages.length,
      ttl 
    });

  } catch (error) {
    console.error('❌ [Redis] Erro ao salvar conversa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Adicionar mensagem à conversa existente
app.put('/api/redis/conversation', validateAuth, async (req, res) => {
  try {
    const { sessionId, message, ttl = 1800 } = req.body;
    const userId = req.userId;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId e message são obrigatórios' });
    }

    const key = getConversationKey(userId, sessionId);
    let data = await redis.get(key);

    // Se não existe, criar nova conversa
    if (!data) {
      data = {
        sessionId,
        userId,
        messages: [],
        lastActivity: new Date().toISOString(),
        totalMessages: 0
      };
    }

    // Adicionar nova mensagem
    data.messages.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });
    
    data.lastActivity = new Date().toISOString();
    data.totalMessages = data.messages.length;

    // Manter apenas últimas 10 mensagens no cache (configurável)
    const maxCacheMessages = 10;
    if (data.messages.length > maxCacheMessages) {
      data.messages = data.messages.slice(-maxCacheMessages);
    }

    await redis.set(key, data, ttl);

    console.log(`📝 [Redis] Mensagem adicionada: ${key}, total: ${data.messages.length}`);

    return res.json({ 
      success: true,
      messagesCount: data.messages.length,
      lastActivity: data.lastActivity
    });

  } catch (error) {
    console.error('❌ [Redis] Erro ao adicionar mensagem:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Remover conversa do Redis
app.delete('/api/redis/conversation', validateAuth, async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.userId;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId é obrigatório' });
    }

    const key = getConversationKey(userId, sessionId as string);
    await redis.del(key);

    console.log(`🗑️ [Redis] Conversa removida: ${key}`);

    return res.json({ success: true, removed: key });

  } catch (error) {
    console.error('❌ [Redis] Erro ao remover conversa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Listar todas as conversas do usuário
app.get('/api/redis/conversations', validateAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const pattern = `fastbot:conversation:${userId}:*`;
    
    const keys = await redis.keys(pattern);
    const conversations = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        conversations.push({
          key,
          sessionId: data.sessionId,
          messagesCount: data.messages.length,
          lastActivity: data.lastActivity,
          totalMessages: data.totalMessages
        });
      }
    }

    // Ordenar por última atividade
    conversations.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    console.log(`📋 [Redis] ${conversations.length} conversas encontradas para usuário ${userId}`);

    return res.json({ 
      conversations,
      totalCount: conversations.length
    });

  } catch (error) {
    console.error('❌ [Redis] Erro ao listar conversas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Status e estatísticas do Redis
app.get('/api/redis/status', validateAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const pattern = `fastbot:conversation:${userId}:*`;
    const keys = await redis.keys(pattern);
    
    let totalMessages = 0;
    let activeConversations = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        activeConversations++;
        totalMessages += data.messages.length;
      }
    }

    const stats = {
      status: 'online',
      activeConversations,
      totalMessages,
      cacheKeys: keys.length,
      userId
    };

    console.log(`📊 [Redis] Status para usuário ${userId}:`, stats);

    return res.json(stats);

  } catch (error) {
    console.error('❌ [Redis] Erro ao obter status:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ [Redis API] Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar servidor (para desenvolvimento local)
const PORT = process.env.REDIS_API_PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 [Redis API] Servidor iniciado na porta ${PORT}`);
    console.log(`📡 [Redis API] Endpoints disponíveis:`);
    console.log(`   GET    /api/redis/conversation`);
    console.log(`   POST   /api/redis/conversation`);
    console.log(`   PUT    /api/redis/conversation`);
    console.log(`   DELETE /api/redis/conversation`);
    console.log(`   GET    /api/redis/conversations`);
    console.log(`   GET    /api/redis/status`);
  });
}

export default app;
