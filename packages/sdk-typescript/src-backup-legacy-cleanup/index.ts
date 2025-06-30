/**
 * PoD Protocol SDK - TypeScript SDK for PoD Protocol (Prompt or Die)
 *
 * This SDK provides a complete interface for interacting with the PoD Protocol
 * on Solana, enabling AI agents to register, communicate, and transact with each other.
 */

// Core client (v1 - Anchor-based)
export { PodComClient } from './client';

// Web3.js v2.0 Native Client (Modern)
export {
  PodAIClientV2,
  createPodAIClientV2,
  createDualClient,
  type PodAIClientV2Config,
} from './client-v2';

// Web3.js v1 ↔ v2 Compatibility Bridge
export {
  Web3Bridge,
  createWeb3Bridge,
  AutoConverter,
  EnhancedWeb3Bridge,
  isWeb3V1Context,
  isWeb3V2Context,
  type Web3BridgeConfig,
  type BridgeOptions,
  type CompatibleAddress,
  type CompatibleSigner,
} from './compatibility/web3-bridge';

// Migration Tools
export {
  AnchorWeb3Fixer,
  quickFix,
  generateMigrationGuide,
  type MigrationConfig,
  type FixResult,
} from './migration/anchor-web3-fixer';

// Web3.js v2.0 Generated Clients (Codama)
export * from './generated';

// Services
export { AgentService } from './services/agent';
export { MessageService } from './services/message';
export { ChannelService } from './services/channel';
export { EscrowService } from './services/escrow';
export { AnalyticsService } from './services/analytics';
export { DiscoveryService } from './services/discovery';
export { IPFSService } from './services/ipfs';
export { ZKCompressionService } from './services/zk-compression';

// Service types
export type {
  AgentAnalytics,
  MessageAnalytics,
  ChannelAnalytics,
  NetworkAnalytics,
  DashboardData,
} from './services/analytics';

export type {
  SearchFilters,
  SearchResult,
  RecommendationOptions,
  Recommendation,
} from './services/discovery';

export type {
  IPFSConfig,
  ChannelMessageContent,
  ParticipantExtendedMetadata,
  IPFSStorageResult,
} from './services/ipfs';

export type {
  ZKCompressionConfig,
  CompressedChannelMessage,
  CompressedChannelParticipant,
  BatchSyncOperation,
} from './services/zk-compression';

// Types and interfaces
export {
  PROGRAM_ID,
  MessageType,
  MessageStatus,
  ChannelVisibility,
  AGENT_CAPABILITIES,
  PodComError,
  ErrorCode,
} from './types';

export type {
  AgentAccount,
  MessageAccount,
  ChannelAccount,
  EscrowAccount,
  PodComConfig,
  CreateAgentOptions,
  UpdateAgentOptions,
  SendMessageOptions,
  CreateChannelOptions,
  DepositEscrowOptions,
  WithdrawEscrowOptions,
  AgentSearchFilters,
  MessageSearchFilters,
  ChannelSearchFilters,
  NetworkStatistics,
} from './types';

// Utility functions
export {
  findAgentPDA,
  findMessagePDA,
  findChannelPDA,
  findEscrowPDA,
  findParticipantPDA,
  findInvitationPDA,
  findChannelMessagePDA,
  getMessageTypeId,
  getMessageTypeFromId,
  hashPayload,
  hasCapability,
  addCapability,
  removeCapability,
  getCapabilityNames,
  lamportsToSol,
  solToLamports,
  isValidAddress,
  sleep,
  retry,
} from './utils';

// Re-export commonly used Solana types for convenience from Web3.js v2.0
export type { Address } from '@solana/addresses';
export type { Rpc } from '@solana/kit';
export type { KeyPairSigner } from '@solana/signers';
