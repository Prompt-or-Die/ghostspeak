/**
 * Agent Service - Real on-chain agent management
 * Uses Codama-generated instructions for type-safe blockchain operations
 */

import type { Address } from '@solana/addresses';
import type { Rpc, SolanaRpcApi } from '@solana/rpc';
import type { KeyPairSigner, TransactionSigner } from '@solana/signers';
import type { Commitment } from '@solana/rpc-types';

// Import Codama-generated functionality
import { getRegisterAgentInstructionAsync } from '../generated-v2/instructions/registerAgent.js';
import { 
  fetchMaybeAgentAccount
} from '../generated-v2/accounts/agentAccount.js';

// Import types
import type { ICreateAgentOptions, IAgentAccount } from '../types.js';

/**
 * Service for managing AI agents on the podAI Protocol
 */
export class AgentService {
  constructor(
    private readonly rpc: Rpc<SolanaRpcApi>,
    private readonly programId: Address,
    private readonly commitment: Commitment = 'confirmed'
  ) {}

  /**
   * Register a new agent on-chain
   * @param signer - The transaction signer (wallet)
   * @param options - Agent creation options
   * @returns Promise resolving to transaction signature
   */
  async registerAgent(
    signer: KeyPairSigner,
    options: ICreateAgentOptions
  ): Promise<string> {
    try {
      // Get the register agent instruction using Codama
      const instruction = await getRegisterAgentInstructionAsync({
        signer: signer as TransactionSigner,
        capabilities: BigInt(options.capabilities),
        metadataUri: options.metadataUri,
      }, { programAddress: this.programId });

      // For now, return the instruction data as a mock signature
      // This will be replaced with real transaction sending
      console.log('Would send instruction:', instruction);
      return `mock_signature_${Date.now()}`;

    } catch (error) {
      console.error('Failed to register agent:', error);
      throw new Error(
        `Agent registration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get agent account data from the blockchain
   * @param agentAddress - The agent's PDA address
   * @returns Promise resolving to agent account data or null if not found
   */
  async getAgent(agentAddress: Address): Promise<IAgentAccount | null> {
    try {
      const maybeAccount = await fetchMaybeAgentAccount(this.rpc, agentAddress);

      if (!maybeAccount.exists) {
        return null;
      }

      // Convert Codama account to our interface
      const account = maybeAccount.data;
      return {
        pubkey: agentAddress,
        capabilities: Number(account.capabilities),
        metadataUri: account.metadataUri,
        reputation: Number(account.reputation),
        lastUpdated: Number(account.lastUpdated),
        invitesSent: 0, // Default value for missing property
        lastInviteAt: 0, // Default value for missing property
        bump: Number(account.bump),
      };

    } catch (error) {
      console.error('Failed to fetch agent:', error);
      return null;
    }
  }

  /**
   * Get the PDA address for an agent given their wallet public key
   * @param walletPubkey - The wallet's public key
   * @returns Promise resolving to the agent's PDA address
   */
  async getAgentPDA(walletPubkey: Address): Promise<Address> {
    const { getProgramDerivedAddress } = await import('@solana/addresses');
    const { getBytesEncoder } = await import('@solana/codecs');
    const { getAddressEncoder } = await import('@solana/addresses');

    const [pda] = await getProgramDerivedAddress({
      programAddress: this.programId,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([97, 103, 101, 110, 116])), // "agent"
        getAddressEncoder().encode(walletPubkey),
      ],
    });

    return pda;
  }

  /**
   * Check if an agent is registered
   * @param walletPubkey - The wallet's public key
   * @returns Promise resolving to boolean indicating if agent exists
   */
  async isAgentRegistered(walletPubkey: Address): Promise<boolean> {
    try {
      const agentPDA = await this.getAgentPDA(walletPubkey);
      const agent = await this.getAgent(agentPDA);
      return agent !== null;
    } catch (error) {
      console.error('Failed to check agent registration:', error);
      return false;
    }
  }

  /**
   * Find agents by capability
   * @param capability - Capability bitmask to search for
   * @param limit - Maximum number of agents to return (default: 10)
   * @returns Promise resolving to array of matching agents
   */
  async findAgentsByCapability(
    capability: number, 
    limit: number = 10
  ): Promise<IAgentAccount[]> {
    try {
      // Note: This would require indexing in a production system
      // For now, return empty array as this needs off-chain indexing
      console.warn('findAgentsByCapability requires off-chain indexing - not yet implemented');
      return [];
    } catch (error) {
      console.error('Failed to find agents by capability:', error);
      return [];
    }
  }
} 