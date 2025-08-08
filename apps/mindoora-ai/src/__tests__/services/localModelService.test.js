import { jest } from '@jest/globals';
import path from 'path';

// Mock fs module functions
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();

// Mock logger functions
const mockLoggerInfo = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerError = jest.fn();

// Use ES module mocking with proper Node.js module handling
jest.unstable_mockModule('fs', () => ({
  default: {
    existsSync: mockExistsSync,
    mkdirSync: mockMkdirSync,
  },
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
}));

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  }
}));

jest.unstable_mockModule('../../services/cacheService.js', () => ({
  default: {
    generateKey: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  }
}));

// Import after mocking
const localModelService = (await import('../../services/localModelService.js')).default;

const mockModelsDirectory = path.join(process.cwd(), 'models');

beforeEach(() => {
  jest.clearAllMocks();
  mockExistsSync.mockImplementation((filePath) => filePath.includes('config.json'));
  mockMkdirSync.mockImplementation(() => {});
});

describe('LocalModelService', () => {

  test('should create models directory if it does not exist', () => {
    mockExistsSync.mockReturnValueOnce(false);
    localModelService.ensureModelsDirectory();
    expect(mockMkdirSync).toHaveBeenCalledWith(mockModelsDirectory, { recursive: true });
    expect(mockLoggerInfo).toHaveBeenCalledWith('Created models directory:', mockModelsDirectory);
  });

  test('should initialize available local models', () => {
    localModelService.initializeLocalModels();
    const availableModels = localModelService.getAvailableModels();
    // The service now includes xenova models that are mocked as available
    expect(availableModels).toEqual({
      'gpt2': expect.any(Object),
      'distilgpt2': expect.any(Object),
      'flan-t5-small': expect.any(Object),
      'xenova-distilgpt2': expect.any(Object),
      'xenova-gpt2': expect.any(Object),
      'xenova-t5-small': expect.any(Object)
    });
  });

  test('should generate fallback questions when no models are available', async () => {
    // Test fallback questions directly
    const result = localModelService.generateFallbackQuestions('JavaScript', 3, 'medium');
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.metadata.provider).toBe('fallback-mock');
  });

  test('should try to use local models for question generation', async () => {
    const result = await localModelService.generateQuestions('JavaScript', { count: 3 });
    expect(result.questions.length).toBeGreaterThan(0);
    // The provider name should be 'local-ai' when using real models, or 'local-intelligent' when falling back
    expect(['local-ai', 'local-intelligent']).toContain(result.metadata.provider);
  });

  test('should log warnings and errors if all models fail', async () => {
    jest.spyOn(localModelService, 'generateWithLocalModel').mockRejectedValue(new Error('Model failed'));
    const result = await localModelService.generateQuestions('JavaScript', { count: 3 });
    // The service now has 6 available models (including xenova models), not 3
    expect(mockLoggerWarn).toHaveBeenCalledWith('All 6 local models failed, generating fallback questions');
    expect(mockLoggerError).toHaveBeenCalled();
    expect(result.metadata.provider).toBe('fallback-mock');
  });
});
