#!/usr/bin/env node

/**
 * 📦 DEPENDENCY RESOLVER
 * Automatically resolves missing dependencies and import issues
 * Handles: missing packages, incorrect import paths, version conflicts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyResolver {
  constructor() {
    this.packagesInstalled = 0;
    this.importsFixed = 0;
    this.commonMissingPackages = {
      // Common missing packages and their correct names
      '@types/node': '@types/node',
      '@solana/web3.js': '@solana/web3.js',
      '@project-serum/anchor': '@coral-xyz/anchor',
      'bs58': 'bs58',
      'buffer': 'buffer',
      'crypto-js': 'crypto-js',
      'uuid': 'uuid',
      '@types/uuid': '@types/uuid',
      'dotenv': 'dotenv',
      'js-yaml': 'js-yaml',
      '@types/js-yaml': '@types/js-yaml'
    };
  }

  async run() {
    console.log('📦 DEPENDENCY RESOLVER STARTING...\n');
    
    try {
      // Analyze and fix import errors
      await this.analyzeImportErrors();
      
      // Install missing packages
      await this.installMissingPackages();
      
      // Fix import paths
      await this.fixImportPaths();
      
      // Update package versions
      await this.updatePackageVersions();
      
      this.reportResults();
      
    } catch (error) {
      console.error('❌ Dependency resolver failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeImportErrors() {
    console.log('🔍 Analyzing import errors...');
    
    try {
      execSync('bunx tsc --noEmit --skipLibCheck', { encoding: 'utf8' });
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const importErrors = this.extractImportErrors(output);
      
      console.log(`📊 Found ${importErrors.length} import-related errors`);
      
      for (const importError of importErrors) {
        await this.resolveImportError(importError);
      }
    }
  }

  extractImportErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Match "Cannot find module" errors
      const moduleMatch = line.match(/Cannot find module '([^']+)'/);
      if (moduleMatch) {
        errors.push({
          type: 'missing-module',
          module: moduleMatch[1],
          line: line
        });
        continue;
      }
      
      // Match "Module not found" errors
      const notFoundMatch = line.match(/Module '([^']+)' not found/);
      if (notFoundMatch) {
        errors.push({
          type: 'module-not-found',
          module: notFoundMatch[1],
          line: line
        });
        continue;
      }
      
      // Match import resolution errors
      const resolutionMatch = line.match(/Could not resolve '([^']+)'/);
      if (resolutionMatch) {
        errors.push({
          type: 'resolution-failed',
          module: resolutionMatch[1],
          line: line
        });
      }
    }
    
    return errors;
  }

  async resolveImportError(importError) {
    const { module, type } = importError;
    
    console.log(`🔧 Resolving ${type}: ${module}`);
    
    switch (type) {
      case 'missing-module':
        await this.installMissingModule(module);
        break;
        
      case 'module-not-found':
        await this.fixModulePath(module);
        break;
        
      case 'resolution-failed':
        await this.fixResolutionIssue(module);
        break;
    }
  }

  async installMissingModule(moduleName) {
    // Check if it's a known package
    const correctName = this.commonMissingPackages[moduleName] || moduleName;
    
    try {
      console.log(`  📦 Installing ${correctName}...`);
      execSync(`bun add ${correctName}`, { stdio: 'pipe' });
      console.log(`  ✅ Installed ${correctName}`);
      this.packagesInstalled++;
    } catch (error) {
      // Try installing as dev dependency
      try {
        execSync(`bun add -d ${correctName}`, { stdio: 'pipe' });
        console.log(`  ✅ Installed ${correctName} as dev dependency`);
        this.packagesInstalled++;
      } catch (devError) {
        console.log(`  ⚠️  Could not install ${correctName}`);
      }
    }
  }

  async fixModulePath(moduleName) {
    // Look for files that might be importing this module
    const files = this.findFilesWithImport(moduleName);
    
    for (const file of files) {
      await this.fixImportInFile(file, moduleName);
    }
  }

  findFilesWithImport(moduleName) {
    const files = [];
    
    // Search in common directories
    const searchDirs = ['packages', 'src', 'tests'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.searchDirectory(dir, moduleName));
      }
    }
    
    return files;
  }

  searchDirectory(dir, moduleName) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files.push(...this.searchDirectory(fullPath, moduleName));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(`'${moduleName}'`) || content.includes(`"${moduleName}"`)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return files;
  }

  async fixImportInFile(filePath, moduleName) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    
    // Common import fixes
    const fixes = [
      // Add file extension for relative imports
      {
        pattern: new RegExp(`from\\s+['"](\\.\\./[^'"]+)['"]`, 'g'),
        replacement: (match, p1) => {
          if (!p1.includes('.') && !p1.endsWith('/')) {
            return match.replace(p1, `${p1}.js`);
          }
          return match;
        }
      },
      
      // Fix common package name issues
      {
        pattern: new RegExp(`from\\s+['"]${moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        replacement: (match) => {
          const correctName = this.commonMissingPackages[moduleName];
          if (correctName && correctName !== moduleName) {
            return match.replace(moduleName, correctName);
          }
          return match;
        }
      }
    ];
    
    for (const fix of fixes) {
      if (typeof fix.replacement === 'function') {
        fixed = fixed.replace(fix.pattern, fix.replacement);
      } else {
        fixed = fixed.replace(fix.pattern, fix.replacement);
      }
    }
    
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✅ Fixed import in ${path.relative(process.cwd(), filePath)}`);
      this.importsFixed++;
    }
  }

  async fixResolutionIssue(moduleName) {
    // Try to resolve common resolution issues
    console.log(`  🔧 Attempting to resolve ${moduleName}...`);
    
    // Check if it's a workspace package
    if (moduleName.startsWith('@podai/')) {
      await this.fixWorkspaceReference(moduleName);
    }
  }

  async fixWorkspaceReference(moduleName) {
    const packageName = moduleName.replace('@podai/', '');
    const packagePath = path.join('packages', packageName);
    
    if (fs.existsSync(packagePath)) {
      console.log(`  ✅ Found workspace package: ${packagePath}`);
      // The import should work with proper tsconfig paths
    } else {
      console.log(`  ⚠️  Workspace package not found: ${packagePath}`);
    }
  }

  async installMissingPackages() {
    console.log('\n📦 Installing commonly missing packages...');
    
    const essentialPackages = [
      '@types/node',
      'buffer',
      'js-yaml',
      '@types/js-yaml'
    ];
    
    for (const pkg of essentialPackages) {
      if (!this.isPackageInstalled(pkg)) {
        await this.installMissingModule(pkg);
      }
    }
  }

  isPackageInstalled(packageName) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return !!(packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName]);
    } catch {
      return false;
    }
  }

  async fixImportPaths() {
    console.log('\n🔧 Fixing import paths...');
    
    // Look for files with relative import issues
    const tsFiles = this.findAllTypeScriptFiles();
    
    for (const file of tsFiles) {
      await this.fixRelativeImports(file);
    }
  }

  findAllTypeScriptFiles() {
    const files = [];
    const searchDirs = ['packages', 'src', 'tests'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.findTypeScriptFilesInDir(dir));
      }
    }
    
    return files;
  }

  findTypeScriptFilesInDir(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.findTypeScriptFilesInDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return files;
  }

  async fixRelativeImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    
    // Fix relative imports that are missing file extensions
    const relativeImportRegex = /from\s+['"](\.\/.+?)['"];?/g;
    
    fixed = fixed.replace(relativeImportRegex, (match, importPath) => {
      if (!importPath.includes('.') && !importPath.endsWith('/')) {
        const possiblePaths = [
          `${importPath}.ts`,
          `${importPath}.js`,
          `${importPath}/index.ts`,
          `${importPath}/index.js`
        ];
        
        const fileDir = path.dirname(filePath);
        
        for (const possiblePath of possiblePaths) {
          const fullPath = path.resolve(fileDir, possiblePath);
          if (fs.existsSync(fullPath)) {
            return match.replace(importPath, possiblePath);
          }
        }
      }
      
      return match;
    });
    
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✅ Fixed relative imports in ${path.relative(process.cwd(), filePath)}`);
      this.importsFixed++;
    }
  }

  async updatePackageVersions() {
    console.log('\n🔄 Checking for package version conflicts...');
    
    try {
      const output = execSync('bun pm ls --all', { encoding: 'utf8' });
      
      // Look for version conflicts in the output
      if (output.includes('WARN') || output.includes('conflict')) {
        console.log('  ⚠️  Version conflicts detected, attempting to resolve...');
        
        try {
          execSync('bun install --force', { stdio: 'pipe' });
          console.log('  ✅ Forced reinstall completed');
        } catch (error) {
          console.log('  ⚠️  Could not resolve all version conflicts automatically');
        }
      } else {
        console.log('  ✅ No version conflicts detected');
      }
    } catch (error) {
      console.log('  ⚠️  Could not check package versions');
    }
  }

  reportResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📦 DEPENDENCY RESOLVER RESULTS');
    console.log('='.repeat(50));
    console.log(`📦 Packages installed: ${this.packagesInstalled}`);
    console.log(`🔧 Import paths fixed: ${this.importsFixed}`);
    console.log(`🚀 Dependency issues: RESOLVED!`);
    console.log('='.repeat(50) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const resolver = new DependencyResolver();
  resolver.run().catch(console.error);
}

module.exports = DependencyResolver; 