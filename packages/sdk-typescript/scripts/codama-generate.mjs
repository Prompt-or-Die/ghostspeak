#!/usr/bin/env node

/**
 * Codama Generation Script
 * Generates Web3.js v2 compatible TypeScript clients from our pod_com IDL
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFromRoot } from 'codama';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { renderVisitor } from '@codama/renderers-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting Codama client generation...');

try {
  // Create a proper Anchor IDL structure from our TypeScript IDL
  console.log('🔧 Constructing IDL from TypeScript module...');
  
  const anchorIdl = {
    address: "HEpGLgYsE1kP8aoYKyLFc3JVVrofS7T4zEA6fWBJsZps",
    metadata: {
      name: "pod_com",
      version: "0.1.0",
      spec: "0.1.0",
      description: "PoD Protocol (Prompt or Die): AI Agent Communication Protocol"
    },
    instructions: [
      {
        name: "register_agent",
        discriminator: [135, 157, 66, 195, 2, 113, 175, 30],
        accounts: [
          {
            name: "agent_account",
            writable: true,
            pda: {
              seeds: [
                { kind: "const", value: [97, 103, 101, 110, 116] },
                { kind: "account", path: "signer" }
              ]
            }
          },
          {
            name: "signer",
            writable: true,
            signer: true
          },
          {
            name: "system_program",
            address: "11111111111111111111111111111111"
          }
        ],
        args: [
          { name: "capabilities", type: "u64" },
          { name: "metadata_uri", type: "string" }
        ]
      }
    ],
    accounts: [
      {
        name: "AgentAccount",
        discriminator: [241, 119, 69, 140, 233, 9, 112, 50]
      }
    ],
    types: [
      {
        name: "AgentAccount",
        type: {
          kind: "struct",
          fields: [
            { name: "pubkey", type: "pubkey" },
            { name: "capabilities", type: "u64" },
            { name: "metadata_uri", type: "string" },
            { name: "reputation", type: "u64" },
            { name: "last_updated", type: "i64" },
            { name: "bump", type: "u8" },
            { name: "reserved", type: { array: ["u8", 7] } }
          ]
        }
      }
    ]
  };

  console.log('✅ IDL constructed successfully');
  console.log(`📍 Program Address: ${anchorIdl.address}`);
  console.log(`📋 Instructions: ${anchorIdl.instructions?.length || 0}`);
  console.log(`🏗️ Account Types: ${anchorIdl.accounts?.length || 0}`);

  // Convert Anchor IDL to Codama IDL
  console.log('🔄 Converting Anchor IDL to Codama IDL...');
  const codama = createFromRoot(rootNodeFromAnchor(anchorIdl));

  // Output directory for generated files
  const outputDir = path.join(__dirname, '../src/generated-v2');
  console.log(`📁 Output directory: ${outputDir}`);

  // Generate TypeScript clients with Web3.js v2 support
  console.log('🏭 Generating Web3.js v2 compatible TypeScript clients...');
  
  const renderOptions = {
    // Use granular imports for better tree-shaking
    useGranularImports: true,
    // Don't render parent instructions to focus on leaves
    renderParentInstructions: false
  };

  codama.accept(renderVisitor(outputDir, renderOptions));

  console.log('✅ Codama client generation completed successfully!');

} catch (error) {
  console.error('❌ Error generating Codama clients:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
