import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Request ID middleware - adds unique ID to each request
 */
export const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    id: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    logger.logRequest(req, res, duration);
    
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Rate limiting middleware
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  },
});

/**
 * API Key authentication middleware (optional)
 */
export const apiKeyAuth = (req, res, next) => {
  if (!config.security.enableApiKeyAuth) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'API key is required',
    });
  }

  if (apiKey !== config.security.apiSecretKey) {
    logger.warn('Invalid API key attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      providedKey: apiKey.substring(0, 8) + '...',
    });
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid API key',
    });
  }

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  logger.logError(error, {
    requestId: req.id,
    method: req.method,
    url: req.url,
    body: req.body,
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.message,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'External service connection failed',
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.isDevelopment() ? error.message : 'Something went wrong',
    ...(config.isDevelopment() && { stack: error.stack }),
  });
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
  });
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      logger.warn('Request timeout', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        timeout,
      });

      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          message: 'Request took too long to process',
        });
      }
    });

    next();
  };
};

/**
 * Health check bypass middleware
 */
export const healthCheckBypass = (req, res, next) => {
  // Skip rate limiting and other heavy middleware for health checks
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  
  // Apply rate limiting for other routes
  rateLimiter(req, res, next);
};
