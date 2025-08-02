// Setup fetch mock for testing
require('jest-fetch-mock').enableMocks();

// Mock console.log to reduce test output noise
global.console = {
  ...console,
  // Uncomment to ignore specific console outputs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock React Native components if needed
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock @xenova/transformers since we're not using it anymore
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(),
}));
