module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Transform files
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  
  // Test file patterns
  testRegex: '.*\\.spec\\.ts$',
  
  // Root directory
  rootDir: './src',
  
  // Module paths
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform ignore patterns for faker
  transformIgnorePatterns: [
    '/node_modules/(?!(@faker-js/faker)/)',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/../test/setup/jest.setup.ts'],
  
  // Coverage configuration
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
  ],
  
  // Coverage directory
  coverageDirectory: '../coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 30000,
  
  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Module path ignore patterns
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};