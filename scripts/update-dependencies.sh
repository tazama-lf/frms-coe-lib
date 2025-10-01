#!/bin/bash

# Update FRMS COE Lib Dependencies Script
# This script updates the @tazama-lf/frms-coe-lib dependency in specified repositories

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGE_JSON="$PROJECT_ROOT/package.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Update FRMS COE Lib Dependencies Script

USAGE:
    $0 [OPTIONS] REPOSITORY...

DESCRIPTION:
    Updates the @tazama-lf/frms-coe-lib dependency version in specified repositories
    to match the current version in this repository's package.json.

OPTIONS:
    -h, --help             Show this help message
    -b, --branch BRANCH    Target branch to update (default: dev)
    -p, --no-pr            Don't create pull requests (default: create PR)
    -d, --dry-run          Show what would be done without making changes
    -v, --version VERSION  Use specific version instead of current package.json version
    -f, --force            Force update even if version appears to be the same
    --token TOKEN          GitHub token (can also use GH_TOKEN env var)

ARGUMENTS:
    REPOSITORY             One or more repositories in format 'owner/repo'

EXAMPLES:
    # Update single repository
    $0 tazama-lf/tms-service

    # Update multiple Tazama repositories
    $0 tazama-lf/tms-service tazama-lf/event-director tazama-lf/typology-processor

    # Update with specific branch
    $0 -b main tazama-lf/tms-service

    # Dry run to see what would be updated
    $0 --dry-run tazama-lf/transaction-monitoring-service

    # Use specific version
    $0 -v 6.0.0 tazama-lf/transaction-monitoring-service

REQUIREMENTS:
    - git
    - gh (GitHub CLI)
    - node/npm
    - Valid GitHub token with repo access

EOF
}

# Parse command line arguments
REPOSITORIES=()
TARGET_BRANCH="dev"
CREATE_PR=true
DRY_RUN=false
FORCE_UPDATE=false
CUSTOM_VERSION=""
GH_TOKEN="${GH_TOKEN:-}"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--branch)
            TARGET_BRANCH="$2"
            shift 2
            ;;
        -p|--no-pr)
            CREATE_PR=false
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--version)
            CUSTOM_VERSION="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_UPDATE=true
            shift
            ;;
        --token)
            GH_TOKEN="$2"
            shift 2
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            REPOSITORIES+=("$1")
            shift
            ;;
    esac
done

# Validate requirements
if ! command -v git &> /dev/null; then
    log_error "git is required but not installed"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is required but not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is required but not installed"
    exit 1
fi

if [ ${#REPOSITORIES[@]} -eq 0 ]; then
    log_error "At least one repository must be specified"
    show_help
    exit 1
fi

# Check GitHub token
if [ -z "$GH_TOKEN" ]; then
    if ! gh auth status &> /dev/null; then
        log_error "GitHub authentication required. Please run 'gh auth login' or set GH_TOKEN"
        exit 1
    fi
else
    export GH_TOKEN
fi

# Get package information
if [ ! -f "$PACKAGE_JSON" ]; then
    log_error "package.json not found at $PACKAGE_JSON"
    exit 1
fi

if [ -n "$CUSTOM_VERSION" ]; then
    CURRENT_VERSION="$CUSTOM_VERSION"
    log_info "Using custom version: $CURRENT_VERSION"
else
    CURRENT_VERSION=$(node -p "require('$PACKAGE_JSON').version")
    log_info "Current package version: $CURRENT_VERSION"
fi

PACKAGE_NAME=$(node -p "require('$PACKAGE_JSON').name")
log_info "Package name: $PACKAGE_NAME"

# Main processing loop
log_info "Starting dependency update process..."
log_info "Target branch: $TARGET_BRANCH"
log_info "Create PR: $CREATE_PR"
log_info "Dry run: $DRY_RUN"

SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

for repo in "${REPOSITORIES[@]}"; do
    log_info "Processing repository: $repo"
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Clone repository
    if ! git clone "https://github.com/$repo.git" repo-clone 2>/dev/null; then
        log_error "Failed to clone $repo"
        ((ERROR_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    cd repo-clone
    
    # Configure git
    git config user.name "frms-coe-lib-updater"
    git config user.email "noreply@tazama.org"
    
    # Checkout target branch
    if ! git checkout "$TARGET_BRANCH" 2>/dev/null; then
        log_error "Failed to checkout branch $TARGET_BRANCH in $repo"
        ((ERROR_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_warning "No package.json found in $repo"
        ((SKIP_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    # Check dependency type and current version
    DEP_TYPE=""
    CURRENT_TARGET_VERSION=""
    
    if node -p "require('./package.json').dependencies && require('./package.json').dependencies['$PACKAGE_NAME']" 2>/dev/null | grep -v undefined > /dev/null; then
        DEP_TYPE="dependencies"
        CURRENT_TARGET_VERSION=$(node -p "require('./package.json').dependencies['$PACKAGE_NAME']" 2>/dev/null || echo "")
    elif node -p "require('./package.json').devDependencies && require('./package.json').devDependencies['$PACKAGE_NAME']" 2>/dev/null | grep -v undefined > /dev/null; then
        DEP_TYPE="devDependencies"
        CURRENT_TARGET_VERSION=$(node -p "require('./package.json').devDependencies['$PACKAGE_NAME']" 2>/dev/null || echo "")
    else
        log_warning "Package $PACKAGE_NAME not found in $repo dependencies"
        ((SKIP_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    log_info "Found $PACKAGE_NAME in $DEP_TYPE: $CURRENT_TARGET_VERSION"
    
    NEW_VERSION="^$CURRENT_VERSION"
    
    # Check if update is needed
    if [ "$CURRENT_TARGET_VERSION" = "$NEW_VERSION" ] || [ "$CURRENT_TARGET_VERSION" = "$CURRENT_VERSION" ]; then
        if [ "$FORCE_UPDATE" = false ]; then
            log_info "Version already up to date in $repo"
            ((SKIP_COUNT++))
            cd - > /dev/null
            continue
        else
            log_info "Forcing update even though version appears current"
        fi
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would update $repo: $CURRENT_TARGET_VERSION -> $NEW_VERSION"
        ((SUCCESS_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    # Create update branch
    BRANCH_NAME="update-frms-coe-lib-v$CURRENT_VERSION"
    git checkout -b "$BRANCH_NAME"
    
    # Update package.json
    cat package.json | node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
        const depType = '$DEP_TYPE';
        const packageName = '$PACKAGE_NAME';
        const newVersion = '$NEW_VERSION';
        
        if (pkg[depType] && pkg[depType][packageName]) {
            pkg[depType][packageName] = newVersion;
        }
        console.log(JSON.stringify(pkg, null, 2));
    " > package.json.tmp && mv package.json.tmp package.json
    
    # Check if changes were made
    if git diff --quiet package.json; then
        log_warning "No changes made to package.json in $repo"
        ((SKIP_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    # Commit and push changes
    git add package.json
    git commit -m "chore: update $PACKAGE_NAME to v$CURRENT_VERSION"
    
    if ! git push origin "$BRANCH_NAME" 2>/dev/null; then
        log_error "Failed to push changes to $repo"
        ((ERROR_COUNT++))
        cd - > /dev/null
        continue
    fi
    
    # Create pull request
    if [ "$CREATE_PR" = true ]; then
        PR_TITLE="chore: update $PACKAGE_NAME to v$CURRENT_VERSION"
        PR_BODY="This PR updates the \`$PACKAGE_NAME\` dependency to version \`$CURRENT_VERSION\`.

## Changes
- Updated \`$PACKAGE_NAME\` from \`$CURRENT_TARGET_VERSION\` to \`$NEW_VERSION\`

## Notes
- This update was automatically generated
- Please review the changelog for any breaking changes before merging

---
Generated by frms-coe-lib dependency updater"
        
        if gh pr create --repo "$repo" --title "$PR_TITLE" --body "$PR_BODY" --base "$TARGET_BRANCH" --head "$BRANCH_NAME" &> /dev/null; then
            log_success "Created PR for $repo"
        else
            log_warning "Failed to create PR for $repo (changes pushed to branch $BRANCH_NAME)"
        fi
    fi
    
    log_success "Updated $repo: $CURRENT_TARGET_VERSION -> $NEW_VERSION"
    ((SUCCESS_COUNT++))
    
    cd - > /dev/null
done

# Summary
echo ""
log_info "Update process completed!"
log_success "Successfully updated: $SUCCESS_COUNT repositories"
log_warning "Skipped: $SKIP_COUNT repositories"
log_error "Errors: $ERROR_COUNT repositories"

if [ $ERROR_COUNT -gt 0 ]; then
    exit 1
fi