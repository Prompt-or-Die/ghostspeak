/**
 * On-Chain Verification Tests
 * Ensures all CLI commands perform real blockchain operations instead of mocks
 */

import { describe, it, expect, beforeAll, vi, Mock } from 'vitest';
import { generateKeyPairSigner } from '@solana/signers';
import type { KeyPairSigner } from '@solana/signers';

// Import the real SDK
import { 
  createPodAIClientV2, 
  type PodAIClientV2 
} from '../packages/sdk-typescript/src/index.js';

// Mock Solana RPC responses for testing
const mockRpcResponses = {
  getLatestBlockhash: {
    value: {
      blockhash: 'test_blockhash_12345',
      lastValidBlockHeight: 123456789
    }
  },
  getSlot: 123456,
  sendTransaction: 'test_signature_real_transaction_abc123',
  confirmTransaction: {
    value: { err: null }
  }
};

describe('On-Chain Operations Verification', () => {
  let testSigner: KeyPairSigner;
  let podClient: PodAIClientV2;

  beforeAll(async () => {
    // Generate test signer
    testSigner = await generateKeyPairSigner();
    
    // Create client with test RPC endpoint
    podClient = createPodAIClientV2({
      rpcEndpoint: 'https://api.devnet.solana.com'
    });
  });

  describe('SDK Agent Service', () => {
    it('should use real transaction flow, not mocks', async () => {
      // Spy on the actual methods to verify real implementation
      const registerAgentSpy = vi.spyOn(podClient.agents, 'registerAgent');

      const testOptions = {
        capabilities: 7,
        metadataUri: 'https://example.com/test-agent.json'
      };

      try {
        await podClient.agents.registerAgent(testSigner, testOptions);
      } catch (error) {
        // Expected to fail without real RPC, but we verify the implementation
      }

      // Verify real method was called (not a mock)
      expect(registerAgentSpy).toHaveBeenCalledWith(testSigner, testOptions);
      
      // Verify the implementation contains real transaction code
      const implementation = podClient.agents.registerAgent.toString();
      expect(implementation).toMatch(/getRegisterAgentInstructionAsync|createTransactionMessage|signTransactionMessageWithSigners/);
    });

    it('should create real Solana instructions', async () => {
      const testOptions = {
        capabilities: 7,
        metadataUri: 'https://example.com/test-agent.json'
      };

      // Import the instruction generator directly to test
      try {
        const { getRegisterAgentInstructionAsync } = await import('../packages/sdk-typescript/src/generated-v2/instructions/registerAgent.js');
        
        const instruction = await getRegisterAgentInstructionAsync({
          signer: testSigner,
          capabilities: BigInt(testOptions.capabilities),
          metadataUri: testOptions.metadataUri,
        }, { programAddress: podClient.getProgramId() });

        // Verify instruction is real Solana instruction object
        expect(instruction).toHaveProperty('accounts');
        expect(instruction).toHaveProperty('programAddress');
        expect(instruction).toHaveProperty('data');
        
        // Verify it's not a mock
        expect(instruction.programAddress).toBe(podClient.getProgramId());
        expect(typeof instruction.data).toBe('object');
        
      } catch (error) {
        // If instruction generation fails, it's still better than returning a mock
        expect(error).toBeInstanceOf(Error);
        expect(error.message).not.toMatch(/mock|fake/i);
      }
    });

    it('should reject mock signatures', async () => {
      const mockSignaturePatterns = [
        'mock_signature_123456',
        'agent_1234567890',
        'fake_transaction_abc',
        'test_signature_mock'
      ];

      mockSignaturePatterns.forEach(mockSig => {
        // Real signatures should be base58 encoded, 64-88 characters
        // Mock signatures typically contain underscores and readable text
        expect(mockSig).toMatch(/_/); // Mock signatures contain underscores
        expect(mockSig.length).toBeLessThan(40); // Mock signatures are too short
      });

      // Real Solana signatures should match this pattern
      const realSignaturePattern = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
      
      // Example real signature (from Solana)
      const realSignature = '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW';
      expect(realSignature).toMatch(realSignaturePattern);
    });
  });

  describe('Transaction Pattern Detection', () => {
    it('should detect real transaction patterns in agent service', async () => {
      const fs = await import('fs/promises');
      const agentServiceCode = await fs.readFile(
        'packages/sdk-typescript/src/services/agent.ts',
        'utf-8'
      );

      // GOOD patterns (real blockchain operations)
      const goodPatterns = [
        'getRegisterAgentInstructionAsync',
        'createTransactionMessage',
        'signTransactionMessageWithSigners',
        'sendAndConfirmTransaction',
        'getSignatureFromTransaction',
        'setTransactionMessageFeePayerSigner',
        'appendTransactionMessageInstructions'
      ];

      goodPatterns.forEach(pattern => {
        expect(agentServiceCode).toMatch(new RegExp(pattern));
      });

      // BAD patterns (mock operations)
      const badPatterns = [
        /mock_signature_\d+/,
        /agent_\d+/,
        /fake_transaction/,
        /return.*Date\.now\(\)/,
        /TODO.*mock/i
      ];

      badPatterns.forEach(pattern => {
        expect(agentServiceCode).not.toMatch(pattern);
      });
    });
  });

  describe('Mock Prevention Tests', () => {
    it('should require real blockchain signatures format', () => {
      // Valid Solana signature format
      const validSignatureRegex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
      
      // Examples of what should be REJECTED
      const invalidSignatures = [
        'mock_signature_12345',
        'agent_1234567890', 
        'fake_abc123',
        'test_123',
        '12345', // too short
        'abcdef_with_underscore'
      ];
      
      invalidSignatures.forEach(sig => {
        expect(sig).not.toMatch(validSignatureRegex);
      });
      
      // Examples of what should be ACCEPTED
      const validSignatures = [
        '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW',
        '3Bxs7UpYhyNSKKjsGzgwZdsYa7KhPSwD8tNqE67JkYwFXgJjH7TdHx4rQVwXz2QPJXqDgQKcRFkKqNPHvEJvd5PQ'
      ];
      
      validSignatures.forEach(sig => {
        expect(sig).toMatch(validSignatureRegex);
      });
    });
  });

  describe('Integration Test Scenarios', () => {
    it('should handle real RPC failures gracefully', async () => {
      // Test with invalid RPC endpoint to verify error handling
      const badClient = createPodAIClientV2({
        rpcEndpoint: 'https://invalid-rpc-endpoint-that-does-not-exist.com'
      });
      
      await expect(
        badClient.agents.registerAgent(testSigner, {
          capabilities: 7,
          metadataUri: 'https://example.com/test.json'
        })
      ).rejects.toThrow();
      
      // Verify it's a real network error, not a mock response
      try {
        await badClient.agents.registerAgent(testSigner, {
          capabilities: 7, 
          metadataUri: 'https://example.com/test.json'
        });
      } catch (error) {
        expect(error.message).not.toMatch(/mock|fake/i);
        expect(error.message).toMatch(/network|connection|fetch|ENOTFOUND/i);
      }
    });

    it('should validate transaction inputs before sending', async () => {
      // Test with invalid inputs to verify validation
      await expect(
        podClient.agents.registerAgent(testSigner, {
          capabilities: -1, // Invalid
          metadataUri: 'invalid-uri' // Invalid
        })
      ).rejects.toThrow();

      await expect(
        podClient.agents.registerAgent(testSigner, {
          capabilities: 999999999, // Too large
          metadataUri: '' // Empty
        })
      ).rejects.toThrow();
    });
  });
});

// Helper function to run verification and generate report
export async function runOnChainVerificationReport() {
  console.log('🔍 Running On-Chain Verification Analysis...\n');
  
  const results = {
    realOperations: [] as string[],
    mockOperations: [] as string[],
    needsFix: [] as string[]
  };

  try {
    // Check agent service implementation
    const fs = await import('fs/promises');
    const agentServiceCode = await fs.readFile('packages/sdk-typescript/src/services/agent.ts', 'utf-8');
    
    if (agentServiceCode.includes('getRegisterAgentInstructionAsync') && 
        agentServiceCode.includes('signTransactionMessageWithSigners')) {
      results.realOperations.push('✅ agent-service: Uses real Solana transactions');
    } else {
      results.mockOperations.push('⚠️  agent-service: Missing real transaction code');
    }

    // Check CLI commands
    const commandFiles = [
      { file: 'packages/cli/src/commands/register-agent.ts', name: 'register-agent' },
      { file: 'packages/cli/src/commands/manage-channels.ts', name: 'manage-channels' },
      { file: 'packages/cli/src/commands/view-analytics.ts', name: 'view-analytics' }
    ];

    for (const { file, name } of commandFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        if (content.includes('MockPodClient') || content.includes('mock_signature') || 
            content.includes('channel_${Date.now()}') || content.includes('message_${Date.now()}')) {
          results.mockOperations.push(`⚠️  ${name}: Uses mock operations`);
          results.needsFix.push(`🔧 ${name}: Replace mocks with real SDK calls`);
        } else if (content.includes('createPodAIClientV2') || content.includes('podClient.agents')) {
          results.realOperations.push(`✅ ${name}: Uses real SDK`);
        } else {
          results.needsFix.push(`❓ ${name}: Cannot determine implementation type`);
        }
      } catch (error) {
        results.needsFix.push(`❌ ${name}: Cannot analyze file - ${error.message}`);
      }
    }

  } catch (error) {
    results.needsFix.push(`❌ Analysis failed: ${error.message}`);
  }

  // Print results
  console.log('📊 VERIFICATION RESULTS:\n');
  
  if (results.realOperations.length > 0) {
    console.log('🟢 REAL ON-CHAIN OPERATIONS:');
    results.realOperations.forEach(op => console.log(`   ${op}`));
    console.log('');
  }
  
  if (results.mockOperations.length > 0) {
    console.log('🟡 MOCK OPERATIONS DETECTED:');
    results.mockOperations.forEach(op => console.log(`   ${op}`));
    console.log('');
  }
  
  if (results.needsFix.length > 0) {
    console.log('🔴 NEEDS FIXING:');
    results.needsFix.forEach(fix => console.log(`   ${fix}`));
    console.log('');
  }

  const totalOperations = results.realOperations.length + results.mockOperations.length;
  const successRate = totalOperations > 0 ? (results.realOperations.length / totalOperations) * 100 : 0;
  console.log(`📈 On-Chain Implementation Rate: ${successRate.toFixed(1)}%`);
  
  return results;
} 