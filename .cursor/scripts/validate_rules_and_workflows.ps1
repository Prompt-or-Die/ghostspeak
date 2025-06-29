# podAI Core - Rules & Workflows Validation Script
# Version: 1.0.0

param(
    [switch]$Detailed,
    [switch]$Fix,
    [string]$OutputPath = "validation_report.json"
)

# Required files structure
$RequiredStructure = @{
    Rules = @(
        "coding_standards.md",
        "architecture_patterns.md", 
        "security_protocols.md",
        "testing_standards.md",
        "documentation_guidelines.md",
        "performance_guidelines.md",
        "api_standards.md",
        "compliance_checklist.md"
    )
    Workflows = @(
        "project_initialization.md",
        "feature_development.md",
        "deployment_process.md",
        "status_check.md",
        "duplication_prevention.md",
        "incident_response.md",
        "release_management.md",
        "refactoring.md",
        "dependency_review.md",
        "master_setup.md"
    )
    Memory = @(
        "activeContext.md",
        "productContext.md",
        "progress.md",
        "decisionLog.md",
        "systemPatterns.md",
        "retrospective.md",
        "userFeedback.md"
    )
    Scripts = @(
        "validate_rules_and_workflows.ps1",
        "generate_template.ps1"
    )
    CorePackages = @(
        "core",
        "sdk-rust",
        "sdk-typescript"
    )
    ConfigFiles = @(
        "package.json",
        "Cargo.toml",
        "bunfig.toml",
        "README.md",
        "LICENSE"
    )
}

# Validation results
$ValidationResults = @{
    Rules = @()
    Workflows = @()
    Memory = @()
    Scripts = @()
    Packages = @()
    Config = @()
    Summary = @{
        TotalFiles = 0
        ValidFiles = 0
        MissingFiles = @()
        InvalidFiles = @()
        Warnings = @()
    }
}

function Test-FileExists {
    param(
        [string]$Path,
        [string]$Category,
        [string]$FileName
    )
    
    $fullPath = Join-Path $PWD $Path
    $exists = Test-Path $fullPath
    
    $result = @{
        Category = $Category
        FileName = $FileName
        Path = $Path
        Exists = $exists
        Size = if ($exists) { (Get-Item $fullPath).Length } else { 0 }
        LastModified = if ($exists) { (Get-Item $fullPath).LastWriteTime } else { $null }
    }
    
    if ($exists -and $Detailed) {
        $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
        $result.LineCount = ($content -split "`n").Count
        $result.WordCount = ($content -split '\s+').Count
        
        # Basic content validation
        if ($Category -eq "Rules" -and $content.Length -lt 100) {
            $result.Warning = "File appears to be too short for a rule file"
        }
        if ($Category -eq "Workflows" -and $content.Length -lt 200) {
            $result.Warning = "File appears to be too short for a workflow file"
        }
    }
    
    return $result
}

function ValidateCategory {
    param(
        [string]$CategoryName,
        [array]$RequiredFiles,
        [string]$BasePath
    )
    
    Write-Host "Validating $CategoryName..." -ForegroundColor Cyan
    
    $categoryResults = @()
    $validCount = 0
    
    foreach ($file in $RequiredFiles) {
        $path = Join-Path $BasePath $file
        $result = Test-FileExists -Path $path -Category $CategoryName -FileName $file
        
        if ($result.Exists) {
            Write-Host "  ✓ $file" -ForegroundColor Green
            $validCount++
        } else {
            Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
            $ValidationResults.Summary.MissingFiles += "$CategoryName/$file"
        }
        
        if ($result.Warning) {
            Write-Host "    ⚠ $($result.Warning)" -ForegroundColor Yellow
            $ValidationResults.Summary.Warnings += "$CategoryName/$file : $($result.Warning)"
        }
        
        $categoryResults += $result
    }
    
    $color = if ($validCount -eq $RequiredFiles.Count) { "Green" } else { "Yellow" }
    Write-Host "  $validCount/$($RequiredFiles.Count) files found" -ForegroundColor $color
    
    return $categoryResults
}

function ValidatePackageStructure {
    Write-Host "Validating Package Structure..." -ForegroundColor Cyan
    
    $packagesPath = "packages"
    $packageResults = @()
    
    if (!(Test-Path $packagesPath)) {
        Write-Host "  ✗ packages/ directory missing" -ForegroundColor Red
        return $packageResults
    }
    
    $existingPackages = Get-ChildItem $packagesPath -Directory | Select-Object -ExpandProperty Name
    
    foreach ($requiredPackage in $RequiredStructure.CorePackages) {
        $exists = $existingPackages -contains $requiredPackage
        
        if ($exists) {
            Write-Host "  ✓ packages/$requiredPackage/" -ForegroundColor Green
            
            # Validate package.json or Cargo.toml exists
            $packageConfigExists = (Test-Path "packages/$requiredPackage/package.json") -or (Test-Path "packages/$requiredPackage/Cargo.toml")
            if ($packageConfigExists) {
                Write-Host "    ✓ Configuration file found" -ForegroundColor Green
            } else {
                Write-Host "    ⚠ No package.json or Cargo.toml found" -ForegroundColor Yellow
                $ValidationResults.Summary.Warnings += "packages/$requiredPackage : Missing configuration file"
            }
        } else {
            Write-Host "  ✗ packages/$requiredPackage/ (MISSING)" -ForegroundColor Red
            $ValidationResults.Summary.MissingFiles += "packages/$requiredPackage"
        }
        
        $packageResults += @{
            Package = $requiredPackage
            Exists = $exists
            HasConfig = if ($exists) { $packageConfigExists } else { $false }
        }
    }
    
    # Check for non-core packages that should be removed
    $nonCorePackages = $existingPackages | Where-Object { $_ -notin $RequiredStructure.CorePackages }
    if ($nonCorePackages.Count -gt 0) {
        Write-Host "  ⚠ Non-core packages detected (consider removing for focused core environment):" -ForegroundColor Yellow
        foreach ($package in $nonCorePackages) {
            Write-Host "    - packages/$package/" -ForegroundColor Yellow
            $ValidationResults.Summary.Warnings += "Non-core package detected : packages/$package"
        }
    }
    
    return $packageResults
}

function GenerateReport {
    $report = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        ValidationResults = $ValidationResults
        Summary = @{
            TotalCategories = 6
            ValidCategories = 0
            OverallStatus = "Unknown"
            CompliancePercentage = 0
        }
    }
    
    # Calculate compliance percentage
    $totalRequiredFiles = ($RequiredStructure.Rules.Count + 
                          $RequiredStructure.Workflows.Count + 
                          $RequiredStructure.Memory.Count + 
                          $RequiredStructure.Scripts.Count + 
                          $RequiredStructure.CorePackages.Count + 
                          $RequiredStructure.ConfigFiles.Count)
    
    $foundFiles = $totalRequiredFiles - $ValidationResults.Summary.MissingFiles.Count
    $report.Summary.CompliancePercentage = [math]::Round(($foundFiles / $totalRequiredFiles) * 100, 2)
    
    # Determine overall status
    if ($ValidationResults.Summary.MissingFiles.Count -eq 0) {
        $report.Summary.OverallStatus = "COMPLIANT"
        $report.Summary.ValidCategories = 6
    } elseif ($ValidationResults.Summary.MissingFiles.Count -le 3) {
        $report.Summary.OverallStatus = "MOSTLY_COMPLIANT"
    } else {
        $report.Summary.OverallStatus = "NON_COMPLIANT"
    }
    
    return $report
}

# Main execution
Write-Host "🔍 podAI Core - Rules & Workflows Validation" -ForegroundColor Magenta
Write-Host ("=" * 60) -ForegroundColor Magenta

# Validate each category
$ValidationResults.Rules = Validate-Category -CategoryName "Rules" -RequiredFiles $RequiredStructure.Rules -BasePath ".cursor/rules"
$ValidationResults.Workflows = Validate-Category -CategoryName "Workflows" -RequiredFiles $RequiredStructure.Workflows -BasePath ".cursor/workflows"
$ValidationResults.Memory = Validate-Category -CategoryName "Memory" -RequiredFiles $RequiredStructure.Memory -BasePath ".cursor/memory"
$ValidationResults.Scripts = Validate-Category -CategoryName "Scripts" -RequiredFiles $RequiredStructure.Scripts -BasePath ".cursor/scripts"
$ValidationResults.Packages = Validate-PackageStructure
$ValidationResults.Config = Validate-Category -CategoryName "Config" -RequiredFiles $RequiredStructure.ConfigFiles -BasePath "."

# Generate and display summary
$report = Generate-Report

Write-Host "`n📊 VALIDATION SUMMARY" -ForegroundColor Magenta
Write-Host ("=" * 30) -ForegroundColor Magenta

$statusColor = switch ($report.Summary.OverallStatus) {
    "COMPLIANT" { "Green" }
    "MOSTLY_COMPLIANT" { "Yellow" }
    default { "Red" }
}
Write-Host "Overall Status: $($report.Summary.OverallStatus)" -ForegroundColor $statusColor

$complianceColor = if ($report.Summary.CompliancePercentage -ge 95) { "Green" } 
                   elseif ($report.Summary.CompliancePercentage -ge 80) { "Yellow" } 
                   else { "Red" }
Write-Host "Compliance: $($report.Summary.CompliancePercentage)%" -ForegroundColor $complianceColor

if ($ValidationResults.Summary.MissingFiles.Count -gt 0) {
    Write-Host "`n❌ Missing Files ($($ValidationResults.Summary.MissingFiles.Count)):" -ForegroundColor Red
    foreach ($missing in $ValidationResults.Summary.MissingFiles) {
        Write-Host "  - $missing" -ForegroundColor Red
    }
}

if ($ValidationResults.Summary.Warnings.Count -gt 0) {
    Write-Host "`n⚠️  Warnings ($($ValidationResults.Summary.Warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $ValidationResults.Summary.Warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
}

# Save report
$report | ConvertTo-Json -Depth 10 | Out-File $OutputPath -Encoding UTF8
Write-Host "`n📄 Report saved to: $OutputPath" -ForegroundColor Cyan

# Exit with appropriate code
switch ($report.Summary.OverallStatus) {
    "COMPLIANT" {
        Write-Host "`n✅ All validations passed!" -ForegroundColor Green
        exit 0
    }
    "MOSTLY_COMPLIANT" {
        Write-Host "`n⚠️  Minor issues detected. Review warnings." -ForegroundColor Yellow
        exit 1
    }
    default {
        Write-Host "`n❌ Critical issues detected. Address missing files." -ForegroundColor Red
        exit 2
    }
} 