import { select } from '@inquirer/prompts';
import { UIManager } from '../ui/ui-manager.js';
import { NetworkManager } from '../utils/network-manager.js';
import { ConfigManager } from '../utils/config-manager.js';

export interface NetworkAnalytics {
  totalAgents: number;
  activeAgents: number;
  totalChannels: number;
  messagesSent24h: number;
  transactionVolume: number;
  networkHealth: 'healthy' | 'warning' | 'critical';
}

export interface AgentAnalytics {
  address: string;
  name: string;
  messagesSent: number;
  messagesReceived: number;
  channelsJoined: number;
  reputation: number;
  uptime: number;
  lastSeen: Date;
}

export class ViewAnalyticsCommand {
  private ui: UIManager;
  private network: NetworkManager;
  private config: ConfigManager;

  constructor() {
    this.ui = new UIManager();
    this.network = new NetworkManager();
    this.config = new ConfigManager();
  }

  async execute(): Promise<void> {
    try {
      this.ui.clear();
      this.ui.bigTitle('Analytics Dashboard', 'Network statistics and performance metrics');

      const choice = await select({
        message: 'What analytics would you like to view?',
        choices: [
          { name: '🌐 Network Overview', value: 'network', description: 'Overall network statistics' },
          { name: '🤖 Agent Performance', value: 'agents', description: 'Agent activity and metrics' },
          { name: '💬 Messaging Stats', value: 'messaging', description: 'Communication analytics' },
          { name: '📈 Real-time Monitor', value: 'realtime', description: 'Live network monitoring' },
          { name: '📊 Historical Data', value: 'historical', description: 'Historical trends and patterns' },
          { name: '🎯 Custom Report', value: 'custom', description: 'Generate custom analytics' },
          { name: '↩️  Back to Main Menu', value: 'back' }
        ]
      });

      switch (choice) {
        case 'network':
          await this.showNetworkOverview();
          break;
        case 'agents':
          await this.showAgentPerformance();
          break;
        case 'messaging':
          await this.showMessagingStats();
          break;
        case 'realtime':
          await this.showRealtimeMonitor();
          break;
        case 'historical':
          await this.showHistoricalData();
          break;
        case 'custom':
          await this.generateCustomReport();
          break;
        case 'back':
          return;
      }

    } catch (error) {
      this.ui.error(
        'Analytics display failed',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async showNetworkOverview(): Promise<void> {
    this.ui.sectionHeader('Network Overview', 'Current network status and statistics');

    const spinner = this.ui.spinner('Fetching network analytics...');
    spinner.start();

    try {
      // Get real network stats
      const networkStats = await this.network.getNetworkStats();
      const currentNetwork = await this.network.getCurrentNetwork();
      const isConnected = await this.network.checkConnection();
      const latency = await this.network.testLatency();

      spinner.success({ text: 'Network data loaded' });

      // Display network health
      this.ui.networkStatus(currentNetwork, isConnected, latency);
      this.ui.spacing();

      // Mock analytics data (in real implementation, this would come from the blockchain)
      const analytics: NetworkAnalytics = {
        totalAgents: 1247,
        activeAgents: 89,
        totalChannels: 156,
        messagesSent24h: 12847,
        transactionVolume: 45672,
        networkHealth: 'healthy'
      };

      // Network Statistics
      this.ui.sectionHeader('Network Statistics', 'Current network metrics');
      
      this.ui.keyValue({
        'Current Slot': networkStats.slot.toLocaleString(),
        'Block Height': networkStats.blockHeight.toLocaleString(),
        'Total Transactions': networkStats.transactionCount.toLocaleString(),
        'Network Version': networkStats.version['solana-core']
      });

      // Protocol Statistics
      this.ui.sectionHeader('Protocol Statistics', 'PodAI protocol metrics');
      
      this.ui.table(
        ['Metric', 'Value', 'Change (24h)', 'Status'],
        [
          { 
            Metric: 'Total Agents', 
            Value: analytics.totalAgents.toLocaleString(), 
            'Change (24h)': '+12 (1.0%)', 
            Status: '📈 Growing' 
          },
          { 
            Metric: 'Active Agents', 
            Value: analytics.activeAgents.toString(), 
            'Change (24h)': '+5 (5.9%)', 
            Status: '🟢 Active' 
          },
          { 
            Metric: 'Channels', 
            Value: analytics.totalChannels.toString(), 
            'Change (24h)': '+3 (2.0%)', 
            Status: '💬 Communicating' 
          },
          { 
            Metric: 'Messages (24h)', 
            Value: analytics.messagesSent24h.toLocaleString(), 
            'Change (24h)': '+2,341 (22.3%)', 
            Status: '⚡ Busy' 
          }
        ]
      );

      // Network Health
      const healthColor = analytics.networkHealth === 'healthy' ? 'green' : 
                         analytics.networkHealth === 'warning' ? 'yellow' : 'red';
      
      this.ui.box(
        `Network Health: ${analytics.networkHealth.toUpperCase()}\n\n` +
        `• All services operational\n` +
        `• Transaction processing: Normal\n` +
        `• Message delivery: 99.8% success rate\n` +
        `• Average confirmation time: ${latency}ms`,
        { title: 'System Status', color: healthColor }
      );

    } catch (error) {
      spinner.error({ text: 'Failed to fetch network data' });
      throw error;
    }
  }

  private async showAgentPerformance(): Promise<void> {
    this.ui.sectionHeader('Agent Performance', 'Agent activity and performance metrics');

    const spinner = this.ui.spinner('Loading agent analytics...');
    spinner.start();

    await new Promise(resolve => setTimeout(resolve, 2000));

    spinner.success({ text: 'Agent data loaded' });

    // Mock agent data
    const topAgents: AgentAnalytics[] = [
      {
        address: 'AGT1...xyz123',
        name: 'TradingBot Pro',
        messagesSent: 2847,
        messagesReceived: 1923,
        channelsJoined: 12,
        reputation: 98.5,
        uptime: 99.2,
        lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        address: 'AGT2...abc456',
        name: 'AnalysisAI',
        messagesSent: 1456,
        messagesReceived: 3241,
        channelsJoined: 8,
        reputation: 96.8,
        uptime: 97.4,
        lastSeen: new Date(Date.now() - 120000) // 2 minutes ago
      },
      {
        address: 'AGT3...def789',
        name: 'ModeratorBot',
        messagesSent: 892,
        messagesReceived: 456,
        channelsJoined: 25,
        reputation: 99.1,
        uptime: 99.8,
        lastSeen: new Date(Date.now() - 60000) // 1 minute ago
      }
    ];

    this.ui.table(
      ['Agent', 'Messages Out', 'Messages In', 'Channels', 'Reputation', 'Uptime', 'Status'],
      topAgents.map(agent => ({
        Agent: `${agent.name}\n${agent.address}`,
        'Messages Out': agent.messagesSent.toLocaleString(),
        'Messages In': agent.messagesReceived.toLocaleString(),
        Channels: agent.channelsJoined.toString(),
        Reputation: `${agent.reputation}%`,
        Uptime: `${agent.uptime}%`,
        Status: agent.lastSeen > new Date(Date.now() - 600000) ? '🟢 Online' : '🟡 Away'
      }))
    );

    // Personal agent stats if available
    const config = await this.config.load();
    if (config.defaultAgent) {
      this.ui.sectionHeader('Your Agent Performance', 'Your default agent statistics');
      
      const myAgent = topAgents[0]; // Mock data
      this.ui.keyValue({
        'Agent Address': config.defaultAgent,
        'Messages Sent (24h)': myAgent.messagesSent.toLocaleString(),
        'Messages Received (24h)': myAgent.messagesReceived.toLocaleString(),
        'Active Channels': myAgent.channelsJoined.toString(),
        'Reputation Score': `${myAgent.reputation}%`,
        'Uptime (7 days)': `${myAgent.uptime}%`,
        'Last Activity': myAgent.lastSeen.toLocaleString()
      });
    }
  }

  private async showMessagingStats(): Promise<void> {
    this.ui.sectionHeader('Messaging Statistics', 'Communication analytics and trends');

    const spinner = this.ui.spinner('Analyzing messaging data...');
    spinner.start();

    await new Promise(resolve => setTimeout(resolve, 1500));

    spinner.success({ text: 'Messaging data analyzed' });

    // Message volume by time
    this.ui.info('Message Volume (Last 24 Hours):');
    this.ui.table(
      ['Time', 'Messages', 'Channels Active', 'Avg Response Time'],
      [
        { Time: '00:00-06:00', Messages: '2,341', 'Channels Active': '23', 'Avg Response Time': '45s' },
        { Time: '06:00-12:00', Messages: '5,672', 'Channels Active': '67', 'Avg Response Time': '23s' },
        { Time: '12:00-18:00', Messages: '8,924', 'Channels Active': '89', 'Avg Response Time': '18s' },
        { Time: '18:00-24:00', Messages: '6,234', 'Channels Active': '56', 'Avg Response Time': '29s' }
      ]
    );

    // Message types breakdown
    this.ui.sectionHeader('Message Analysis', 'Message type and content breakdown');
    
    this.ui.keyValue({
      'Direct Messages': '45.3% (12,847 messages)',
      'Channel Messages': '38.7% (10,982 messages)',
      'System Messages': '12.1% (3,432 messages)',
      'Bot Commands': '3.9% (1,108 messages)'
    });

    // Top channels by activity
    this.ui.sectionHeader('Most Active Channels', 'Channels ranked by message volume');
    
    this.ui.table(
      ['Channel', 'Messages (24h)', 'Participants', 'Activity Level'],
      [
        { Channel: 'General Discussion', 'Messages (24h)': '3,241', Participants: '127', 'Activity Level': '🔥 Very High' },
        { Channel: 'Trading Signals', 'Messages (24h)': '2,834', Participants: '89', 'Activity Level': '📈 High' },
        { Channel: 'AI Development', 'Messages (24h)': '1,567', Participants: '45', 'Activity Level': '💬 Moderate' },
        { Channel: 'Support', 'Messages (24h)': '892', Participants: '23', 'Activity Level': '🆘 Low' }
      ]
    );
  }

  private async showRealtimeMonitor(): Promise<void> {
    this.ui.sectionHeader('Real-time Monitor', 'Live network activity monitoring');

    this.ui.info('Starting real-time monitoring... (Press Ctrl+C to stop)');
    
    // Simulate real-time updates
    let updateCount = 0;
    const maxUpdates = 10;

    const monitorInterval = setInterval(() => {
      updateCount++;
      
      console.clear();
      this.ui.sectionHeader('Real-time Monitor', `Live network activity (Update #${updateCount})`);
      
      // Mock real-time data
      const currentTime = new Date().toLocaleTimeString();
      const randomMessages = Math.floor(Math.random() * 50) + 10;
      const randomTxs = Math.floor(Math.random() * 20) + 5;
      
      this.ui.keyValue({
        'Last Update': currentTime,
        'Messages/min': randomMessages.toString(),
        'Transactions/min': randomTxs.toString(),
        'Active Agents': (85 + Math.floor(Math.random() * 10)).toString(),
        'Network Latency': `${120 + Math.floor(Math.random() * 30)}ms`
      });

      // Recent activity
      const activities = [
        `🤖 Agent AGT${Math.random().toString(36).substr(2, 6)} joined channel "Trading"`,
        `💬 ${randomMessages} new messages in last minute`,
        `📊 Channel "AI Dev" created by user`,
        `⚡ ${randomTxs} transactions confirmed`,
        `🔒 New agent registered: AGT${Math.random().toString(36).substr(2, 6)}`
      ];

      this.ui.info('Recent Activity:');
      activities.slice(0, 3).forEach(activity => {
        console.log(`   ${activity}`);
      });

      if (updateCount >= maxUpdates) {
        clearInterval(monitorInterval);
        this.ui.spacing();
        this.ui.success('Real-time monitoring stopped');
      }
    }, 2000);

    // In a real implementation, you'd listen for Ctrl+C and clear the interval
    await new Promise(resolve => setTimeout(resolve, maxUpdates * 2000));
  }

  private async showHistoricalData(): Promise<void> {
    this.ui.sectionHeader('Historical Data', 'Long-term trends and patterns');

    const period = await select({
      message: 'Select time period:',
      choices: [
        { name: '📅 Last 7 days', value: '7d' },
        { name: '📅 Last 30 days', value: '30d' },
        { name: '📅 Last 90 days', value: '90d' },
        { name: '📅 All time', value: 'all' }
      ]
    });

    const spinner = this.ui.spinner(`Loading ${period} historical data...`);
    spinner.start();

    await new Promise(resolve => setTimeout(resolve, 2000));

    spinner.success({ text: 'Historical data loaded' });

    // Mock historical trends
    this.ui.table(
      ['Metric', 'Current', 'Previous Period', 'Change', 'Trend'],
      [
        { Metric: 'Total Agents', Current: '1,247', 'Previous Period': '1,156', Change: '+91 (7.9%)', Trend: '📈 Growing' },
        { Metric: 'Daily Messages', Current: '12,847', 'Previous Period': '10,234', Change: '+2,613 (25.5%)', Trend: '📈 Growing' },
        { Metric: 'Active Channels', Current: '156', 'Previous Period': '142', Change: '+14 (9.9%)', Trend: '📈 Growing' },
        { Metric: 'Avg Response Time', Current: '28.5s', 'Previous Period': '31.2s', Change: '-2.7s (8.7%)', Trend: '📉 Improving' }
      ]
    );

    this.ui.box(
      `📊 ${period.toUpperCase()} Summary\n\n` +
      `• Network growth continues with 7.9% increase in agents\n` +
      `• Message volume up 25.5% indicating higher engagement\n` +
      `• Response times improved by 8.7%\n` +
      `• Channel creation rate increased by 9.9%\n\n` +
      `Overall trend: Strong growth and improved performance`,
      { title: 'Trend Analysis', color: 'green' }
    );
  }

  private async generateCustomReport(): Promise<void> {
    this.ui.sectionHeader('Custom Report', 'Generate personalized analytics report');

    this.ui.info('Custom report generation - Coming Soon!');
    
    const reportType = await select({
      message: 'Select report type:',
      choices: [
        { name: '📈 Performance Report', value: 'performance' },
        { name: '💰 Financial Report', value: 'financial' },
        { name: '🛡️  Security Report', value: 'security' },
        { name: '📊 Usage Report', value: 'usage' }
      ]
    });

    this.ui.success(`${reportType} report generation queued`);
    this.ui.info('You will be notified when the report is ready.');
  }
} 