# podAI Core

A focused development environment for the core podAI Protocol (Prompt or Die) - an AI Agent Communication Protocol built on Solana.

## Overview

This repository contains the essential components needed for core podAI Protocol development:

- **Smart Contract**: Solana/Anchor program for AI agent communication
- **SDKs**: Rust and TypeScript client libraries
- **Testing**: Comprehensive test suites and benchmarks
- **Governance**: Complete development workflow and quality standards

## Architecture

### Core Components

podAI-core/
├── packages/core/         # Smart contract program
├── packages/sdk-rust/     # Rust SDK
├── packages/sdk-typescript/ # TypeScript SDK
├── tests/                 # Integration tests
└── docs/                  # Documentation

### Governance Structure

.cursor/
├── rules/                 # Development standards and protocols
├── workflows/             # Development process workflows
├── memory/                # Project context and progress tracking
└── scripts/               # Automation scripts

## Features

### Smart Contract Features

- **Agent Registration**: PDA-based identity management
- **Direct Messaging**: Point-to-point communication with expiration
- **Group Channels**: Public/private group communication
- **Escrow System**: Secure financial interactions
- **Reputation System**: Trust and verification mechanisms
- **Rate Limiting**: Spam prevention and resource management
- **State Compression**: ZK compression for scalability

### SDK Features

- **Type Safety**: Full type safety with generated bindings
- **Account Management**: Automatic PDA derivation and management
- **Transaction Building**: High-level transaction construction
- **Error Handling**: Comprehensive error mapping and recovery
- **Real-time Updates**: Event-based state synchronization

## Development Setup

### Prerequisites

- Rust 1.79.0+
- Node.js 18+
- Solana CLI 1.18+
- Anchor CLI 0.31.1+

### Quick Start

```bash
# Clone and setup
git clone https://github.com/Prompt-or-Die/ghostspeak.git
cd podAI-core

# Build smart contract
anchor build

# Run tests
anchor test

# Build SDKs
cargo build --workspace
cd packages/sdk-typescript && npm install && npm run build
```

### Development Workflow

This project follows a research-first development approach:

1. **Research Phase**: Use Context7 MCP for library research
2. **Planning Phase**: Create ADRs and technical designs
3. **Implementation Phase**: Smart contract and SDK development
4. **Testing Phase**: Comprehensive testing and validation
5. **Documentation Phase**: Complete documentation and examples

## Quality Standards

### Security

- Comprehensive input validation
- Cryptographic security with Blake3
- Rate limiting and access control
- Regular security audits

### Performance

- Optimized account layouts
- State compression for scalability
- Efficient transaction batching
- Performance benchmarking

### Testing

- 90%+ code coverage for smart contract
- 85%+ code coverage for SDKs
- Property-based testing
- Integration and end-to-end testing

## Program Information

- **Program ID**: `HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps`
- **Network**: Solana Devnet (mainnet ready)
- **Framework**: Anchor 0.31.1
- **Language**: Rust 2021 Edition

## Contributing

This project follows strict development standards:

- All changes require research via Context7 MCP
- Comprehensive testing required
- Security-focused code review
- Documentation must be updated
- ADRs required for architectural changes

See `.cursor/rules/` for complete development standards.

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For technical support and questions:

- Create an issue in the repository
- Follow the development workflow in `.cursor/workflows/`
- Reference architectural decisions in `adr/`
