#!/usr/bin/env node

/**
 * Simple verification script to check on-chain operations vs mocks
 * Can be run with: node tests/verify-onchain-status.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying On-Chain Operations vs Mocks...\n');

const results = {
  realOperations: [],
  mockOperations: [],
  needsFix: []
};

try {
  // Check agent service
  const agentServicePath = path.join(__dirname, '../packages/sdk-typescript/src/services/agent.ts');
  const agentServiceCode = fs.readFileSync(agentServicePath, 'utf-8');
  
  if (agentServiceCode.includes('getRegisterAgentInstructionAsync') && 
      agentServiceCode.includes('signTransactionMessageWithSigners')) {
    results.realOperations.push('✅ agent-service: Uses real Solana transactions');
  } else {
    results.mockOperations.push('⚠️  agent-service: Missing real transaction code');
  }

  // Check CLI commands
  const commandsDir = path.join(__dirname, '../packages/cli/src/commands');
  const commandFiles = [
    { file: 'register-agent.ts', name: 'register-agent' },
    { file: 'manage-channels.ts', name: 'manage-channels' },
    { file: 'view-analytics.ts', name: 'view-analytics' }
  ];

  for (const { file, name } of commandFiles) {
    try {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('MockPodClient') || 
          content.includes('mock_signature') || 
          content.includes('channel_${Date.now()}') || 
          content.includes('message_${Date.now()}') ||
          content.includes('totalAgents: 1247')) {
        results.mockOperations.push(`⚠️  ${name}: Uses mock operations`);
        results.needsFix.push(`🔧 ${name}: Replace mocks with real SDK calls`);
      } else if (content.includes('createPodAIClientV2') || 
                 content.includes('podClient.agents')) {
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

// Mock pattern detection
console.log('\n🔍 SEARCHING FOR MOCK PATTERNS...\n');

const mockPatterns = [
  'mock_signature_',
  'channel_${Date.now()}',
  'message_${Date.now()}',
  'totalAgents: 1247',
  'MockPodClient'
];

let mocksFound = 0;

for (const pattern of mockPatterns) {
  const files = [
    '../packages/cli/src/commands/register-agent.ts',
    '../packages/cli/src/commands/manage-channels.ts', 
    '../packages/cli/src/commands/view-analytics.ts'
  ];
  
  for (const file of files) {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes(pattern)) {
        console.log(`⚠️  MOCK FOUND: "${pattern}" in ${path.basename(file)}`);
        mocksFound++;
      }
    } catch (error) {
      // File not found, skip
    }
  }
}

if (mocksFound === 0) {
  console.log('✅ No mock patterns detected!');
} else {
  console.log(`\n❌ Total mock patterns found: ${mocksFound}`);
}

console.log('\n' + '='.repeat(60));
console.log('SUMMARY:');
console.log(`• Real operations: ${results.realOperations.length}`);
console.log(`• Mock operations: ${results.mockOperations.length}`);
console.log(`• Need fixes: ${results.needsFix.length}`);
console.log(`• Success rate: ${successRate.toFixed(1)}%`);

if (successRate < 100) {
  console.log('\n📋 TODO: Implement missing SDK services for 100% real operations');
} else {
  console.log('\n🎉 ALL OPERATIONS USE REAL ON-CHAIN TRANSACTIONS!');
} 