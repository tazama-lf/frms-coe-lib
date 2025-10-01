# FRMS COE Lib Dependency Update Tools

This directory contains tools for automatically updating the `@tazama-lf/frms-coe-lib` dependency version in other repositories.

## Files

- **`update-dependencies.yml`** - GitHub Action workflow for automated updates
- **`update-dependencies.sh`** - Bash script for local/manual updates (Linux/macOS)
- **`update-dependencies.ps1`** - PowerShell script for local/manual updates (Windows)

## GitHub Action Workflow

### Triggers

The workflow can be triggered in two ways:

1. **Manual dispatch** - Run on-demand with custom parameters
2. **Automatic on release** - Runs automatically when a new release is published

### Manual Usage

1. Go to the Actions tab in the GitHub repository
2. Select "Update FRMS COE Lib Dependencies"
3. Click "Run workflow"
4. Fill in the parameters:
   - **Repositories**: Comma-separated list of repositories to update (e.g., `tazama-lf/tms-service,tazama-lf/event-director`)
   - **Target branch**: Branch to update (default: `dev`)
   - **Create PR**: Whether to create pull requests for changes (default: `true`)

### Automatic Usage

The workflow will automatically run when a new release is published, updating a predefined list of repositories. To customize this list, edit the workflow file and modify the `REPOS` variable in the "Set repository list" step.

### Required Permissions

The GitHub Action requires the following permissions:
- `contents: read` - To read the current repository
- `pull-requests: write` - To create pull requests
- `repository-projects: write` - To push to other repositories

Make sure the `GH_TOKEN` has access to the target repositories.

## Cross-Organization & Private Repository Support

### 🔐 Authentication Considerations

The default `GH_TOKEN` has limitations when working with repositories outside the current organization:

- ✅ **Same organization, public repos**: Works with default `GH_TOKEN`
- ❌ **Different organizations**: Requires Personal Access Token (PAT) or GitHub App
- ❌ **Private repositories**: Requires explicit access permissions

### 🔧 Setup for Cross-Organization Updates

#### Option 1: Personal Access Token (Recommended for small scale)

1. **Create PAT**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create **Classic Token** with `repo` scope
   - Token owner must have access to all target repositories

2. **Add Repository Secret**:
   - Repository Settings → Secrets and variables → Actions
   - Add secret: `CROSS_ORG_TOKEN` with your PAT value

3. **Grant Organization Access**:
   - For each target organization: Settings → Third-party access
   - Approve the token for organization access

#### Option 2: GitHub App (Recommended for enterprise)

Create a GitHub App with repository permissions and install across organizations.

### 🚀 Usage with Cross-Organization Support

The GitHub Action includes a new parameter for cross-organization updates:

```yaml
# For different organizations or private repos
repositories: "other-org/private-repo1,another-org/repo2"
use_cross_org_token: true  # Uses CROSS_ORG_TOKEN secret
```

```yaml
# For same organization (public repos)
repositories: "tazama-lf/repo1,tazama-lf/repo2"
use_cross_org_token: false  # Uses default GH_TOKEN
```

### ⚠️ Important Limitations

#### Repository Access
- Token owner must be **collaborator** on each target repository
- Or have **organization membership** with appropriate permissions
- **Private repositories** require explicit access grants

#### Organization Policies
Many organizations restrict:
- External tokens entirely
- Require GitHub Apps instead of PATs
- Mandate specific authentication flows
- Block cross-organization integrations

#### Branch Protection Rules
Protected branches may:
- Prevent direct pushes (even with valid tokens)
- Require pull request reviews before merging
- Require status checks to pass

### 🔍 Error Messages & Troubleshooting

The workflow provides specific error messages for permission issues:

- `"Failed to clone (check permissions)"` → Token lacks **read access**
- `"Failed to push (check write permissions)"` → Token lacks **write access**  
- `"Failed to create PR"` → Token lacks **PR creation** permissions

### 💡 Best Practices for Cross-Organization Use

1. **Test First**: Start with a single test repository
2. **Minimal Permissions**: Use tokens with minimum required scope
3. **Token Rotation**: Regularly rotate PATs for security
4. **GitHub Apps**: Prefer GitHub Apps for enterprise scenarios
5. **Organization Coordination**: Work with target organization admins
6. **Documentation**: Document which organizations/repos are supported

## Local Scripts

### Bash Script (Linux/macOS)

```bash
# Make executable
chmod +x scripts/update-dependencies.sh

# Update single repository
./scripts/update-dependencies.sh tazama-lf/tms-service

# Update multiple repositories
./scripts/update-dependencies.sh tazama-lf/tms-service tazama-lf/event-director

# Update with specific branch
./scripts/update-dependencies.sh -b main tazama-lf/tms-service

# Dry run (show what would be updated)
./scripts/update-dependencies.sh --dry-run tazama-lf/transaction-monitoring-service

# Use specific version
./scripts/update-dependencies.sh -v 6.0.0 tazama-lf/transaction-monitoring-service

# Don't create pull requests
./scripts/update-dependencies.sh --no-pr tazama-lf/transaction-monitoring-service
```

### PowerShell Script (Windows)

```powershell
# Update single repository
.\scripts\update-dependencies.ps1 tazama-lf/tms-service

# Update multiple repositories
.\scripts\update-dependencies.ps1 tazama-lf/tms-service tazama-lf/event-director

# Update with specific branch
.\scripts\update-dependencies.ps1 -Branch main tazama-lf/tms-service

# Dry run (show what would be updated)
.\scripts\update-dependencies.ps1 -DryRun tazama-lf/transaction-monitoring-service

# Use specific version
.\scripts\update-dependencies.ps1 -Version 6.0.0 tazama-lf/transaction-monitoring-service

# Don't create pull requests
.\scripts\update-dependencies.ps1 -NoPR tazama-lf/transaction-monitoring-service
```

## Prerequisites

All tools require the following to be installed and configured:

1. **Git** - For cloning and pushing to repositories
2. **GitHub CLI (gh)** - For creating pull requests
3. **Node.js** - For reading package.json files
4. **GitHub Token** - With appropriate permissions

### GitHub Authentication

You can authenticate in several ways:

1. **GitHub CLI**: Run `gh auth login`
2. **Environment Variable**: Set `GH_TOKEN` environment variable
3. **Script Parameter**: Pass token directly to local scripts

### Required Token Permissions

The GitHub token needs the following scopes:
- `repo` - Full repository access
- `workflow` - For updating GitHub Actions (if needed)

#### For Cross-Organization Access
When updating repositories in different organizations or private repositories:

1. **Set Environment Variable**:
   ```bash
   export GH_TOKEN="your_personal_access_token_here"
   ```

2. **Or pass directly to scripts**:
   ```bash
   # Bash
   ./scripts/update-dependencies.sh --token your_pat_here other-org/private-repo
   
   # PowerShell
   .\scripts\update-dependencies.ps1 -Token your_pat_here other-org/private-repo
   ```

3. **Token Requirements**:
   - Must have `repo` scope for target repositories
   - Token owner must have collaborator access or organization membership
   - May need approval from organization administrators

## How It Works

1. **Version Detection**: Reads the current version from this repository's `package.json`
2. **Repository Processing**: For each target repository:
   - Clones the repository
   - Checks out the target branch
   - Looks for `@tazama-lf/frms-coe-lib` in `dependencies` or `devDependencies`
   - Updates the version if different from current
   - Commits and pushes changes to a new branch
   - Creates a pull request (if enabled)

## Customization

### Default Repository List

To change the default repositories updated on release, edit the workflow file:

```yaml
# Default repositories to update on release (customize this list)
REPOS="tazama-lf/transaction-monitoring-service,tazama-lf/rule-processor,tazama-lf/typology-processor"
```

### Branch Strategy

The tools create branches named `update-frms-coe-lib-v{VERSION}` (e.g., `update-frms-coe-lib-v6.0.0-rc.9`).

### Pull Request Template

The tools create pull requests with:
- **Title**: `chore: update @tazama-lf/frms-coe-lib to v{VERSION}`
- **Body**: Includes change summary and notes
- **Labels**: None (can be customized)

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure GitHub token has correct permissions
   - For CLI: Run `gh auth login`
   - For scripts: Set `GH_TOKEN` environment variable

2. **Repository Access Denied**
   - Token must have access to target repositories
   - Organization repositories may require additional permissions

3. **Branch Already Exists**
   - The update branch already exists in the target repository
   - Delete the branch or use the `--force` option

4. **No Changes Made**
   - The dependency version is already up to date
   - Use `--force` to update anyway

### Debug Mode

For local scripts, use the `--dry-run` option to see what would be updated without making actual changes.

## Examples

### Typical Workflow

1. **After publishing a new version**:
   ```bash
   # GitHub Action will run automatically
   # Or manually trigger with specific repositories
   ```

2. **Before a major release**:
   ```bash
   # Test with dry run first
   ./scripts/update-dependencies.sh --dry-run tazama-lf/tms-service
   
   # Update staging repositories to dev branch (default)
   ./scripts/update-dependencies.sh tazama-lf/tms-service tazama-lf/event-director
   ```

3. **Emergency update**:
   ```bash
   # Force update even if version appears current
   ./scripts/update-dependencies.sh --force tazama-lf/tms-service
   ```

### Repository Lists

Common repository groupings (from repositories.conf):

```bash
# Core Tazama services
CORE_REPOS="tazama-lf/tms-service,tazama-lf/event-director,tazama-lf/typology-processor"

# All rule processors
RULE_REPOS="frmscoe/rule-001,frmscoe/rule-002,frmscoe/rule-003"

# Update core services
./scripts/update-dependencies.sh $CORE_REPOS
```