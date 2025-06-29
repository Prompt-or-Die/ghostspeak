# podAI Core - Template Generation Script
# Version: 1.0.0

param(
    [string]$Type,
    [string]$Name,
    [string]$OutputPath = ".",
    [switch]$Force
)

# Template definitions
$Templates = @{
    "component" = @{
        Extension = ".tsx"
        Content = @'
import React from 'react';

interface {NAME}Props {
  // Define component props here
}

export const {NAME}: React.FC<{NAME}Props> = (props) => {
  return (
    <div className="{NAME_LOWER}">
      <h2>{NAME} Component</h2>
      {/* Add component implementation here */}
    </div>
  );
};

export default {NAME};
'@
    }
    
    "service" = @{
        Extension = ".ts"
        Content = @'
/**
 * {NAME} Service for podAI Core
 * Generated: {TIMESTAMP}
 */

export interface {NAME}Config {
  // Define configuration interface
}

export class {NAME}Service {
  private config: {NAME}Config;

  constructor(config: {NAME}Config) {
    this.config = config;
  }

  /**
   * Initialize the {NAME} service
   */
  async initialize(): Promise<void> {
    // Add initialization logic here
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Add cleanup logic here
  }
}

export default {NAME}Service;
'@
    }
    
    "test" = @{
        Extension = ".test.ts"
        Content = @'
/**
 * Tests for {NAME}
 * Generated: {TIMESTAMP}
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { {NAME} } from '../{NAME}';

describe('{NAME}', () => {
  let instance: {NAME};

  beforeEach(() => {
    // Setup test instance
    instance = new {NAME}();
  });

  test('should initialize correctly', () => {
    expect(instance).toBeDefined();
  });

  test('should handle basic operations', () => {
    // Add test implementation
    expect(true).toBe(true);
  });

  test('should handle error cases', () => {
    // Add error handling tests
    expect(() => {
      // Test error conditions
    }).not.toThrow();
  });

  test('should cleanup resources', async () => {
    // Test cleanup operations
    await instance.cleanup?.();
    expect(true).toBe(true);
  });
});
'@
    }
    
    "rust-module" = @{
        Extension = ".rs"
        Content = @'
//! {NAME} module for Pod Protocol Core
//! Generated: {TIMESTAMP}

use anchor_lang::prelude::*;

/// Configuration for {NAME}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct {NAME}Config {
    // Define configuration fields
}

/// {NAME} implementation
pub struct {NAME} {
    config: {NAME}Config,
}

impl {NAME} {
    /// Create a new {NAME} instance
    pub fn new(config: {NAME}Config) -> Self {
        Self { config }
    }

    /// Initialize the {NAME}
    pub fn initialize(&mut self) -> Result<()> {
        // Add initialization logic here
        Ok(())
    }

    /// Process operations
    pub fn process(&self) -> Result<()> {
        // Add processing logic here
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_{NAME_LOWER}_initialization() {
        let config = {NAME}Config {
            // Initialize test config
        };
        let mut instance = {NAME}::new(config);
        assert!(instance.initialize().is_ok());
    }

    #[test]
    fn test_{NAME_LOWER}_processing() {
        let config = {NAME}Config {
            // Initialize test config
        };
        let instance = {NAME}::new(config);
        assert!(instance.process().is_ok());
    }
}
'@
    }
    
    "smart-contract" = @{
        Extension = ".rs"
        Content = @'
//! {NAME} Smart Contract for Pod Protocol Core
//! Generated: {TIMESTAMP}

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod {NAME_LOWER} {
    use super::*;

    /// Initialize the {NAME} program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let {NAME_LOWER}_account = &mut ctx.accounts.{NAME_LOWER}_account;
        {NAME_LOWER}_account.authority = ctx.accounts.authority.key();
        {NAME_LOWER}_account.created_at = Clock::get()?.unix_timestamp;
        
        emit!({NAME}Initialized {
            authority: {NAME_LOWER}_account.authority,
            timestamp: {NAME_LOWER}_account.created_at,
        });

        Ok(())
    }

    /// Process {NAME} operations
    pub fn process(ctx: Context<Process>, data: Vec<u8>) -> Result<()> {
        let {NAME_LOWER}_account = &mut ctx.accounts.{NAME_LOWER}_account;
        
        // Validate input
        require!(data.len() <= 1024, {NAME}Error::DataTooLarge);
        
        // Process data
        {NAME_LOWER}_account.last_updated = Clock::get()?.unix_timestamp;
        
        emit!({NAME}Processed {
            authority: {NAME_LOWER}_account.authority,
            data_length: data.len(),
            timestamp: {NAME_LOWER}_account.last_updated,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + {NAME}Account::INIT_SPACE
    )]
    pub {NAME_LOWER}_account: Account<'info, {NAME}Account>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Process<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub {NAME_LOWER}_account: Account<'info, {NAME}Account>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct {NAME}Account {
    pub authority: Pubkey,
    pub created_at: i64,
    pub last_updated: i64,
}

#[event]
pub struct {NAME}Initialized {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct {NAME}Processed {
    pub authority: Pubkey,
    pub data_length: usize,
    pub timestamp: i64,
}

#[error_code]
pub enum {NAME}Error {
    #[msg("Data size exceeds maximum allowed")]
    DataTooLarge,
}
'@
    }
    
    "documentation" = @{
        Extension = ".md"
        Content = @'
# {NAME} Documentation

Generated: {TIMESTAMP}

## Overview

Brief description of {NAME} functionality and purpose.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
bun add {NAME_LOWER}
```

## Usage

### Basic Usage

```typescript
import { {NAME} } from '{NAME_LOWER}';

const instance = new {NAME}();
await instance.initialize();
```

### Advanced Usage

```typescript
// Add advanced usage examples here
```

## API Reference

### Constructor

```typescript
new {NAME}(config?: {NAME}Config)
```

### Methods

#### initialize()

Initializes the {NAME} instance.

**Returns:** `Promise<void>`

### Types

#### {NAME}Config

Configuration options for {NAME}.

```typescript
interface {NAME}Config {
  // Define configuration properties
}
```

## Examples

### Example 1: Basic Setup

```typescript
// Add example code here
```

## Error Handling

```typescript
try {
  await instance.process();
} catch (error) {
  console.error('Error:', error);
}
```

## Security Considerations

- Security consideration 1
- Security consideration 2

## Performance

- Performance note 1
- Performance note 2

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License.
'@
    }
}

function Show-Help {
    Write-Host "podAI Core - Template Generator" -ForegroundColor Magenta
    Write-Host "Usage: ./generate_template.ps1 -Type <type> -Name <name> [-OutputPath <path>] [-Force]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available Types:" -ForegroundColor Cyan
    foreach ($type in $Templates.Keys) {
        Write-Host "  - $type" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  ./generate_template.ps1 -Type component -Name UserProfile" -ForegroundColor Gray
    Write-Host "  ./generate_template.ps1 -Type service -Name MessageService -OutputPath ./src/services" -ForegroundColor Gray
    Write-Host "  ./generate_template.ps1 -Type test -Name UserService -Force" -ForegroundColor Gray
}

function GenerateTemplate {
    param(
        [string]$TemplateType,
        [string]$ComponentName,
        [string]$TargetPath
    )

    if (-not $Templates.ContainsKey($TemplateType)) {
        Write-Host "Error: Unknown template type '$TemplateType'" -ForegroundColor Red
        Show-Help
        exit 1
    }

    $template = $Templates[$TemplateType]
    $fileName = $ComponentName + $template.Extension
    $fullPath = Join-Path $TargetPath $fileName

    # Check if file exists
    if ((Test-Path $fullPath) -and -not $Force) {
        Write-Host "Error: File '$fullPath' already exists. Use -Force to overwrite." -ForegroundColor Red
        exit 1
    }

    # Create directory if it doesn't exist
    $directory = Split-Path $fullPath -Parent
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
        Write-Host "Created directory: $directory" -ForegroundColor Yellow
    }

    # Replace placeholders in template
    $content = $template.Content
    $content = $content -replace '{NAME}', $ComponentName
    $content = $content -replace '{NAME_LOWER}', $ComponentName.ToLower()
    $content = $content -replace '{NAME_UPPER}', $ComponentName.ToUpper()
    $content = $content -replace '{TIMESTAMP}', (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

    # Write file
    $content | Out-File -FilePath $fullPath -Encoding UTF8

    Write-Host "✅ Generated $TemplateType template: $fullPath" -ForegroundColor Green

    # Generate additional files based on type
    switch ($TemplateType) {
        "component" {
            $testName = $ComponentName + ".test"
            Generate-Template -TemplateType "test" -ComponentName $testName -TargetPath $TargetPath
        }
        "service" {
            $testName = $ComponentName + ".test"
            Generate-Template -TemplateType "test" -ComponentName $testName -TargetPath $TargetPath
        }
    }
}

# Main execution
if (-not $Type -or -not $Name) {
    Show-Help
    exit 1
}

# Validate inputs
if ($Name -notmatch '^[A-Za-z][A-Za-z0-9]*$') {
    Write-Host "Error: Name must start with a letter and contain only alphanumeric characters." -ForegroundColor Red
    exit 1
}

# Generate template
try {
    Generate-Template -TemplateType $Type -ComponentName $Name -TargetPath $OutputPath
    Write-Host "🎉 Template generation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error generating template: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 