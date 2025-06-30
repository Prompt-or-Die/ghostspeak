#!/usr/bin/env node

/**
 * 🔗 SMART IMPORT RESOLVER
 * Automatically resolves and adds missing imports when types are referenced
 * Uses type registry to intelligently determine correct import sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SmartImportResolver {
  constructor() {
    this.typeRegistry = null;
    this.importsAdded = 0;
    this.filesModified = 0;
    this.resolvedTypes = new Set();
    
    // Common import patterns
    this.importPatterns = {
      // How to import from different sources
      '@solana/web3.js': { type: 'named', pattern: 'import { {{types}} } from "@solana/web3.js";' },
      '@coral-xyz/anchor': { type: 'named', pattern: 'import { {{types}} } from "@coral-xyz/anchor";' },
      '@solana/addresses': { type: 'named', pattern: 'import { {{types}} } from "@solana/addresses";' },
      'bn.js': { type: 'default', pattern: 'import BN from "bn.js";' },
      'buffer': { type: 'named', pattern: 'import { {{types}} } from "buffer";' },
      'crypto': { type: 'named', pattern: 'import { {{types}} } from "crypto";' }
    };
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🔗 SMART IMPORT RESOLVER STARTING...\n');
    
    try {
      // Load type registry
      await this.loadTypeRegistry();
      
      // Analyze import errors
      const importErrors = await this.findImportErrors();
      console.log(`📊 Found ${importErrors.length} import-related errors to resolve\n`);
      
      // Resolve missing imports
      await this.resolveImportErrors(importErrors);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Smart import resolver failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load the type registry from file
   */
  async loadTypeRegistry() {
    console.log('📚 Loading type registry...');
    
    const registryPath = path.join(__dirname, 'type-registry.json');
    
    if (!fs.existsSync(registryPath)) {
      console.log('⚠️  Type registry not found. Building it first...');
      
      // Import and run type registry builder
      const { execSync } = await import('child_process');
      execSync('node .scripts/auto-fix/type-registry-builder.js', { stdio: 'inherit' });
    }
    
    if (fs.existsSync(registryPath)) {
      this.typeRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      console.log(`  ✅ Loaded registry with ${this.typeRegistry.metadata.typesFound} types`);
    } else {
      throw new Error('Could not load or create type registry');
    }
  }

  /**
   * Find all import-related TypeScript errors
   */
  async findImportErrors() {
    console.log('🔍 Analyzing import errors...');
    
    const { execSync } = await import('child_process');
    
    try {
      execSync('bunx tsc --project tsconfig.validation.json', { encoding: 'utf8' });
      return []; // No errors
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      return this.parseImportErrors(output);
    }
  }

  /**
   * Parse TypeScript output for import-related errors
   */
  parseImportErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Cannot find name 'X' errors
      const nameMatch = trimmed.match(/^(.+)\(\d+,\d+\): error TS2304: Cannot find name '(\w+)'/);
      if (nameMatch) {
        errors.push({
          type: 'missing-name',
          file: nameMatch[1],
          missingName: nameMatch[2],
          line: trimmed
        });
        continue;
      }
      
      // Cannot find module errors  
      const moduleMatch = trimmed.match(/^(.+)\(\d+,\d+\): error TS2307: Cannot find module '([^']+)'/);
      if (moduleMatch) {
        errors.push({
          type: 'missing-module',
          file: moduleMatch[1],
          missingModule: moduleMatch[2],
          line: trimmed
        });
        continue;
      }
      
      // Property does not exist errors (might need type imports)
      const propertyMatch = trimmed.match(/^(.+)\(\d+,\d+\): error TS2339: Property '(\w+)' does not exist on type '([^']+)'/);
      if (propertyMatch) {
        errors.push({
          type: 'missing-property',
          file: propertyMatch[1],
          property: propertyMatch[2],
          onType: propertyMatch[3],
          line: trimmed
        });
        continue;
      }
      
      // Type 'X' is not assignable to type 'Y' (might need imports)
      const assignableMatch = trimmed.match(/^(.+)\(\d+,\d+\): error TS2322: Type '([^']+)' is not assignable to type '([^']+)'/);
      if (assignableMatch) {
        errors.push({
          type: 'type-mismatch',
          file: assignableMatch[1],
          fromType: assignableMatch[2],
          toType: assignableMatch[3],
          line: trimmed
        });
      }
    }
    
    return errors;
  }

  /**
   * Resolve all import errors by adding missing imports
   */
  async resolveImportErrors(errors) {
    console.log('⚡ Resolving import errors...\n');
    
    // Group errors by file for efficient processing
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      await this.resolveFileImports(filePath, fileErrors);
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
   * Resolve all import errors for a single file
   */
  async resolveFileImports(filePath, errors) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} (file not found)`);
      return;
    }

    console.log(`🔧 Resolving imports for ${path.relative(process.cwd(), filePath)} (${errors.length} errors)`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Track what needs to be imported
    const importsToAdd = new Map(); // source -> [types]
    
    for (const error of errors) {
      const resolved = this.resolveError(error, filePath, content);
      if (resolved) {
        for (const [source, types] of resolved) {
          if (!importsToAdd.has(source)) {
            importsToAdd.set(source, new Set());
          }
          types.forEach(type => importsToAdd.get(source).add(type));
        }
      }
    }
    
    // Add all resolved imports
    if (importsToAdd.size > 0) {
      content = this.addImportsToFile(content, importsToAdd);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Added imports for ${importsToAdd.size} sources`);
      this.filesModified++;
      this.importsAdded += Array.from(importsToAdd.values()).reduce((sum, types) => sum + types.size, 0);
    } else {
      console.log(`  ⚠️  No import resolutions found for ${path.relative(process.cwd(), filePath)}`);
    }
  }

  /**
   * Resolve a specific error to determine what imports are needed
   */
  resolveError(error, filePath, content) {
    const importsNeeded = new Map();
    
    switch (error.type) {
      case 'missing-name':
        const nameResolution = this.resolveMissingName(error.missingName, filePath);
        if (nameResolution) {
          if (!importsNeeded.has(nameResolution.source)) {
            importsNeeded.set(nameResolution.source, []);
          }
          importsNeeded.get(nameResolution.source).push(nameResolution.name);
          this.resolvedTypes.add(error.missingName);
        }
        break;
        
      case 'missing-module':
        // Try to fix relative import paths
        const moduleResolution = this.resolveMissingModule(error.missingModule, filePath);
        if (moduleResolution) {
          // This might need a different handling approach
          console.log(`  🔍 Module resolution: ${error.missingModule} -> ${moduleResolution}`);
        }
        break;
        
      case 'type-mismatch':
        // Check if either type needs to be imported
        const fromTypeResolution = this.resolveMissingName(error.fromType, filePath);
        const toTypeResolution = this.resolveMissingName(error.toType, filePath);
        
        if (fromTypeResolution) {
          if (!importsNeeded.has(fromTypeResolution.source)) {
            importsNeeded.set(fromTypeResolution.source, []);
          }
          importsNeeded.get(fromTypeResolution.source).push(fromTypeResolution.name);
        }
        
        if (toTypeResolution) {
          if (!importsNeeded.has(toTypeResolution.source)) {
            importsNeeded.set(toTypeResolution.source, []);
          }
          importsNeeded.get(toTypeResolution.source).push(toTypeResolution.name);
        }
        break;
    }
    
    return importsNeeded.size > 0 ? importsNeeded : null;
  }

  /**
   * Resolve a missing name by looking it up in the type registry
   */
  resolveMissingName(name, filePath) {
    // Check if already imported
    const content = fs.readFileSync(filePath, 'utf8');
    if (this.isAlreadyImported(name, content)) {
      return null;
    }
    
    // Search in type registry
    const typeInfo = this.findInRegistry(name);
    if (typeInfo) {
      const importPath = this.calculateRelativeImport(filePath, typeInfo.file || typeInfo.importPath);
      return {
        name: name,
        source: importPath,
        type: typeInfo.type
      };
    }
    
    // Check common external types
    if (this.typeRegistry.projectPatterns?.commonTypes) {
      const commonTypesMap = new Map(Object.entries(this.typeRegistry.projectPatterns.commonTypes));
      if (commonTypesMap.has(name)) {
        return {
          name: name,
          source: commonTypesMap.get(name),
          type: 'external'
        };
      }
    }
    
    return null;
  }

  /**
   * Check if a type is already imported in the file
   */
  isAlreadyImported(name, content) {
    const importRegex = new RegExp(`import.*\\b${name}\\b.*from`, 'i');
    return importRegex.test(content);
  }

  /**
   * Find a type in the registry
   */
  findInRegistry(name) {
    const { registries } = this.typeRegistry;
    
    // Search all registry types
    for (const [registryType, typeMap] of Object.entries(registries)) {
      if (typeMap[name]) {
        return {
          ...typeMap[name],
          registryType
        };
      }
    }
    
    return null;
  }

  /**
   * Calculate relative import path between files
   */
  calculateRelativeImport(fromFile, toFile) {
    // Handle external packages
    if (typeof toFile === 'string' && !toFile.includes('/') && !toFile.includes('\\')) {
      return toFile; // It's already a package name
    }
    
    if (typeof toFile === 'string' && toFile.startsWith('@')) {
      return toFile; // It's already a scoped package
    }
    
    // Calculate relative path
    const fromDir = path.dirname(fromFile);
    let relativePath = path.relative(fromDir, toFile);
    
    // Convert to forward slashes and remove extension
    relativePath = relativePath.replace(/\\/g, '/').replace(/\.tsx?$/, '');
    
    // Add ./ if it's a relative import
    if (!relativePath.startsWith('.') && !relativePath.startsWith('@')) {
      relativePath = './' + relativePath;
    }
    
    return relativePath;
  }

  /**
   * Resolve missing module by fixing import paths
   */
  resolveMissingModule(modulePath, filePath) {
    // Try adding file extensions
    const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const fromDir = path.dirname(filePath);
    
    for (const ext of possibleExtensions) {
      const fullPath = path.resolve(fromDir, modulePath + ext);
      if (fs.existsSync(fullPath)) {
        return modulePath + ext;
      }
    }
    
    // Try index files
    for (const ext of possibleExtensions) {
      const indexPath = path.resolve(fromDir, modulePath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return modulePath + '/index' + ext;
      }
    }
    
    return null;
  }

  /**
   * Add imports to the beginning of a file
   */
  addImportsToFile(content, importsToAdd) {
    const lines = content.split('\n');
    const importLines = [];
    
    // Find where to insert imports (after existing imports)
    let insertIndex = 0;
    let inImportBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import ')) {
        inImportBlock = true;
        insertIndex = i + 1;
      } else if (inImportBlock && line === '') {
        // Empty line after imports
        insertIndex = i;
        break;
      } else if (inImportBlock && !line.startsWith('import ') && line !== '') {
        // Non-import, non-empty line
        insertIndex = i;
        break;
      }
    }
    
    // Generate import statements
    for (const [source, typesSet] of importsToAdd) {
      const types = Array.from(typesSet);
      const importStatement = this.generateImportStatement(source, types);
      if (importStatement) {
        importLines.push(importStatement);
      }
    }
    
    // Insert import lines
    if (importLines.length > 0) {
      lines.splice(insertIndex, 0, ...importLines);
      
      // Add empty line after imports if there isn't one
      if (insertIndex + importLines.length < lines.length && 
          lines[insertIndex + importLines.length].trim() !== '') {
        lines.splice(insertIndex + importLines.length, 0, '');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Generate appropriate import statement for source and types
   */
  generateImportStatement(source, types) {
    // Handle external packages with known patterns
    if (this.importPatterns[source]) {
      const pattern = this.importPatterns[source];
      if (pattern.type === 'named') {
        return pattern.pattern.replace('{{types}}', types.join(', '));
      } else if (pattern.type === 'default') {
        return pattern.pattern;
      }
    }
    
    // Default to named import
    if (types.length === 1) {
      return `import { ${types[0]} } from "${source}";`;
    } else {
      return `import {\n  ${types.join(',\n  ')}\n} from "${source}";`;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔗 SMART IMPORT RESOLVER RESULTS');
    console.log('='.repeat(60));
    console.log(`📂 Files modified: ${this.filesModified}`);
    console.log(`⚡ Imports added: ${this.importsAdded}`);
    console.log(`🎯 Types resolved: ${this.resolvedTypes.size}`);
    console.log('='.repeat(60));
    
    if (this.resolvedTypes.size > 0) {
      console.log('✅ Successfully resolved types:');
      Array.from(this.resolvedTypes).slice(0, 10).forEach(type => {
        console.log(`  • ${type}`);
      });
      
      if (this.resolvedTypes.size > 10) {
        console.log(`  ... and ${this.resolvedTypes.size - 10} more`);
      }
    }
    
    console.log('='.repeat(60));
    console.log('🚀 Import resolution: COMPLETE!');
    console.log('='.repeat(60) + '\n');
  }
}

// CLI execution
const resolver = new SmartImportResolver();
resolver.run().catch(console.error); 