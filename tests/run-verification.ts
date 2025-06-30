import { runOnChainVerificationReport } from './on-chain-verification.test.js';

console.log('🔍 Starting On-Chain Verification...\n');

runOnChainVerificationReport()
  .then((results) => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }); 