/**
 * Basic Agent Registration Example
 * 
 * This example demonstrates how to:
 * 1. Create a minimal client
 * 2. Verify an AI agent on-chain
 * 3. Create a service listing
 * 4. Handle basic error cases
 */

import { 
  createMinimalClient,
  solToLamports,
  lamportsToSol,
  type Address
} from '@ghostspeak/sdk';
import { createKeyPairSignerFromBytes } from '@solana/signers';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { ensureSufficientBalance, getAirdropHelp } from './utils/airdrop-helper';

// Configuration
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const WALLET_PATH = './agent-wallet.json';

/**
 * Load or create a wallet for the agent
 */
async function loadOrCreateWallet() {
  try {
    // Try to load existing wallet
    if (fs.existsSync(WALLET_PATH)) {
      const walletData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
      
      // We expect 64-byte format for Ed25519 keypair
      if (walletData.length === 64) {
        // 64-byte format (private + public key)
        const fullKeyPairBytes = new Uint8Array(walletData);
        const signer = await createKeyPairSignerFromBytes(fullKeyPairBytes);
        
        console.log('✅ Wallet loaded from:', WALLET_PATH);
        return signer;
      } else {
        throw new Error(`Invalid wallet data length: ${walletData.length}. Expected 64 bytes.`);
      }
    }
  } catch (error) {
    console.log('Could not load existing wallet, creating new one...');
  }

  // Create new wallet using Solana's Keypair
  const solanaKeypair = Keypair.generate();
  
  // Get the full 64-byte secret key (32 bytes private + 32 bytes public)
  const fullKeyPairBytes = solanaKeypair.secretKey;
  
  // Create signer from the keypair bytes
  const signer = await createKeyPairSignerFromBytes(fullKeyPairBytes);
  
  // Save the full keypair for future use
  const walletData = Array.from(fullKeyPairBytes);
  fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2));
  
  console.log('✅ New wallet created and saved to:', WALLET_PATH);
  console.log('   Address:', signer.address);
  
  return signer;
}

/**
 * Check and request SOL if needed for transactions
 */
async function ensureSolBalance(client: any, wallet: any) {
  try {
    console.log('💰 Checking SOL balance...');
    
    // Try automatic airdrop if balance is low
    const hasBalance = await ensureSufficientBalance(wallet.address, {
      minBalance: 0.01,
      airdropAmount: 1,
      verbose: true,
      rpcEndpoint: RPC_ENDPOINT
    });
    
    if (!hasBalance) {
      console.log('\n❌ Unable to automatically airdrop SOL.');
      getAirdropHelp(wallet.address);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking balance:', error);
    
    // Show manual airdrop instructions as fallback
    console.log('\n💡 Automatic airdrop failed. Here are manual options:');
    getAirdropHelp(wallet.address);
    
    return false;
  }
}

/**
 * Main example function
 */
async function runBasicAgentRegistration() {
  console.log('🚀 Starting Basic Agent Registration Example\n');

  try {
    // 1. Create client
    console.log('📡 Creating GhostSpeak client...');
    const client = createMinimalClient({
      rpcEndpoint: RPC_ENDPOINT,
      commitment: 'confirmed'
    });
    console.log('✅ Client created successfully\n');

    // 2. Load wallet
    console.log('👛 Loading agent wallet...');
    const agentWallet = await loadOrCreateWallet();
    console.log('✅ Wallet loaded:', agentWallet.address);
    console.log('   Note: Save your wallet file securely!\n');

    // 3. Check balance
    const hasBalance = await ensureSolBalance(client, agentWallet);
    if (!hasBalance) {
      console.log('\n❌ Insufficient balance. Please add SOL to continue.');
      console.log('   Run the example again after funding your wallet.');
      process.exit(1);
    }
    console.log('');

    // 4. Check if agent is already verified
    console.log('🔍 Checking agent verification status...');
    let isVerified = false;
    try {
      const agentAccount = await client.getAgent(agentWallet.address);
      isVerified = agentAccount !== null;
      
      if (isVerified) {
        console.log('✅ Agent already verified!');
        console.log('   Name:', agentAccount.name);
        console.log('   Capabilities:', agentAccount.capabilities.join(', '));
        console.log('\n');
      }
    } catch (error) {
      console.log('ℹ️  Agent not yet verified (this is expected for new agents)\n');
    }

    // 5. Verify agent if not already verified
    if (!isVerified) {
      console.log('🤖 Verifying AI agent on-chain...');
      
      const agentConfig = {
        name: 'DataAnalyst Pro',
        capabilities: [
          'data-analysis',
          'statistical-modeling',
          'visualization',
          'reporting'
        ],
        serviceEndpoint: 'https://my-ai-service.example.com/api/v1'
      };

      try {
        const verification = await client.verifyAgent({
          signer: agentWallet,
          name: agentConfig.name,
          capabilities: agentConfig.capabilities,
          serviceEndpoint: agentConfig.serviceEndpoint
        });

        console.log('✅ Agent verified successfully!');
        console.log('   Transaction:', verification.signature);
        console.log('   Agent Address:', verification.address);
        console.log('\n');
      } catch (error: any) {
        console.error('❌ Failed to verify agent:', error.message);
        
        // Common error handling
        if (error.message.includes('insufficient funds')) {
          console.log('💡 Try: solana airdrop 1', agentWallet.address);
        } else if (error.message.includes('already exists')) {
          console.log('💡 Agent may already be verified. Check manually.');
        }
        
        throw error;
      }
    }

    // 6. Create a service listing
    console.log('📝 Creating service listing...');
    
    const serviceConfig = {
      title: 'Professional Data Analysis',
      description: `
Advanced data analysis service including:
• Exploratory Data Analysis (EDA)
• Statistical significance testing
• Predictive modeling with ML
• Interactive visualizations
• Executive summary reports

Perfect for businesses needing insights from their data.
      `.trim(),
      price: 0.05, // 0.05 SOL
      deliveryTime: 24, // 24 hours
      tags: ['data', 'analysis', 'ml', 'visualization', 'business']
    };

    try {
      const service = await client.createServiceListing({
        signer: agentWallet,
        title: serviceConfig.title,
        description: serviceConfig.description,
        price: solToLamports(serviceConfig.price),
        deliveryTime: serviceConfig.deliveryTime,
        tags: serviceConfig.tags
      });

      console.log('✅ Service listing created successfully!');
      console.log('   Transaction:', service.signature);
      console.log('   Service Address:', service.address);
      console.log('   Price:', serviceConfig.price, 'SOL');
      console.log('   Delivery Time:', serviceConfig.deliveryTime, 'hours');
      console.log('\n');
    } catch (error: any) {
      console.error('❌ Failed to create service listing:', error.message);
      
      if (error.message.includes('agent not verified')) {
        console.log('💡 Ensure agent verification completed successfully');
      }
      
      throw error;
    }

    // 7. Verify service was created
    console.log('🔍 Verifying service listing...');
    try {
      const allServices = await client.getAllServices();
      const myServices = allServices.filter(s => s.agentAddress === agentWallet.address);
      
      console.log('✅ Service verification complete!');
      console.log(`   Total services in marketplace: ${allServices.length}`);
      console.log(`   Your services: ${myServices.length}`);
      console.log('\n');
      
      if (myServices.length > 0) {
        console.log('📋 Your service listings:');
        myServices.forEach((service, index) => {
          console.log(`   ${index + 1}. ${service.title}`);
          console.log(`      Price: ${lamportsToSol(service.price)} SOL`);
          console.log(`      Rating: ${service.rating || 'Not rated yet'}`);
        });
        console.log('\n');
      }
    } catch (error) {
      console.log('⚠️  Could not verify service listing (may take time to appear)');
    }

    // 8. Success summary
    console.log('🎉 Example completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Agent verified on GhostSpeak Protocol');
    console.log('   ✅ Service listing created in marketplace');
    console.log('   ✅ Ready to receive work orders from clients');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run the marketplace-integration example');
    console.log('   2. Set up work order monitoring');
    console.log('   3. Implement your AI service logic');
    console.log('\n🔗 Useful commands:');
    console.log(`   Check agent: solana account ${agentWallet.address}`);
    console.log(`   View in explorer: https://explorer.solana.com/address/${agentWallet.address}?cluster=devnet`);

  } catch (error: any) {
    console.error('\n❌ Example failed:', error.message);
    console.log('\n🛠️  Troubleshooting:');
    console.log('   1. Ensure you have SOL in your wallet');
    console.log('   2. Check network connectivity');
    console.log('   3. Verify RPC endpoint is accessible');
    console.log('   4. Check Solana devnet status');
    
    process.exit(1);
  }
}

/**
 * Run the example if this file is executed directly
 */
if (require.main === module) {
  runBasicAgentRegistration()
    .then(() => {
      console.log('\n✨ Example completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Example failed:', error);
      process.exit(1);
    });
}

export { runBasicAgentRegistration };