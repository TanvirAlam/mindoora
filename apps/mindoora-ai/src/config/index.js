import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server Configuration
  port: parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // API Keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
  },
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },

  // Database & Cache
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
  },

  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
    ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Model Configuration
  ai: {
    defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'local',
    fallbackProvider: process.env.FALLBACK_AI_PROVIDER || 'local',
    maxQuestionsPerRequest: parseInt(process.env.MAX_QUESTIONS_PER_REQUEST) || 5,
    questionGenerationTimeout: parseInt(process.env.QUESTION_GENERATION_TIMEOUT) || 30000,
  },

  // Security
  security: {
    apiSecretKey: process.env.API_SECRET_KEY || 'default-secret-key',
    enableApiKeyAuth: process.env.ENABLE_API_KEY_AUTH === 'true',
  },

  // Performance
  performance: {
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 10,
  },

  // Validation
  isProduction: () => config.nodeEnv === 'production',
  isDevelopment: () => config.nodeEnv === 'development',
  isTest: () => config.nodeEnv === 'test',
};

// Validate required configuration
const validateConfig = () => {
  const requiredEnvVars = [];

  if (!config.openai.apiKey && config.ai.defaultProvider === 'openai') {
    requiredEnvVars.push('OPENAI_API_KEY');
  }

  if (!config.huggingface.apiKey && config.ai.defaultProvider === 'huggingface') {
    requiredEnvVars.push('HUGGINGFACE_API_KEY');
  }

  if (!config.googleAI.apiKey && config.ai.defaultProvider === 'googleai') {
    requiredEnvVars.push('GOOGLE_AI_API_KEY');
  }

  if (!config.huggingface.apiKey && config.ai.defaultProvider === 't5') {
    requiredEnvVars.push('HUGGINGFACE_API_KEY');
  }

  if (requiredEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${requiredEnvVars.join(', ')}`
    );
  }
};

// Only validate in production or when explicitly requested
if (config.isProduction() || process.env.VALIDATE_CONFIG === 'true') {
  validateConfig();
}

export default config;
