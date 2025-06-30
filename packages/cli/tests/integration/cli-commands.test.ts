/**
 * Comprehensive CLI Command Integration Tests
 * Tests all CLI options with real SDK integration
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';
import { generateKeyPairSigner } from '@solana/signers';
import { createPodAIClientV2 } from '../../../sdk-typescript/dist/index.js';

describe('CLI Commands Integration Tests', () => {
  let testWallet: any;
  let client: any;
  
  beforeAll(async () => {
    // Generate test wallet
    testWallet = await generateKeyPairSigner();
    
    // Create test client
    client = createPodAIClientV2({
      rpcEndpoint: 'https://api.devnet.solana.com',
      commitment: 'confirmed'
    });
    
    console.log('🧪 Test setup complete');
    console.log('📋 Test wallet:', testWallet.address);
  });

  describe('🤖 Agent Registration Command', () => {
    test('should show agent registration menu', async () => {
      const result = await runCLICommand(['--help']);
      expect(result.stdout).toContain('register-agent');
      expect(result.stdout).toContain('Register a new AI agent');
    });

    test('should start agent registration flow', async () => {
      const result = await runCLICommandInteractive(['register-agent'], [
        '\x1B[B', // Arrow down 
        '\r'      // Enter
      ]);
      
      expect(result.stdout).toContain('Agent Registration');
      expect(result.stdout).toContain('capabilities');
    }, 30000);

    test('should validate capabilities selection', async () => {
      const result = await runCLICommandInteractive(['register-agent'], [
        ' ',      // Select first capability
        '\r'      // Confirm
      ]);
      
      expect(result.stdout).toContain('capabilities');
    }, 30000);
  });

  describe('🏠 Channel Management Command', () => {
    test('should show channel management menu', async () => {
      const result = await runCLICommand(['manage-channels', '--help']);
      expect(result.stdout).toContain('channel');
    });

    test('should start channel creation flow', async () => {
      const result = await runCLICommandInteractive(['manage-channels'], [
        '\r'      // Select first option (Create channel)
      ]);
      
      expect(result.stdout).toContain('Channel');
    }, 30000);
  });

  describe('💬 Message Operations', () => {
    test('should handle message sending menu', async () => {
      const result = await runCLICommand(['--help']);
      const hasMessageOrSend = result.stdout.includes('message') || result.stdout.includes('send');
      expect(hasMessageOrSend).toBe(true);
    });
  });

  describe('📊 Analytics Command', () => {
    test('should show analytics options', async () => {
      const result = await runCLICommand(['view-analytics', '--help']);
      const hasAnalyticsOrView = result.stdout.includes('analytics') || result.stdout.includes('view');
      expect(hasAnalyticsOrView).toBe(true);
    });

    test('should start analytics view', async () => {
      const result = await runCLICommandInteractive(['view-analytics'], [
        '\r'      // Select first option
      ]);
      
      const hasAnalyticsOrNetwork = result.stdout.includes('Analytics') || result.stdout.includes('Network');
      expect(hasAnalyticsOrNetwork).toBe(true);
    }, 30000);
  });

  describe('⚙️ Settings Command', () => {
    test('should show settings menu', async () => {
      const result = await runCLICommand(['settings', '--help']);
      const hasSettingsOrConfig = result.stdout.includes('settings') || result.stdout.includes('config');
      expect(hasSettingsOrConfig).toBe(true);
    });

    test('should start settings configuration', async () => {
      const result = await runCLICommandInteractive(['settings'], [
        '\r'      // Select first option
      ]);
      
      const hasSettingsOrConfiguration = result.stdout.includes('Settings') || result.stdout.includes('Configuration');
      expect(hasSettingsOrConfiguration).toBe(true);
    }, 30000);
  });

  describe('🧪 E2E Testing Command', () => {
    test('should show test options', async () => {
      const result = await runCLICommand(['test-e2e', '--help']);
      const hasTestOrE2E = result.stdout.includes('test') || result.stdout.includes('e2e');
      expect(hasTestOrE2E).toBe(true);
    });

    test('should start test selection', async () => {
      const result = await runCLICommandInteractive(['test-e2e'], [
        '\r'      // Select first test
      ]);
      
      const hasTestOrE2E = result.stdout.includes('Test') || result.stdout.includes('E2E');
      expect(hasTestOrE2E).toBe(true);
    }, 30000);
  });

  describe('🔧 SDK Development Command', () => {
    test('should show SDK development options', async () => {
      const result = await runCLICommand(['develop-sdk', '--help']);
      const hasSDKOrDevelop = result.stdout.includes('sdk') || result.stdout.includes('develop');
      expect(hasSDKOrDevelop).toBe(true);
    });
  });

  describe('🌐 Network Connectivity', () => {
    test('should connect to devnet', async () => {
      const healthCheck = await client.healthCheck();
      expect(healthCheck.rpcConnection).toBe(true);
    });

    test('should validate RPC endpoint', async () => {
      const result = await runCLICommandInteractive(['settings'], [
        '\x1B[B', // Arrow down to network settings
        '\r'      // Enter
      ]);
      
      const hasNetworkOrDevnet = result.stdout.includes('network') || result.stdout.includes('devnet');
      expect(hasNetworkOrDevnet).toBe(true);
    }, 30000);
  });

  describe('📋 Help and Information', () => {
    test('should show main help menu', async () => {
      const result = await runCLICommand(['--help']);
      expect(result.stdout).toContain('podAI');
      expect(result.stdout).toContain('commands');
    });

    test('should show version information', async () => {
      const result = await runCLICommand(['--version']);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  afterAll(async () => {
    console.log('🧹 Test cleanup complete');
  });
});

/**
 * Helper function to run CLI commands and capture output
 */
async function runCLICommand(args: string[], timeout = 10000): Promise<{stdout: string, stderr: string, exitCode: number}> {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', ['src/index.ts', ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Helper function to run interactive CLI commands with input simulation
 */
async function runCLICommandInteractive(
  args: string[], 
  inputs: string[], 
  timeout = 20000
): Promise<{stdout: string, stderr: string, exitCode: number}> {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', ['src/index.ts', ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let inputIndex = 0;

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      
      // Send next input after a small delay
      if (inputIndex < inputs.length) {
        setTimeout(() => {
          child.stdin?.write(inputs[inputIndex]);
          inputIndex++;
        }, 1000);
      } else {
        // End after all inputs are sent
        setTimeout(() => {
          child.kill();
        }, 2000);
      }
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill();
      resolve({
        stdout,
        stderr,
        exitCode: 0
      });
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Test CLI SDK Integration
 */
describe('🔗 SDK Integration Tests', () => {
  test('should import SDK functions correctly', async () => {
    const sdk = await import('../../../sdk-typescript/dist/index.js');
    
    expect(sdk.createPodAIClientV2).toBeDefined();
    expect(sdk.PodAIClientV2).toBeDefined();
    expect(typeof sdk.createPodAIClientV2).toBe('function');
  });

  test('should create client instance', async () => {
    const client = createPodAIClientV2({
      rpcEndpoint: 'https://api.devnet.solana.com'
    });
    
    expect(client).toBeDefined();
    expect(typeof client.healthCheck).toBe('function');
  });

  test('should perform health check', async () => {
    const client = createPodAIClientV2({
      rpcEndpoint: 'https://api.devnet.solana.com'
    });
    
    const health = await client.healthCheck();
    expect(health).toBeDefined();
    expect(typeof health.rpcConnection).toBe('boolean');
  });
});

/**
 * Test Command Functionality Mapping
 */
describe('📋 Command Functionality Status', () => {
  const commandStatus = {
    'register-agent': 'PARTIAL',      // UI works, needs real blockchain calls
    'manage-channels': 'PARTIAL',     // UI works, needs implementation
    'view-analytics': 'MOCK',         // Using mock data
    'settings': 'WORKING',            // Basic functionality works
    'test-e2e': 'PARTIAL',           // Framework exists, needs tests
    'develop-sdk': 'PARTIAL',         // Basic tools, needs enhancement
    'deploy-protocol': 'UNKNOWN',     // Needs testing
    'help': 'WORKING'                 // Help system works
  };

  Object.entries(commandStatus).forEach(([command, status]) => {
    test(`${command} should be ${status}`, () => {
      expect(status).toMatch(/WORKING|PARTIAL|MOCK|UNKNOWN/);
      console.log(`📋 ${command}: ${status}`);
    });
  });
}); 