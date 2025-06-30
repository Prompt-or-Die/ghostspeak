/**
 * Transaction utilities for Web3.js v2.0
 * Handles transaction creation, sending, and confirmation
 */

import type { Address } from '@solana/addresses';
import type { IInstruction } from '@solana/instructions';
import type { Rpc, SolanaRpcApi, GetSignatureStatusesApi } from '@solana/rpc';
import type { Commitment } from '@solana/rpc-types';
import type { KeyPairSigner } from '@solana/signers';

export interface TransactionOptions {
  commitment?: Commitment;
  timeout?: number;
  skipPreflight?: boolean;
  maxRetries?: number;
}

/**
 * Send and confirm a transaction using Web3.js v2.0
 * @param rpc - The RPC client
 * @param instructions - Array of instructions to include
 * @param signer - Transaction signer
 * @param options - Transaction options
 * @returns Promise resolving to transaction signature
 */
export async function sendAndConfirmTransactionV2(
  rpc: Rpc<SolanaRpcApi>,
  instructions: IInstruction[],
  signer: KeyPairSigner,
  options: TransactionOptions = {}
): Promise<string> {
  const {
    commitment = 'confirmed',
    timeout = 60000,
    skipPreflight = false,
    maxRetries = 3,
  } = options;

  try {
    // Import transaction creation utilities
    const { pipe } = await import('@solana/functional');
    const {
      createTransactionMessage,
      setTransactionMessageFeePayer,
      setTransactionMessageLifetimeUsingBlockhash,
      compileTransaction,
      signTransaction,
    } = await import('@solana/transactions');

    // Get recent blockhash
    const {
      value: { blockhash, lastValidBlockHeight },
    } = await rpc.getLatestBlockhash({ commitment }).send();

    // Create transaction message
    const transactionMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayer(signer.address, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
      (tx) => {
        // Add instructions
        instructions.forEach((instruction) => {
          tx.instructions.push(instruction);
        });
        return tx;
      }
    );

    // Compile and sign transaction
    const transaction = pipe(compileTransaction(transactionMessage), (tx) =>
      signTransaction([signer], tx)
    );

    // Send transaction
    const signature = await rpc
      .sendTransaction(transaction, {
        skipPreflight,
        maxRetries,
      })
      .send();

    // Wait for confirmation
    await confirmTransaction(rpc, signature, {
      commitment,
      timeout,
      lastValidBlockHeight,
    });

    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error(
      `Transaction failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Confirm a transaction
 * @param rpc - The RPC client
 * @param signature - Transaction signature
 * @param options - Confirmation options
 */
async function confirmTransaction(
  rpc: Rpc<SolanaRpcApi & GetSignatureStatusesApi>,
  signature: string,
  options: {
    commitment?: Commitment;
    timeout?: number;
    lastValidBlockHeight?: number;
  } = {}
): Promise<void> {
  const {
    commitment = 'confirmed',
    timeout = 60000,
    lastValidBlockHeight,
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Check signature status
      const { value: statuses } = await rpc
        .getSignatureStatuses([signature], { searchTransactionHistory: true })
        .send();

      const status = statuses[0];

      if (status) {
        if (status.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
        }

        if (
          status.confirmationStatus === commitment ||
          (commitment === 'confirmed' &&
            status.confirmationStatus === 'finalized')
        ) {
          return; // Transaction confirmed
        }
      }

      // Check if blockhash is still valid (if provided)
      if (lastValidBlockHeight) {
        const currentBlockHeight = await rpc.getBlockHeight().send();
        if (currentBlockHeight > lastValidBlockHeight) {
          throw new Error('Transaction expired - blockhash no longer valid');
        }
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Transaction failed')
      ) {
        throw error;
      }
      // Continue polling for other errors
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
}
