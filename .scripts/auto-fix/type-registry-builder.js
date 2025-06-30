#!/usr/bin/env node

/**
 * 🔍 TYPE REGISTRY BUILDER
 * Scans entire project to create comprehensive type map for intelligent auto-fixing
 * Maps every type, interface, class, function to its source file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TypeRegistryBuilder {
  constructor() {
    this.typeRegistry = new Map();
    this.interfaceRegistry = new Map();
    this.classRegistry = new Map();
    this.functionRegistry = new Map();
    this.enumRegistry = new Map();
    this.aliasRegistry = new Map();
    this.filesScanned = 0;
    this.typesFound = 0;
    
    // Common project patterns
    this.projectPatterns = {
      // Known type mappings
      commonTypes: new Map([
        ['PublicKey', '@solana/web3.js'],
        ['Connection', '@solana/web3.js'],
        ['Keypair', '@solana/web3.js'],
        ['Transaction', '@solana/web3.js'],
        ['Address', '@solana/addresses'],
        ['Program', '@coral-xyz/anchor'],
        ['BN', 'bn.js'],
        ['Buffer', 'buffer']
      ]),
      
      // Import style preferences
      importStyles: {
        '@solana/web3.js': 'named',
        '@coral-xyz/anchor': 'named',
        'bn.js': 'default',
        'buffer': 'named'
      }
    };
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🔍 TYPE REGISTRY BUILDER STARTING...\n');
    
    try {
      // Build comprehensive type registry
      await this.buildTypeRegistry();
      
      // Save registry to file
      await this.saveRegistry();
      
      // Generate analysis report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Type registry builder failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Build comprehensive type registry by scanning all TypeScript files
   */
  async buildTypeRegistry() {
    console.log('📂 Scanning project files...');
    
    const projectFiles = await this.findAllTypeScriptFiles();
    console.log(`📊 Found ${projectFiles.length} TypeScript files to analyze\n`);
    
    for (const filePath of projectFiles) {
      await this.analyzeFile(filePath);
    }
  }

  /**
   * Find all TypeScript files in the project
   */
  async findAllTypeScriptFiles() {
    const files = [];
    const searchDirs = ['packages', 'src', 'tests', '.'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.scanDirectory(dir, excludeDirs));
      }
    }
    
    return files.filter(file => 
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.includes('/node_modules/') &&
      !file.includes('/.git/')
    );
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  scanDirectory(dir, excludeDirs) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            files.push(...this.scanDirectory(fullPath, excludeDirs));
          }
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return files;
  }

  /**
   * Analyze a single TypeScript file for type definitions
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      console.log(`🔍 Analyzing ${relativePath}...`);
      
      // Extract all exportable types from the file
      const exports = this.extractExports(content, filePath);
      
      // Register all found types
      for (const exportItem of exports) {
        this.registerType(exportItem, filePath);
      }
      
      this.filesScanned++;
      
    } catch (error) {
      console.log(`⚠️  Error analyzing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract all export statements from TypeScript content
   */
  extractExports(content, filePath) {
    const exports = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Export interfaces
      const interfaceMatch = line.match(/^export\s+interface\s+(\w+)/);
      if (interfaceMatch) {
        exports.push({
          type: 'interface',
          name: interfaceMatch[1],
          line: i + 1,
          definition: this.extractDefinition(lines, i)
        });
        continue;
      }
      
      // Export types
      const typeMatch = line.match(/^export\s+type\s+(\w+)/);
      if (typeMatch) {
        exports.push({
          type: 'type',
          name: typeMatch[1],
          line: i + 1,
          definition: this.extractDefinition(lines, i)
        });
        continue;
      }
      
      // Export classes
      const classMatch = line.match(/^export\s+(?:(?:abstract|default)\s+)?class\s+(\w+)/);
      if (classMatch) {
        exports.push({
          type: 'class',
          name: classMatch[1],
          line: i + 1,
          definition: this.extractDefinition(lines, i)
        });
        continue;
      }
      
      // Export functions
      const functionMatch = line.match(/^export\s+(?:async\s+)?function\s+(\w+)/);
      if (functionMatch) {
        exports.push({
          type: 'function',
          name: functionMatch[1],
          line: i + 1,
          definition: this.extractDefinition(lines, i)
        });
        continue;
      }
      
      // Export const/let/var
      const constMatch = line.match(/^export\s+(?:const|let|var)\s+(\w+)/);
      if (constMatch) {
        exports.push({
          type: 'const',
          name: constMatch[1],
          line: i + 1,
          definition: line
        });
        continue;
      }
      
      // Export enums
      const enumMatch = line.match(/^export\s+enum\s+(\w+)/);
      if (enumMatch) {
        exports.push({
          type: 'enum',
          name: enumMatch[1],
          line: i + 1,
          definition: this.extractDefinition(lines, i)
        });
        continue;
      }
      
      // Named exports
      const namedExportMatch = line.match(/^export\s*{\s*([^}]+)\s*}/);
      if (namedExportMatch) {
        const names = namedExportMatch[1].split(',').map(n => n.trim());
        for (const name of names) {
          const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
          if (cleanName) {
            exports.push({
              type: 'named',
              name: cleanName,
              line: i + 1,
              definition: line
            });
          }
        }
        continue;
      }
      
      // Default exports
      const defaultMatch = line.match(/^export\s+default\s+(?:class\s+)?(\w+)/);
      if (defaultMatch) {
        exports.push({
          type: 'default',
          name: defaultMatch[1],
          line: i + 1,
          definition: line
        });
      }
    }
    
    return exports;
  }

  /**
   * Extract multi-line definition for complex types
   */
  extractDefinition(lines, startIndex) {
    let definition = lines[startIndex];
    let braceCount = 0;
    
    // Count braces to find complete definition
    for (const char of definition) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // If definition spans multiple lines
    let i = startIndex + 1;
    while (braceCount > 0 && i < lines.length) {
      definition += '\n' + lines[i];
      
      for (const char of lines[i]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      i++;
    }
    
    return definition;
  }

  /**
   * Register a type in the appropriate registry
   */
  registerType(exportItem, filePath) {
    const typeInfo = {
      name: exportItem.name,
      type: exportItem.type,
      file: filePath,
      relativePath: path.relative(process.cwd(), filePath),
      line: exportItem.line,
      definition: exportItem.definition,
      importPath: this.generateImportPath(filePath)
    };
    
    // Register in appropriate registry based on type
    switch (exportItem.type) {
      case 'interface':
        this.interfaceRegistry.set(exportItem.name, typeInfo);
        break;
      case 'type':
        this.aliasRegistry.set(exportItem.name, typeInfo);
        break;
      case 'class':
        this.classRegistry.set(exportItem.name, typeInfo);
        break;
      case 'function':
        this.functionRegistry.set(exportItem.name, typeInfo);
        break;
      case 'enum':
        this.enumRegistry.set(exportItem.name, typeInfo);
        break;
      default:
        this.typeRegistry.set(exportItem.name, typeInfo);
    }
    
    this.typesFound++;
  }

  /**
   * Generate appropriate import path for a file
   */
  generateImportPath(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Convert to import path format
    let importPath = relativePath
      .replace(/\\/g, '/') // Windows path fix
      .replace(/\.tsx?$/, '') // Remove extension
      .replace(/\/index$/, ''); // Remove index
    
    // Handle workspace packages
    if (importPath.startsWith('packages/')) {
      const packageParts = importPath.split('/');
      if (packageParts[1]) {
        importPath = `@podai/${packageParts[1]}`;
        if (packageParts.length > 3) {
          importPath += '/' + packageParts.slice(3).join('/');
        }
      }
    }
    
    // Make relative imports
    if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
      importPath = './' + importPath;
    }
    
    return importPath;
  }

  /**
   * Save the complete registry to a JSON file
   */
  async saveRegistry() {
    console.log('\n💾 Saving type registry...');
    
    const registryData = {
      metadata: {
        generated: new Date().toISOString(),
        filesScanned: this.filesScanned,
        typesFound: this.typesFound,
        version: '1.0.0'
      },
      projectPatterns: this.projectPatterns,
      registries: {
        types: Object.fromEntries(this.typeRegistry),
        interfaces: Object.fromEntries(this.interfaceRegistry),
        classes: Object.fromEntries(this.classRegistry),
        functions: Object.fromEntries(this.functionRegistry),
        enums: Object.fromEntries(this.enumRegistry),
        aliases: Object.fromEntries(this.aliasRegistry)
      }
    };
    
    const registryPath = path.join(__dirname, 'type-registry.json');
    fs.writeFileSync(registryPath, JSON.stringify(registryData, null, 2));
    
    console.log(`  ✅ Registry saved to: ${path.relative(process.cwd(), registryPath)}`);
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 TYPE REGISTRY ANALYSIS REPORT');
    console.log('='.repeat(60));
    console.log(`📂 Files scanned: ${this.filesScanned}`);
    console.log(`🎯 Total types found: ${this.typesFound}`);
    console.log('');
    console.log('📊 Type breakdown:');
    console.log(`  • Interfaces: ${this.interfaceRegistry.size}`);
    console.log(`  • Type aliases: ${this.aliasRegistry.size}`);
    console.log(`  • Classes: ${this.classRegistry.size}`);
    console.log(`  • Functions: ${this.functionRegistry.size}`);
    console.log(`  • Enums: ${this.enumRegistry.size}`);
    console.log(`  • Other exports: ${this.typeRegistry.size}`);
    console.log('='.repeat(60));
    console.log('🚀 Type registry ready for intelligent auto-fixing!');
    console.log('='.repeat(60) + '\n');
    
    // Show top types for verification
    console.log('🔍 Sample registered types:');
    const samples = Array.from(this.interfaceRegistry.entries()).slice(0, 5);
    for (const [name, info] of samples) {
      console.log(`  • ${name} (${info.type}) from ${info.relativePath}`);
    }
    console.log('');
  }

  /**
   * Static method to load existing registry
   */
  static loadRegistry() {
    const registryPath = path.join(__dirname, 'type-registry.json');
    
    if (fs.existsSync(registryPath)) {
      const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      return data;
    }
    
    return null;
  }

  /**
   * Find type in registry by name
   */
  static findType(name, registry = null) {
    if (!registry) {
      registry = TypeRegistryBuilder.loadRegistry();
    }
    
    if (!registry) return null;
    
    // Search all registry types
    const { registries } = registry;
    
    for (const [registryName, typeMap] of Object.entries(registries)) {
      if (typeMap[name]) {
        return {
          ...typeMap[name],
          registryType: registryName
        };
      }
    }
    
    // Check common types
    if (registry.projectPatterns?.commonTypes?.has?.(name)) {
      return {
        name,
        importPath: registry.projectPatterns.commonTypes.get(name),
        type: 'external',
        registryType: 'common'
      };
    }
    
    return null;
  }
}

// CLI execution
const builder = new TypeRegistryBuilder();
builder.run().catch(console.error); 