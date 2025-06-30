/** @type {import('jest').Config} */
export default {
  // ============================================================================
  // BASIC CONFIGURATION
  // ============================================================================
  
  displayName: 'podAI Platform Test Suite',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // ============================================================================
  // WORKSPACE & PROJECT STRUCTURE
  // ============================================================================
  
  projects: [
    {
      displayName: 'CLI',
      testMatch: ['<rootDir>/packages/cli/**/*.{test,spec}.{js,ts,tsx}'],
    },
    {
      displayName: 'SDK TypeScript',
      testMatch: ['<rootDir>/packages/sdk-typescript/**/*.{test,spec}.{js,ts,tsx}'],
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}'],
    },
  ],
  
  // ============================================================================
  // MODULE RESOLUTION
  // ============================================================================
  
  moduleNameMapper: {
    '^@podai/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@podai/sdk-typescript/(.*)$': '<rootDir>/packages/sdk-typescript/src/$1',
    '^@podai/cli/(.*)$': '<rootDir>/packages/cli/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    '^@helpers/(.*)$': '<rootDir>/tests/helpers/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  
  // ============================================================================
  // FILE PATTERNS & MATCHING
  // ============================================================================
  
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.{js,ts,tsx}',
    '<rootDir>/packages/**/*.{test,spec}.{js,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}',
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/target/',
    '/.next/',
    '/coverage/',
  ],
  
  // ============================================================================
  // TYPESCRIPT & TRANSFORM CONFIGURATION
  // ============================================================================
  
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
        },
      },
    ],
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@solana|@coral-xyz|@lightprotocol))',
  ],
  
  // ============================================================================
  // ENVIRONMENT & GLOBALS
  // ============================================================================
  
  testEnvironment: 'node',
  
  globals: {
    'ts-jest': {
      useESM: true,
    },
    __SOLANA_NETWORK__: 'localnet',
    __ANCHOR_PROGRAM_ID__: 'HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps',
    __TEST_ENV__: 'jest',
    __AI_TESTING__: true,
  },
  
  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================
  
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts',
  ],
  
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.{js,ts,tsx}',
    '!packages/*/src/**/*.spec.{js,ts,tsx}',
    '!packages/*/src/**/__tests__/**',
    '!packages/*/src/**/generated/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // ============================================================================
  // REPORTING & OUTPUT
  // ============================================================================
  
  testTimeout: 30000,
  maxWorkers: '50%',
  
  verbose: process.env.CI === 'true',
  bail: process.env.CI === 'true' ? 1 : 0,
  
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}; 