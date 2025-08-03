import { jest } from '@jest/globals';

// Mock NodeCache
const mockMemoryCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  flushAll: jest.fn(),
  getStats: jest.fn().mockReturnValue({
    keys: 5,
    hits: 10,
    misses: 2
  })
};

// Mock config
const mockConfig = {
  performance: {
    cacheTTL: 3600
  },
  redis: {
    url: 'redis://localhost:6379',
    password: null
  },
  nodeEnv: 'test',
  logLevel: 'info',
  isProduction: () => false,
  isDevelopment: () => false,
  isTest: () => true
};

// Mock logger to prevent error logging during tests
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logError: jest.fn(),
  logCacheEvent: jest.fn(),
  logHTTPRequest: jest.fn(),
  logAIRequest: jest.fn()
};

// Mock the Redis client
const mockRedisClient = {
  ping: jest.fn().mockResolvedValue('PONG'),
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  flushdb: jest.fn(),
  on: jest.fn(),
  quit: jest.fn(),
};

// Use proper ES module mocking
jest.unstable_mockModule('../../config/index.js', () => ({
  default: mockConfig
}));

jest.unstable_mockModule('node-cache', () => ({
  default: jest.fn().mockImplementation(() => mockMemoryCache)
}));

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: mockLogger
}));

// Import after mocking
const cacheService = (await import('../../services/cacheService.js')).default;

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = cacheService.generateKey('questions', 'openai', 'prompt-hash', 5, 'medium');
      const key2 = cacheService.generateKey('questions', 'openai', 'prompt-hash', 5, 'medium');
      
      expect(key1).toBe(key2);
      expect(key1).toBe('mindoora-ai:questions:openai:prompt-hash:5:medium');
    });

    it('should handle different prefixes and parts', () => {
      const key = cacheService.generateKey('analysis', 'content-hash');
      expect(key).toBe('mindoora-ai:analysis:content-hash');
    });
  });

  describe('get', () => {
    it('should return null for cache miss', async () => {
      mockMemoryCache.get.mockReturnValue(undefined);
      
      const result = await cacheService.get('non-existent-key');
      
      expect(result).toBeNull();
      expect(mockMemoryCache.get).toHaveBeenCalledWith('non-existent-key');
    });

    it('should return value from memory cache on hit', async () => {
      const testValue = { data: 'test' };
      mockMemoryCache.get.mockReturnValue(testValue);
      
      const result = await cacheService.get('test-key');
      
      expect(result).toEqual(testValue);
      expect(mockMemoryCache.get).toHaveBeenCalledWith('test-key');
    });

    it('should fallback to memory cache if Redis fails', async () => {
      const testValue = { data: 'test' };
      
      // Mock Redis as available but failing
      cacheService.useRedis = true;
      cacheService.redisClient = mockRedisClient;
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));
      mockMemoryCache.get.mockReturnValue(testValue);
      
      const result = await cacheService.get('test-key');
      
      expect(result).toEqual(testValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(mockMemoryCache.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('set', () => {
    it('should set value in memory cache', async () => {
      const testValue = { data: 'test' };
      mockMemoryCache.set.mockReturnValue(true);
      
      const result = await cacheService.set('test-key', testValue);
      
      expect(result).toBe(true);
      expect(mockMemoryCache.set).toHaveBeenCalledWith('test-key', testValue, 3600);
    });

    it('should set value in Redis and memory cache when Redis is available', async () => {
      const testValue = { data: 'test' };
      
      cacheService.useRedis = true;
      cacheService.redisClient = mockRedisClient;
      mockRedisClient.setex.mockResolvedValue('OK');
      mockMemoryCache.set.mockReturnValue(true);
      
      const result = await cacheService.set('test-key', testValue);
      
      expect(result).toBe(true);
      expect(mockRedisClient.setex).toHaveBeenCalledWith('test-key', 3600, JSON.stringify(testValue));
      expect(mockMemoryCache.set).toHaveBeenCalledWith('test-key', testValue, 3600);
    });

    it('should handle custom TTL', async () => {
      const testValue = { data: 'test' };
      const customTTL = 1800;
      
      mockMemoryCache.set.mockReturnValue(true);
      
      const result = await cacheService.set('test-key', testValue, customTTL);
      
      expect(result).toBe(true);
      expect(mockMemoryCache.set).toHaveBeenCalledWith('test-key', testValue, customTTL);
    });
  });

  describe('delete', () => {
    it('should delete from memory cache', async () => {
      mockMemoryCache.del.mockReturnValue(1);
      
      const result = await cacheService.delete('test-key');
      
      expect(result).toBe(true);
      expect(mockMemoryCache.del).toHaveBeenCalledWith('test-key');
    });

    it('should delete from Redis and memory cache when Redis is available', async () => {
      cacheService.useRedis = true;
      cacheService.redisClient = mockRedisClient;
      mockRedisClient.del.mockResolvedValue(1);
      mockMemoryCache.del.mockReturnValue(1);
      
      const result = await cacheService.delete('test-key');
      
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(mockMemoryCache.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should clear memory cache', async () => {
      mockMemoryCache.flushAll.mockReturnValue(undefined);
      
      const result = await cacheService.clear();
      
      expect(result).toBe(true);
      expect(mockMemoryCache.flushAll).toHaveBeenCalled();
    });

    it('should clear Redis and memory cache when Redis is available', async () => {
      cacheService.useRedis = true;
      cacheService.redisClient = mockRedisClient;
      mockRedisClient.flushdb.mockResolvedValue('OK');
      mockMemoryCache.flushAll.mockReturnValue(undefined);
      
      const result = await cacheService.clear();
      
      expect(result).toBe(true);
      expect(mockRedisClient.flushdb).toHaveBeenCalled();
      expect(mockMemoryCache.flushAll).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      const stats = cacheService.getStats();
      
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('redis');
      expect(stats.memory).toHaveProperty('keys');
      expect(stats.memory).toHaveProperty('hits');
      expect(stats.memory).toHaveProperty('misses');
      expect(stats.memory).toHaveProperty('hitRate');
      expect(stats.redis).toHaveProperty('connected');
      expect(stats.redis).toHaveProperty('url');
    });

    it('should calculate hit rate correctly', () => {
      const stats = cacheService.getStats();
      
      // Based on mocked values: hits=10, misses=2
      expect(stats.memory.hitRate).toBeCloseTo(10 / 12);
    });
  });
});
