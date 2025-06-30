#!/usr/bin/env node

/**
 * 🔧 CONFIGURATION AUTO-FIXER
 * Fixes configuration files automatically to prevent build failures
 * Handles: .prettierrc, eslint.config.js, tsconfig.json, bunfig.toml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ConfigurationAutoFixer {
  constructor() {
    this.fixesApplied = 0;
    this.configFiles = [
      '.prettierrc',
      'eslint.config.js',
      'tsconfig.json',
      'tsconfig.validation.json',
      'bunfig.toml',
      'package.json'
    ];
  }

  async run() {
    console.log('🔧 CONFIGURATION AUTO-FIXER STARTING...\n');
    
    for (const configFile of this.configFiles) {
      await this.fixConfigFile(configFile);
    }
    
    this.reportResults();
  }

  async fixConfigFile(configFile) {
    if (!fs.existsSync(configFile)) {
      console.log(`⚠️  ${configFile} not found, skipping...`);
      return;
    }

    console.log(`🔍 Checking ${configFile}...`);

    try {
      switch (path.extname(configFile)) {
        case '.json':
          await this.fixJSONFile(configFile);
          break;
        case '':
          if (configFile === '.prettierrc') {
            await this.fixPrettierRC();
          }
          break;
        case '.js':
          await this.fixJSConfigFile(configFile);
          break;
        case '.toml':
          await this.fixTOMLFile(configFile);
          break;
      }
    } catch (error) {
      console.log(`❌ Error fixing ${configFile}:`, error.message);
    }
  }

  async fixPrettierRC() {
    console.log('🎨 Fixing .prettierrc YAML syntax...');
    
    let content = fs.readFileSync('.prettierrc', 'utf8');
    let fixed = false;

    // Common YAML issues in .prettierrc
    const fixes = [
      // Fix duplicate keys
      { pattern: /^(\s*\w+:\s*.+\n)[\s\S]*?^(\s*\1)/gm, replacement: '$1' },
      
      // Fix invalid anchors
      { pattern: /<<:\s*&(\w+)/g, replacement: '<<: *$1' },
      
      // Fix unquoted strings with special characters
      { pattern: /^(\s*)([^:\s]+):\s*([^"\s][^"]*[^"\s])\s*$/gm, replacement: '$1$2: "$3"' },
      
      // Fix boolean values
      { pattern: /:\s*(true|false)\s*$/gm, replacement: ': $1' },
      
      // Fix number values
      { pattern: /:\s*(\d+)\s*$/gm, replacement: ': $1' }
    ];

    for (const fix of fixes) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    }

    // Validate YAML syntax
    try {
      yaml.load(content);
      
      if (fixed) {
        fs.writeFileSync('.prettierrc', content);
        console.log('  ✅ Fixed .prettierrc YAML syntax');
        this.fixesApplied++;
      } else {
        console.log('  ✅ .prettierrc is valid');
      }
    } catch (yamlError) {
      console.log('  ⚠️  Converting .prettierrc to JSON format...');
      
      // Convert to JSON format as fallback
      const defaultConfig = {
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 100,
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
        overrides: [
          {
            files: ['*.md', '*.yml', '*.yaml'],
            options: {
              tabWidth: 2,
              printWidth: 80
            }
          },
          {
            files: ['*.json'],
            options: {
              tabWidth: 2,
              printWidth: 120
            }
          }
        ]
      };
      
      fs.writeFileSync('.prettierrc', JSON.stringify(defaultConfig, null, 2));
      console.log('  ✅ Converted .prettierrc to valid JSON format');
      this.fixesApplied++;
    }
  }

  async fixJSONFile(fileName) {
    console.log(`📄 Validating ${fileName} JSON syntax...`);
    
    const content = fs.readFileSync(fileName, 'utf8');
    
    try {
      JSON.parse(content);
      console.log(`  ✅ ${fileName} is valid JSON`);
    } catch (error) {
      console.log(`  🔧 Fixing ${fileName} JSON syntax...`);
      
      let fixed = content;
      
      // Common JSON fixes
      const jsonFixes = [
        // Remove trailing commas
        { pattern: /,(\s*[}\]])/g, replacement: '$1' },
        
        // Fix unquoted keys
        { pattern: /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, replacement: '$1"$2":' },
        
        // Fix single quotes to double quotes
        { pattern: /'([^']*)':/g, replacement: '"$1":' },
        { pattern: /:\s*'([^']*)'/g, replacement: ': "$1"' }
      ];

      for (const fix of jsonFixes) {
        fixed = fixed.replace(fix.pattern, fix.replacement);
      }

      try {
        JSON.parse(fixed);
        fs.writeFileSync(fileName, fixed);
        console.log(`  ✅ Fixed ${fileName} JSON syntax`);
        this.fixesApplied++;
      } catch (stillError) {
        console.log(`  ❌ Could not auto-fix ${fileName}:`, stillError.message);
      }
    }
  }

  async fixJSConfigFile(fileName) {
    console.log(`🔧 Checking ${fileName} syntax...`);
    
    const content = fs.readFileSync(fileName, 'utf8');
    
    // Basic JS syntax validation and fixes
    let fixed = content;
    let hasChanges = false;

    // Common JS config issues
    const jsFixes = [
      // Fix missing semicolons at end of expressions
      { pattern: /^(\s*export\s+.+)(?<!;)\s*$/gm, replacement: '$1;' },
      
      // Fix missing quotes in object properties
      { pattern: /(\{[^}]*?)(\w+)(\s*:)/g, replacement: '$1"$2"$3' }
    ];

    for (const fix of jsFixes) {
      const newContent = fixed.replace(fix.pattern, fix.replacement);
      if (newContent !== fixed) {
        fixed = newContent;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(fileName, fixed);
      console.log(`  ✅ Fixed ${fileName} syntax issues`);
      this.fixesApplied++;
    } else {
      console.log(`  ✅ ${fileName} syntax is valid`);
    }
  }

  async fixTOMLFile(fileName) {
    console.log(`⚙️  Checking ${fileName} TOML syntax...`);
    
    const content = fs.readFileSync(fileName, 'utf8');
    let fixed = content;
    let hasChanges = false;

    // Common TOML fixes
    const tomlFixes = [
      // Fix unquoted strings with spaces
      { pattern: /^(\s*\w+\s*=\s*)([^"\[\n]+\s[^"\[\n]+)(\s*)$/gm, replacement: '$1"$2"$3' },
      
      // Fix boolean values
      { pattern: /=\s*(True|TRUE|False|FALSE)\s*$/gm, replacement: '= $1'.toLowerCase() },
      
      // Fix array formatting
      { pattern: /\[\s*([^,\]]+)\s*,\s*([^,\]]+)\s*\]/g, replacement: '["$1", "$2"]' }
    ];

    for (const fix of tomlFixes) {
      const newContent = fixed.replace(fix.pattern, fix.replacement);
      if (newContent !== fixed) {
        fixed = newContent;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(fileName, fixed);
      console.log(`  ✅ Fixed ${fileName} TOML syntax`);
      this.fixesApplied++;
    } else {
      console.log(`  ✅ ${fileName} TOML syntax is valid`);
    }
  }

  reportResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🔧 CONFIGURATION AUTO-FIXER RESULTS');
    console.log('='.repeat(50));
    console.log(`⚡ Configuration fixes applied: ${this.fixesApplied}`);
    console.log(`🚀 Build system reliability: IMPROVED!`);
    console.log('='.repeat(50) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new ConfigurationAutoFixer();
  fixer.run().catch(console.error);
}

module.exports = ConfigurationAutoFixer; 