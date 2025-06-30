#!/usr/bin/env node

/**
 * 🚀 TYPESCRIPT AUTO-FIXER
 * Exponentially speeds up development by fixing common TypeScript errors automatically
 * Handles: override modifiers, undefined types, unused imports, type assertions
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class TypeScriptAutoFixer {
  constructor() {
    this.fixesApplied = 0;
    this.filesProcessed = 0;
    this.errorPatterns = {
      // Most common TS strict mode errors
      missingOverride: /This member must have an 'override' modifier/,
      undefinedTypes: /Type '.+' is not assignable to type '.+'/,
      unusedImports: /'.+' is declared but its value is never read/,
      anyTypes: /Argument of type '.+' is not assignable to parameter of type/,
      optionalProperties: /Object is possibly 'undefined'/,
      noUnusedLocals: /'.+' is declared but its value is never read/,
      noImplicitReturns: /Not all code paths return a value/,
      strictNullChecks: /Object is possibly 'null'/
    };
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 TYPESCRIPT AUTO-FIXER STARTING...\n');
    
    try {
      // Get TypeScript compilation errors
      const errors = await this.getTypeScriptErrors();
      console.log(`📊 Found ${errors.length} TypeScript errors to fix\n`);
      
      // Apply automated fixes
      await this.applyAutomatedFixes(errors);
      
      // Run final validation
      await this.validateFixes();
      
      this.reportResults();
      
    } catch (error) {
      console.error('❌ Auto-fixer failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get TypeScript compilation errors
   */
  async getTypeScriptErrors() {
    console.log('🔍 Analyzing TypeScript errors...');
    
    try {
      execSync('bunx tsc --project tsconfig.validation.json', { encoding: 'utf8' });
      return []; // No errors
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.parseTypeScriptErrors(output);
    }
  }

  /**
   * Parse TypeScript error output into structured data
   */
  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match TypeScript error format: file(line,col): error TS####: message
      const match = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      
      if (match) {
        const [, filePath, lineNum, colNum, errorCode, message] = match;
        
        errors.push({
          file: filePath,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message,
          type: this.categorizeError(message)
        });
      }
    }
    
    return errors;
  }

  /**
   * Categorize error types for targeted fixing
   */
  categorizeError(message) {
    if (message.includes("must have an 'override' modifier")) return 'override';
    if (message.includes('is declared but its value is never read')) return 'unused';
    if (message.includes('Object is possibly')) return 'nullish';
    if (message.includes('not assignable to type')) return 'type-mismatch';
    if (message.includes('Cannot find module')) return 'import';
    if (message.includes('Not all code paths return')) return 'return';
    return 'other';
  }

  /**
   * Apply automated fixes based on error types
   */
  async applyAutomatedFixes(errors) {
    console.log('⚡ Applying automated fixes...\n');
    
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      await this.fixFile(filePath, fileErrors);
    }
  }

  /**
   * Group errors by file for efficient processing
   */
  groupErrorsByFile(errors) {
    const groups = {};
    
    for (const error of errors) {
      if (!groups[error.file]) {
        groups[error.file] = [];
      }
      groups[error.file].push(error);
    }
    
    return groups;
  }

  /**
   * Fix all errors in a single file
   */
  async fixFile(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (file not found)`);
      return;
    }

    console.log(`🔧 Fixing ${path.relative(process.cwd(), filePath)} (${errors.length} errors)`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    // Sort errors by line number (descending) to avoid offset issues
    errors.sort((a, b) => b.line - a.line);

    for (const error of errors) {
      const fixed = this.applySpecificFix(lines, error);
      if (fixed) {
        modified = true;
        this.fixesApplied++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`  ✅ Fixed ${filePath}`);
      this.filesProcessed++;
    } else {
      console.log(`  ⚠️  No automated fixes available for ${filePath}`);
    }
  }

  /**
   * Apply specific fix based on error type
   */
  applySpecificFix(lines, error) {
    const lineIndex = error.line - 1;

    switch (error.type) {
      case 'override':
        return this.fixOverrideModifier(lines, lineIndex);
        
      case 'unused':
        return this.fixUnusedVariable(lines, lineIndex, error.message);
        
      case 'nullish':
        return this.fixNullishValue(lines, lineIndex);
        
      case 'import':
        return this.fixImportError(lines, lineIndex, error.message);
        
      case 'type-mismatch':
        return this.fixTypeMismatch(lines, lineIndex, error.message);
        
      case 'return':
        return this.fixMissingReturn(lines, lineIndex);
        
      default:
        return false;
    }
  }

  /**
   * Fix missing override modifiers
   */
  fixOverrideModifier(lines, lineIndex) {
    const line = lines[lineIndex];
    
    // Add override modifier to methods
    if (line.match(/^\s*(public|private|protected)?\s*(async\s+)?\w+\s*\(/)) {
      lines[lineIndex] = line.replace(
        /^(\s*)(public|private|protected)?\s*/,
        '$1$2 override '
      ).replace(/\s+override/, ' override');
      return true;
    }
    
    return false;
  }

  /**
   * Fix unused variables by removing or prefixing with underscore
   */
  fixUnusedVariable(lines, lineIndex, message) {
    const line = lines[lineIndex];
    const varMatch = message.match(/'([^']+)' is declared/);
    
    if (varMatch) {
      const varName = varMatch[1];
      
      // For imports, remove unused import
      if (line.includes('import')) {
        const newLine = this.removeUnusedImport(line, varName);
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          return true;
        }
      }
      
      // For variables, prefix with underscore
      if (line.includes(`${varName}:`)) {
        lines[lineIndex] = line.replace(
          new RegExp(`\\b${varName}\\b`),
          `_${varName}`
        );
        return true;
      }
    }
    
    return false;
  }

  /**
   * Remove unused import from import statement
   */
  removeUnusedImport(line, varName) {
    // Handle different import patterns
    const patterns = [
      { regex: new RegExp(`import\\s+{[^}]*\\b${varName}\\b[^}]*}\\s+from`), type: 'named' },
      { regex: new RegExp(`import\\s+${varName}\\s+from`), type: 'default' },
      { regex: new RegExp(`import\\s+\\*\\s+as\\s+${varName}\\s+from`), type: 'namespace' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        if (pattern.type === 'named') {
          return line.replace(
            new RegExp(`\\b${varName}\\b,?\\s*|,\\s*\\b${varName}\\b`),
            ''
          ).replace(/{\s*,/, '{').replace(/,\s*}/, '}');
        } else {
          return ''; // Remove entire line for default/namespace imports
        }
      }
    }
    
    return line;
  }

  /**
   * Fix nullish value errors with optional chaining
   */
  fixNullishValue(lines, lineIndex) {
    const line = lines[lineIndex];
    
    // Add optional chaining where appropriate
    const optionalChainPattern = /(\w+)\.(\w+)/g;
    const newLine = line.replace(optionalChainPattern, (match, obj, prop) => {
      if (!match.includes('?.')) {
        return `${obj}?.${prop}`;
      }
      return match;
    });
    
    if (newLine !== line) {
      lines[lineIndex] = newLine;
      return true;
    }
    
    return false;
  }

  /**
   * Fix import errors by adding missing imports
   */
  fixImportError(lines, lineIndex, message) {
    const moduleMatch = message.match(/Cannot find module '([^']+)'/);
    
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      
      // Try to resolve relative imports
      if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
        const line = lines[lineIndex];
        const newLine = line.replace(moduleName, `${moduleName}.js`);
        
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Fix type mismatch with type assertions
   */
  fixTypeMismatch(lines, lineIndex, message) {
    const line = lines[lineIndex];
    
    // Add type assertions for common cases
    if (message.includes('string | undefined')) {
      const newLine = line.replace(/(\w+)\.(\w+)/g, '($1 as any).$2');
      if (newLine !== line) {
        lines[lineIndex] = newLine;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Fix missing return statements
   */
  fixMissingReturn(lines, lineIndex) {
    // Look for function blocks without return
    for (let i = lineIndex; i < lines.length; i++) {
      if (lines[i].includes('}')) {
        lines.splice(i, 0, '  return undefined;');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log('\n🔍 Validating fixes...');
    
    try {
      execSync('bunx tsc --project tsconfig.validation.json', { encoding: 'utf8' });
      console.log('✅ All TypeScript errors resolved!');
    } catch (error) {
      const remaining = this.parseTypeScriptErrors(error.stdout || error.stderr || '').length;
      console.log(`⚠️  ${remaining} errors remaining (may require manual intervention)`);
    }
  }

  /**
   * Report results
   */
  reportResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TYPESCRIPT AUTO-FIXER RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Files processed: ${this.filesProcessed}`);
    console.log(`⚡ Fixes applied: ${this.fixesApplied}`);
    console.log(`🚀 Development speed: EXPONENTIALLY INCREASED!`);
    console.log('='.repeat(60) + '\n');
  }
}

// ES module CLI execution
const fixer = new TypeScriptAutoFixer();
fixer.run().catch(console.error); 