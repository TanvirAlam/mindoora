import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import config from './config/index.js';
import logger from './utils/logger.js';
import cacheService from './services/cacheService.js';
import {
  requestId,
  requestLogger,
  healthCheckBypass,
  errorHandler,
  notFoundHandler,
} from './middleware/index.js';

import questionRoutes from './routes/questions.js';
import localModelRoutes from './routes/localModels.js';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API service
}));

// CORS configuration
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware (before logging)
app.use(requestId);

// HTTP request logging (only in development)
if (config.isDevelopment()) {
  app.use(morgan('combined'));
}

// Custom request logging
app.use(requestLogger);

// Health check bypass for rate limiting
app.use(healthCheckBypass);

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Emach AI Service is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Detailed health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      memory: process.memoryUsage(),
      cache: cacheService.getStats(),
    };

    res.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    logger.logError(error, { context: 'Health check failed' });
    
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/questions', questionRoutes);
app.use('/api/local', localModelRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close cache connections
    await cacheService.close();
    
    // Close server
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    logger.logError(error, { context: 'Graceful shutdown failed' });
    process.exit(1);
  }
};

// Start server
const server = app.listen(config.port, async () => {
  // Import AI provider service to check available providers
  const aiProviderService = (await import('./services/aiProviderService.js')).default;
  
  logger.info(`🚀 Mindoora AI Service started`, {
    port: config.port,
    environment: config.nodeEnv,
    providers: aiProviderService.getAvailableProviders(),
  });
  
  logger.info('📋 Available endpoints:', {
    health: `http://localhost:${config.port}/health`,
    questions: `http://localhost:${config.port}/api/questions/generate`,
    docs: 'See README.md for full API documentation',
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
