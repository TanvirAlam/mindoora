import { jest } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  
  // Disable console logs during tests (except errors)
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep error logs for debugging
  };
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Custom matchers or global utilities can be added here
global.testTimeout = (ms = 5000) => new Promise(resolve => setTimeout(resolve, ms));
