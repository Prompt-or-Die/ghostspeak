# podAI Platform - Development Guide

## 🚀 Quick Start

### Prerequisites

Before starting development, ensure you have the following tools installed:

- **Bun** (≥1.2.15) - Primary package manager and runtime
- **Node.js** (≥20.0.0) - JavaScript runtime
- **Rust** (≥1.79.0) - Smart contract development
- **Cargo** (≥1.79.0) - Rust package manager
- **Anchor CLI** (≥0.31.1) - Solana smart contract framework
- **Solana CLI** (≥1.18.0) - Solana blockchain tools

### Installation

```bash
# Clone the repository
git clone https://github.com/podai/platform.git
cd platform

# Install dependencies
bun install

# Setup workspace
bun run setup-workspace

# Build all packages
bun run build

# Run tests
bun run test
```

## 🏗️ Architecture Overview

The podAI Platform follows a four-layer architecture:

1. **Layer 1: Blockchain Infrastructure** - Solana smart contracts, economic layer
2. **Layer 2: Edge Mesh Network** - P2P networking, real-time coordination
3. **Layer 3: Intelligence Layer** - AI processing, federated learning
4. **Layer 4: Application Interface** - User interfaces, developer tools

### Package Structure

```
podai-platform/
├── packages/
│   ├── core/                 # Rust smart contracts (Solana/Anchor)
│   ├── sdk-rust/            # Rust SDK for blockchain interaction
│   ├── sdk-typescript/      # TypeScript SDK for web applications
│   └── cli/                 # Command-line interface
├── tests/                   # Integration and E2E tests
├── docs/                    # Documentation
└── .cursor/                 # Development automation
```

## 📝 Development Workflow

### 1. Development Commands

```bash
# Start development mode
bun run dev

# Build specific packages
bun run build:rust          # Build Rust smart contracts
bun run build:typescript    # Build TypeScript packages
bun run build:wasm         # Build WebAssembly modules

# Development servers
bun run dev:cli             # CLI development mode
bun run dev:sdk-ts          # SDK TypeScript development
bun run dev:docs            # Documentation server
```

### 2. Testing

```bash
# Run all tests
bun run test

# Specific test suites
bun run test:rust           # Rust/Anchor tests
bun run test:typescript     # TypeScript/Jest tests
bun run test:integration    # Integration tests
bun run test:e2e           # End-to-end tests
bun run test:performance   # Performance benchmarks

# Test utilities
bun run test:watch         # Watch mode
bun run test:coverage      # Coverage report
```

### 3. Code Quality

```bash
# Linting
bun run lint               # Run all linters
bun run lint:rust          # Cargo clippy
bun run lint:typescript    # ESLint + TypeScript
bun run lint:fix           # Auto-fix issues

# Formatting
bun run format             # Format all code
bun run format:rust        # Cargo fmt
bun run format:typescript  # Prettier

# Validation
bun run validate           # Full validation suite
bun run validate:types     # TypeScript type checking
bun run validate:security  # Security audit
```

### 4. Documentation

```bash
# Generate documentation
bun run docs               # Generate all docs
bun run docs:api           # API documentation
bun run docs:rust          # Rust documentation
bun run docs:architecture  # Architecture diagrams

# Preview documentation
bun run docs:serve         # Serve docs locally
bun run docs:preview       # Generate and serve
```

## 🧪 Testing Strategy

### Test Pyramid

- **Unit Tests (70%)** - Fast, isolated component tests
- **Integration Tests (20%)** - Cross-component interaction tests  
- **E2E Tests (10%)** - Full user workflow tests

### Test Categories

1. **Smart Contract Tests**
   - Anchor framework tests
   - Program instruction validation
   - Account state verification
   - Economic model testing

2. **SDK Tests**
   - Client library functionality
   - API integration
   - Error handling
   - Performance benchmarks

3. **Integration Tests**
   - Cross-package interactions
   - Blockchain integration
   - Real network testing
   - AI model integration

4. **Performance Tests**
   - Load testing
   - Memory usage
   - Transaction throughput
   - Latency measurements

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Blockchain Configuration
SOLANA_NETWORK=devnet
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json

# AI Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Development Configuration
LOG_LEVEL=debug
NODE_ENV=development

# Testing Configuration
TEST_TIMEOUT=30000
TEST_PARALLEL=true
```

### Package-Specific Configuration

Each package has its own configuration:

- `packages/core/Anchor.toml` - Anchor/Solana configuration
- `packages/cli/config.json` - CLI configuration
- `packages/sdk-typescript/tsconfig.json` - TypeScript configuration

## 🚢 Deployment

### Development Deployment

```bash
# Deploy to devnet
bun run deploy:devnet

# Deploy specific components
bun run deploy:contracts     # Smart contracts only
bun run deploy:sdk          # SDK packages
```

### Production Deployment

```bash
# Full production build and deploy
bun run deploy:production

# Deploy to mainnet (requires authorization)
bun run deploy:mainnet
```

## 🤖 AI Development Features

### Code Analysis

The workspace includes AI-powered development tools:

```bash
# Analyze code complexity and patterns
bun run ai:analyze

# Optimize performance
bun run ai:optimize

# Review code quality
bun run ai:review

# Generate tests
bun run ai:test-gen
```

### Configuration

AI features are configured in `.ai-config.json`:

```json
{
  "ai": {
    "codeAnalysis": {
      "enabled": true,
      "complexity": {
        "maxCyclomaticComplexity": 10,
        "maxCognitiveComplexity": 15
      }
    },
    "testGeneration": {
      "enabled": true,
      "coverage": {
        "target": 90
      }
    }
  }
}
```

## 📊 Monitoring and Analytics

### Performance Monitoring

```bash
# Monitor development performance
bun run monitor

# Specific monitoring
bun run monitor:performance  # Application performance
bun run monitor:security     # Security vulnerabilities
bun run monitor:deps        # Dependency analysis
```

### Analytics Dashboard

The workspace includes comprehensive analytics:

- Build performance metrics
- Test execution times
- Code quality trends
- Dependency security status

## 🔒 Security

### Security Auditing

```bash
# Run security audits
bun run audit              # All security checks
bun run audit:rust         # Rust security audit
bun run audit:bun          # Bun security audit
bun run audit:npm          # NPM security audit
bun run audit:licenses     # License compliance
```

### Best Practices

1. **Never commit private keys or secrets**
2. **Use environment variables for configuration**
3. **Regular dependency updates**
4. **Security-first development approach**
5. **Code review for all changes**

## 🐛 Debugging

### Development Debugging

```bash
# Debug specific components
bun --inspect run dev       # Node.js debugging
cargo test -- --nocapture  # Rust debugging
anchor test --skip-build   # Anchor debugging
```

### Log Analysis

```bash
# View logs
tail -f logs/development.log

# Structured logging
bun run logs:analyze
```

## 🚀 Performance Optimization

### Build Optimization

```bash
# Optimized builds
bun run build:optimized     # Native CPU optimization
bun run build:production    # Production optimization
```

### Bundle Analysis

```bash
# Analyze bundle sizes
bun run analyze:bundle
bun run analyze:deps
```

## 🔄 Continuous Integration

### GitHub Actions

The workspace includes comprehensive CI/CD pipelines:

- **Linting & Formatting** - Code quality checks
- **Testing** - Comprehensive test suite
- **Security** - Vulnerability scanning
- **Build** - Multi-platform builds
- **Deploy** - Automated deployments

### Local CI Simulation

```bash
# Simulate CI pipeline locally
bun run ci:simulate
```

## 📚 Additional Resources

### Documentation

- [Architecture Decision Records](./adr/) - Technical decisions
- [API Documentation](./docs/api/) - Generated API docs
- [Contributing Guide](./CONTRIBUTING.md) - Contribution guidelines

### External Links

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://coral-xyz.github.io/anchor/)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   bun run clean
   bun run fresh
   ```

2. **Test Failures**
   ```bash
   # Reset test environment
   bun run test:reset
   ```

3. **Dependency Issues**
   ```bash
   # Update dependencies
   bun run deps:update
   ```

### Getting Help

- Check existing [Issues](https://github.com/podai/platform/issues)
- Review [Discussions](https://github.com/podai/platform/discussions)
- Join our [Discord](https://discord.gg/podai)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! 🎉**

For questions or support, reach out to the development team or create an issue in the repository. 