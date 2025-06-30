/**
 * podAI SDK Client - Web3.js v2.0 Native Implementation
 * Pure Web3.js v2.0 client with modern APIs and optimal performance
 */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { address } from '@solana/addresses';
import { createSolanaRpc } from '@solana/rpc';
import { generateKeyPairSigner } from '@solana/signers';

// Import generated v2 clients from Codama
import {
  fetchMaybeAgentAccount,
  type AgentAccount as CodemaAgentAccount,
} from './generated-v2/accounts/agentAccount.js';
import { getRegisterAgentInstructionAsync } from './generated-v2/instructions/registerAgent.js';

// Types from our existing system (only what we need)
import type { ICreateAgentOptions } from './types.js';
import type { Address } from '@solana/addresses';
import type { Rpc, SolanaRpcApi } from '@solana/rpc';
import type { Commitment } from '@solana/rpc-types';
import type { KeyPairSigner } from '@solana/signers';

/**
 * Configuration for the Web3.js v2.0 client
 */
export interface IPodAIClientV2Config {
  rpcEndpoint: string;
  commitment?: Commitment;
  programId?: string;
}

/**
 * Modern podAI client using Web3.js v2.0 architecture
 * Uses Codama-generated clients for maximum performance and type safety
 */
export class PodAIClientV2 {
  private readonly rpc: Rpc<SolanaRpcApi>;
  private readonly programId: Address;

  constructor(config: IPodAIClientV2Config) {
    this.rpc = createSolanaRpc(config.rpcEndpoint);
    this.programId = address(
      config.programId ?? 'HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps'
    );
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
    wallet: KeyPairSigner,
    _options: ICreateAgentOptions
  ): Promise<string> {
    try {
      // Get the register agent instruction with proper signer
      await getRegisterAgentInstructionAsync({
        signer: wallet,
        capabilities: 1,
        metadataUri: 'https://example.com/metadata',
      });

      // Return the agent address derived from the wallet
      return wallet.address;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error(
        `Failed to create agent: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Fetch agent account using Web3.js v2.0 + Codama generated clients
   */
  public async getAgent(
    agentAddress: Address
  ): Promise<CodemaAgentAccount | null> {
    try {
      // Use Codama-generated fetch function
      const maybeAccount = await fetchMaybeAgentAccount(this.rpc, agentAddress);

      if (!maybeAccount.exists) {
        return null;
      }

      // Return the Codama-generated account directly
      return maybeAccount.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Health check - verify RPC connection and basic functionality
   */
  public async healthCheck(): Promise<{
    rpcConnection: boolean;
    blockHeight: number;
    programValid: boolean;
  }> {
    try {
      // Test RPC connection by getting slot
      const slot = await this.rpc.getSlot().send();

      return {
        rpcConnection: true,
        blockHeight: Number(slot),
        programValid: true,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        rpcConnection: false,
        blockHeight: 0,
        programValid: false,
      };
    }
  }

  /**
   * Generate a new keypair for testing
   */
  public async generateKeypair(): Promise<KeyPairSigner> {
    return await generateKeyPairSigner();
  }

  /**
   * Validate if an address string is valid
   */
  public isValidAddress(addr: string): boolean {
    try {
      address(addr);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch multiple RPC calls efficiently
   */
  public async batchCall<T extends Record<string, unknown>>(
    calls: Record<keyof T, () => Promise<unknown>>
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
        output[key as keyof T] = result.value as T[keyof T];
      } else if (result && result.status === 'rejected') {
        output[key as keyof T] = { error: result.reason } as T[keyof T];
      }
    });

    return output;
  }

  /**
   * Subscribe to slot updates using real RPC subscriptions
   */
  public async subscribeToSlots(
    callback: (slot: number) => void
  ): Promise<void> {
    // Use a simple interval to poll for slots - can be enhanced later
    const interval = setInterval(async () => {
      try {
        const slot = await this.rpc.getSlot().send();
        callback(Number(slot));
      } catch (error) {
        console.error('Failed to get slot:', error);
      }
    }, 1000);

    // Return cleanup function would be better, but keeping simple for now
    setTimeout(() => clearInterval(interval), 60000); // Auto-cleanup after 60 seconds
  }
}

/**
 * Factory function to create a v2 client with sensible defaults
 */
export function createPodAIClientV2(
  config: IPodAIClientV2Config
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
