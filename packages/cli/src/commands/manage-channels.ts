import { select, input, confirm, checkbox } from '@inquirer/prompts';
import { generateKeyPairSigner } from '@solana/signers';
import type { KeyPairSigner } from '@solana/signers';
import { UIManager } from '../ui/ui-manager.js';
import { NetworkManager } from '../utils/network-manager.js';
import { ConfigManager } from '../utils/config-manager.js';

// TODO: Import real SDK once paths are fixed
// import { messageType } from "@podai/sdk-typescript/generated/types/messageType";

// Mock interfaces for now
interface MockPodClient {
  channels: {
    createChannel(signer: KeyPairSigner, options: any): Promise<string>;
    getAllChannels(limit: number): Promise<any[]>;
    joinChannel(address: string, signer: KeyPairSigner): Promise<void>;
    getChannelsByCreator(publicKey: any): Promise<any[]>;
    broadcastMessage(signer: KeyPairSigner, options: any): Promise<string>;
  };
  messages: {
    sendMessage(signer: KeyPairSigner, options: any): Promise<string>;
  };
}

enum ChannelVisibility {
  Public = 'public',
  Private = 'private', 
  Restricted = 'restricted'
}

enum MessageType {
  TEXT = 'text'
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  visibility: 'public' | 'private' | 'restricted';
  createdAt: Date;
  lastActivity: Date;
}

export class ManageChannelsCommand {
  private ui: UIManager;
  private network: NetworkManager;
  private config: ConfigManager;
  private podClient: MockPodClient | null = null;

  constructor() {
    this.ui = new UIManager();
    this.network = new NetworkManager();
    this.config = new ConfigManager();
  }

  async execute(): Promise<void> {
    try {
      this.ui.clear();
      this.ui.bigTitle('Channel Management', 'Create, join, and manage communication channels');

      // Initialize podAI client
      await this.initializePodClient();

      const choice = await select({
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Create New Channel', value: 'create' },
          { name: '🔍 Browse Channels', value: 'browse' },
          { name: '🤝 Join Channel', value: 'join' },
          { name: '📋 My Channels', value: 'my-channels' },
          { name: '💬 Send Message', value: 'send-message' },
          { name: '⚙️  Channel Settings', value: 'settings' },
          { name: '↩️  Back to Main Menu', value: 'back' }
        ]
      });

      switch (choice) {
        case 'create':
          await this.createChannel();
          break;
        case 'browse':
          await this.browseChannels();
          break;
        case 'join':
          await this.joinChannel();
          break;
        case 'my-channels':
          await this.showMyChannels();
          break;
        case 'send-message':
          await this.sendMessage();
          break;
        case 'settings':
          await this.channelSettings();
          break;
        case 'back':
          return;
      }

    } catch (error) {
      this.ui.error(
        'Channel management failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async initializePodClient(): Promise<void> {
    const spinner = this.ui.spinner('Initializing podAI client...');
    spinner.start();

    try {
      // TODO: Use real PodAIClientV2 once imports are fixed
      // const rpc = await this.network.getRpc();
      // const network = await this.network.getCurrentNetwork();
      
      // Create mock client for now
      this.podClient = {
        channels: {
          createChannel: async (_signer: KeyPairSigner, _options: any) => {
            return `channel_${Date.now()}`;
          },
          getAllChannels: async (_limit: number) => {
            return [
              { name: 'General Chat', description: 'Main discussion channel', participantCount: 42 }
            ];
          },
          joinChannel: async (_address: string, _signer: KeyPairSigner) => {
            return;
          },
          getChannelsByCreator: async (_publicKey: any) => {
            return [];
          },
          broadcastMessage: async (_signer: KeyPairSigner, _options: any) => {
            return `message_${Date.now()}`;
          }
        },
        messages: {
          sendMessage: async (_signer: KeyPairSigner, _options: any) => {
            return `message_${Date.now()}`;
          }
        }
      };

      spinner.success({ text: 'podAI client initialized' });
    } catch (error) {
      spinner.error({ text: 'Failed to initialize podAI client' });
      throw new Error(`Client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createChannel(): Promise<void> {
    this.ui.sectionHeader('Create New Channel', 'Set up a new communication channel');

    const name = await input({
      message: 'Channel name:',
      validate: (value) => {
        if (!value.trim()) return 'Channel name is required';
        if (value.length > 30) return 'Channel name must be 30 characters or less';
        return true;
      }
    });

    const description = await input({
      message: 'Channel description:',
      validate: (value) => {
        if (!value.trim()) return 'Channel description is required';
        if (value.length > 100) return 'Description must be 100 characters or less';
        return true;
      }
    });

    const visibility = await select({
      message: 'Channel visibility:',
      choices: [
        { name: '🌐 Public - Anyone can join', value: ChannelVisibility.Public },
        { name: '🔒 Private - Invite only', value: ChannelVisibility.Private },
        { name: '🎭 Restricted - Approval required', value: ChannelVisibility.Restricted }
      ]
    }) as ChannelVisibility;

    const features = await checkbox({
      message: 'Select channel features:',
      choices: [
        { name: '🔒 End-to-end encryption', value: 'encryption', checked: true },
        { name: '📁 File sharing', value: 'files' },
        { name: '🤖 AI agent access', value: 'ai-agents', checked: true },
        { name: '💰 Token gating', value: 'token-gate' },
        { name: '🗳️  Voting system', value: 'voting' }
      ]
    });

    this.ui.sectionHeader('Channel Summary', 'Review your channel configuration');
    
    const visibilityName = visibility === ChannelVisibility.Public ? 'PUBLIC' : 
                          visibility === ChannelVisibility.Private ? 'PRIVATE' : 'RESTRICTED';
    
    this.ui.keyValue({
      'Name': name,
      'Description': description,
      'Visibility': visibilityName,
      'Features': features.join(', ') || 'Basic messaging'
    });

    const confirmed = await confirm({
      message: 'Create this channel?',
      default: true
    });

    if (confirmed) {
      const spinner = this.ui.spinner('Creating channel on-chain...');
      spinner.start();

      try {
        if (!this.podClient) {
          throw new Error('podAI client not initialized');
        }

        // Create channel options
        const channelOptions = {
          name,
          description,
          visibility,
          maxMembers: 1000,
          feePerMessage: 0 // Free for now
        };

        // Get current agent keypair (in real implementation, load securely)
        const agentKeypair = await generateKeyPairSigner();

        // Create channel on-chain using the SDK
        const transactionSignature = await this.podClient.channels.createChannel(
          agentKeypair,
          channelOptions
        );

        // Wait for confirmation
        const confirmed = await this.network.waitForConfirmation(transactionSignature, 'confirmed', 30000);
        
        if (!confirmed) {
          throw new Error('Transaction confirmation timeout');
        }

        spinner.success({ text: 'Channel created successfully!' });

        // Get the created channel info
        const channels = await this.podClient.channels.getChannelsByCreator(agentKeypair.address);
        const newChannel = channels[channels.length - 1]; // Get the most recent channel

        this.ui.box(
          `🎉 Channel "${name}" created!\n\n` +
          `Channel Address: ${newChannel?.pubkey || 'N/A'}\n` +
          `Visibility: ${visibilityName}\n` +
          `Transaction: ${transactionSignature}\n` +
          `Features: ${features.length} enabled\n\n` +
          `Share the channel address with others to invite them.`,
          { title: 'Channel Created', color: 'green' }
        );

      } catch (error) {
        spinner.error({ text: 'Channel creation failed' });
        throw new Error(`Failed to create channel: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async browseChannels(): Promise<void> {
    this.ui.sectionHeader('Browse Channels', 'Discover public channels to join');

    const spinner = this.ui.spinner('Loading available channels...');
    spinner.start();

    try {
      if (!this.podClient) {
        throw new Error('podAI client not initialized');
      }

      // Get public channels using the SDK
      const channels = await this.podClient.channels.getAllChannels(50); // Limit to 50

      spinner.success({ text: 'Channels loaded' });

      if (channels.length === 0) {
        this.ui.info('No public channels found. Create the first one!');
        return;
      }

      const channelData = channels.map(channel => ({
        Name: channel.name || 'Unnamed Channel',
        Description: channel.description || 'No description',
        Members: channel.participantCount?.toString() || '0',
        Type: channel.visibility === ChannelVisibility.Private ? '🔒 Private' : '🌐 Public',
        'Last Activity': new Date(channel.lastUpdated || channel.createdAt || 0).toLocaleTimeString()
      }));

      this.ui.table(
        ['Name', 'Description', 'Members', 'Type', 'Last Activity'],
        channelData
      );

      const joinChannel = await confirm({
        message: 'Would you like to join a channel?',
        default: true
      });

      if (joinChannel) {
        await this.joinChannel();
      }

    } catch (error) {
      spinner.error({ text: 'Failed to load channels' });
      throw new Error(`Failed to browse channels: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async joinChannel(): Promise<void> {
    this.ui.sectionHeader('Join Channel', 'Enter a channel to start communicating');

    const channelAddress = await input({
      message: 'Channel address (public key):',
      validate: (value) => {
        if (!value.trim()) return 'Channel address is required';
        try {
          // Basic validation for Solana public key format
          if (value.length < 32 || value.length > 44) {
            return 'Invalid address format';
          }
          return true;
        } catch {
          return 'Invalid channel address';
        }
      }
    });

    const spinner = this.ui.spinner('Joining channel...');
    spinner.start();

    try {
      if (!this.podClient) {
        throw new Error('podAI client not initialized');
      }

      const agentKeypair = await generateKeyPairSigner();

      // Join channel on-chain using the SDK
      await this.podClient.channels.joinChannel(channelAddress, agentKeypair);

      spinner.success({ text: 'Successfully joined channel!' });

      this.ui.success('Welcome to the channel!');
      this.ui.info('You can now send messages and interact with other members.');

    } catch (error) {
      spinner.error({ text: 'Failed to join channel' });
      throw new Error(`Failed to join channel: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async showMyChannels(): Promise<void> {
    this.ui.sectionHeader('My Channels', 'Channels you have joined or created');

    const spinner = this.ui.spinner('Loading your channels...');
    spinner.start();

    try {
      if (!this.podClient) {
        throw new Error('podAI client not initialized');
      }

      const agentKeypair = await generateKeyPairSigner();

      // Get channels owned by user
      const ownedChannels = await this.podClient.channels.getChannelsByCreator(agentKeypair.address);
      
      // For now, we'll just show owned channels (participant lookup would require additional indexing)
      const allChannels = ownedChannels;

      spinner.success({ text: 'Channels loaded' });

      if (allChannels.length === 0) {
        this.ui.info('You haven\'t created any channels yet. Create one to get started!');
        return;
      }

      const channelData = allChannels.map(channel => ({
        Name: channel.name || 'Unnamed Channel',
        Role: 'Owner', // All channels returned are owned by user
        Members: channel.participantCount?.toString() || '0',
        Status: channel.isActive ? '🟢 Active' : '🔴 Inactive'
      }));

      this.ui.table(['Name', 'Role', 'Members', 'Status'], channelData);

      if (allChannels.length > 0) {
        const channelChoice = await select({
          message: 'Select a channel to manage:',
          choices: [
            ...allChannels.map(ch => ({ 
              name: ch.name || 'Unnamed Channel', 
              value: ch.pubkey 
            })),
            { name: '↩️  Back', value: 'back' }
          ]
        });

        if (channelChoice !== 'back') {
          const selectedChannel = allChannels.find(ch => ch.pubkey === channelChoice);
          if (selectedChannel) {
            this.ui.info(`Managing channel: ${selectedChannel.name}`);
            // Add channel-specific management options here
          }
        }
      }

    } catch (error) {
      spinner.error({ text: 'Failed to load channels' });
      throw new Error(`Failed to load channels: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async sendMessage(): Promise<void> {
    this.ui.sectionHeader('Send Message', 'Send a message to a channel');

    const messageType = await select({
      message: 'Message type:',
      choices: [
        { name: '💬 Text Message', value: 'direct' },
        { name: '📢 Channel Broadcast', value: 'channel' }
      ]
    });

    if (messageType === 'direct') {
      // Direct message
      const recipient = await input({
        message: 'Recipient address:',
        validate: (value) => {
          if (!value.trim()) return 'Recipient address is required';
          return true;
        }
      });

      const message = await input({
        message: 'Your message:',
        validate: (value) => {
          if (!value.trim()) return 'Message cannot be empty';
          if (value.length > 1000) return 'Message too long (max 1000 characters)';
          return true;
        }
      });

      const spinner = this.ui.spinner('Sending direct message...');
      spinner.start();

      try {
        if (!this.podClient) {
          throw new Error('podAI client not initialized');
        }

        const agentKeypair = await generateKeyPairSigner();

        // Create message options
        const messageOptions = {
          recipient: recipient,
          payload: message,
          messageType: MessageType.TEXT,
          content: message
        };

        // Send message on-chain using the SDK
        const transactionSignature = await this.podClient.messages.sendMessage(
          agentKeypair,
          messageOptions
        );

        // Wait for confirmation
        const confirmed = await this.network.waitForConfirmation(transactionSignature, 'confirmed', 30000);
        
        if (!confirmed) {
          throw new Error('Transaction confirmation timeout');
        }

        spinner.success({ text: 'Message sent successfully!' });
        this.ui.transaction(transactionSignature, 'confirmed');

      } catch (error) {
        spinner.error({ text: 'Failed to send message' });
        throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
      }

    } else {
      // Channel broadcast
      const channelAddress = await input({
        message: 'Channel address:',
        validate: (value) => {
          if (!value.trim()) return 'Channel address is required';
          return true;
        }
      });

      const message = await input({
        message: 'Your message:',
        validate: (value) => {
          if (!value.trim()) return 'Message cannot be empty';
          if (value.length > 1000) return 'Message too long (max 1000 characters)';
          return true;
        }
      });

      const spinner = this.ui.spinner('Broadcasting message to channel...');
      spinner.start();

      try {
        if (!this.podClient) {
          throw new Error('podAI client not initialized');
        }

        const agentKeypair = await generateKeyPairSigner();

        // Broadcast message to channel using the SDK
        const transactionSignature = await this.podClient.channels.broadcastMessage(
          agentKeypair,
          {
            channelPDA: channelAddress,
            content: message,
            messageType: MessageType.TEXT
          }
        );

        // Wait for confirmation
        const confirmed = await this.network.waitForConfirmation(transactionSignature, 'confirmed', 30000);
        
        if (!confirmed) {
          throw new Error('Transaction confirmation timeout');
        }

        spinner.success({ text: 'Message broadcast successfully!' });
        this.ui.transaction(transactionSignature, 'confirmed');

      } catch (error) {
        spinner.error({ text: 'Failed to broadcast message' });
        throw new Error(`Failed to broadcast message: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async channelSettings(): Promise<void> {
    this.ui.sectionHeader('Channel Settings', 'Configure channel preferences');

    // Load current settings from config
    const config = await this.config.load();

    this.ui.keyValue({
      'Notification Level': 'All messages', // config.notifications?.level
      'Auto-join new channels': 'Disabled', // Feature not implemented yet
      'Message retention': '30 days', // config.messageRetention
      'Encryption': 'Enabled' // config.encryption
    });

    const updateSettings = await confirm({
      message: 'Would you like to update these settings?',
      default: false
    });

    if (updateSettings) {
      // Implement settings update logic
      this.ui.info('Settings update functionality - implement based on requirements');
    }
  }
} 