# Update FRMS COE Lib Dependencies Script (PowerShell)
# This script updates the @tazama-lf/frms-coe-lib dependency in specified repositories

param(
    [Parameter(Mandatory=$true, Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$Repositories,
    
    [Alias("b")]
    [string]$Branch = "dev",
    
    [Alias("p")]
    [switch]$NoPR,
    
    [Alias("d")]
    [switch]$DryRun,
    
    [Alias("v")]
    [string]$Version,
    
    [Alias("f")]
    [switch]$Force,
    
    [string]$Token = $env:GH_TOKEN,
    
    [Alias("h")]
    [switch]$Help
)

function Show-Help {
    @"
Update FRMS COE Lib Dependencies Script (PowerShell)

USAGE:
    .\update-dependencies.ps1 [OPTIONS] REPOSITORY...

DESCRIPTION:
    Updates the @tazama-lf/frms-coe-lib dependency version in specified repositories
    to match the current version in this repository's package.json.

OPTIONS:
    -Branch, -b BRANCH      Target branch to update (default: dev)
    -NoPR, -p              Don't create pull requests (default: create PR)
    -DryRun, -d            Show what would be done without making changes
    -Version, -v VERSION   Use specific version instead of current package.json version
    -Force, -f             Force update even if version appears to be the same
    -Token TOKEN           GitHub token (can also use GH_TOKEN env var)
    -Help, -h              Show this help message

ARGUMENTS:
    REPOSITORY             One or more repositories in format 'owner/repo'

EXAMPLES:
    # Update single repository
    .\update-dependencies.ps1 tazama-lf/tms-service

    # Update multiple Tazama repositories
    .\update-dependencies.ps1 tazama-lf/tms-service tazama-lf/event-director tazama-lf/typology-processor

    # Update with specific branch
    .\update-dependencies.ps1 -Branch main tazama-lf/tms-service

    # Dry run to see what would be updated
    .\update-dependencies.ps1 -DryRun tazama-lf/transaction-monitoring-service

    # Use specific version
    .\update-dependencies.ps1 -Version 6.0.0 tazama-lf/transaction-monitoring-service

REQUIREMENTS:
    - git
    - gh (GitHub CLI)
    - node/npm
    - Valid GitHub token with repo access
"@
}

function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show help if requested
if ($Help) {
    Show-Help
    exit 0
}

# Validate requirements
$commands = @('git', 'gh', 'node')
foreach ($cmd in $commands) {
    if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-LogError "$cmd is required but not found in PATH"
        exit 1
    }
}

if ($Repositories.Count -eq 0) {
    Write-LogError "At least one repository must be specified"
    Show-Help
    exit 1
}

# Check GitHub authentication
if (-not $Token) {
    try {
        & gh auth status *>$null
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub CLI not authenticated"
        }
    }
    catch {
        Write-LogError "GitHub authentication required. Please run 'gh auth login' or set GH_TOKEN"
        exit 1
    }
}
else {
    $env:GH_TOKEN = $Token
}

# Get package information
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$PackageJsonPath = Join-Path $ProjectRoot "package.json"

if (!(Test-Path $PackageJsonPath)) {
    Write-LogError "package.json not found at $PackageJsonPath"
    exit 1
}

if ($Version) {
    $CurrentVersion = $Version
    Write-LogInfo "Using custom version: $CurrentVersion"
}
else {
    $CurrentVersion = & node -p "require('$PackageJsonPath').version"
    Write-LogInfo "Current package version: $CurrentVersion"
}

$PackageName = & node -p "require('$PackageJsonPath').name"
Write-LogInfo "Package name: $PackageName"

# Configuration
$CreatePR = -not $NoPR
$TargetBranch = $Branch

# Counters
$SuccessCount = 0
$SkipCount = 0
$ErrorCount = 0

Write-LogInfo "Starting dependency update process..."
Write-LogInfo "Target branch: $TargetBranch"
Write-LogInfo "Create PR: $CreatePR"
Write-LogInfo "Dry run: $DryRun"

# Process each repository
foreach ($repo in $Repositories) {
    Write-LogInfo "Processing repository: $repo"
    
    # Create temporary directory
    $TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
    Push-Location $TempDir
    
    try {
        # Clone repository
        Write-LogInfo "Cloning $repo..."
        & git clone "https://github.com/$repo.git" repo-clone *>$null
        if ($LASTEXITCODE -ne 0) {
            Write-LogError "Failed to clone $repo"
            $ErrorCount++
            continue
        }
        
        Set-Location repo-clone
        
        # Configure git
        & git config user.name "frms-coe-lib-updater"
        & git config user.email "noreply@tazama.org"
        
        # Checkout target branch
        & git checkout $TargetBranch *>$null
        if ($LASTEXITCODE -ne 0) {
            Write-LogError "Failed to checkout branch $TargetBranch in $repo"
            $ErrorCount++
            continue
        }
        
        # Check if package.json exists
        if (!(Test-Path "package.json")) {
            Write-LogWarning "No package.json found in $repo"
            $SkipCount++
            continue
        }
        
        # Check dependency type and current version
        $DepType = $null
        $CurrentTargetVersion = $null
        
        # Check dependencies
        try {
            $deps = & node -p "JSON.stringify(require('./package.json').dependencies || {})"
            $depsObj = $deps | ConvertFrom-Json
            if ($depsObj.PSObject.Properties.Name -contains $PackageName) {
                $DepType = "dependencies"
                $CurrentTargetVersion = $depsObj.$PackageName
            }
        }
        catch {}
        
        # Check devDependencies if not found in dependencies
        if (-not $DepType) {
            try {
                $devDeps = & node -p "JSON.stringify(require('./package.json').devDependencies || {})"
                $devDepsObj = $devDeps | ConvertFrom-Json
                if ($devDepsObj.PSObject.Properties.Name -contains $PackageName) {
                    $DepType = "devDependencies"
                    $CurrentTargetVersion = $devDepsObj.$PackageName
                }
            }
            catch {}
        }
        
        if (-not $DepType) {
            Write-LogWarning "Package $PackageName not found in $repo dependencies"
            $SkipCount++
            continue
        }
        
        Write-LogInfo "Found $PackageName in $DepType : $CurrentTargetVersion"
        
        $NewVersion = "^$CurrentVersion"
        
        # Check if update is needed
        if (($CurrentTargetVersion -eq $NewVersion) -or ($CurrentTargetVersion -eq $CurrentVersion)) {
            if (-not $Force) {
                Write-LogInfo "Version already up to date in $repo"
                $SkipCount++
                continue
            }
            else {
                Write-LogInfo "Forcing update even though version appears current"
            }
        }
        
        if ($DryRun) {
            Write-LogInfo "[DRY RUN] Would update $repo : $CurrentTargetVersion -> $NewVersion"
            $SuccessCount++
            continue
        }
        
        # Create update branch
        $BranchName = "update-frms-coe-lib-v$CurrentVersion"
        & git checkout -b $BranchName *>$null
        
        # Update package.json using Node.js
        $UpdateScript = @"
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const depType = '$DepType';
const packageName = '$PackageName';
const newVersion = '$NewVersion';

if (pkg[depType] && pkg[depType][packageName]) {
    pkg[depType][packageName] = newVersion;
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"@
        
        $UpdateScript | & node
        
        # Check if changes were made
        & git diff --quiet package.json
        if ($LASTEXITCODE -eq 0) {
            Write-LogWarning "No changes made to package.json in $repo"
            $SkipCount++
            continue
        }
        
        # Commit and push changes
        & git add package.json
        & git commit -m "chore: update $PackageName to v$CurrentVersion"
        
        & git push origin $BranchName *>$null
        if ($LASTEXITCODE -ne 0) {
            Write-LogError "Failed to push changes to $repo"
            $ErrorCount++
            continue
        }
        
        # Create pull request
        if ($CreatePR) {
            $PRTitle = "chore: update $PackageName to v$CurrentVersion"
            $PRBody = @"
This PR updates the ``$PackageName`` dependency to version ``$CurrentVersion``.

## Changes
- Updated ``$PackageName`` from ``$CurrentTargetVersion`` to ``$NewVersion``

## Notes
- This update was automatically generated
- Please review the changelog for any breaking changes before merging

---
Generated by frms-coe-lib dependency updater (PowerShell)
"@
            
            & gh pr create --repo $repo --title $PRTitle --body $PRBody --base $TargetBranch --head $BranchName *>$null
            if ($LASTEXITCODE -eq 0) {
                Write-LogSuccess "Created PR for $repo"
            }
            else {
                Write-LogWarning "Failed to create PR for $repo (changes pushed to branch $BranchName)"
            }
        }
        
        Write-LogSuccess "Updated $repo : $CurrentTargetVersion -> $NewVersion"
        $SuccessCount++
    }
    catch {
        Write-LogError "Unexpected error processing $repo : $_"
        $ErrorCount++
    }
    finally {
        Pop-Location
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Summary
Write-Host ""
Write-LogInfo "Update process completed!"
Write-LogSuccess "Successfully updated: $SuccessCount repositories"
Write-LogWarning "Skipped: $SkipCount repositories"
Write-LogError "Errors: $ErrorCount repositories"

if ($ErrorCount -gt 0) {
    exit 1
}