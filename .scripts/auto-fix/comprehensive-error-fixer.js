#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

class ComprehensiveErrorFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
    this.errorPatterns = new Map();
  }

  /**
   * Get TypeScript errors for project files only
   */
  getProjectErrors() {
    try {
      console.log('🔍 Analyzing TypeScript errors in project files...');
      
      const output = execSync(
        'bunx tsc --project tsconfig.validation.json --noEmit',
        { encoding: 'utf8', cwd: projectRoot }
      );
      return [];
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      
      // Filter to project files only (packages/ directory)
      const projectErrors = errorOutput
        .split('\n')
        .filter(line => line.includes('packages/') && line.includes('error TS'))
        .map(line => this.parseError(line))
        .filter(error => error !== null);

      console.log(`📊 Found ${projectErrors.length} errors in project files`);
      return projectErrors;
    }
  }

  /**
   * Parse TypeScript error line
   */
  parseError(line) {
    const match = line.match(/^([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (!match) return null;

    const [, file, lineNum, colNum, code, message] = match;
    return {
      file: file.trim(),
      line: parseInt(lineNum),
      column: parseInt(colNum),
      code,
      message: message.trim(),
      originalLine: line
    };
  }

  /**
   * Apply comprehensive fixes to all project files
   */
  async fixAllErrors() {
    const errors = this.getProjectErrors();
    
    // Group errors by file for efficient processing
    const errorsByFile = new Map();
    errors.forEach(error => {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    });

    console.log(`📁 Processing ${errorsByFile.size} files with errors...`);

    // Process each file
    for (const [filePath, fileErrors] of errorsByFile) {
      await this.fixFileErrors(filePath, fileErrors);
    }

    console.log(`\n✨ Applied ${this.totalFixes} fixes across ${this.fixedFiles.size} files`);
    
    // Show summary of fix types
    console.log('\n📊 Fix Summary:');
    for (const [pattern, count] of this.errorPatterns) {
      console.log(`   ${pattern}: ${count} fixes`);
    }
  }

  /**
   * Fix errors in a specific file
   */
  async fixFileErrors(filePath, errors) {
    try {
      const absolutePath = join(projectRoot, filePath);
      let content = readFileSync(absolutePath, 'utf8');
      let modified = false;

      // Sort errors by line number (descending) to avoid line number shifts
      errors.sort((a, b) => b.line - a.line);

      for (const error of errors) {
        const fix = this.generateFix(error, content);
        if (fix) {
          content = this.applyFix(content, error, fix);
          modified = true;
          this.totalFixes++;
          
          // Track fix patterns
          const pattern = this.getFixPattern(error);
          this.errorPatterns.set(pattern, (this.errorPatterns.get(pattern) || 0) + 1);
        }
      }

      if (modified) {
        writeFileSync(absolutePath, content, 'utf8');
        this.fixedFiles.add(filePath);
        console.log(`✅ Fixed ${filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not fix ${filePath}: ${error.message}`);
    }
  }

  /**
   * Generate fix for specific error
   */
  generateFix(error, content) {
    const { code, message } = error;

    switch (code) {
      case 'TS2307': // Cannot find module
        return this.fixMissingModule(error, message);
      
      case 'TS2339': // Property does not exist
        return this.fixMissingProperty(error, message, content);
      
      case 'TS18046': // Variable is of type 'unknown'
        return this.fixUnknownType(error, message, content);
      
      case 'TS6133': // Variable is declared but never used
        return this.fixUnusedVariable(error, message, content);
      
      case 'TS2564': // Property has no initializer
        return this.fixUninitializedProperty(error, message, content);
      
      case 'TS2551': // Property does not exist. Did you mean?
        return this.fixPropertySuggestion(error, message, content);
      
      case 'TS2683': // 'this' implicitly has type 'any'
        return this.fixImplicitThis(error, message, content);
      
      case 'TS2556': // Expected N arguments but got M
        return this.fixArgumentMismatch(error, message, content);
      
      default:
        return null;
    }
  }

  /**
   * Fix missing module imports
   */
  fixMissingModule(error, message) {
    const moduleMatch = message.match(/Cannot find module '([^']+)'/);
    if (!moduleMatch) return null;

    const moduleName = moduleMatch[1];
    
    // Handle common missing modules
    const moduleReplacements = {
      '@metaplex-foundation/umi-bundle-defaults': '@metaplex-foundation/umi',
      '@metaplex-foundation/mpl-bubblegum': '@metaplex-foundation/mpl-core',
      'web3.storage': null, // Remove this import
      '@podAI/sdk-typescript': '@podai/sdk-typescript'
    };

    if (moduleName in moduleReplacements) {
      const replacement = moduleReplacements[moduleName];
      return {
        type: 'replace-import',
        search: moduleName,
        replace: replacement
      };
    }

    return null;
  }

  /**
   * Fix missing properties
   */
  fixMissingProperty(error, message, content) {
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Fix spinner.succeed() -> spinner.success()
    if (message.includes("Property 'succeed' does not exist")) {
      return {
        type: 'replace-text',
        search: '.succeed(',
        replace: '.success('
      };
    }

    return null;
  }

  /**
   * Fix unknown types with proper type assertions
   */
  fixUnknownType(error, message, content) {
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Handle error objects
    if (message.includes("'error' is of type 'unknown'")) {
      if (line.includes('error.message')) {
        return {
          type: 'replace-line',
          newLine: line.replace('error.message', '(error as Error).message')
        };
      }
      if (line.includes('error.toString')) {
        return {
          type: 'replace-line',
          newLine: line.replace('error.toString', '(error as Error).toString')
        };
      }
    }

    return null;
  }

  /**
   * Fix unused variables
   */
  fixUnusedVariable(error, message, content) {
    const varMatch = message.match(/'([^']+)' is declared but its value is never read/);
    if (!varMatch) return null;

    const varName = varMatch[1];
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Add underscore prefix to indicate intentionally unused
    if (line.includes(`const ${varName}`) || line.includes(`let ${varName}`)) {
      return {
        type: 'replace-line',
        newLine: line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`)
      };
    }

    return null;
  }

  /**
   * Fix uninitialized properties
   */
  fixUninitializedProperty(error, message, content) {
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Add definite assignment assertion
    if (line.includes(':') && !line.includes('!:')) {
      return {
        type: 'replace-line',
        newLine: line.replace(':', '!:')
      };
    }

    return null;
  }

  /**
   * Fix property suggestions (Did you mean?)
   */
  fixPropertySuggestion(error, message, content) {
    const suggestionMatch = message.match(/Did you mean '([^']+)'/);
    if (!suggestionMatch) return null;

    const suggestion = suggestionMatch[1];
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Extract the wrong property name from the error
    const propertyMatch = message.match(/Property '([^']+)' does not exist/);
    if (!propertyMatch) return null;

    const wrongProperty = propertyMatch[1];

    return {
      type: 'replace-line',
      newLine: line.replace(`.${wrongProperty}`, `.${suggestion}`)
    };
  }

  /**
   * Fix implicit 'this' type
   */
  fixImplicitThis(error, message, content) {
    const lines = content.split('\n');
    const line = lines[error.line - 1];

    // Add explicit this parameter
    if (line.includes('function(') && !line.includes('this:')) {
      return {
        type: 'replace-line',
        newLine: line.replace('function(', 'function(this: any, ')
      };
    }

    return null;
  }

  /**
   * Fix argument mismatches
   */
  fixArgumentMismatch(error, message, content) {
    // This requires more context analysis, skip for now
    return null;
  }

  /**
   * Apply the fix to content
   */
  applyFix(content, error, fix) {
    const lines = content.split('\n');

    switch (fix.type) {
      case 'replace-import':
        return fix.replace 
          ? content.replace(`'${fix.search}'`, `'${fix.replace}'`)
          : content.replace(new RegExp(`^.*${fix.search}.*$`, 'm'), '');
      
      case 'replace-text':
        return content.replace(fix.search, fix.replace);
      
      case 'replace-line':
        lines[error.line - 1] = fix.newLine;
        return lines.join('\n');
      
      default:
        return content;
    }
  }

  /**
   * Get fix pattern for tracking
   */
  getFixPattern(error) {
    const patterns = {
      'TS2307': 'Missing modules',
      'TS2339': 'Missing properties',
      'TS18046': 'Unknown types',
      'TS6133': 'Unused variables',
      'TS2564': 'Uninitialized properties',
      'TS2551': 'Property suggestions',
      'TS2683': 'Implicit this'
    };
    
    return patterns[error.code] || `Other (${error.code})`;
  }
}

// Run the fixer
async function main() {
  console.log('🚀 Starting Comprehensive TypeScript Error Fixer...\n');
  
  const fixer = new ComprehensiveErrorFixer();
  await fixer.fixAllErrors();
  
  console.log('\n🎉 Comprehensive fixing complete!');
  console.log('\n📊 Run validation to see remaining errors:');
  console.log('   bunx tsc --project tsconfig.validation.json --noEmit');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveErrorFixer }; 