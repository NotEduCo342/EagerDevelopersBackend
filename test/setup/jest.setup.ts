import 'jest-extended';
import { jest } from '@jest/globals';

// Global test configuration
beforeAll(() => {
  // Set timezone for consistent date testing
  process.env.TZ = 'UTC';
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Reset all mocks after each test
  jest.resetAllMocks();
});

// Global test utilities
global.testTimeout = (timeout: number) => {
  jest.setTimeout(timeout);
};

// Mock console methods in test environment
global.console = {
  ...console,
  // Uncomment to silence console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};