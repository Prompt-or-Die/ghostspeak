# CRITICAL RULE: Web3.js v2 EXCLUSIVE ARCHITECTURE

## ⚠️ MANDATORY COMPLIANCE: This project EXCLUSIVELY uses Web3.js v2

**EFFECTIVE DATE**: January 2025  
**STATUS**: CRITICAL - NON-NEGOTIABLE  
**APPLIES TO**: All TypeScript/JavaScript code, SDK implementations, CLI tools, examples, and documentation

---

## 🎯 CORE MANDATE

**podAI Protocol uses ONLY Solana Web3.js v2.x and NEVER Web3.js v1.x**

- ✅ **CORRECT**: `@solana/web3.js@2`
- ❌ **FORBIDDEN**: `@solana/web3.js@1` or unversioned `@solana/web3.js`
- ✅ **CORRECT**: `@solana-program/*` packages
- ❌ **FORBIDDEN**: `@coral-xyz/anchor` client-side dependencies

---

## 📦 REQUIRED DEPENDENCIES

### Core Web3.js v2 Packages
```json
{
  "@solana/web3.js": "^2.0.0",
  "@solana/addresses": "^2.0.0",
  "@solana/rpc": "^2.0.0",
  "@solana/rpc-subscriptions": "^2.0.0",
  "@solana/signers": "^2.0.0",
  "@solana/transactions": "^2.0.0",
  "@solana/instructions": "^2.0.0",
  "@solana/accounts": "^2.0.0",
  "@solana/codecs": "^2.0.0"
}
```

### Program-Specific Packages
```json
{
  "@solana-program/system": "latest",
  "@solana-program/compute-budget": "latest",
  "@solana-program/token": "latest"
}
```

### Client Generation
```json
{
  "@codama/nodes-from-anchor": "latest",
  "@codama/renderers": "latest",
  "@codama/visitors-core": "latest"
}
```

### FORBIDDEN Dependencies
```json
{
  "@solana/web3.js": "^1.x", 
  "@coral-xyz/anchor": "*",   
  "web3": "*"                
}
```

---

## 🔧 MANDATORY CODE PATTERNS

### 1. RPC Connections
```typescript
// ✅ CORRECT: Web3.js v2 Pattern
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js';

const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');
const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com');

// ❌ FORBIDDEN: Web3.js v1 Pattern
// const connection = new Connection('https://api.mainnet-beta.solana.com');
```

### 2. Key Pair Management
```typescript
// ✅ CORRECT: Web3.js v2 KeyPairSigner
import { generateKeyPairSigner, createKeyPairSignerFromBytes } from '@solana/web3.js';

const keyPairSigner = await generateKeyPairSigner();
const signer = await createKeyPairSignerFromBytes(privateKeyBytes);

// Access public key
const publicKey = keyPairSigner.address;

// ❌ FORBIDDEN: Web3.js v1 Keypair
// const keypair = Keypair.generate();
// const publicKey = keypair.publicKey;
```

### 3. Address Handling
```typescript
// ✅ CORRECT: Web3.js v2 Address Functions
import { address } from '@solana/web3.js';

const destinationAddress = address("4Nu34Lrv9Wv4fX1zA7xTNy8Z4bTKcB9oL8ZMbZV9CNUz");

// ❌ FORBIDDEN: Web3.js v1 PublicKey
// const publicKey = new PublicKey("4Nu34Lrv9Wv4fX1zA7xTNy8Z4bTKcB9oL8ZMbZV9CNUz");
```

### 4. Transaction Building
```typescript
// ✅ CORRECT: Web3.js v2 Functional Pipeline
import { 
  pipe, 
  createTransactionMessage, 
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction 
} from '@solana/web3.js';

const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayer(signer.address, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
  (tx) => appendTransactionMessageInstruction(instruction, tx)
);

// ❌ FORBIDDEN: Web3.js v1 Class-based
// const transaction = new Transaction();
// transaction.add(instruction);
```

### 5. Amount Handling
```typescript
// ✅ CORRECT: Web3.js v2 Native BigInt
import { lamports } from '@solana/web3.js';

const amount = lamports(1000000000n); // 1 SOL in lamports
const transferAmount = 1n; // Native BigInt

// ❌ FORBIDDEN: Web3.js v1 Number/BN
// const amount = new BN(1000000000);
// const amount = 1000000000; // Regular number
```

### 6. Transaction Factories
```typescript
// ✅ CORRECT: Web3.js v2 Factory Pattern
import { sendAndConfirmTransactionFactory } from '@solana/web3.js';

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

// ❌ FORBIDDEN: Direct method calls
// await connection.sendTransaction(transaction);
```

---

## 🏗️ CLIENT GENERATION WITH CODAMA

### Generate TypeScript Clients from Anchor IDL
```typescript
// ✅ REQUIRED: Codama Generation Script
import { 
  rootNodeFromAnchorWithoutDefaultVisitor, 
  AnchorIdl 
} from '@codama/nodes-from-anchor';
import { renderJavaScriptVisitor } from '@codama/renderers';
import { visit } from '@codama/visitors-core';
import anchorIdl from './target/idl/program.json';

async function generateClient() {
  const node = rootNodeFromAnchorWithoutDefaultVisitor(anchorIdl as AnchorIdl);
  await visit(node, await renderJavaScriptVisitor('src/generated'));
}
```

### Import Generated Clients
```typescript
// ✅ CORRECT: Import Generated Web3.js v2 Clients
import { registerAgent } from './generated/instructions';
import { fetchAgentAccount } from './generated/accounts';
import { getPodComProgramId } from './generated/programs';

// ❌ FORBIDDEN: Manual Anchor client imports
// import { Program } from '@coral-xyz/anchor';
```

---

## 🚫 MIGRATION BLOCKERS

### Never Use These Patterns
```typescript
// ❌ FORBIDDEN: Web3.js v1 Patterns
Connection
Keypair
PublicKey
Transaction
VersionedTransaction
sendAndConfirmTransaction (direct call)
SystemProgram
TOKEN_PROGRAM_ID

// ❌ FORBIDDEN: Anchor Client Patterns
Program<T>
AnchorProvider
workspace
IdlAccounts<T>
```

### Replace With Web3.js v2 Equivalents
```typescript
// ✅ CORRECT: Web3.js v2 Replacements
createSolanaRpc()
generateKeyPairSigner()
address()
createTransactionMessage()
signTransactionMessageWithSigners()
sendAndConfirmTransactionFactory()
getTransferSolInstruction() // from @solana-program/system
getPodComProgramId() // from generated clients
```

---

## 📋 PERFORMANCE REQUIREMENTS

### Bundle Size Optimization
- **MANDATORY**: Use granular imports only
- **FORBIDDEN**: Wildcard imports from `@solana/web3.js`
- **TARGET**: <100KB bundle size increase

```typescript
// ✅ CORRECT: Granular Imports
import { createSolanaRpc } from '@solana/rpc';
import { generateKeyPairSigner } from '@solana/signers';

// ❌ FORBIDDEN: Wildcard Imports
// import * as web3 from '@solana/web3.js';
```

### Performance Standards
- **Keypair Generation**: 10x faster than v1 (required)
- **Transaction Signing**: 10x faster than v1 (required)
- **Bundle Size**: 30% reduction minimum (required)
- **Zero Dependencies**: No external dependencies (required)

---

## 🔒 SECURITY REQUIREMENTS

### Native Cryptography
- **MANDATORY**: Use Web Crypto API via Web3.js v2
- **FORBIDDEN**: Custom cryptography implementations
- **REQUIRED**: Native Ed25519 support

### Input Validation
```typescript
// ✅ REQUIRED: Address validation
import { isAddress } from '@solana/addresses';

function validateAddress(addr: string) {
  if (!isAddress(addr)) {
    throw new Error('Invalid Solana address');
  }
}
```

---

## 🧪 TESTING REQUIREMENTS

### Test Patterns
```typescript
// ✅ REQUIRED: Web3.js v2 Test Setup
import { createSolanaRpc } from '@solana/rpc';
import { generateKeyPairSigner } from '@solana/signers';

describe('Web3.js v2 Tests', () => {
  let rpc: ReturnType<typeof createSolanaRpc>;
  let signer: Awaited<ReturnType<typeof generateKeyPairSigner>>;
  
  beforeEach(async () => {
    rpc = createSolanaRpc('http://localhost:8899');
    signer = await generateKeyPairSigner();
  });
});
```

---

## 📚 DOCUMENTATION REQUIREMENTS

### Code Examples
- **MANDATORY**: All examples use Web3.js v2 patterns
- **FORBIDDEN**: Any reference to Web3.js v1 patterns
- **REQUIRED**: Codama generation examples

### README Updates
- **MANDATORY**: Specify Web3.js v2 requirement
- **REQUIRED**: Installation instructions for correct packages
- **FORBIDDEN**: References to `@coral-xyz/anchor` for client usage

---

## ⚡ DEVELOPMENT WORKFLOW

### Before Writing Code
1. ✅ Verify Web3.js v2 packages installed
2. ✅ Check no v1 dependencies in package.json
3. ✅ Generate clients with Codama if using custom programs
4. ✅ Use Web3.js v2 patterns exclusively

### Code Review Checklist
- [ ] No Web3.js v1 imports
- [ ] No class-based patterns (Connection, Keypair, etc.)
- [ ] Proper use of factory functions
- [ ] Native BigInt for amounts
- [ ] Granular imports only
- [ ] Generated clients for custom programs

---

## 🚨 VIOLATIONS & ENFORCEMENT

### Immediate Action Required
- **Block PR**: Any Web3.js v1 usage
- **Refactor Required**: Class-based patterns
- **Bundle Check**: Verify size improvements

### Reporting Violations
```bash
# Detect v1 patterns
grep -r "new Connection\|Keypair.generate\|new PublicKey" src/
grep -r "@coral-xyz/anchor" package.json
```

---

## 📖 OFFICIAL REFERENCES

### Primary Sources
- [Anza Web3.js v2 Official Release](https://www.anza.xyz/blog/solana-web3-js-2-release)
- [Helius Web3.js v2 Guide](https://www.helius.dev/blog/how-to-start-building-with-the-solana-web3-js-2-0-sdk)
- [QuickNode Web3.js v2 Overview](https://blog.quicknode.com/solana-web3-js-2-0-a-new-chapter-in-solana-development/)
- [Codama Documentation](https://github.com/codama-idl/codama)

### Migration References
- [Web3.js v2 Migration Guide](https://solana-labs.github.io/solana-web3.js/migrating/)
- [Codama Anchor Integration](https://www.quicknode.com/guides/solana-development/anchor/codama-client)

---

**⚠️ CRITICAL REMINDER**: This rule is NON-NEGOTIABLE. All AI assistants, developers, and automated tools MUST follow Web3.js v2 patterns exclusively. No exceptions.**

**Last Updated**: January 2025  
**Next Review**: When Web3.js v3 is released 