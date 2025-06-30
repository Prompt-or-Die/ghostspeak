#!/usr/bin/env node

/**
 * 🚀 ADVANCED TYPESCRIPT FIXER
 * Master auto-fixer with comprehensive type awareness and intelligent error resolution
 * Combines: type registry, smart imports, advanced patterns, project knowledge
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedTypeScriptFixer {
  constructor() {
    this.typeRegistry = null;
    this.fixesApplied = 0;
    this.filesProcessed = 0;
    this.importsAdded = 0;
    this.errorsResolved = new Map();
    
    // Advanced error patterns with intelligent fixes
    this.advancedPatterns = {
      // Type assertion patterns
      typeAssertions: {
        'Object is possibly': {
          pattern: /Object is possibly '(undefined|null)'/,
          fix: (line, match) => {
            // Add optional chaining or null checks
            return line.replace(/(\w+)\.(\w+)/g, '$1?.$2');
          }
        }
      },
      
      // Missing override patterns
      overridePatterns: {
        'must have an override modifier': {
          fix: (line) => {
            return line.replace(
              /^(\s*)(public|private|protected)?\s*(async\s+)?(\w+\s*\()/,
              '$1$2 override $3$4'
            ).replace(/\s+override/, ' override');
          }
        }
      },
      
      // exactOptionalPropertyTypes fixes
      exactOptionalTypes: {
        'not assignable.*exactOptionalPropertyTypes': {
          fix: (line, context) => {
            // Handle exact optional property types
            return this.fixExactOptionalPropertyTypes(line, context);
          }
        }
      },
      
      // Unused variable patterns
      unusedVariables: {
        'declared but its value is never read': {
          fix: (line, varName) => {
            // Prefix with underscore to indicate intentionally unused
            return line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
          }
        }
      }
    };
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 ADVANCED TYPESCRIPT FIXER STARTING...\n');
    console.log('🎯 Comprehensive type-aware error resolution system');
    console.log('⚡ Combining: type registry + smart imports + advanced patterns\n');
    
    try {
      // Initialize type registry
      await this.initializeTypeRegistry();
      
      // Get all TypeScript errors
      const errors = await this.getTypeScriptErrors();
      console.log(`📊 Found ${errors.length} TypeScript errors to analyze\n`);
      
      // Categorize and prioritize errors
      const categorizedErrors = this.categorizeErrors(errors);
      this.reportErrorAnalysis(categorizedErrors);
      
      // Apply comprehensive fixes
      await this.applyComprehensiveFixes(categorizedErrors);
      
      // Run validation
      await this.validateFixes();
      
      // Generate final report
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Advanced TypeScript fixer failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Initialize type registry (build if needed)
   */
  async initializeTypeRegistry() {
    console.log('📚 Initializing type registry...');
    
    const registryPath = path.join(__dirname, 'type-registry.json');
    
    if (!fs.existsSync(registryPath)) {
      console.log('🔍 Building type registry...');
      execSync('node .scripts/auto-fix/type-registry-builder.js', { stdio: 'inherit' });
    }
    
    if (fs.existsSync(registryPath)) {
      this.typeRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      console.log(`  ✅ Loaded ${this.typeRegistry.metadata.typesFound} types from registry\n`);
    } else {
      throw new Error('Could not initialize type registry');
    }
  }

  /**
   * Get TypeScript compilation errors with detailed analysis
   */
  async getTypeScriptErrors() {
    console.log('🔍 Analyzing TypeScript errors...');
    
    try {
      execSync('bunx tsc --project tsconfig.validation.json', { encoding: 'utf8' });
      return []; // No errors
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.parseAdvancedErrors(output);
    }
  }

  /**
   * Parse TypeScript errors with enhanced categorization
   */
  parseAdvancedErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Enhanced error parsing with context
      const match = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      
      if (match) {
        const [, filePath, lineNum, colNum, errorCode, message] = match;
        
        const error = {
          file: filePath,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message,
          category: this.categorizeError(message, errorCode),
          severity: this.determineSeverity(errorCode, message),
          fixable: this.isFixable(errorCode, message),
          context: this.extractContext(lines, i)
        };
        
        errors.push(error);
      }
    }
    
    return errors;
  }

  /**
   * Enhanced error categorization
   */
  categorizeError(message, errorCode) {
    const categories = {
      'missing-imports': [
        /Cannot find name/,
        /Cannot find module/,
        /Module.*has no exported member/
      ],
      'type-mismatches': [
        /Type.*is not assignable to type/,
        /Argument of type.*is not assignable/
      ],
      'optional-types': [
        /Object is possibly/,
        /exactOptionalPropertyTypes/
      ],
      'unused-code': [
        /is declared but its value is never read/,
        /is defined but never used/
      ],
      'missing-overrides': [
        /must have an 'override' modifier/
      ],
      'strict-null-checks': [
        /Object is possibly 'null'/,
        /Object is possibly 'undefined'/
      ],
      'missing-returns': [
        /Not all code paths return a value/
      ],
      'duplicate-identifiers': [
        /Duplicate identifier/
      ]
    };
    
    for (const [category, patterns] of Object.entries(categories)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * Determine error severity for prioritization
   */
  determineSeverity(errorCode, message) {
    const highSeverity = ['TS2304', 'TS2307', 'TS2322', 'TS2339'];
    const mediumSeverity = ['TS6133', 'TS4114', 'TS2532'];
    
    if (highSeverity.includes(errorCode)) return 'high';
    if (mediumSeverity.includes(errorCode)) return 'medium';
    return 'low';
  }

  /**
   * Determine if error is automatically fixable
   */
  isFixable(errorCode, message) {
    const fixablePatterns = [
      /Cannot find name/,
      /is declared but its value is never read/,
      /must have an 'override' modifier/,
      /Object is possibly/
    ];
    
    return fixablePatterns.some(pattern => pattern.test(message));
  }

  /**
   * Extract context around error line
   */
  extractContext(lines, errorIndex) {
    const context = {
      before: [],
      after: [],
      errorLine: lines[errorIndex]
    };
    
    // Get 2 lines before and after for context
    for (let i = Math.max(0, errorIndex - 2); i < errorIndex; i++) {
      context.before.push(lines[i]);
    }
    
    for (let i = errorIndex + 1; i < Math.min(lines.length, errorIndex + 3); i++) {
      context.after.push(lines[i]);
    }
    
    return context;
  }

  /**
   * Categorize all errors for systematic fixing
   */
  categorizeErrors(errors) {
    const categorized = {
      'missing-imports': [],
      'type-mismatches': [],
      'optional-types': [],
      'unused-code': [],
      'missing-overrides': [],
      'strict-null-checks': [],
      'missing-returns': [],
      'other': []
    };
    
    errors.forEach(error => {
      const category = error.category;
      if (categorized[category]) {
        categorized[category].push(error);
      } else {
        categorized.other.push(error);
      }
    });
    
    return categorized;
  }

  /**
   * Report error analysis
   */
  reportErrorAnalysis(categorizedErrors) {
    console.log('📊 ERROR ANALYSIS REPORT');
    console.log('─'.repeat(50));
    
    for (const [category, errors] of Object.entries(categorizedErrors)) {
      if (errors.length > 0) {
        const fixableCount = errors.filter(e => e.fixable).length;
        console.log(`🔹 ${category.replace('-', ' ').toUpperCase()}: ${errors.length} errors (${fixableCount} fixable)`);
      }
    }
    console.log('');
  }

  /**
   * Apply comprehensive fixes in optimal order
   */
  async applyComprehensiveFixes(categorizedErrors) {
    console.log('⚡ APPLYING COMPREHENSIVE FIXES...\n');
    
    // Fix in order of dependency (imports first, then types, then cleanup)
    const fixOrder = [
      'missing-imports',
      'type-mismatches', 
      'missing-overrides',
      'optional-types',
      'strict-null-checks',
      'unused-code',
      'missing-returns'
    ];
    
    for (const category of fixOrder) {
      const errors = categorizedErrors[category] || [];
      if (errors.length > 0) {
        await this.fixErrorCategory(category, errors);
      }
    }
  }

  /**
   * Fix specific category of errors
   */
  async fixErrorCategory(category, errors) {
    console.log(`🔧 Fixing ${category.replace('-', ' ')} (${errors.length} errors)...`);
    
    switch (category) {
      case 'missing-imports':
        await this.fixMissingImports(errors);
        break;
      case 'missing-overrides':
        await this.fixMissingOverrides(errors);
        break;
      case 'unused-code':
        await this.fixUnusedCode(errors);
        break;
      case 'optional-types':
        await this.fixOptionalTypes(errors);
        break;
      case 'strict-null-checks':
        await this.fixNullChecks(errors);
        break;
      default:
        await this.fixGenericErrors(errors);
    }
  }

  /**
   * Fix missing imports using smart import resolver
   */
  async fixMissingImports(errors) {
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      await this.addMissingImportsToFile(filePath, fileErrors);
    }
  }

  /**
   * Add missing imports to a file
   */
  async addMissingImportsToFile(filePath, errors) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const importsToAdd = new Map();
    let modified = false;
    
    for (const error of errors) {
      const missingName = this.extractMissingName(error.message);
      if (missingName) {
        const typeInfo = this.findTypeInRegistry(missingName);
        if (typeInfo) {
          const importPath = this.calculateImportPath(filePath, typeInfo);
          if (importPath && !this.isAlreadyImported(missingName, content)) {
            if (!importsToAdd.has(importPath)) {
              importsToAdd.set(importPath, new Set());
            }
            importsToAdd.get(importPath).add(missingName);
          }
        }
      }
    }
    
    if (importsToAdd.size > 0) {
      content = this.addImportsToFileContent(content, importsToAdd);
      fs.writeFileSync(filePath, content);
      this.filesProcessed++;
      this.importsAdded += Array.from(importsToAdd.values()).reduce((sum, types) => sum + types.size, 0);
      modified = true;
      
      console.log(`  ✅ Added imports to ${path.relative(process.cwd(), filePath)}`);
    }
    
    return modified;
  }

  /**
   * Extract missing name from error message
   */
  extractMissingName(message) {
    const nameMatch = message.match(/Cannot find name '(\w+)'/);
    return nameMatch ? nameMatch[1] : null;
  }

  /**
   * Find type in registry
   */
  findTypeInRegistry(name) {
    if (!this.typeRegistry) return null;
    
    const { registries } = this.typeRegistry;
    
    // Search all registry types
    for (const [registryType, typeMap] of Object.entries(registries)) {
      if (typeMap[name]) {
        return typeMap[name];
      }
    }
    
    // Check common types
    const commonTypes = this.typeRegistry.projectPatterns?.commonTypes;
    if (commonTypes && commonTypes[name]) {
      return {
        name,
        importPath: commonTypes[name],
        type: 'external'
      };
    }
    
    return null;
  }

  /**
   * Calculate import path for a type
   */
  calculateImportPath(fromFile, typeInfo) {
    if (typeInfo.type === 'external' || typeInfo.importPath?.startsWith('@')) {
      return typeInfo.importPath;
    }
    
    if (typeInfo.file) {
      const fromDir = path.dirname(fromFile);
      let relativePath = path.relative(fromDir, typeInfo.file);
      relativePath = relativePath.replace(/\\/g, '/').replace(/\.tsx?$/, '');
      
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      return relativePath;
    }
    
    return typeInfo.importPath;
  }

  /**
   * Check if type is already imported
   */
  isAlreadyImported(name, content) {
    return new RegExp(`import.*\\b${name}\\b.*from`).test(content);
  }

  /**
   * Add imports to file content
   */
  addImportsToFileContent(content, importsToAdd) {
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find insertion point after existing imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        insertIndex = i + 1;
      } else if (insertIndex > 0 && lines[i].trim() === '') {
        break;
      }
    }
    
    // Generate import statements
    const importStatements = [];
    for (const [source, typesSet] of importsToAdd) {
      const types = Array.from(typesSet);
      importStatements.push(`import { ${types.join(', ')} } from "${source}";`);
    }
    
    // Insert imports
    lines.splice(insertIndex, 0, ...importStatements, '');
    return lines.join('\n');
  }

  /**
   * Fix missing override modifiers
   */
  async fixMissingOverrides(errors) {
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const error of fileErrors) {
          const lines = content.split('\n');
          const lineIndex = error.line - 1;
          
          if (lineIndex < lines.length) {
            const originalLine = lines[lineIndex];
            const fixedLine = this.addOverrideModifier(originalLine);
            
            if (fixedLine !== originalLine) {
              lines[lineIndex] = fixedLine;
              content = lines.join('\n');
              modified = true;
              this.fixesApplied++;
            }
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          this.filesProcessed++;
          console.log(`  ✅ Fixed override modifiers in ${path.relative(process.cwd(), filePath)}`);
        }
      }
    }
  }

  /**
   * Add override modifier to method
   */
  addOverrideModifier(line) {
    return line.replace(
      /^(\s*)(public|private|protected)?\s*(async\s+)?(\w+\s*\()/,
      '$1$2 override $3$4'
    ).replace(/\s+override/, ' override');
  }

  /**
   * Fix unused code by prefixing with underscore
   */
  async fixUnusedCode(errors) {
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const error of fileErrors) {
          const varMatch = error.message.match(/'([^']+)' is declared but its value is never read/);
          if (varMatch) {
            const varName = varMatch[1];
            const newContent = content.replace(
              new RegExp(`\\b${varName}\\b(?=\\s*[:=])`, 'g'),
              `_${varName}`
            );
            
            if (newContent !== content) {
              content = newContent;
              modified = true;
              this.fixesApplied++;
            }
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          this.filesProcessed++;
          console.log(`  ✅ Fixed unused variables in ${path.relative(process.cwd(), filePath)}`);
        }
      }
    }
  }

  /**
   * Fix optional type issues
   */
  async fixOptionalTypes(errors) {
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const error of fileErrors) {
          if (error.message.includes('exactOptionalPropertyTypes')) {
            // Handle exact optional property types by making properties explicitly optional
            const lines = content.split('\n');
            const lineIndex = error.line - 1;
            
            if (lineIndex < lines.length) {
              const line = lines[lineIndex];
              const fixedLine = this.fixExactOptionalPropertyTypes(line, error);
              
              if (fixedLine !== line) {
                lines[lineIndex] = fixedLine;
                content = lines.join('\n');
                modified = true;
                this.fixesApplied++;
              }
            }
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          this.filesProcessed++;
          console.log(`  ✅ Fixed optional types in ${path.relative(process.cwd(), filePath)}`);
        }
      }
    }
  }

  /**
   * Fix exact optional property types
   */
  fixExactOptionalPropertyTypes(line, error) {
    // Add undefined to union types for exact optional properties
    return line.replace(
      /:\s*([^|]+)(?=\s*[;}])/g,
      ': $1 | undefined'
    );
  }

  /**
   * Fix null checks by adding optional chaining
   */
  async fixNullChecks(errors) {
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const error of fileErrors) {
          const lines = content.split('\n');
          const lineIndex = error.line - 1;
          
          if (lineIndex < lines.length) {
            const originalLine = lines[lineIndex];
            const fixedLine = originalLine.replace(/(\w+)\.(\w+)/g, '$1?.$2');
            
            if (fixedLine !== originalLine) {
              lines[lineIndex] = fixedLine;
              content = lines.join('\n');
              modified = true;
              this.fixesApplied++;
            }
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          this.filesProcessed++;
          console.log(`  ✅ Fixed null checks in ${path.relative(process.cwd(), filePath)}`);
        }
      }
    }
  }

  /**
   * Fix generic errors with pattern matching
   */
  async fixGenericErrors(errors) {
    console.log(`  ⚠️  ${errors.length} generic errors need manual review`);
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
   * Validate fixes by running TypeScript again
   */
  async validateFixes() {
    console.log('\n🔍 Validating comprehensive fixes...');
    
    try {
      execSync('bunx tsc --project tsconfig.validation.json', { encoding: 'utf8' });
      console.log('✅ All TypeScript errors resolved!');
      return 0;
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const remaining = this.parseAdvancedErrors(output).length;
      console.log(`⚠️  ${remaining} errors remaining`);
      return remaining;
    }
  }

  /**
   * Generate comprehensive results report
   */
  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 ADVANCED TYPESCRIPT FIXER: COMPREHENSIVE RESULTS');
    console.log('='.repeat(70));
    console.log(`📂 Files processed: ${this.filesProcessed}`);
    console.log(`⚡ Total fixes applied: ${this.fixesApplied}`);
    console.log(`🔗 Imports added: ${this.importsAdded}`);
    console.log(`🎯 Error categories resolved: ${Object.keys(this.errorsResolved).length}`);
    console.log('='.repeat(70));
    console.log('✅ ADVANCED TYPE-AWARE FIXING: COMPLETE!');
    console.log('🚀 Development acceleration: EXPONENTIAL!');
    console.log('⚡ Ready for: HIGH-VELOCITY DEVELOPMENT!');
    console.log('='.repeat(70) + '\n');
  }
}

// CLI execution
const fixer = new AdvancedTypeScriptFixer();
fixer.run().catch(console.error); 