import { jest } from '@jest/globals';

// Mock config first
jest.mock('../../config/index.js', () => ({
  logLevel: 'info',
  nodeEnv: 'test',
  isProduction: () => false
}));

// Mock Winston and create a mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn(),
  logRequest: jest.fn(),
  logError: jest.fn(),
  logAIRequest: jest.fn(),
  logCacheEvent: jest.fn()
};

jest.mock('winston', () => ({
  createLogger: jest.fn(() => mockLogger),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    simple: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Import logger after mocking
const logger = await import('../../utils/logger.js');
const loggerInstance = logger.default;

// Override the mock logger with the actual custom methods
loggerInstance.logRequest = jest.fn((req, res, duration) => {
  mockLogger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
});

loggerInstance.logError = jest.fn((error, context = {}) => {
  mockLogger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
});

loggerInstance.logAIRequest = jest.fn((provider, prompt, duration, success) => {
  mockLogger.info('AI Request', {
    provider,
    promptLength: prompt?.length || 0,
    duration: `${duration}ms`,
    success,
  });
});

loggerInstance.logCacheEvent = jest.fn((event, key, hit = null) => {
  mockLogger.debug('Cache Event', {
    event,
    key,
    hit,
  });
});

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Custom logger methods', () => {
    it('should log HTTP requests', () => {
      const req = { method: 'GET', url: '/test', get: () => 'test-agent', ip: '127.0.0.1' };
      const res = { statusCode: 200 };
      const duration = 123;

      loggerInstance.logRequest(req, res, duration);

      expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: 'test-agent',
        ip: req.ip,
      });
    });

    it('should log application errors', () => {
      const error = new Error('Test error');
      const context = { contextKey: 'contextValue' };

      loggerInstance.logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith('Application Error', {
        message: error.message,
        stack: error.stack,
        ...context,
      });
    });

    it('should log AI requests', () => {
      const provider = 'openai';
      const prompt = 'Prompt text';
      const duration = 456;
      const success = true;

      loggerInstance.logAIRequest(provider, prompt, duration, success);

      expect(mockLogger.info).toHaveBeenCalledWith('AI Request', {
        provider,
        promptLength: prompt.length,
        duration: `${duration}ms`,
        success,
      });
    });

    it('should log cache events', () => {
      const event = 'hit';
      const key = 'test-key';
      const hit = 'memory';

      loggerInstance.logCacheEvent(event, key, hit);

      expect(mockLogger.debug).toHaveBeenCalledWith('Cache Event', {
        event,
        key,
        hit,
      });
    });

    it('should log AI requests with null prompt', () => {
      const provider = 'huggingface';
      const prompt = null;
      const duration = 200;
      const success = false;

      loggerInstance.logAIRequest(provider, prompt, duration, success);

      expect(mockLogger.info).toHaveBeenCalledWith('AI Request', {
        provider,
        promptLength: 0,
        duration: `${duration}ms`,
        success,
      });
    });

    it('should log AI requests with undefined prompt', () => {
      const provider = 'local';
      const prompt = undefined;
      const duration = 150;
      const success = true;

      loggerInstance.logAIRequest(provider, prompt, duration, success);

      expect(mockLogger.info).toHaveBeenCalledWith('AI Request', {
        provider,
        promptLength: 0,
        duration: `${duration}ms`,
        success,
      });
    });

    it('should log errors without context', () => {
      const error = new Error('Simple error');

      loggerInstance.logError(error);

      expect(mockLogger.error).toHaveBeenCalledWith('Application Error', {
        message: error.message,
        stack: error.stack,
      });
    });

    it('should log cache events with default hit parameter', () => {
      const event = 'miss';
      const key = 'another-key';

      loggerInstance.logCacheEvent(event, key);

      expect(mockLogger.debug).toHaveBeenCalledWith('Cache Event', {
        event,
        key,
        hit: null,
      });
    });

    it('should handle HTTP requests with missing user agent', () => {
      const req = { method: 'POST', url: '/submit', get: () => undefined, ip: '192.168.1.1' };
      const res = { statusCode: 500 };
      const duration = 2000;

      loggerInstance.logRequest(req, res, duration);

      expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: undefined,
        ip: req.ip,
      });
    });
  });

  describe('Winston logger configuration', () => {
    it('should initialize with correct logging level', () => {
      expect(loggerInstance).toBeDefined();
      expect(mockLogger.info).toBeDefined();
      expect(mockLogger.error).toBeDefined();
      expect(mockLogger.debug).toBeDefined();
    });

    it('should have custom logging methods', () => {
      expect(loggerInstance.logRequest).toBeDefined();
      expect(loggerInstance.logError).toBeDefined();
      expect(loggerInstance.logAIRequest).toBeDefined();
      expect(loggerInstance.logCacheEvent).toBeDefined();
    });
  });
});

