import Joi from 'joi';
import localModelService from '../services/localModelService.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Validation schemas
const generateQuestionsSchema = Joi.object({
  prompt: Joi.string().min(3).max(500).required()
    .messages({
      'string.min': 'Prompt must be at least 3 characters long',
      'string.max': 'Prompt cannot exceed 500 characters',
      'any.required': 'Prompt is required'
    }),
  model: Joi.string().valid('flan-t5-base', 'flan-t5-small', 'gpt2', 'distilgpt2').default('flan-t5-small')
    .messages({
      'any.only': 'Model must be one of: flan-t5-base, flan-t5-small, gpt2, distilgpt2'
    }),
  count: Joi.number().integer().min(1).max(10).default(3)
    .messages({
      'number.min': 'Count must be at least 1',
      'number.max': 'Count cannot exceed 10'
    }),
  difficulty: Joi.string().valid('beginner', 'medium', 'advanced').default('medium')
    .messages({
      'any.only': 'Difficulty must be one of: beginner, medium, advanced'
    }),
  focusArea: Joi.string().max(200).optional().allow('')
    .messages({
      'string.max': 'Focus area cannot exceed 200 characters'
    }),
});

const testModelSchema = Joi.object({
  model: Joi.string().valid('flan-t5-base', 'flan-t5-small', 'gpt2', 'distilgpt2').default('flan-t5-small')
    .messages({
      'any.only': 'Model must be one of: flan-t5-base, flan-t5-small, gpt2, distilgpt2'
    }),
});

class LocalModelController {
  /**
   * Generate questions using local/free Hugging Face models
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

      const { prompt, model, count, difficulty, focusArea } = value;

      logger.info('Local model question generation request received', {
        prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        model,
        count,
        difficulty,
        focusArea,
      });

      // Generate questions using local model service
      const result = await localModelService.generateQuestions(prompt, {
        model,
        count,
        difficulty,
        focusArea,
      });

      logger.info('Questions generated successfully with local model', {
        questionCount: result.questions.length,
        model: result.metadata.model,
        duration: result.metadata.duration,
      });

      res.json({
        success: true,
        data: result,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          provider: 'huggingface-local',
          model: result.metadata.model,
        },
      });

    } catch (error) {
      logger.logError(error, { 
        context: 'Local model question generation failed',
        requestBody: req.body 
      });

      // Check if it's an API key issue
      if (error.message.includes('Hugging Face API key')) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
          message: 'Hugging Face API key is required for model access',
          instructions: 'Add HUGGINGFACE_API_KEY to your .env file',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to generate questions with local model',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Test a specific model
   */
  async testModel(req, res) {
    try {
      // Validate request body
      const { error, value } = testModelSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message),
        });
      }

      const { model } = value;

      logger.info('Model test request received', { model });

      // Test the model
      const testResult = await localModelService.testModel(model);

      res.json({
        success: true,
        data: testResult,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { 
        context: 'Model test failed',
        requestBody: req.body 
      });

      res.status(500).json({
        success: false,
        error: 'Model test failed',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get available models and their info
   */
  async getModels(req, res) {
    try {
      const models = localModelService.getRecommendedModels();
      
      // Add status info for each model
      const modelsWithStatus = {};
      for (const [key, model] of Object.entries(models)) {
        try {
          const modelInfo = await localModelService.getModelInfo(key);
          modelsWithStatus[key] = modelInfo;
        } catch (error) {
          modelsWithStatus[key] = {
            ...model,
            available: false,
            error: error.message,
          };
        }
      }

      res.json({
        success: true,
        data: {
          models: modelsWithStatus,
          recommended: Object.keys(models).filter(key => models[key].recommended),
          totalCount: Object.keys(models).length,
        },
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Failed to get models info' });

      res.status(500).json({
        success: false,
        error: 'Failed to get models information',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get model info for a specific model
   */
  async getModelInfo(req, res) {
    try {
      const { modelName } = req.params;

      if (!modelName) {
        return res.status(400).json({
          success: false,
          error: 'Model name is required',
        });
      }

      const modelInfo = await localModelService.getModelInfo(modelName);

      res.json({
        success: true,
        data: modelInfo,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { 
        context: 'Failed to get model info',
        modelName: req.params.modelName 
      });

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Model not found',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get model information',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Health check for local model service
   */
  async healthCheck(req, res) {
    try {
      const healthResult = await localModelService.healthCheck();
      
      const statusCode = healthResult.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: healthResult.status === 'healthy',
        data: healthResult,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Local model health check failed' });

      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: config.isDevelopment() ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Quick test endpoint for development
   */
  async quickTest(req, res) {
    try {
      const testTopics = ['JavaScript', 'Python', 'React', 'Node.js', 'HTML'];
      const randomTopic = testTopics[Math.floor(Math.random() * testTopics.length)];

      logger.info('Quick test started', { topic: randomTopic });

      const result = await localModelService.generateQuestions(randomTopic, {
        model: 'flan-t5-small', // Use smallest model for quick test
        count: 2,
        difficulty: 'medium',
      });

      res.json({
        success: true,
        message: `Quick test completed with topic: ${randomTopic}`,
        data: result,
        metadata: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          testTopic: randomTopic,
        },
      });

    } catch (error) {
      logger.logError(error, { context: 'Quick test failed' });

      res.status(500).json({
        success: false,
        error: 'Quick test failed',
        message: config.isDevelopment() ? error.message : 'Internal server error',
        instructions: error.message.includes('API key') ? 
          'Please add HUGGINGFACE_API_KEY to your .env file' : null,
      });
    }
  }
}

export default new LocalModelController();
