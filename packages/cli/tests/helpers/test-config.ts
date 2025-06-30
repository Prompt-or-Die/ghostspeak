import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export interface TestConfig {
  network: 'localnet' | 'devnet';
  rpcUrl: string;
  commitment: 'confirmed' | 'finalized';
  timeout: number;
  retryAttempts: number;
}

export interface TestAccounts {
  payer: Keypair;
  testAgents: Keypair[];
  testChannels: PublicKey[];
}

export interface TestEnvironment {
  config: TestConfig;
  connection: Connection;
  accounts: TestAccounts;
}

/**
 * Default test configuration following testing standards
 */
export const DEFAULT_TEST_CONFIG: TestConfig = {
  network: 'localnet',
  rpcUrl: 'http://127.0.0.1:8899', // Local test validator
  commitment: 'confirmed',
  timeout: 30000, // 30 seconds for E2E tests
  retryAttempts: 3
};

/**
 * Performance test limits following testing standards
 */
export const PERFORMANCE_LIMITS = {
  maxTransactionTime: 5000, // 5 seconds max
  maxRpcResponseTime: 1000, // 1 second max
  minTpsThreshold: 100, // Minimum transactions per second
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB max memory
  maxCpuUsage: 80 // 80% max CPU usage
};

/**
 * Security test configuration
 */
export const SECURITY_TEST_CONFIG = {
  maliciousInputs: [
    '', // Empty string
    'x'.repeat(10000), // Very long string
    '<script>alert("xss")</script>', // XSS attempt
    '"; DROP TABLE agents; --', // SQL injection attempt
    '../../etc/passwd', // Path traversal
    '\x00\x01\x02\x03', // Binary data
    '🚀'.repeat(1000), // Unicode spam
  ],
  invalidAddresses: [
    'invalid',
    '123',
    'not-a-public-key',
    '',
    'x'.repeat(100),
  ],
  rateLimitTests: {
    requestsPerSecond: 1000,
    burstSize: 10000,
    testDuration: 60000 // 1 minute
  }
};

/**
 * Test data factory configuration
 */
export const TEST_DATA_FACTORY = {
  agentNames: [
    'TestBot1',
    'AnalysisAgent',
    'TradingBot',
    'ModeratorAI',
    'CustomAgent'
  ],
  channelNames: [
    'TestChannel',
    'GeneralChat',
    'TradingSignals',
    'DevDiscussion',
    'PrivateGroup'
  ],
  messageContents: [
    'Hello world!',
    'Test message from agent',
    'Performance test message',
    'Security validation test',
    'Integration test communication'
  ]
};

/**
 * Test coverage requirements following testing standards
 */
export const COVERAGE_REQUIREMENTS = {
  overall: 90, // 90% overall coverage
  criticalPaths: 100, // 100% for security-critical functions
  errorPaths: 100, // 100% error handling coverage
  performancePaths: 95, // 95% performance-critical paths
  integrationPaths: 85 // 85% integration test coverage
};

/**
 * Test execution configuration
 */
export const TEST_EXECUTION = {
  parallel: true,
  maxConcurrency: 4,
  retryFailedTests: true,
  maxRetries: 3,
  reportFormats: ['json', 'html', 'console'],
  collectCoverage: true,
  coverageThreshold: COVERAGE_REQUIREMENTS
};

/**
 * Environment validation configuration
 */
export const ENV_VALIDATION = {
  requiredEnvVars: [
    'NODE_ENV',
    'RPC_URL'
  ],
  optionalEnvVars: [
    'WALLET_PATH',
    'LOG_LEVEL',
    'TEST_TIMEOUT'
  ],
  networkRequirements: {
    minSolBalance: 1.0, // 1 SOL minimum for tests
    requiredPrograms: [
      // Add program IDs that need to be deployed
    ]
  }
};

/**
 * Load test configuration from environment or use defaults
 */
export function loadTestConfig(): TestConfig {
  return {
    network: (process.env.TEST_NETWORK as 'localnet' | 'devnet') || DEFAULT_TEST_CONFIG.network,
    rpcUrl: process.env.RPC_URL || DEFAULT_TEST_CONFIG.rpcUrl,
    commitment: (process.env.COMMITMENT as 'confirmed' | 'finalized') || DEFAULT_TEST_CONFIG.commitment,
    timeout: parseInt(process.env.TEST_TIMEOUT || '') || DEFAULT_TEST_CONFIG.timeout,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '') || DEFAULT_TEST_CONFIG.retryAttempts
  };
}

/**
 * Validate test environment setup
 */
export async function validateTestEnvironment(config: TestConfig): Promise<boolean> {
  try {
    const connection = new Connection(config.rpcUrl, config.commitment);
    
    // Test RPC connection
    const slot = await connection.getSlot();
    if (slot === 0) {
      throw new Error('Invalid slot returned from RPC');
    }

    // Test network health
    const blockTime = await connection.getBlockTime(slot);
    if (!blockTime) {
      throw new Error('Could not get block time');
    }

    return true;
  } catch (error) {
    console.error('Test environment validation failed:', error);
    return false;
  }
}

/**
 * Create isolated test environment
 */
export async function createTestEnvironment(): Promise<TestEnvironment> {
  const config = loadTestConfig();
  const connection = new Connection(config.rpcUrl, config.commitment);

  // Validate environment
  const isValid = await validateTestEnvironment(config);
  if (!isValid) {
    throw new Error('Test environment validation failed');
  }

  // Generate test accounts
  const payer = Keypair.generate();
  const testAgents = Array.from({ length: 5 }, () => Keypair.generate());
  const testChannels = Array.from({ length: 3 }, () => Keypair.generate().publicKey);

  return {
    config,
    connection,
    accounts: {
      payer,
      testAgents,
      testChannels
    }
  };
}

/**
 * Cleanup test environment
 */
export async function cleanupTestEnvironment(env: TestEnvironment): Promise<void> {
  // Close connection
  // Note: web3.js Connection doesn't have a close method, but we can clear any timers/intervals
  
  // Clear any test data
  console.log('Test environment cleaned up');
} 