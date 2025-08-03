import { jest } from '@jest/globals';

describe('Basic Test Setup', () => {
  it('should run basic Jest test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('hello world');
    expect(result).toBe('hello world');
  });

  it('should support Jest mocks', () => {
    const mockFn = jest.fn().mockReturnValue('mocked');
    const result = mockFn();
    
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('mocked');
  });

  it('should support ES modules', () => {
    const testObject = {
      name: 'test',
      getValue: () => 'test value'
    };

    expect(testObject.name).toBe('test');
    expect(testObject.getValue()).toBe('test value');
  });
});
