# 🪟 WINDOWS DEVELOPMENT ENVIRONMENT AUTO-SETUP
# Automatically configures Windows for Rust/Node.js/Solana development
# Handles: MSVC tools, Windows SDK, Rust toolchain, Node.js, Git

param(
    [switch]$QuickSetup,
    [switch]$FullSetup,
    [switch]$ValidateOnly
)

Write-Host "🪟 WINDOWS DEVELOPMENT ENVIRONMENT SETUP" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Function definitions
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Chocolatey {
    Write-Host "📦 Installing Chocolatey package manager..." -ForegroundColor Yellow
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "  ✅ Chocolatey already installed" -ForegroundColor Green
        return
    }
    
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        Write-Host "  ✅ Chocolatey installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install Chocolatey: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Install-VSBuildTools {
    Write-Host "🔧 Installing Visual Studio Build Tools..." -ForegroundColor Yellow
    
    # Check if VS Build Tools are already installed
    $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vsWhere) {
        $installations = & $vsWhere -products Microsoft.VisualStudio.Product.BuildTools -format json | ConvertFrom-Json
        if ($installations) {
            Write-Host "  ✅ Visual Studio Build Tools already installed" -ForegroundColor Green
            return
        }
    }
    
    try {
        # Download and install VS Build Tools
        $url = "https://aka.ms/vs/17/release/vs_buildtools.exe"
        $installer = "$env:TEMP\vs_buildtools.exe"
        
        Write-Host "  📥 Downloading VS Build Tools installer..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $installer
        
        Write-Host "  🔧 Installing VS Build Tools with C++ workload..." -ForegroundColor Cyan
        $arguments = @(
            "--quiet"
            "--wait"
            "--add", "Microsoft.VisualStudio.Workload.VCTools"
            "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64"
            "--add", "Microsoft.VisualStudio.Component.Windows10SDK.19041"
        )
        
        Start-Process -FilePath $installer -ArgumentList $arguments -Wait -NoNewWindow
        
        # Cleanup
        Remove-Item $installer -Force
        
        Write-Host "  ✅ Visual Studio Build Tools installed" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install VS Build Tools: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Install-Rust {
    Write-Host "🦀 Installing Rust toolchain..." -ForegroundColor Yellow
    
    if (Get-Command rustc -ErrorAction SilentlyContinue) {
        Write-Host "  ✅ Rust already installed" -ForegroundColor Green
        return
    }
    
    try {
        # Download and install Rustup
        $url = "https://win.rustup.rs/x86_64"
        $installer = "$env:TEMP\rustup-init.exe"
        
        Write-Host "  📥 Downloading Rust installer..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $installer
        
        Write-Host "  🔧 Installing Rust..." -ForegroundColor Cyan
        Start-Process -FilePath $installer -ArgumentList "-y" -Wait -NoNewWindow
        
        # Add Rust to PATH for current session
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        
        # Cleanup
        Remove-Item $installer -Force
        
        Write-Host "  ✅ Rust installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install Rust: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Install-NodeJS {
    Write-Host "📗 Installing Node.js..." -ForegroundColor Yellow
    
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version
        Write-Host "  ✅ Node.js already installed: $nodeVersion" -ForegroundColor Green
        return
    }
    
    try {
        choco install nodejs -y
        Write-Host "  ✅ Node.js installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install Node.js: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Install-Bun {
    Write-Host "🥟 Installing Bun..." -ForegroundColor Yellow
    
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        $bunVersion = bun --version
        Write-Host "  ✅ Bun already installed: $bunVersion" -ForegroundColor Green
        return
    }
    
    try {
        # Use PowerShell to install Bun
        irm bun.sh/install.ps1 | iex
        Write-Host "  ✅ Bun installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install Bun: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  💡 You can install manually from: https://bun.sh" -ForegroundColor Cyan
    }
}

function Install-Git {
    Write-Host "🔄 Installing Git..." -ForegroundColor Yellow
    
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitVersion = git --version
        Write-Host "  ✅ Git already installed: $gitVersion" -ForegroundColor Green
        return
    }
    
    try {
        choco install git -y
        Write-Host "  ✅ Git installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to install Git: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Install-SolanaTools {
    Write-Host "⛓️  Installing Solana development tools..." -ForegroundColor Yellow
    
    if (Get-Command solana -ErrorAction SilentlyContinue) {
        $solanaVersion = solana --version
        Write-Host "  ✅ Solana CLI already installed: $solanaVersion" -ForegroundColor Green
    } else {
        try {
            # Install Solana CLI
            Write-Host "  📥 Installing Solana CLI..." -ForegroundColor Cyan
            cmd /c "sh -c `"$(curl -sSfL https://release.solana.com/v1.17.0/install)`""
            
            # Add to PATH
            $env:PATH += ";$env:USERPROFILE\.local\share\solana\install\active_release\bin"
            
            Write-Host "  ✅ Solana CLI installed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Solana CLI installation failed, but continuing..." -ForegroundColor Yellow
        }
    }
    
    # Install Anchor
    if (Get-Command anchor -ErrorAction SilentlyContinue) {
        Write-Host "  ✅ Anchor already installed" -ForegroundColor Green
    } else {
        try {
            Write-Host "  📥 Installing Anchor..." -ForegroundColor Cyan
            cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
            avm install latest
            avm use latest
            
            Write-Host "  ✅ Anchor installed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Anchor installation failed, but continuing..." -ForegroundColor Yellow
        }
    }
}

function Set-EnvironmentVariables {
    Write-Host "🌍 Setting up environment variables..." -ForegroundColor Yellow
    
    $envVars = @{
        "RUST_BACKTRACE" = "1"
        "CARGO_NET_GIT_FETCH_WITH_CLI" = "true"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable($var.Key, $var.Value, "User")
        Write-Host "  ✅ Set $($var.Key) = $($var.Value)" -ForegroundColor Green
    }
}

function Test-DevelopmentEnvironment {
    Write-Host "🔍 Validating development environment..." -ForegroundColor Yellow
    
    $tools = @(
        @{ Name = "Node.js"; Command = "node --version" },
        @{ Name = "Bun"; Command = "bun --version" },
        @{ Name = "Rust"; Command = "rustc --version" },
        @{ Name = "Cargo"; Command = "cargo --version" },
        @{ Name = "Git"; Command = "git --version" }
    )
    
    $successCount = 0
    
    foreach ($tool in $tools) {
        try {
            $version = Invoke-Expression $tool.Command 2>$null
            Write-Host "  ✅ $($tool.Name): $version" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ❌ $($tool.Name): Not found" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📊 Environment Status: $successCount/$($tools.Count) tools available" -ForegroundColor Cyan
    
    return $successCount -eq $tools.Count
}

function Test-BuildCapability {
    Write-Host "🔧 Testing build capability..." -ForegroundColor Yellow
    
    # Test Rust compilation
    try {
        $testDir = "$env:TEMP\rust-test"
        New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        
        $testCode = @"
fn main() {
    println!("Hello, Windows!");
}
"@
        
        Set-Content -Path "$testDir\main.rs" -Value $testCode
        
        Push-Location $testDir
        rustc main.rs 2>$null
        if (Test-Path "main.exe") {
            Write-Host "  ✅ Rust compilation: Working" -ForegroundColor Green
            $rustWorks = $true
        } else {
            Write-Host "  ❌ Rust compilation: Failed" -ForegroundColor Red
            $rustWorks = $false
        }
        Pop-Location
        
        Remove-Item $testDir -Recurse -Force
    } catch {
        Write-Host "  ❌ Rust compilation test failed" -ForegroundColor Red
        $rustWorks = $false
    }
    
    return $rustWorks
}

# Main execution logic
try {
    # Check administrator privileges
    if (-not (Test-Administrator)) {
        Write-Host "⚠️  This script requires administrator privileges for some installations." -ForegroundColor Yellow
        Write-Host "   Consider running as administrator for full functionality." -ForegroundColor Yellow
        Write-Host ""
    }
    
    if ($ValidateOnly) {
        $isValid = Test-DevelopmentEnvironment
        $canBuild = Test-BuildCapability
        
        if ($isValid -and $canBuild) {
            Write-Host "`n🎯 RESULT: Development environment is READY!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "`n⚠️  RESULT: Development environment needs setup" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Install components based on setup type
    if ($QuickSetup) {
        Write-Host "⚡ Running QUICK SETUP..." -ForegroundColor Cyan
        Install-Chocolatey
        Install-NodeJS
        Install-Bun
    } elseif ($FullSetup) {
        Write-Host "🔧 Running FULL SETUP..." -ForegroundColor Cyan
        Install-Chocolatey
        Install-VSBuildTools
        Install-Rust
        Install-NodeJS
        Install-Bun
        Install-Git
        Install-SolanaTools
        Set-EnvironmentVariables
    } else {
        Write-Host "🔍 Analyzing current environment..." -ForegroundColor Cyan
        
        $needsSetup = -not (Test-DevelopmentEnvironment)
        
        if ($needsSetup) {
            Write-Host "`nSetup required. Choose an option:" -ForegroundColor Yellow
            Write-Host "1. Quick Setup (Node.js, Bun only)"
            Write-Host "2. Full Setup (All development tools)"
            Write-Host "3. Exit"
            
            $choice = Read-Host "`nEnter choice (1-3)"
            
            switch ($choice) {
                "1" { 
                    Install-Chocolatey
                    Install-NodeJS
                    Install-Bun
                }
                "2" { 
                    Install-Chocolatey
                    Install-VSBuildTools
                    Install-Rust
                    Install-NodeJS
                    Install-Bun
                    Install-Git
                    Install-SolanaTools
                    Set-EnvironmentVariables
                }
                default { 
                    Write-Host "Exiting..." -ForegroundColor Yellow
                    exit 0
                }
            }
        }
    }
    
    # Final validation
    Write-Host "`n🎯 FINAL VALIDATION" -ForegroundColor Cyan
    $isReady = Test-DevelopmentEnvironment
    $canBuild = Test-BuildCapability
    
    if ($isReady -and $canBuild) {
        Write-Host "`n🚀 SUCCESS: Windows development environment is READY!" -ForegroundColor Green
        Write-Host "=" * 60 -ForegroundColor Green
        Write-Host "💡 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Restart your terminal/VS Code"
        Write-Host "   2. Run: bun install"
        Write-Host "   3. Run: bun run build"
        Write-Host "   4. Start developing at light speed! 🚀"
        Write-Host "=" * 60 -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Some issues remain. Manual intervention may be required." -ForegroundColor Yellow
        Write-Host "Check the output above for specific failures." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running with administrator privileges or install tools manually." -ForegroundColor Yellow
    exit 1
} 