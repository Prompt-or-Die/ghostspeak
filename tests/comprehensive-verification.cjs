#!/usr/bin/env node

/**
 * Comprehensive On-Chain Verification 
 * Checks ALL CLI commands and SDK functions for real vs mock operations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE ON-CHAIN VERIFICATION\n');
console.log('Checking ALL commands and functions...\n');

const results = {
  realOperations: [],
  mockOperations: [],
  noBlockchainNeeded: [],
  needsImplementation: [],
  totalCommands: 0
};

// All CLI commands to check
const allCommands = [
  'register-agent.ts',
  'manage-channels.ts', 
  'view-analytics.ts',
  'deploy-protocol.ts',
  'test-e2e.ts',
  'develop-sdk.ts',
  'settings.ts',
  'help.ts'
];

console.log('📋 ANALYZING ALL CLI COMMANDS:\n');

const commandsDir = path.join(__dirname, '../packages/cli/src/commands');

for (const commandFile of allCommands) {
  const commandName = commandFile.replace('.ts', '');
  results.totalCommands++;
  
  console.log(`${results.totalCommands}. Checking ${commandName}...`);
  
  try {
    const filePath = path.join(commandsDir, commandFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for mock patterns
    const mockPatterns = [
      'MockPodClient',
      'mock_signature',
      'channel_\$\{$Date\.now\(\)\\}',
      'message_\$\{$Date\.now\(\)\\}', 
      'totalAgents: 1247',
      'fake_transaction'
    ];
    
    // Check for real SDK patterns
    const realPatterns = [
      'createPodAIClientV2',
      'podClient\.agents',
      'getRegisterAgentInstructionAsync',
      'signTransactionMessageWithSigners',
      'sendAndConfirmTransaction'
    ];
    
    let hasMockPatterns = false;
    let hasRealPatterns = false;
    
    // Detect mock patterns
    for (const pattern of mockPatterns) {
      if (content.match(new RegExp(pattern, 'i'))) {
        hasMockPatterns = true;
        console.log(`   ❌ MOCK DETECTED: ${pattern}`);
        break;
      }
    }
    
    // Detect real patterns  
    for (const pattern of realPatterns) {
      if (content.match(new RegExp(pattern, 'i'))) {
        hasRealPatterns = true;
        console.log(`   ✅ REAL SDK: ${pattern}`);
        break;
      }
    }
    
    // Categorize the command
    if (hasRealPatterns && !hasMockPatterns) {
      results.realOperations.push(`✅ ${commandName}: Real on-chain operations`);
      console.log(`   ✅ STATUS: REAL ON-CHAIN\n`);
    } else if (hasMockPatterns) {
      results.mockOperations.push(`❌ ${commandName}: Uses mock operations`);
      console.log(`   ❌ STATUS: USES MOCKS\n`);
    } else if (commandName === 'help' || commandName === 'settings') {
      results.noBlockchainNeeded.push(`ℹ️  ${commandName}: UI/config only`);
      console.log(`   ℹ️  STATUS: UI ONLY\n`);
    } else {
      results.needsImplementation.push(`🔧 ${commandName}: Needs blockchain implementation`);
      console.log(`   🔧 STATUS: NEEDS IMPLEMENTATION\n`);
    }
    
  } catch (error) {
    results.needsImplementation.push(`❌ ${commandName}: Cannot analyze`);
    console.log(`   ❌ ERROR: Cannot analyze file\n`);
  }
}

console.log('🔍 CHECKING SDK SERVICES:\n');

// Check SDK services
const sdkServicesDir = path.join(__dirname, '../packages/sdk-typescript/src/services');
const serviceFiles = [
  'agent.ts',
  // Note: Other services may not exist yet
];

let servicesChecked = 0;
try {
  const files = fs.readdirSync(sdkServicesDir);
  for (const file of files) {
    if (file.endsWith('.ts') && file !== 'mod.ts' && file !== 'index.ts') {
      servicesChecked++;
      const serviceName = file.replace('.ts', '');
      console.log(`${servicesChecked}. Checking ${serviceName} service...`);
      
      const content = fs.readFileSync(path.join(sdkServicesDir, file), 'utf-8');
      
      if (content.includes('getRegisterAgentInstructionAsync') || 
          content.includes('signTransactionMessageWithSigners')) {
        results.realOperations.push(`✅ ${serviceName}-service: Real blockchain operations`);
        console.log(`   ✅ STATUS: REAL BLOCKCHAIN OPERATIONS\n`);
      } else if (content.includes('mock') || content.includes('fake')) {
        results.mockOperations.push(`❌ ${serviceName}-service: Contains mocks`);
        console.log(`   ❌ STATUS: CONTAINS MOCKS\n`);
      } else {
        results.needsImplementation.push(`🔧 ${serviceName}-service: Needs implementation`);
        console.log(`   🔧 STATUS: NEEDS IMPLEMENTATION\n`);
      }
    }
  }
} catch (error) {
  console.log(`   ❌ Cannot access services directory\n`);
}

// Print comprehensive results
console.log('📊 COMPREHENSIVE VERIFICATION RESULTS:\n');

if (results.realOperations.length > 0) {
  console.log('🟢 REAL ON-CHAIN OPERATIONS:');
  results.realOperations.forEach(op => console.log(`   ${op}`));
  console.log('');
}

if (results.mockOperations.length > 0) {
  console.log('🔴 MOCK OPERATIONS (NEED FIXING):');
  results.mockOperations.forEach(op => console.log(`   ${op}`));
  console.log('');
}

if (results.noBlockchainNeeded.length > 0) {
  console.log('ℹ️  UI/CONFIG ONLY (No blockchain needed):');
  results.noBlockchainNeeded.forEach(op => console.log(`   ${op}`));
  console.log('');
}

if (results.needsImplementation.length > 0) {
  console.log('🔧 NEEDS IMPLEMENTATION:');
  results.needsImplementation.forEach(op => console.log(`   ${op}`));
  console.log('');
}

// Calculate statistics
const blockchainCommands = results.totalCommands - results.noBlockchainNeeded.length;
const workingBlockchainCommands = results.realOperations.length;
const onChainRate = blockchainCommands > 0 ? (workingBlockchainCommands / blockchainCommands) * 100 : 0;

console.log('=' .repeat(60));
console.log('📈 FINAL STATISTICS:');
console.log(`• Total commands analyzed: ${results.totalCommands}`);
console.log(`• Commands needing blockchain: ${blockchainCommands}`);
console.log(`• Working on-chain commands: ${workingBlockchainCommands}`);
console.log(`• Mock/broken commands: ${results.mockOperations.length}`);
console.log(`• UI-only commands: ${results.noBlockchainNeeded.length}`);
console.log(`• On-chain success rate: ${onChainRate.toFixed(1)}%`);

console.log('\n🎯 OVERALL ASSESSMENT:');
if (onChainRate >= 80) {
  console.log('🟢 EXCELLENT: Most commands use real on-chain operations');
} else if (onChainRate >= 50) {
  console.log('🟡 MODERATE: Some commands use real on-chain operations');
} else if (onChainRate >= 25) {
  console.log('🟠 POOR: Few commands use real on-chain operations');
} else {
  console.log('🔴 CRITICAL: Most/all commands use mock operations');
}

console.log('\n🚀 RECOMMENDATIONS:');
if (results.mockOperations.length > 0) {
  console.log('1. Implement missing SDK services for mock commands');
  console.log('2. Replace MockPodClient with real PodAIClientV2');
  console.log('3. Add real blockchain queries for analytics');
}
if (results.realOperations.length > 0) {
  console.log('4. ✅ Agent registration is working - use as template');
}
console.log('5. Test all commands against devnet to verify functionality');

console.log('\n✅ VERIFICATION COMPLETE!'); 