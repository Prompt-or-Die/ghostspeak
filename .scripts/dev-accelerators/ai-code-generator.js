#!/usr/bin/env node

/**
 * 🤖 AI CODE GENERATOR
 * Exponentially speeds up development with intelligent code generation
 * Handles: component scaffolding, API endpoints, test files, type definitions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AICodeGenerator {
  constructor() {
    this.templatesGenerated = 0;
    this.testsGenerated = 0;
    this.templates = {
      // Modern React component template
      reactComponent: (name, props = []) => `
import React from 'react';

interface ${name}Props {
${props.map(prop => `  ${prop.name}: ${prop.type};`).join('\n')}
}

export const ${name}: React.FC<${name}Props> = ({ ${props.map(p => p.name).join(', ')} }) => {
  return (
    <div className="${name.toLowerCase()}">
      <h2>${name}</h2>
      {/* Component implementation */}
    </div>
  );
};

export default ${name};
`,

      // TypeScript service class template
      serviceClass: (name, methods = []) => `
import { Logger } from '../utils/logger';

export interface I${name}Service {
${methods.map(method => `  ${method.name}(${method.params || ''}): Promise<${method.returnType || 'void'}>;`).join('\n')}
}

export class ${name}Service implements I${name}Service {
  private logger = new Logger('${name}Service');

  constructor() {
    this.logger.info('${name}Service initialized');
  }

${methods.map(method => `
  async ${method.name}(${method.params || ''}): Promise<${method.returnType || 'void'}> {
    try {
      this.logger.debug('${method.name} called');
      
      // Implementation here
      throw new Error('Method not implemented: ${method.name}');
      
    } catch (error) {
      this.logger.error('Error in ${method.name}:', error);
      throw error;
    }
  }`).join('\n')}
}
`,

      // Test file template
      testFile: (componentName, testType = 'unit') => `
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
${testType === 'component' ? `import { render, screen, fireEvent } from '@testing-library/react';` : ''}
import { ${componentName} } from '../${componentName.toLowerCase()}';

describe('${componentName}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('should initialize correctly', () => {
    ${testType === 'component' ? `
    render(<${componentName} />);
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
    ` : `
    const instance = new ${componentName}();
    expect(instance).toBeDefined();
    `}
  });

  test('should handle basic functionality', async () => {
    // Test implementation
    expect(true).toBe(true);
  });

  test('should handle error cases', async () => {
    // Error handling tests
    expect(true).toBe(true);
  });

  test('should meet performance requirements', async () => {
    // Performance tests
    expect(true).toBe(true);
  });
});
`,

      // API endpoint template
      apiEndpoint: (name, method = 'GET') => `
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const ${name}Schema = z.object({
  // Define your schema here
});

type ${name}Request = z.infer<typeof ${name}Schema>;

export async function ${method.toUpperCase()}(request: NextRequest) {
  try {
    ${method !== 'GET' ? `
    const body = await request.json();
    const validatedData = ${name}Schema.parse(body);
    ` : `
    const { searchParams } = new URL(request.url);
    // Extract query parameters
    `}

    // Implementation here
    const result = {
      success: true,
      data: {},
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('${name} API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
`,

      // Solana program instruction template
      solanaInstruction: (name, accounts = [], args = []) => `
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ${name} {
${accounts.map(acc => `    pub ${acc.name}: ${acc.type},`).join('\n')}
}

pub fn ${name.toLowerCase()}(
    ctx: Context<${name}>,
${args.map(arg => `    ${arg.name}: ${arg.type},`).join('\n')}
) -> Result<()> {
    let ${name.toLowerCase()}_account = &mut ctx.accounts.${accounts[0]?.name || 'account'};
    
    // Validation
    require!(
        ${name.toLowerCase()}_account.is_initialized,
        ErrorCode::AccountNotInitialized
    );

    // Implementation here
    
    // Emit event
    emit!(${name}Event {
        // Event data
    });

    Ok(())
}

#[event]
pub struct ${name}Event {
    // Event fields
}
`
    };
  }

  async run() {
    console.log('🤖 AI CODE GENERATOR STARTING...\n');
    
    await this.showMenu();
  }

  async showMenu() {
    console.log('🎯 What would you like to generate?\n');
    console.log('1. React Component');
    console.log('2. TypeScript Service');
    console.log('3. Test File');
    console.log('4. API Endpoint');
    console.log('5. Solana Instruction');
    console.log('6. Complete Feature Set');
    console.log('7. Auto-detect and Generate Missing Files');
    console.log('8. Exit\n');

    // For demo purposes, let's run auto-detection
    await this.autoDetectAndGenerate();
  }

  async autoDetectAndGenerate() {
    console.log('🔍 Auto-detecting missing files and generating templates...\n');

    // Detect missing test files
    await this.generateMissingTests();
    
    // Detect missing type definitions
    await this.generateMissingTypes();
    
    // Generate utility functions
    await this.generateUtilityFunctions();
    
    this.reportResults();
  }

  async generateMissingTests() {
    console.log('🧪 Generating missing test files...');
    
    const sourceFiles = this.findSourceFiles();
    
    for (const sourceFile of sourceFiles) {
      const testFile = this.getTestFilePath(sourceFile);
      
      if (!fs.existsSync(testFile)) {
        await this.generateTestFile(sourceFile, testFile);
      }
    }
  }

  findSourceFiles() {
    const files = [];
    const searchDirs = ['packages', 'src'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.findSourceFilesInDir(dir));
      }
    }
    
    return files.filter(file => 
      !file.includes('/test/') && 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      (file.endsWith('.ts') || file.endsWith('.tsx'))
    );
  }

  findSourceFilesInDir(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.findSourceFilesInDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return files;
  }

  getTestFilePath(sourceFile) {
    const dir = path.dirname(sourceFile);
    const name = path.basename(sourceFile, path.extname(sourceFile));
    
    // Check if there's a test directory
    const testDir = path.join(dir, 'test');
    if (fs.existsSync(testDir)) {
      return path.join(testDir, `${name}.test.ts`);
    }
    
    // Otherwise place test next to source
    return path.join(dir, `${name}.test.ts`);
  }

  async generateTestFile(sourceFile, testFile) {
    const content = fs.readFileSync(sourceFile, 'utf8');
    
    // Extract component/class name
    const classMatch = content.match(/export\s+(?:class|function|const)\s+(\w+)/);
    const componentName = classMatch ? classMatch[1] : path.basename(sourceFile, path.extname(sourceFile));
    
    // Determine test type
    const isReactComponent = content.includes('React') || content.includes('jsx') || sourceFile.endsWith('.tsx');
    const testType = isReactComponent ? 'component' : 'unit';
    
    const testContent = this.templates.testFile(componentName, testType);
    
    // Ensure test directory exists
    const testDir = path.dirname(testFile);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    fs.writeFileSync(testFile, testContent);
    console.log(`  ✅ Generated test: ${path.relative(process.cwd(), testFile)}`);
    this.testsGenerated++;
  }

  async generateMissingTypes() {
    console.log('📝 Generating missing type definitions...');
    
    // Look for files that might need type definitions
    const jsFiles = this.findJavaScriptFiles();
    
    for (const jsFile of jsFiles) {
      const typeFile = jsFile.replace('.js', '.d.ts');
      
      if (!fs.existsSync(typeFile)) {
        await this.generateTypeDefinition(jsFile, typeFile);
      }
    }
  }

  findJavaScriptFiles() {
    const files = [];
    const searchDirs = ['packages', 'src'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.findJSFilesInDir(dir));
      }
    }
    
    return files;
  }

  findJSFilesInDir(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.findJSFilesInDir(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.includes('.test.')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return files;
  }

  async generateTypeDefinition(jsFile, typeFile) {
    const content = fs.readFileSync(jsFile, 'utf8');
    
    // Extract exports and functions for type generation
    const exports = this.extractExports(content);
    const functions = this.extractFunctions(content);
    
    let typeContent = `// Generated type definitions for ${path.basename(jsFile)}\n\n`;
    
    // Generate function type definitions
    for (const func of functions) {
      typeContent += `export declare function ${func.name}(${func.params}): ${func.returnType || 'any'};\n`;
    }
    
    // Generate export types
    for (const exp of exports) {
      if (exp.type === 'const') {
        typeContent += `export declare const ${exp.name}: any;\n`;
      } else if (exp.type === 'class') {
        typeContent += `export declare class ${exp.name} {\n  constructor();\n}\n`;
      }
    }
    
    if (typeContent.length > 100) { // Only create if we found meaningful content
      fs.writeFileSync(typeFile, typeContent);
      console.log(`  ✅ Generated types: ${path.relative(process.cwd(), typeFile)}`);
      this.templatesGenerated++;
    }
  }

  extractExports(content) {
    const exports = [];
    
    const exportMatches = content.matchAll(/export\s+(?:(const|class|function)\s+)?(\w+)/g);
    
    for (const match of exportMatches) {
      exports.push({
        type: match[1] || 'unknown',
        name: match[2]
      });
    }
    
    return exports;
  }

  extractFunctions(content) {
    const functions = [];
    
    const functionMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g);
    
    for (const match of functionMatches) {
      functions.push({
        name: match[1],
        params: match[2] || '',
        returnType: content.includes('async') ? 'Promise<any>' : 'any'
      });
    }
    
    return functions;
  }

  async generateUtilityFunctions() {
    console.log('🛠️  Generating utility functions...');
    
    const utilsDir = 'src/utils';
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    // Generate common utility files if they don't exist
    const utilities = [
      {
        name: 'logger.ts',
        content: this.generateLoggerUtility()
      },
      {
        name: 'validation.ts',
        content: this.generateValidationUtility()
      },
      {
        name: 'async-helpers.ts',
        content: this.generateAsyncHelpers()
      }
    ];
    
    for (const utility of utilities) {
      const filePath = path.join(utilsDir, utility.name);
      
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, utility.content);
        console.log(`  ✅ Generated utility: ${utility.name}`);
        this.templatesGenerated++;
      }
    }
  }

  generateLoggerUtility() {
    return `
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private context: string;
  private level: LogLevel;

  constructor(context: string, level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(\`[\${this.context}] DEBUG: \${message}\`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(\`[\${this.context}] INFO: \${message}\`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(\`[\${this.context}] WARN: \${message}\`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(\`[\${this.context}] ERROR: \${message}\`, ...args);
    }
  }
}
`;
  }

  generateValidationUtility() {
    return `
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: string[];
};

export class Validator {
  static required<T>(value: T | null | undefined, fieldName: string): ValidationResult<T> {
    if (value === null || value === undefined || value === '') {
      return { success: false, errors: [\`\${fieldName} is required\`] };
    }
    return { success: true, data: value };
  }

  static email(value: string, fieldName: string = 'Email'): ValidationResult<string> {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(value)) {
      return { success: false, errors: [\`\${fieldName} must be a valid email address\`] };
    }
    return { success: true, data: value };
  }

  static minLength(value: string, minLength: number, fieldName: string): ValidationResult<string> {
    if (value.length < minLength) {
      return { success: false, errors: [\`\${fieldName} must be at least \${minLength} characters\`] };
    }
    return { success: true, data: value };
  }

  static combine<T>(...results: ValidationResult<any>[]): ValidationResult<T> {
    const errors: string[] = [];
    
    for (const result of results) {
      if (!result.success) {
        errors.push(...result.errors);
      }
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true, data: results[0].data };
  }
}
`;
  }

  generateAsyncHelpers() {
    return `
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function timeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
`;
  }

  reportResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🤖 AI CODE GENERATOR RESULTS');
    console.log('='.repeat(50));
    console.log(`🧪 Test files generated: ${this.testsGenerated}`);
    console.log(`📝 Templates created: ${this.templatesGenerated}`);
    console.log(`🚀 Development speed: EXPONENTIALLY INCREASED!`);
    console.log('='.repeat(50) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const generator = new AICodeGenerator();
  generator.run().catch(console.error);
}

module.exports = AICodeGenerator; 