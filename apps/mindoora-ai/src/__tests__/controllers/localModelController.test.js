import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
const mockLocalModelService = {
  generateQuestions: jest.fn(),
  testModel: jest.fn(),
  getRecommendedModels: jest.fn(),
  getModelInfo: jest.fn(),
  healthCheck: jest.fn()
};

const mockConfig = {
  isDevelopment: jest.fn().mockReturnValue(true)
};

const mockLogger = {
  info: jest.fn(),
  logError: jest.fn()
};

// Mock modules using ES module mocking
jest.unstable_mockModule('../../services/localModelService.js', () => ({
  default: mockLocalModelService
}));

jest.unstable_mockModule('../../config/index.js', () => ({
  default: mockConfig
}));

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: mockLogger
}));

// Import after mocking
const localModelController = (await import('../../controllers/localModelController.js')).default;

// Setup Express app for testing
const app = express();
app.use(express.json());

// Add request ID middleware for testing
app.use((req, res, next) => {
  req.id = 'test-request-id';
  next();
});

// Setup routes
app.post('/generate', localModelController.generateQuestions.bind(localModelController));
app.post('/test', localModelController.testModel.bind(localModelController));
app.get('/models', localModelController.getModels.bind(localModelController));
app.get('/models/:modelName', localModelController.getModelInfo.bind(localModelController));
app.get('/health', localModelController.healthCheck.bind(localModelController));
app.get('/quick-test', localModelController.quickTest.bind(localModelController));

describe('LocalModelController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /generate', () => {
    it('should generate questions successfully', async () => {
      const mockResult = {
        questions: ['Question 1?', 'Question 2?', 'Question 3?'],
        metadata: {
          model: 'flan-t5-small',
          duration: 1500,
          provider: 'huggingface-local'
        }
      };

      mockLocalModelService.generateQuestions.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'JavaScript fundamentals',
          model: 'flan-t5-small',
          count: 3,
          difficulty: 'medium',
          focusArea: 'variables'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(response.body.metadata.provider).toBe('huggingface-local');
      expect(mockLocalModelService.generateQuestions).toHaveBeenCalledWith('JavaScript fundamentals', {
        model: 'flan-t5-small',
        count: 3,
        difficulty: 'medium',
        focusArea: 'variables'
      });
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'ab', // Too short
          count: 15    // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
      // Joi validates in order, so we should see the prompt error first
      expect(response.body.details).toContain('Prompt must be at least 3 characters long');
    });

    it('should handle count validation errors', async () => {
      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Valid prompt here',
          count: 15    // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toContain('Count cannot exceed 10');
    });

    it('should handle missing prompt', async () => {
      const response = await request(app)
        .post('/generate')
        .send({
          model: 'flan-t5-small'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Prompt is required');
    });

    it('should handle invalid model', async () => {
      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt',
          model: 'invalid-model'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Model must be one of: flan-t5-base, flan-t5-small, gpt2, distilgpt2');
    });

    it('should handle API key errors', async () => {
      mockLocalModelService.generateQuestions.mockRejectedValue(
        new Error('Hugging Face API key is required')
      );

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('API key required');
      expect(response.body.instructions).toBe('Add HUGGINGFACE_API_KEY to your .env file');
    });

    it('should handle service errors', async () => {
      mockLocalModelService.generateQuestions.mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to generate questions with local model');
      expect(mockLogger.logError).toHaveBeenCalled();
    });
  });

  describe('POST /test', () => {
    it('should test model successfully', async () => {
      const mockTestResult = {
        model: 'flan-t5-small',
        status: 'available',
        responseTime: 150,
        testQuestion: 'What is JavaScript?'
      };

      mockLocalModelService.testModel.mockResolvedValue(mockTestResult);

      const response = await request(app)
        .post('/test')
        .send({
          model: 'flan-t5-small'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTestResult);
      expect(mockLocalModelService.testModel).toHaveBeenCalledWith('flan-t5-small');
    });

    it('should handle validation errors for test', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          model: 'invalid-model'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle test model errors', async () => {
      mockLocalModelService.testModel.mockRejectedValue(
        new Error('Model test failed')
      );

      const response = await request(app)
        .post('/test')
        .send({
          model: 'flan-t5-small'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Model test failed');
    });
  });

  describe('GET /models', () => {
    it('should get models successfully', async () => {
      const mockModels = {
        'flan-t5-small': {
          name: 'FLAN-T5 Small',
          description: 'A smaller version of FLAN-T5',
          recommended: true
        },
        'gpt2': {
          name: 'GPT-2',
          description: 'OpenAI GPT-2 model',
          recommended: false
        }
      };

      const mockModelInfo = {
        name: 'FLAN-T5 Small',
        available: true,
        size: '250MB'
      };

      mockLocalModelService.getRecommendedModels.mockReturnValue(mockModels);
      mockLocalModelService.getModelInfo.mockResolvedValue(mockModelInfo);

      const response = await request(app).get('/models');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toBeDefined();
      expect(response.body.data.recommended).toBeDefined();
      expect(response.body.data.totalCount).toBe(2);
    });

    it('should handle models with errors', async () => {
      const mockModels = {
        'flan-t5-small': {
          name: 'FLAN-T5 Small',
          recommended: true
        }
      };

      mockLocalModelService.getRecommendedModels.mockReturnValue(mockModels);
      mockLocalModelService.getModelInfo.mockRejectedValue(
        new Error('Model not available')
      );

      const response = await request(app).get('/models');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.models['flan-t5-small'].available).toBe(false);
      expect(response.body.data.models['flan-t5-small'].error).toBe('Model not available');
    });

    it('should handle get models service error', async () => {
      mockLocalModelService.getRecommendedModels.mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app).get('/models');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get models information');
    });
  });

  describe('GET /models/:modelName', () => {
    it('should get model info successfully', async () => {
      const mockModelInfo = {
        name: 'FLAN-T5 Small',
        available: true,
        size: '250MB',
        description: 'Small version of FLAN-T5'
      };

      mockLocalModelService.getModelInfo.mockResolvedValue(mockModelInfo);

      const response = await request(app).get('/models/flan-t5-small');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockModelInfo);
      expect(mockLocalModelService.getModelInfo).toHaveBeenCalledWith('flan-t5-small');
    });

    it('should handle missing model name', async () => {
      const response = await request(app).get('/models/');

      // Express returns 500 for missing route params when the route exists but param validation fails
      expect(response.status).toBe(500);
    });

    it('should handle model not found', async () => {
      mockLocalModelService.getModelInfo.mockRejectedValue(
        new Error('Model not found')
      );

      const response = await request(app).get('/models/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Model not found');
    });

    it('should handle model info service error', async () => {
      mockLocalModelService.getModelInfo.mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).get('/models/flan-t5-small');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get model information');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const mockHealthResult = {
        status: 'healthy',
        models: ['flan-t5-small', 'gpt2'],
        timestamp: new Date().toISOString()
      };

      mockLocalModelService.healthCheck.mockResolvedValue(mockHealthResult);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockHealthResult);
    });

    it('should return unhealthy status', async () => {
      const mockHealthResult = {
        status: 'unhealthy',
        errors: ['Model loading failed'],
        timestamp: new Date().toISOString()
      };

      mockLocalModelService.healthCheck.mockResolvedValue(mockHealthResult);

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toEqual(mockHealthResult);
    });

    it('should handle health check service error', async () => {
      mockLocalModelService.healthCheck.mockRejectedValue(
        new Error('Health check failed')
      );

      const response = await request(app).get('/health');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Health check failed');
    });
  });

  describe('GET /quick-test', () => {
    it('should run quick test successfully', async () => {
      const mockResult = {
        questions: ['Test question 1?', 'Test question 2?'],
        metadata: {
          model: 'flan-t5-small',
          duration: 800
        }
      };

      mockLocalModelService.generateQuestions.mockResolvedValue(mockResult);

      const response = await request(app).get('/quick-test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(response.body.metadata.testTopic).toBeDefined();
      expect(['JavaScript', 'Python', 'React', 'Node.js', 'HTML']).toContain(response.body.metadata.testTopic);
    });

    it('should handle quick test API key error', async () => {
      mockLocalModelService.generateQuestions.mockRejectedValue(
        new Error('API key required')
      );

      const response = await request(app).get('/quick-test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Quick test failed');
      expect(response.body.instructions).toBe('Please add HUGGINGFACE_API_KEY to your .env file');
    });

    it('should handle quick test service error', async () => {
      mockLocalModelService.generateQuestions.mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app).get('/quick-test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Quick test failed');
      expect(response.body.instructions).toBeNull();
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle long prompt validation', async () => {
      const longPrompt = 'a'.repeat(501); // Exceeds 500 character limit

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: longPrompt
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Prompt cannot exceed 500 characters');
    });

    it('should handle invalid difficulty', async () => {
      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt',
          difficulty: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Difficulty must be one of: beginner, medium, advanced');
    });

    it('should handle long focus area', async () => {
      const longFocusArea = 'a'.repeat(201); // Exceeds 200 character limit

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt',
          focusArea: longFocusArea
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Focus area cannot exceed 200 characters');
    });

    it('should apply default values correctly', async () => {
      const mockResult = {
        questions: ['Question 1?'],
        metadata: {
          model: 'flan-t5-small',
          duration: 1000
        }
      };

      mockLocalModelService.generateQuestions.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt'
        });

      expect(response.status).toBe(200);
      expect(mockLocalModelService.generateQuestions).toHaveBeenCalledWith('Test prompt', {
        model: 'flan-t5-small',  // default
        count: 3,               // default
        difficulty: 'medium',   // default
        focusArea: undefined    // not provided
      });
    });
  });

  describe('Error handling with production config', () => {
    beforeEach(() => {
      mockConfig.isDevelopment.mockReturnValue(false);
    });

    afterEach(() => {
      mockConfig.isDevelopment.mockReturnValue(true);
    });

    it('should hide error messages in production', async () => {
      mockLocalModelService.generateQuestions.mockRejectedValue(
        new Error('Detailed error message')
      );

      const response = await request(app)
        .post('/generate')
        .send({
          prompt: 'Test prompt'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });
});
