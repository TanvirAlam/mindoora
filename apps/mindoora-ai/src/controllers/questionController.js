import Joi from 'joi';
import aiProviderService from '../services/aiProviderService.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Validation schemas
const generateQuestionsSchema = Joi.object({
  prompt: Joi.string().min(2).max(1000).required()
    .messages({
      'string.min': 'Prompt must be at least 2 characters long',
      'string.max': 'Prompt cannot exceed 1000 characters',
      'any.required': 'Prompt is required'
    }),
  count: Joi.number().integer().min(1).max(config.ai.maxQuestionsPerRequest).default(5)
    .messages({
      'number.min': 'Count must be at least 1',
      'number.max': `Count cannot exceed ${config.ai.maxQuestionsPerRequest}`
    }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'mixed').default('medium')
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard, mixed'
    }),
  questionTypes: Joi.array().items(
    Joi.string().valid('multiple-choice', 'true-false', 'fill-blank', 'short-answer')
  ).default(['multiple-choice'])
    .messages({
      'any.only': 'Question types must be one of: multiple-choice, true-false, fill-blank, short-answer'
    }),
  provider: Joi.string().valid('openai', 'huggingface', 'googleai', 't5').optional()
    .messages({
      'any.only': 'Provider must be one of: openai, huggingface, googleai, t5'
    }),
  useCache: Joi.boolean().default(true),
});

const analyzeContentSchema = Joi.object({
  text: Joi.string().min(10).max(5000).required()
    .messages({
      'string.min': 'Text must be at least 10 characters long',
      'string.max': 'Text cannot exceed 5000 characters',
      'any.required': 'Text is required'
    }),
  provider: Joi.string().valid('openai', 'huggingface', 'googleai').optional()
    .messages({
      'any.only': 'Provider must be one of: openai, huggingface, googleai'
    }),
});

class QuestionController {
  /**
   * Generate quiz questions based on a prompt
   */
  async generateQuestions(req, res) {
    try {
      // Validate request body
      const { error, value } = generateQuestionsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message),
        });
      }

      const { prompt, count, difficulty, questionTypes, provider, useCache } = value;

      logger.info('Question generation request received', {
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        count,
        difficulty,
        questionTypes,
        provider,
      });

      // Generate questions
      const result = await aiProviderService.generateQuestions(prompt, {
        count,
        difficulty,
        questionTypes,
        provider,
        useCache,
      });

      logger.info('Questions generated successfully', {
        questionCount: result.questions.length,
        provider: provider || config.ai.defaultProvider,
      });

      res.json({
        success: true,
        data: result,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          provider: provider || config.ai.defaultProvider,
        },
      });

    } catch (error) {
      logger.logError(error, { 
        context: 'Question generation failed',
        requestBody: req.body 
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate questions',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Analyze content for difficulty and topics
   */
  async analyzeContent(req, res) {
    try {
      // Validate request body
      const { error, value } = analyzeContentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message),
        });
      }

      const { text, provider } = value;

      logger.info('Content analysis request received', {
        textLength: text.length,
        provider,
      });

      // Analyze content
      const result = await aiProviderService.analyzeContent(text, provider);

      logger.info('Content analysis completed successfully');

      res.json({
        success: true,
        data: result,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          provider: provider || config.ai.defaultProvider,
        },
      });

    } catch (error) {
      logger.logError(error, { 
        context: 'Content analysis failed',
        requestBody: req.body 
      });

      res.status(500).json({
        success: false,
        error: 'Failed to analyze content',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get available AI providers
   */
  async getProviders(req, res) {
    try {
      const providers = aiProviderService.getAvailableProviders();
      
      res.json({
        success: true,
        data: {
          providers,
          default: config.ai.defaultProvider,
          fallback: config.ai.fallbackProvider,
        },
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Failed to get providers' });

      res.status(500).json({
        success: false,
        error: 'Failed to get providers',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Health check for AI providers
   */
  async healthCheck(req, res) {
    try {
      const results = await aiProviderService.healthCheck();
      
      const overallHealth = Object.values(results).every(result => result.status === 'healthy');
      
      res.status(overallHealth ? 200 : 503).json({
        success: overallHealth,
        data: {
          overall: overallHealth ? 'healthy' : 'degraded',
          providers: results,
        },
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Health check failed' });

      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get service statistics
   */
  async getStats(req, res) {
    try {
      const cacheService = (await import('../services/cacheService.js')).default;
      const cacheStats = cacheService.getStats();
      
      res.json({
        success: true,
        data: {
          cache: cacheStats,
          config: {
            maxQuestionsPerRequest: config.ai.maxQuestionsPerRequest,
            defaultProvider: config.ai.defaultProvider,
            cacheTTL: config.performance.cacheTTL,
          },
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Failed to get stats' });

      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Clear cache
   */
  async clearCache(req, res) {
    try {
      const cacheService = (await import('../services/cacheService.js')).default;
      await cacheService.clear();
      
      logger.info('Cache cleared manually via API');
      
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Failed to clear cache' });

      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }
}

export default new QuestionController();
