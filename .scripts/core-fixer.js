#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class CoreFixer {
  constructor() {
    this.fixCount = 0;
    this.fixedFiles = new Set();
  }

  async fixCore() {
    console.log('🎯 Fixing core SDK functionality...\n');

    await this.fixImports();
    await this.fixTypes();
    await this.fixUnused();

    console.log(`\n✨ Applied ${this.fixCount} fixes to ${this.fixedFiles.size} files`);
    this.validate();
  }

  async fixImports() {
    console.log('📦 Fixing imports...');

    await this.fix('packages/cli/src/commands/manage-channels.ts', (content) => {
      return content.replace(/@podAI\/sdk-typescript/g, '@podai/sdk-typescript');
    });

    await this.fix('tests/test-utils.ts', (content) => {
      let fixed = content;
      fixed = fixed.replace('../sdk/src/utils', '../packages/sdk-typescript/src/utils');
      fixed = fixed.replace('../sdk/src/types', '../packages/sdk-typescript/src/types');
      return fixed;
    });
  }

  async fixTypes() {
    console.log('🎯 Fixing types...');

    const coreFiles = [
      'packages/sdk-typescript/src/services/agent.ts',
      'packages/sdk-typescript/src/services/base.ts',
      'packages/sdk-typescript/src/services/channel.ts',
      'packages/sdk-typescript/src/client.ts',
      'packages/cli/src/commands/register-agent.ts',
      'packages/cli/src/commands/manage-channels.ts'
    ];

    for (const file of coreFiles) {
      await this.fix(file, (content) => {
        let fixed = content;
        fixed = fixed.replace(/\berror\.message\b/g, '(error as Error).message');
        fixed = fixed.replace(/\berror\.toString\(\)/g, '(error as Error).toString()');
        return fixed;
      });
    }
  }

  async fixUnused() {
    console.log('🧹 Fixing unused variables...');

    await this.fix('tests/fixtures/test-data.ts', (content) => {
      return content.replace('import { Keypair, PublicKey }', 'import { Keypair }');
    });

    await this.fix('packages/sdk-typescript/src/utils/secure-memory.ts', (content) => {
      return content.replace('a[i] ^ b[i]', '(a?.[i] ?? 0) ^ (b?.[i] ?? 0)');
    });
  }

  async fix(filePath, fixFunc) {
    const fullPath = join(projectRoot, filePath);
    
    if (!existsSync(fullPath)) {
      return;
    }

    const original = readFileSync(fullPath, 'utf8');
    const fixed = fixFunc(original);

    if (fixed !== original) {
      writeFileSync(fullPath, fixed, 'utf8');
      this.fixedFiles.add(filePath);
      this.fixCount++;
      console.log(`✅ Fixed ${filePath}`);
    }
  }

  validate() {
    try {
      console.log('\n📊 Validating...');
      
      execSync('bunx tsc --project tsconfig.validation.json --noEmit 2>&1', {
        encoding: 'utf8',
        cwd: projectRoot
      });
      
      console.log('🎉 NO ERRORS!');
      
    } catch (error) {
      const output = error.stdout || error.message;
      const projectErrors = output
        .split('\n')
        .filter(line => line.includes('packages/') && line.includes('error TS'))
        .length;
        
      console.log(`📈 Remaining errors: ${projectErrors}`);
      
      if (projectErrors > 0 && projectErrors <= 20) {
        console.log('\n🔍 Sample errors:');
        output
          .split('\n')
          .filter(line => line.includes('packages/') && line.includes('error TS'))
          .slice(0, 5)
          .forEach(error => console.log(`   ${error}`));
      }
    }
  }
}

async function main() {
  const fixer = new CoreFixer();
  await fixer.fixCore();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CoreFixer }; 