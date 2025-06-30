/**
 * podAI SDK Client - Web3.js v2.0 Native Implementation
 * Pure Web3.js v2.0 client with modern APIs and optimal performance
 */

import type { Address } from '@solana/addresses';
import type { KeyPairSigner } from '@solana/signers';
import type { Rpc, SolanaRpcApi } from '@solana/rpc';
import type { Commitment } from '@solana/rpc-types';
import { createSolanaRpc } from '@solana/rpc';
import { generateKeyPairSigner } from '@solana/signers';
import { address } from '@solana/addresses';

// Import generated v2 clients from Codama
import { getRegisterAgentInstructionAsync } from './generated-v2/instructions/registerAgent.js';
import {
  fetchMaybeAgentAccount,
  type AgentAccount as CodemaAgentAccount,
} from './generated-v2/accounts/agentAccount.js';

// Types from our existing system
import type { AgentAccount, CreateAgentOptions } from './types.js';

/**
 * Configuration for the Web3.js v2.0 client
 */
export interface PodAIClientV2Config {
  rpcEndpoint: string;
  programId?: Address;
  commitment?: Commitment;
}

/**
 * Modern Web3.js v2.0 implementation of the podAI SDK
 * Uses Codama-generated clients for maximum performance and type safety
 */
export class PodAIClientV2 {
  private rpc: Rpc<SolanaRpcApi>;
  private programId: Address;
  private commitment: Commitment;

  constructor(config: PodAIClientV2Config) {
    this.rpc = createSolanaRpc(config.rpcEndpoint);
    this.programId =
      config.programId ||
      address('PoD1111111111111111111111111111111111111111');
    this.commitment = config.commitment || 'confirmed';
  }

  /**
   * Generate a new signer for transactions
   */
  public async generateSigner(): Promise<KeyPairSigner> {
    return await generateKeyPairSigner();
  }

  /**
   * Get the RPC client for direct access
   */
  public getRpc(): Rpc<SolanaRpcApi> {
    return this.rpc;
  }

  /**
   * Get the program ID
   */
  public getProgramId(): Address {
    return this.programId;
  }

  /**
   * Create a new agent using Web3.js v2.0 + Codama generated clients
   */
  public async createAgent(
    options: CreateAgentOptions & { signer: KeyPairSigner }
  ): Promise<{ signature: string; agentAddress: Address }> {
    // Use Codama-generated registerAgent instruction
    const instruction = await getRegisterAgentInstructionAsync({
      signer: options.signer,
      capabilities: options.capabilities,
      metadataUri: options.metadataUri,
    });

    // For now, return mock data - in Phase 2 we'll implement real transaction building
    const agentAddress = address('11111111111111111111111111111111');

    return {
      signature: 'mock-signature-for-create-agent-v2',
      agentAddress,
    };
  }

  /**
   * Fetch agent account using Web3.js v2.0 + Codama generated clients
   */
  public async getAgent(agentAddress: Address): Promise<AgentAccount | null> {
    try {
      // Use Codama-generated agentAccount fetcher
      const account = await fetchMaybeAgentAccount(this.rpc, agentAddress);

      if (!account.exists) {
        return null;
      }

      // Convert from Codama format to our AgentAccount interface
      const data = account.data;
      return {
        pubkey: agentAddress,
        capabilities: Number(data.capabilities),
        metadataUri: data.metadataUri,
        reputation: Number(data.reputation),
        lastUpdated: Number(data.lastUpdated),
        invitesSent: 0, // Not in Codama format yet
        lastInviteAt: 0, // Not in Codama format yet
        bump: data.bump,
      };
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Health check for Web3.js v2.0 system
   */
  public async healthCheck(): Promise<{
    v2: { status: 'ok' | 'error'; latency?: number; blockHeight?: number };
  }> {
    const startTime = performance.now();

    try {
      // Test v2 RPC with multiple calls
      const [slot, blockHeight] = await Promise.all([
        this.rpc.getSlot().send(),
        this.rpc.getBlockHeight().send(),
      ]);

      const latency = performance.now() - startTime;

      return {
        v2: {
          status: 'ok',
          latency,
          blockHeight: Number(blockHeight),
        },
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        v2: { status: 'error' },
      };
    }
  }

  /**
   * Get network statistics using Web3.js v2.0 APIs
   */
  public async getNetworkStats(): Promise<{
    slot: number;
    blockHeight: number;
    totalSupply: number;
    epoch: number;
  }> {
    try {
      const [slot, blockHeight, supply, epochInfo] = await Promise.all([
        this.rpc.getSlot().send(),
        this.rpc.getBlockHeight().send(),
        this.rpc.getSupply().send(),
        this.rpc.getEpochInfo().send(),
      ]);

      return {
        slot: Number(slot),
        blockHeight: Number(blockHeight),
        totalSupply: Number(supply.value.total),
        epoch: Number(epochInfo.epoch),
      };
    } catch (error) {
      console.error('Failed to get network stats:', error);
      throw error;
    }
  }

  /**
   * Batch multiple RPC calls efficiently
   */
  public async batchCall<T extends Record<string, any>>(
    calls: Record<keyof T, () => Promise<any>>
  ): Promise<Partial<T>> {
    const entries = Object.entries(calls);
    const promises = entries.map(([, fn]) =>
      fn().catch((error: Error) => ({ error }))
    );

    const results = await Promise.allSettled(promises);

    const output: Partial<T> = {};
    entries.forEach(([key], index) => {
      const result = results[index];
      if (result && result.status === 'fulfilled') {
        output[key as keyof T] = result.value;
      } else if (result && result.status === 'rejected') {
        output[key as keyof T] = { error: result.reason } as any;
      }
    });

    return output;
  }

  /**
   * Subscribe to slot changes (Web3.js v2.0 subscriptions)
   */
  public async subscribeToSlots(
    callback: (slot: number) => void
  ): Promise<() => void> {
    // Mock implementation - in Phase 2 we'll implement real subscriptions
    const interval = setInterval(async () => {
      try {
        const slot = await this.rpc.getSlot().send();
        callback(Number(slot));
      } catch (error) {
        console.error('Slot subscription error:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}

/**
 * Factory function to create a v2 client with sensible defaults
 */
export function createPodAIClientV2(
  config: PodAIClientV2Config
): PodAIClientV2 {
  return new PodAIClientV2({
    commitment: 'confirmed',
    ...config,
  });
}

/**
 * Factory for devnet client
 */
export function createDevnetClient(): PodAIClientV2 {
  return createPodAIClientV2({
    rpcEndpoint: 'https://api.devnet.solana.com',
  });
}

/**
 * Factory for mainnet client
 */
export function createMainnetClient(): PodAIClientV2 {
  return createPodAIClientV2({
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  });
}

/**
 * Utility: Check if an address is valid
 */
export function isValidAddress(addr: string): boolean {
  try {
    address(addr);
    return true;
  } catch {
    return false;
  }
}
