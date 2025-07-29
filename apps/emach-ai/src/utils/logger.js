import winston from 'winston';
import config from '../config/index.js';

const { combine, timestamp, errors, json, simple, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    errors({ stack: true }),
    config.isProduction() ? json() : combine(colorize(), devFormat)
  ),
  defaultMeta: {
    service: 'emach-ai',
    environment: config.nodeEnv,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Add file transports in production
if (config.isProduction()) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logs directory if it doesn't exist
if (config.isProduction()) {
  import('fs').then(fs => {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  });
}

// Helper functions for structured logging
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logAIRequest = (provider, prompt, duration, success) => {
  logger.info('AI Request', {
    provider,
    promptLength: prompt?.length || 0,
    duration: `${duration}ms`,
    success,
  });
};

logger.logCacheEvent = (event, key, hit = null) => {
  logger.debug('Cache Event', {
    event, // 'hit', 'miss', 'set', 'delete'
    key,
    hit,
  });
};

export default logger;
