import { jest } from '@jest/globals';

// Mock configuration to prevent actual API calls
const mockConfig = {
  openai: { apiKey: undefined }, // No API key to prevent actual calls
  huggingface: { apiKey: undefined },
  googleAI: { apiKey: undefined },
  ai: {
    defaultProvider: 'local', // Use local provider to avoid API calls
    fallbackProvider: 'local',
    maxQuestionsPerRequest: 10
  },
  nodeEnv: 'test',
  logLevel: 'info',
  isProduction: () => false,
  isDevelopment: () => false,
  isTest: () => true
};

// Mock cache service
const mockCacheService = {
  generateKey: jest.fn().mockReturnValue('test-cache-key'),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
};

// Mock local model service
const mockLocalModelService = {
  generateQuestions: jest.fn().mockResolvedValue({
    questions: [
      {
        id: 'local-1',
        question: 'What is AI?',
        category: 'conceptual',
        correctAnswer: 'A',
        options: { A: 'Smart computer', B: 'Robot', C: 'Algorithm', D: 'Database' },
        difficulty: 'medium',
        explanation: 'AI refers to smart computer systems.',
        topic: 'artificial intelligence'
      }
    ],
    metadata: { provider: 'local-intelligent', cached: false, model: 'gpt2' }
  }),
  generateFallbackQuestions: jest.fn().mockReturnValue({
    questions: [
      {
        id: 'fallback-1',
        question: 'Fallback question?',
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'medium'
      }
    ],
    metadata: { provider: 'fallback', cached: false }
  })
};

// Use proper ES module mocking
jest.unstable_mockModule('../../config/index.js', () => ({
  default: mockConfig
}));

jest.unstable_mockModule('../../services/cacheService.js', () => ({
  default: mockCacheService
}));

jest.unstable_mockModule('../../services/localModelService.js', () => ({
  default: mockLocalModelService
}));

// Mock T5 service to prevent API calls
jest.unstable_mockModule('../../services/t5QuestionService.js', () => ({
  default: {
    generateQuestions: jest.fn().mockRejectedValue(new Error('No API key')),
    healthCheck: jest.fn().mockResolvedValue({ status: 'unavailable', error: 'No API key' })
  }
}));

// Import after mocking
const aiProviderService = (await import('../../services/aiProviderService.js')).default;

describe('AIProviderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQuestions', () => {
    it('should generate questions with default options', async () => {
      const result = await aiProviderService.generateQuestions('artificial intelligence');

      expect(result).toBeDefined();
      expect(result.questions).toBeDefined();
      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.provider).toBeDefined();
    });

    it('should use cached results when available', async () => {
      const cachedResult = {
        questions: [
          {
            id: 'cached-1',
            question: 'Cached question?',
            category: 'conceptual',
            correctAnswer: 'A',
            options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
            difficulty: 'medium'
          }
        ],
        metadata: { provider: 'cache', cached: true }
      };

      mockCacheService.get.mockResolvedValueOnce(cachedResult);

      const result = await aiProviderService.generateQuestions('test prompt');

      expect(result).toEqual(cachedResult);
      expect(mockCacheService.get).toHaveBeenCalledWith('test-cache-key');
    });

    it('should handle provider errors and fall back to local service', async () => {
      // Since we configured no API keys, it should fall back to local service
      const result = await aiProviderService.generateQuestions('test prompt');

      expect(result).toBeDefined();
      expect(result.questions).toBeDefined();
      expect(Array.isArray(result.questions)).toBe(true);
      expect(mockLocalModelService.generateQuestions).toHaveBeenCalled();
    });

    it('should validate question count limits', async () => {
      const result = await aiProviderService.generateQuestions('test prompt', {
        count: 10,
        difficulty: 'hard',
        questionTypes: ['true-false']
      });

      expect(result).toBeDefined();
      expect(result.questions).toBeDefined();
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const providers = aiProviderService.getAvailableProviders();
      
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeContent', () => {
    it('should analyze content using default provider', async () => {
      // Since we have no API keys configured, analyzeContent will fall back to generateQuestions
      const result = await aiProviderService.analyzeContent('This is a text about artificial intelligence.');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The result should contain questions and metadata since it falls back to question generation
      expect(result).toHaveProperty('questions');
      expect(result).toHaveProperty('metadata');
      expect(Array.isArray(result.questions)).toBe(true);
    });
  });

  describe('healthCheck', () => {
    it('should return health status for all providers', async () => {
      const result = await aiProviderService.healthCheck();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // Each provider should have a status
      Object.values(result).forEach(providerHealth => {
        expect(providerHealth).toHaveProperty('status');
        expect(['healthy', 'unhealthy', 'unavailable']).toContain(providerHealth.status);
      });
    });
  });
});
