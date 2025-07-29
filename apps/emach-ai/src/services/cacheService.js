import NodeCache from 'node-cache';
import Redis from 'ioredis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class CacheService {
  constructor() {
    this.memoryCache = new NodeCache({ 
      stdTTL: config.performance.cacheTTL,
      checkperiod: 120 // Check for expired keys every 2 minutes
    });
    
    this.redisClient = null;
    this.useRedis = false;
    
    this.initRedis();
  }

  async initRedis() {
    try {
      if (config.redis.url) {
        this.redisClient = new Redis(config.redis.url, {
          password: config.redis.password,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        // Test connection
        await this.redisClient.ping();
        this.useRedis = true;
        logger.info('Redis connection established');

        // Handle Redis events
        this.redisClient.on('error', (error) => {
          logger.logError(error, { context: 'Redis connection error' });
          this.useRedis = false;
        });

        this.redisClient.on('connect', () => {
          logger.info('Redis connected');
          this.useRedis = true;
        });

        this.redisClient.on('close', () => {
          logger.warn('Redis connection closed');
          this.useRedis = false;
        });
      }
    } catch (error) {
      logger.logError(error, { context: 'Redis initialization failed' });
      this.useRedis = false;
    }
  }

  /**
   * Generate cache key with consistent formatting
   */
  generateKey(prefix, ...parts) {
    return `emach-ai:${prefix}:${parts.join(':')}`;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      let value = null;

      // Try Redis first if available
      if (this.useRedis && this.redisClient) {
        try {
          const redisValue = await this.redisClient.get(key);
          if (redisValue) {
            value = JSON.parse(redisValue);
            logger.logCacheEvent('hit', key, 'redis');
            return value;
          }
        } catch (redisError) {
          logger.logError(redisError, { context: 'Redis get operation failed' });
        }
      }

      // Fallback to memory cache
      value = this.memoryCache.get(key);
      if (value) {
        logger.logCacheEvent('hit', key, 'memory');
        return value;
      }

      logger.logCacheEvent('miss', key);
      return null;
    } catch (error) {
      logger.logError(error, { context: 'Cache get operation failed', key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || config.performance.cacheTTL;

      // Set in Redis if available
      if (this.useRedis && this.redisClient) {
        try {
          await this.redisClient.setex(key, cacheTTL, serializedValue);
          logger.logCacheEvent('set', key, 'redis');
        } catch (redisError) {
          logger.logError(redisError, { context: 'Redis set operation failed' });
        }
      }

      // Always set in memory cache as fallback
      this.memoryCache.set(key, value, cacheTTL);
      logger.logCacheEvent('set', key, 'memory');

      return true;
    } catch (error) {
      logger.logError(error, { context: 'Cache set operation failed', key });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key) {
    try {
      // Delete from Redis if available
      if (this.useRedis && this.redisClient) {
        try {
          await this.redisClient.del(key);
        } catch (redisError) {
          logger.logError(redisError, { context: 'Redis delete operation failed' });
        }
      }

      // Delete from memory cache
      this.memoryCache.del(key);
      logger.logCacheEvent('delete', key);

      return true;
    } catch (error) {
      logger.logError(error, { context: 'Cache delete operation failed', key });
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    try {
      // Clear Redis if available
      if (this.useRedis && this.redisClient) {
        try {
          await this.redisClient.flushdb();
        } catch (redisError) {
          logger.logError(redisError, { context: 'Redis clear operation failed' });
        }
      }

      // Clear memory cache
      this.memoryCache.flushAll();
      logger.info('Cache cleared');

      return true;
    } catch (error) {
      logger.logError(error, { context: 'Cache clear operation failed' });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    
    return {
      memory: {
        keys: memoryStats.keys,
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) || 0,
      },
      redis: {
        connected: this.useRedis,
        url: config.redis.url ? config.redis.url.replace(/\/\/.*@/, '//***@') : null,
      },
    };
  }

  /**
   * Close connections
   */
  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      this.memoryCache.close();
      logger.info('Cache service closed');
    } catch (error) {
      logger.logError(error, { context: 'Cache service close failed' });
    }
  }
}

// Export singleton instance
export default new CacheService();
