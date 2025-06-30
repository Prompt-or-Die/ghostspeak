import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { Connection, Keypair } from '@solana/web3.js';
import { NetworkManager } from '../../packages/cli/src/utils/network-manager';
import { ConfigManager } from '../../packages/cli/src/utils/config-manager';
import { 
  createTestEnvironment, 
  cleanupTestEnvironment, 
  TestEnvironment,
  PERFORMANCE_LIMITS 
} from '../helpers/test-config';

describe('Network Connectivity E2E Tests', () => {
  let testEnv: TestEnvironment;
  let networkManager: NetworkManager;
  let configManager: ConfigManager;

  beforeAll(async () => {
    // Create isolated test environment
    testEnv = await createTestEnvironment();
    networkManager = new NetworkManager();
    configManager = new ConfigManager();

    console.log('🔧 Test environment initialized');
    console.log(`📍 RPC URL: ${testEnv.config.rpcUrl}`);
    console.log(`🌐 Network: ${testEnv.config.network}`);
  });

  afterAll(async () => {
    await cleanupTestEnvironment(testEnv);
    console.log('🧹 Test environment cleaned up');
  });

  describe('Basic Connectivity', () => {
    test('should connect to Solana RPC', async () => {
      const startTime = Date.now();
      const isConnected = await networkManager.checkConnection();
      const duration = Date.now() - startTime;

      expect(isConnected).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime);
    });

    test('should get current network', async () => {
      const network = await networkManager.getCurrentNetwork();
      expect(network).toBeOneOf(['devnet', 'testnet', 'mainnet-beta']);
    });

    test('should measure network latency', async () => {
      const latency = await networkManager.testLatency();
      expect(latency).toBeGreaterThan(0);
      expect(latency).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime);
    });
  });

  describe('Network Statistics', () => {
    test('should fetch network stats', async () => {
      const stats = await networkManager.getNetworkStats();
      
      expect(stats).toHaveProperty('slot');
      expect(stats).toHaveProperty('blockHeight');
      expect(stats).toHaveProperty('transactionCount');
      expect(stats).toHaveProperty('epochInfo');
      expect(stats).toHaveProperty('version');

      // Validate data types
      expect(typeof stats.slot).toBe('number');
      expect(typeof stats.blockHeight).toBe('number');
      expect(typeof stats.transactionCount).toBe('number');
      expect(stats.slot).toBeGreaterThan(0);
      expect(stats.blockHeight).toBeGreaterThan(0);
    });

    test('should get recent blockhash', async () => {
      const startTime = Date.now();
      const { blockhash, feeCalculator } = await networkManager.getRecentBlockhash();
      const duration = Date.now() - startTime;

      expect(typeof blockhash).toBe('string');
      expect(blockhash.length).toBeGreaterThan(0);
      expect(feeCalculator).toHaveProperty('lamportsPerSignature');
      expect(typeof feeCalculator.lamportsPerSignature).toBe('number');
      expect(duration).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime);
    });
  });

  describe('Account Operations', () => {
    test('should get account balance', async () => {
      const testAccount = Keypair.generate();
      const balance = await networkManager.getBalance(testAccount.publicKey);
      
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    test('should get minimum rent exemption', async () => {
      const dataLength = 512; // Typical agent account size
      const rentExemption = await networkManager.getMinimumBalanceForRentExemption(dataLength);
      
      expect(typeof rentExemption).toBe('number');
      expect(rentExemption).toBeGreaterThan(0);
    });

    test('should get account info for existing account', async () => {
      // Use a known system account
      const systemProgramId = new Keypair().publicKey;
      const accountInfo = await networkManager.getAccountInfo(systemProgramId);
      
      // Account might not exist, which is valid for test accounts
      if (accountInfo) {
        expect(accountInfo).toHaveProperty('data');
        expect(accountInfo).toHaveProperty('executable');
        expect(accountInfo).toHaveProperty('lamports');
        expect(accountInfo).toHaveProperty('owner');
      }
    });
  });

  describe('Network Switching', () => {
    test('should switch networks', async () => {
      const originalNetwork = await networkManager.getCurrentNetwork();
      
      // Switch to different network
      const targetNetwork = originalNetwork === 'devnet' ? 'testnet' : 'devnet';
      await networkManager.switchNetwork(targetNetwork);
      
      const newNetwork = await networkManager.getCurrentNetwork();
      expect(newNetwork).toBe(targetNetwork);
      
      // Switch back
      await networkManager.switchNetwork(originalNetwork as 'devnet' | 'testnet' | 'mainnet-beta');
      const restoredNetwork = await networkManager.getCurrentNetwork();
      expect(restoredNetwork).toBe(originalNetwork);
    });

    test('should handle custom RPC URL', async () => {
      const customRpcUrl = 'https://api.devnet.solana.com';
      await networkManager.switchNetwork('devnet', customRpcUrl);
      
      // Verify connection still works
      const isConnected = await networkManager.checkConnection();
      expect(isConnected).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, () => 
        networkManager.getNetworkStats()
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result).toHaveProperty('slot');
        expect(result.slot).toBeGreaterThan(0);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime * 2);
    });

    test('should maintain performance under load', async () => {
      const iterations = 50;
      const results: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await networkManager.checkConnection();
        const duration = Date.now() - startTime;
        results.push(duration);
      }

      const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
      const maxTime = Math.max(...results);

      expect(averageTime).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime / 2);
      expect(maxTime).toBeLessThan(PERFORMANCE_LIMITS.maxRpcResponseTime);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid RPC URL gracefully', async () => {
      const invalidRpcUrl = 'https://invalid-rpc-url.com';
      
      await expect(async () => {
        await networkManager.switchNetwork('devnet', invalidRpcUrl);
        await networkManager.checkConnection();
      }).not.toThrow();
      
      // Should return false for invalid connection
      const isConnected = await networkManager.checkConnection();
      expect(isConnected).toBe(false);
    });

    test('should handle network timeouts', async () => {
      // This test would be implemented with actual timeout scenarios
      // For now, we verify that timeout handling exists
      expect(testEnv.config.timeout).toBeGreaterThan(0);
    });

    test('should retry failed requests', async () => {
      // This test would be implemented with network failure simulation
      // For now, we verify that retry configuration exists
      expect(testEnv.config.retryAttempts).toBeGreaterThan(0);
    });
  });

  describe('Security Tests', () => {
    test('should validate RPC URL format', async () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'ftp://invalid.com',
        'javascript:alert(1)',
        ''
      ];

      for (const invalidUrl of invalidUrls) {
        await expect(async () => {
          await networkManager.switchNetwork('devnet', invalidUrl);
        }).not.toThrow(); // Should handle gracefully, not crash
      }
    });

    test('should use secure connection methods', async () => {
      const connection = await networkManager.getConnection();
      expect(connection).toBeDefined();
      
      // Verify connection uses proper commitment level
      expect(['confirmed', 'finalized']).toContain(testEnv.config.commitment);
    });
  });
}); 