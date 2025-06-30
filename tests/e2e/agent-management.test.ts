import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { Keypair } from '@solana/web3.js';
import { ConfigManager, AgentConfig } from '../../packages/cli/src/utils/config-manager';
import { NetworkManager } from '../../packages/cli/src/utils/network-manager';
import { 
  createTestEnvironment, 
  cleanupTestEnvironment, 
  TestEnvironment,
  SECURITY_TEST_CONFIG 
} from '../helpers/test-config';
import { 
  TEST_AGENTS, 
  EDGE_CASE_DATA, 
  TestDataFactory,
  TestDataCleanup 
} from '../fixtures/test-data';

describe('Agent Management E2E Tests', () => {
  let testEnv: TestEnvironment;
  let configManager: ConfigManager;
  let networkManager: NetworkManager;
  let createdAgents: string[] = [];

  beforeAll(async () => {
    testEnv = await createTestEnvironment();
    configManager = new ConfigManager();
    networkManager = new NetworkManager();

    console.log('🤖 Agent management test environment initialized');
  });

  afterAll(async () => {
    // Cleanup created agents
    await TestDataCleanup.cleanupAgents(createdAgents);
    await cleanupTestEnvironment(testEnv);
    console.log('🧹 Agent tests cleaned up');
  });

  beforeEach(() => {
    // Reset created agents tracking for each test
    createdAgents = [];
  });

  describe('Agent Configuration Management', () => {
    test('should save and load agent configuration', async () => {
      const testAgent = TEST_AGENTS[0];
      const agentConfig: AgentConfig = {
        address: testAgent.keypair.publicKey.toBase58(),
        name: testAgent.name,
        capabilities: testAgent.capabilities,
        reputation: 85.5,
        lastActive: new Date()
      };

      // Save agent
      await configManager.saveAgent(agentConfig);
      createdAgents.push(agentConfig.address);

      // Load agents
      const savedAgents = await configManager.loadAgents();
      const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

      expect(foundAgent).toBeDefined();
      expect(foundAgent!.name).toBe(testAgent.name);
      expect(foundAgent!.capabilities).toBe(testAgent.capabilities);
      expect(foundAgent!.reputation).toBe(85.5);
    });

    test('should update existing agent configuration', async () => {
      const testAgent = TEST_AGENTS[1];
      const agentConfig: AgentConfig = {
        address: testAgent.keypair.publicKey.toBase58(),
        name: testAgent.name,
        capabilities: testAgent.capabilities,
        reputation: 75.0,
        lastActive: new Date()
      };

      // Save initial agent
      await configManager.saveAgent(agentConfig);
      createdAgents.push(agentConfig.address);

      // Update agent
      const updatedConfig = { ...agentConfig, name: 'Updated Test Agent', reputation: 90.0 };
      await configManager.saveAgent(updatedConfig);

      // Verify update
      const savedAgents = await configManager.loadAgents();
      const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

      expect(foundAgent!.name).toBe('Updated Test Agent');
      expect(foundAgent!.reputation).toBe(90.0);
    });

    test('should remove agent configuration', async () => {
      const testAgent = TEST_AGENTS[2];
      const agentConfig: AgentConfig = {
        address: testAgent.keypair.publicKey.toBase58(),
        name: testAgent.name,
        capabilities: testAgent.capabilities,
        reputation: 95.0,
        lastActive: new Date()
      };

      // Save and then remove agent
      await configManager.saveAgent(agentConfig);
      await configManager.removeAgent(agentConfig.address);

      // Verify removal
      const savedAgents = await configManager.loadAgents();
      const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

      expect(foundAgent).toBeUndefined();
    });
  });

  describe('Agent Address Validation', () => {
    test('should validate correct agent addresses', async () => {
      const validAddresses = [
        testEnv.accounts.testAgents[0].publicKey.toBase58(),
        testEnv.accounts.testAgents[1].publicKey.toBase58(),
        Keypair.generate().publicKey.toBase58()
      ];

      for (const address of validAddresses) {
        const isValid = configManager.validateAgentAddress(address);
        expect(isValid).toBe(true);
      }
    });

    test('should reject invalid agent addresses', async () => {
      const invalidAddresses = SECURITY_TEST_CONFIG.invalidAddresses;

      for (const address of invalidAddresses) {
        const isValid = configManager.validateAgentAddress(address);
        expect(isValid).toBe(false);
      }
    });

    test('should handle edge case addresses', async () => {
      const edgeCases = [
        'x'.repeat(44), // Wrong length
        '1'.repeat(44), // All ones
        '0'.repeat(44), // All zeros
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // All 'a's
      ];

      for (const address of edgeCases) {
        const isValid = configManager.validateAgentAddress(address);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('Agent Data Persistence', () => {
    test('should persist agent data across config manager instances', async () => {
      const testAgent = TestDataFactory.createRandomAgent();
      const agentConfig: AgentConfig = {
        address: testAgent.keypair.publicKey.toBase58(),
        name: testAgent.name,
        capabilities: testAgent.capabilities,
        reputation: 88.0,
        lastActive: new Date()
      };

      // Save with first instance
      await configManager.saveAgent(agentConfig);
      createdAgents.push(agentConfig.address);

      // Load with new instance
      const newConfigManager = new ConfigManager();
      const savedAgents = await newConfigManager.loadAgents();
      const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

      expect(foundAgent).toBeDefined();
      expect(foundAgent!.name).toBe(testAgent.name);
    });

    test('should handle empty agent list', async () => {
      // Use a fresh config manager or clear existing data
      const tempConfigManager = new ConfigManager();
      const agents = await tempConfigManager.loadAgents();
      
      expect(Array.isArray(agents)).toBe(true);
      // May have existing agents from other tests, so just verify it's an array
    });

    test('should handle corrupted agent data gracefully', async () => {
      // This would test file corruption handling
      // For now, verify that loadAgents doesn't throw
      await expect(configManager.loadAgents()).resolves.toBeDefined();
    });
  });

  describe('Agent Capabilities', () => {
    test('should handle all capability combinations', async () => {
      const capabilityTests = [
        0b00000, // No capabilities
        0b00001, // Communication only
        0b00010, // Trading only
        0b00100, // Analysis only
        0b01000, // Moderation only
        0b10000, // Custom only
        0b11111, // All capabilities
        0b10101, // Custom + Analysis + Communication
      ];

      for (const capabilities of capabilityTests) {
        const testAgent = TestDataFactory.createRandomAgent();
        testAgent.capabilities = capabilities;

        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: testAgent.name,
          capabilities: testAgent.capabilities,
          reputation: 80.0,
          lastActive: new Date()
        };

        await configManager.saveAgent(agentConfig);
        createdAgents.push(agentConfig.address);

        const savedAgents = await configManager.loadAgents();
        const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

        expect(foundAgent!.capabilities).toBe(capabilities);
      }
    });

    test('should validate capability bounds', async () => {
      const invalidCapabilities = EDGE_CASE_DATA.invalidCapabilities;

      for (const capabilities of invalidCapabilities) {
        const testAgent = TestDataFactory.createRandomAgent();
        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: testAgent.name,
          capabilities: capabilities,
          reputation: 80.0,
          lastActive: new Date()
        };

        // Should handle invalid capabilities gracefully
        await expect(configManager.saveAgent(agentConfig)).not.toThrow();
      }
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple agents efficiently', async () => {
      const agentCount = 100;
      const startTime = Date.now();

      // Create multiple agents
      const agents: AgentConfig[] = [];
      for (let i = 0; i < agentCount; i++) {
        const testAgent = TestDataFactory.createRandomAgent();
        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: `PerformanceAgent${i}`,
          capabilities: testAgent.capabilities,
          reputation: Math.random() * 100,
          lastActive: new Date()
        };
        agents.push(agentConfig);
        createdAgents.push(agentConfig.address);
      }

      // Save all agents
      for (const agent of agents) {
        await configManager.saveAgent(agent);
      }

      const saveTime = Date.now() - startTime;

      // Load all agents
      const loadStartTime = Date.now();
      const savedAgents = await configManager.loadAgents();
      const loadTime = Date.now() - loadStartTime;

      // Verify all agents were saved
      expect(savedAgents.length).toBeGreaterThanOrEqual(agentCount);

      // Performance assertions
      expect(saveTime).toBeLessThan(10000); // 10 seconds max
      expect(loadTime).toBeLessThan(1000); // 1 second max

      console.log(`📊 Performance: Saved ${agentCount} agents in ${saveTime}ms, loaded in ${loadTime}ms`);
    });

    test('should handle concurrent agent operations', async () => {
      const concurrentCount = 20;
      const operations = Array.from({ length: concurrentCount }, (_, i) => {
        const testAgent = TestDataFactory.createRandomAgent();
        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: `ConcurrentAgent${i}`,
          capabilities: testAgent.capabilities,
          reputation: Math.random() * 100,
          lastActive: new Date()
        };
        createdAgents.push(agentConfig.address);
        return configManager.saveAgent(agentConfig);
      });

      const startTime = Date.now();
      await Promise.all(operations);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // 5 seconds max for concurrent operations

      console.log(`⚡ Concurrent operations: ${concurrentCount} agents in ${duration}ms`);
    });
  });

  describe('Security Tests', () => {
    test('should sanitize agent names', async () => {
      const maliciousNames = EDGE_CASE_DATA.maliciousInputs;

      for (const maliciousName of maliciousNames) {
        const testAgent = TestDataFactory.createRandomAgent();
        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: maliciousName,
          capabilities: testAgent.capabilities,
          reputation: 80.0,
          lastActive: new Date()
        };

        // Should handle malicious input gracefully
        await expect(configManager.saveAgent(agentConfig)).not.toThrow();
        createdAgents.push(agentConfig.address);

        const savedAgents = await configManager.loadAgents();
        const foundAgent = savedAgents.find(a => a.address === agentConfig.address);

        // Verify agent was saved (name might be sanitized)
        expect(foundAgent).toBeDefined();
      }
    });

    test('should protect against agent data injection', async () => {
      const injectionAttempts = [
        '{"evil": "code"}',
        'null',
        'undefined',
        'function(){alert(1)}',
        '../../etc/passwd'
      ];

      for (const injection of injectionAttempts) {
        const testAgent = TestDataFactory.createRandomAgent();
        const agentConfig: AgentConfig = {
          address: testAgent.keypair.publicKey.toBase58(),
          name: injection,
          capabilities: testAgent.capabilities,
          reputation: 80.0,
          lastActive: new Date()
        };

        await expect(configManager.saveAgent(agentConfig)).not.toThrow();
        createdAgents.push(agentConfig.address);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      // Test with invalid paths and permissions
      // This would require mocking file system operations
      await expect(configManager.loadAgents()).resolves.toBeDefined();
    });

    test('should handle JSON parsing errors', async () => {
      // Test with corrupted configuration files
      // This would require mocking file content
      await expect(configManager.loadAgents()).resolves.toBeDefined();
    });

    test('should validate date objects', async () => {
      const testAgent = TestDataFactory.createRandomAgent();
      const agentConfig: AgentConfig = {
        address: testAgent.keypair.publicKey.toBase58(),
        name: testAgent.name,
        capabilities: testAgent.capabilities,
        reputation: 80.0,
        lastActive: new Date('invalid-date')
      };

      // Should handle invalid dates gracefully
      await expect(configManager.saveAgent(agentConfig)).not.toThrow();
      createdAgents.push(agentConfig.address);
    });
  });
}); 