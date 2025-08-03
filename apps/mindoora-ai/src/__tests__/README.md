# Mindoora AI Service - Test Suite

This directory contains comprehensive tests for the Mindoora AI service components.

## 🧪 Test Structure

```
src/__tests__/
├── setup.js                    # Global test setup and mocks
├── controllers/                # Controller tests
│   └── questionController.test.js
├── services/                   # Service layer tests
│   ├── aiProviderService.test.js
│   └── cacheService.test.js
├── middleware/                 # Middleware tests
│   └── middleware.test.js
├── utils/                      # Utility tests
│   └── logger.test.js
├── routes/                     # Route tests (to be added)
├── config/                     # Configuration tests (to be added)
└── README.md                   # This file
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Using the custom test script
./scripts/test.sh --coverage --verbose
```

### Test Script Options

```bash
# Run with coverage
./scripts/test.sh --coverage

# Run in watch mode
./scripts/test.sh --watch

# Run with verbose output
./scripts/test.sh --verbose

# Show help
./scripts/test.sh --help
```

## 🎯 Test Coverage

The test suite aims for:
- **70%** minimum coverage across all metrics
- **Functions**: 70%+
- **Lines**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- `coverage/coverage-final.json` - JSON coverage data

## 🛠 Test Configuration

### Jest Configuration (`jest.config.js`)
- ES modules support with Node.js environment
- Global setup and teardown
- Mock configuration for external services
- Coverage collection and thresholds
- 30-second test timeout

### Global Setup (`setup.js`)
- Environment variable configuration
- Console log suppression during tests
- Mock implementations for:
  - Google Generative AI
  - OpenAI
  - Redis (IORedis)
- Global test utilities

## 📝 Writing Tests

### Test Structure

```javascript
import { jest } from '@jest/globals';
import moduleToTest from '../../path/to/module.js';

// Mock external dependencies
jest.mock('../../external/dependency.js', () => ({
  someMethod: jest.fn().mockResolvedValue('mock value')
}));

describe('Module Under Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('specific functionality', () => {
    it('should behave correctly', async () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = await moduleToTest.someMethod(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**: Structure tests clearly
2. **Mock External Dependencies**: Use Jest mocks for external services
3. **Clear Test Names**: Describe what the test should do
4. **Test Both Success and Failure Cases**: Cover error scenarios
5. **Clean Up**: Use `beforeEach`/`afterEach` for test isolation
6. **Async/Await**: Handle promises properly in tests

### Common Mocks

```javascript
// Mock Express request/response
const mockReq = {
  body: {},
  params: {},
  query: {},
  headers: {},
  get: jest.fn()
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis()
};

// Mock AI service responses
const mockAIResponse = {
  questions: [
    {
      id: 'test-1',
      question: 'Test question?',
      type: 'multiple-choice',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      difficulty: 'medium'
    }
  ],
  metadata: { provider: 'test', cached: false }
};
```

## 🔍 Test Categories

### Unit Tests
- Individual functions and methods
- Service class methods
- Utility functions
- Middleware functions

### Integration Tests
- Controller endpoints
- Service interactions
- Database operations
- External API calls

### Mocking Strategy

- **External APIs**: Always mocked to avoid real API calls
- **Database**: Mocked for unit tests, real for integration tests
- **File System**: Mocked for consistency
- **Time**: Mocked for predictable tests

## 🚀 CI/CD Integration

Tests run automatically on:
- Push to main branch
- Pull requests to main branch
- Manual workflow dispatch

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Tests on Node.js 18.x
- Uploads coverage artifacts
- Fails CI if tests fail

## 📊 Test Debugging

### Common Issues

1. **ES Module Errors**: Ensure `NODE_OPTIONS=--experimental-vm-modules`
2. **Mock Issues**: Check mock paths are correct relative to test files
3. **Async Issues**: Use `async/await` properly in tests
4. **Timeout Issues**: Increase timeout for slow tests

### Debugging Commands

```bash
# Run specific test file
npm test -- --testPathPattern=questionController

# Run tests with debug output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="should generate questions"
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
