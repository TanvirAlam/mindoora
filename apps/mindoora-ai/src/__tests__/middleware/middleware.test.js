import { jest } from '@jest/globals';

// Mock dependencies before importing middleware
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  logRequest: jest.fn(),
  logError: jest.fn(),
};

const mockConfig = {
  security: {
    enableApiKeyAuth: true,
    apiSecretKey: 'test-secret-key'
  },
  isDevelopment: () => true,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  }
};

// Use jest.unstable_mockModule for ES modules
jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../config/index.js', () => ({
  default: mockConfig
}));

// Import middleware after mocking
const {
  requestId,
  requestLogger,
  apiKeyAuth,
  errorHandler,
  notFoundHandler,
  requestTimeout,
  healthCheckBypass
} = await import('../../middleware/index.js');

describe('Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      id: null,
      method: 'GET',
      url: '/test',
      path: '/test',
      ip: '127.0.0.1',
      headers: {},
      query: {},
      get: jest.fn(),
      body: {},
      setTimeout: jest.fn(),
    };

    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
      headersSent: false,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('requestId middleware', () => {
    it('should add unique ID to request and response header', () => {
      requestId(req, res, next);

      expect(req.id).toBeDefined();
      expect(typeof req.id).toBe('string');
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('should generate different IDs for different requests', () => {
      const req2 = { ...req };
      
      requestId(req, res, next);
      requestId(req2, res, next);

      expect(req.id).not.toBe(req2.id);
    });
  });

  describe('requestLogger middleware', () => {
    it('should log incoming request', () => {
      req.get.mockReturnValue('test-user-agent');

      requestLogger(req, res, next);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        id: req.id,
        method: req.method,
        url: req.url,
        userAgent: 'test-user-agent',
        ip: req.ip,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should override res.end to log response', () => {
      const originalEnd = res.end;
      requestLogger(req, res, next);

      expect(res.end).not.toBe(originalEnd);
      expect(typeof res.end).toBe('function');
    });
  });

  describe('apiKeyAuth middleware', () => {
    it('should allow requests with valid API key in header', () => {
      req.headers['x-api-key'] = 'test-secret-key';

      apiKeyAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow requests with valid API key in query', () => {
      req.query = { apiKey: 'test-secret-key' };

      apiKeyAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests without API key', () => {
      apiKeyAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'API key is required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid API key', () => {
      req.headers['x-api-key'] = 'invalid-key';

      apiKeyAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid API key',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    });

    it('should handle unauthorized errors', () => {
      const error = new Error('Unauthorized');
      error.name = 'UnauthorizedError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should handle connection refused errors', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service unavailable',
        message: 'External service connection failed',
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Generic error', // In development mode, it shows the actual error message
        stack: expect.any(String) // In development mode, it includes the stack
      });
    });
  });

  describe('notFoundHandler middleware', () => {
    it('should return 404 for unmatched routes', () => {
      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.url} not found`,
      });
    });
  });

  describe('requestTimeout middleware', () => {
    it('should create timeout middleware with default timeout', () => {
      const timeoutMiddleware = requestTimeout();
      
      expect(typeof timeoutMiddleware).toBe('function');
    });

    it('should create timeout middleware with custom timeout', () => {
      const customTimeout = 5000;
      const timeoutMiddleware = requestTimeout(customTimeout);

      timeoutMiddleware(req, res, next);

      expect(req.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
      expect(next).toHaveBeenCalled();
    });
  });

  describe('healthCheckBypass middleware', () => {
    it('should bypass for health check routes', () => {
      req.path = '/health';

      healthCheckBypass(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should bypass for root route', () => {
      req.path = '/';

      healthCheckBypass(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
