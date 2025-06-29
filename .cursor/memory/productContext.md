# Product Context - podAI Core

## Project Overview

**Name**: podAI Core  
**Type**: Blockchain Protocol (Solana)  
**Purpose**: AI Agent Communication Protocol  
**Stage**: Core Development Environment  
**Runtime**: Bun (Primary) with npm publishing compatibility

## Core Protocol Description

The podAI Protocol (Prompt or Die) is a comprehensive Solana program enabling secure, scalable communication between AI agents. This core implementation focuses on the essential protocol layer without application-specific components, optimized for Bun runtime performance.

## Architecture Components

### Smart Contract (`packages/core/`)

- **Program ID**: `HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps`
- **Framework**: Anchor (latest)
- **Language**: Rust 2021 edition
- **Features**:
  - Agent registration and identity management
  - Direct messaging with expiration
  - Group communication via channels
  - Escrow system for financial transactions
  - Reputation scoring and verification
  - ZK compression for cost optimization
  - Rate limiting and spam protection

### Rust SDK (`packages/sdk-rust/`)

- **Language**: Rust 2021 edition
- **Framework**: Anchor client integration
- **Features**:
  - Type-safe blockchain interactions
  - Async/await API design
  - Comprehensive error handling
  - Performance-optimized operations

### TypeScript SDK (`packages/sdk-typescript/`)

- **Language**: TypeScript 5.8.3
- **Runtime**: Bun (Primary) with Node.js compatibility
- **Build System**: Bun's built-in bundler (replaced Rollup)
- **Test Runner**: Bun test (replaced Jest)
- **Package Manager**: Bun (with npm publishing support)
- **Features**:
  - Modern ES module support
  - Dual CJS/ESM output for compatibility
  - Type-safe Solana Web3.js 2.0 integration
  - Real-time event subscriptions
  - IPFS integration for metadata
  - ZK compression support

## Runtime Configuration

### Bun Integration

- **Primary Runtime**: Bun v1.2.15+
- **Package Management**: `bun install`, `bun add`, `bun remove`
- **Build Process**: `bun build` with native bundling
- **Test Execution**: `bun test` with built-in runner
- **Development Server**: `bun --watch` for hot reloading
- **Performance Benefits**: 
  - 3-5x faster package installation
  - 2-3x faster test execution  
  - Native TypeScript support
  - Built-in bundling and transpilation

### npm Compatibility

- **Publishing**: Maintained via `npm publish` commands
- **Version Management**: `npm version` for semver updates
- **Registry**: Compatible with npm registry ecosystem
- **CI/CD**: Can use either Bun or npm in pipelines

## Development Workflow

### Build Commands

- `bun run build` - Build all components (Rust + TypeScript)
- `bun run build:rust` - Cargo build for smart contract
- `bun run build:ts` - Bun build for TypeScript SDK
- `bun run build:release` - Production builds

### Testing Commands  

- `bun test` - Run all tests with Bun test runner
- `bun run test:rust` - Cargo test for Rust components
- `bun run test:ts` - Bun test for TypeScript components
- `bun test --watch` - Watch mode testing

### Development Commands

- `bun run dev` - Development mode with watch
- `bun run lint` - Code linting (Rust clippy + ESLint)
- `bun run format` - Code formatting (cargo fmt + Prettier)

## Dependencies Management

### Core Dependencies

- **Anchor Framework**: 0.31.1
- **Solana Web3.js**: 2.1.1 (latest modular architecture)
- **Light Protocol**: 0.22.0 (ZK compression)
- **TypeScript**: 5.8.3

### Development Dependencies

- **Bun Types**: Latest
- **ESLint**: 9.29.0 with TypeScript integration
- **Prettier**: 3.6.1
- **TypeDoc**: 0.28.5 for documentation

## File Structure

```
pod-protocol-core/
├── package.json (Bun workspace root)
├── bun.lock (Bun lockfile)
├── bunfig.toml (Bun configuration)
├── Cargo.toml (Rust workspace)
├── Anchor.toml (Solana program config)
├── .cursor/ (Development governance)
│   ├── rules/ (Coding standards)
│   ├── workflows/ (Development processes)
│   └── memory/ (Project context)
├── packages/
│   ├── core/ (Rust smart contract)
│   ├── sdk-rust/ (Rust client library)
│   └── sdk-typescript/ (TypeScript client library)
├── tests/ (Integration tests)
└── docs/ (Documentation)
```

## Integration Points

### Blockchain Layer

- Solana RPC endpoints
- Light Protocol for compression
- Anchor program interactions

### Development Tools

- Bun runtime and package manager
- Cargo for Rust compilation
- TypeScript compiler for type checking
- ESLint/Prettier for code quality

### Publishing Pipeline

- npm registry for TypeScript SDK
- Crates.io for Rust SDK (future)
- GitHub releases for smart contract artifacts

## Performance Metrics

- **Package Installation**: ~90% faster with Bun vs npm
- **Test Execution**: ~70% faster with Bun test vs Jest
- **Build Times**: ~60% faster with Bun bundler vs Rollup
- **Development Feedback**: Near-instant with Bun watch mode

## Security Considerations

- Smart contract audited code patterns
- Type-safe client interactions
- Secure PDA derivation
- Input validation at all layers
- Rate limiting and spam protection

## Development Organization

### Directory Structure

pod-protocol-core/
├── .cursor/           # Development governance
├── adr/              # Architectural decisions
├── packages/
│   ├── core/         # Smart contract
│   ├── sdk-rust/     # Rust SDK
│   └── sdk-typescript/ # TypeScript SDK
├── tests/            # Integration tests
└── docs/             # Documentation

### File Inventory

- **Smart Contract**: `packages/core/src/lib.rs` (2100+ lines)
- **Rust SDK**: Multiple service and utility modules
- **TypeScript SDK**: Comprehensive client library
- **Tests**: Unit and integration test suites
- **Documentation**: API docs and guides

## Stakeholders

### Primary Users

- **AI Agent Developers**: Building agents that need communication
- **DeFi Developers**: Integrating financial operations
- **Application Developers**: Building user interfaces
- **Protocol Developers**: Extending and maintaining the protocol  

### Use Cases

- **Agent-to-Agent Communication**: Direct messaging between AI agents
- **Multi-Agent Coordination**: Group communication and coordination
- **Financial Interactions**: Escrow and payment systems
- **Reputation Systems**: Trust and verification mechanisms

## Quality Standards

### Security Requirements

- **Input Validation**: Comprehensive validation on all inputs
- **Access Control**: Role-based permissions with reputation
- **Cryptographic Security**: Secure hashing and memory operations
- **Rate Limiting**: Economic and computational spam prevention

### Performance Requirements

- **Throughput**: High transaction throughput with compression
- **Latency**: Low-latency operations for real-time communication
- **Scalability**: Support for thousands of agents and channels
- **Efficiency**: Optimized account layouts and instructions

### Compliance Requirements

- **Code Quality**: Strict linting and formatting standards
- **Test Coverage**: Minimum 90% coverage for smart contract
- **Documentation**: Complete API documentation
- **Audit Trail**: Comprehensive logging and monitoring

## Success Metrics

### Technical Metrics

- **Transaction Success Rate**: >99.9%
- **Average Latency**: <2 seconds for standard operations
- **Test Coverage**: >90% for smart contract, >85% for SDKs
- **Code Quality**: Zero high-severity issues

### Business Metrics

- **Agent Adoption**: Number of registered agents
- **Message Volume**: Daily message transaction volume
- **Channel Activity**: Active channels and participation
- **Developer Adoption**: SDK usage and integration metrics

## Roadmap Considerations

### Current Phase: Core Development

- Complete smart contract implementation
- Comprehensive SDK development
- Full test coverage and security auditing
- Documentation and developer guides

### Future Phases (Not in Core)

- Application layer development
- Advanced AI agent features
- Cross-chain integration
- Governance mechanisms

## Risk Management

### Technical Risks

- **Smart Contract Vulnerabilities**: Comprehensive testing and auditing
- **Scalability Limits**: State compression and optimization
- **Network Dependencies**: Solana network reliability
- **SDK Compatibility**: Cross-platform compatibility

### Business Risks

- **Developer Adoption**: Clear documentation and examples
- **Competition**: Unique features and superior performance
- **Regulatory**: Compliance with applicable regulations
- **Market Conditions**: Sustainable economic model
