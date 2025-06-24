# 🚨 Emergency Git Recovery: How to Completely Remove Accidentally Committed .env Files from Git History

*A step-by-step guide to safely removing sensitive environment files from your entire git history while preserving your work*

## 📖 Table of Contents
1. [The Problem](#the-problem)
2. [Understanding the Risks](#understanding-the-risks)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Solution](#step-by-step-solution)
5. [Verification](#verification)
6. [Prevention](#prevention)
7. [Alternative Methods](#alternative-methods)
8. [Troubleshooting](#troubleshooting)

---

## 🔥 The Problem

You've just realized you accidentally committed and pushed your `.env` file containing sensitive information to your git repository. This file likely contains:

- API keys (OpenAI, Anthropic, AWS, etc.)
- Database credentials
- JWT secrets
- Third-party service tokens
- OAuth client secrets

**Simply removing the file from tracking won't help** - it's still visible in your git history to anyone with repository access!

---

## ⚠️ Understanding the Risks

When you commit a `.env` file, even if you remove it later:

```bash
# This DOESN'T remove it from history
git rm .env
git commit -m "Remove env file"
```

The sensitive data is still accessible via:
```bash
git show <commit-hash>:.env
git log --follow .env
```

**Real Impact:**
- 🔓 Anyone with repo access can see your secrets
- 🏢 Compliance violations (GDPR, SOX, etc.)
- 💰 Potential security breaches
- 🎯 Target for malicious actors

---

## 🛠️ Prerequisites

### Required Tools:
- **Git** (obviously)
- **Java Runtime Environment** (for BFG)
- **Internet connection** (to download BFG)

### Check Java Installation:

**PowerShell:**
```powershell
java -version
```

**Linux/Mac:**
```bash
java -version
```

If not installed:
- **Windows:** Download from [Oracle](https://www.oracle.com/java/technologies/downloads/)
- **Linux:** `sudo apt install default-jre` or `sudo yum install java-1.8.0-openjdk`
- **Mac:** `brew install openjdk`

---

## 🔧 Step-by-Step Solution

### Phase 1: Backup Your Current Work

**⚠️ CRITICAL:** Save your uncommitted changes before proceeding!

#### 1.1 Check Current Status

**PowerShell:**
```powershell
git status --porcelain
```

**Linux/Mac:**
```bash
git status --porcelain
```

#### 1.2 Create Backup Branch

**PowerShell:**
```powershell
# Create and switch to backup branch
git checkout -b my-work-backup

# Stage all changes
git add .

# Commit everything
git commit -m "Backup: Save all work in progress before history cleanup"

# Switch back to main
git checkout main
```

**Linux/Mac:**
```bash
# Create and switch to backup branch
git checkout -b my-work-backup

# Stage all changes
git add .

# Commit everything
git commit -m "Backup: Save all work in progress before history cleanup"

# Switch back to main
git checkout main
```

### Phase 2: Download and Setup BFG Repo-Cleaner

#### 2.1 Download BFG

**PowerShell:**
```powershell
# Using curl (if available)
curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Alternative: Using PowerShell native
Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -OutFile "bfg.jar"
```

**Linux/Mac:**
```bash
# Using curl
curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Alternative: Using wget
wget -O bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

#### 2.2 Verify Download

**PowerShell:**
```powershell
dir bfg.jar
```

**Linux/Mac:**
```bash
ls -la bfg.jar
```

### Phase 3: History Cleanup Process

#### 3.1 Create Mirror Clone

**PowerShell:**
```powershell
git clone --mirror https://github.com/YourUsername/YourRepo.git repo-cleanup.git
```

**Linux/Mac:**
```bash
git clone --mirror https://github.com/YourUsername/YourRepo.git repo-cleanup.git
```

#### 3.2 Run BFG Cleaner

**PowerShell:**
```powershell
java -jar bfg.jar --delete-files .env repo-cleanup.git
```

**Linux/Mac:**
```bash
java -jar bfg.jar --delete-files .env repo-cleanup.git
```

**Expected Output:**
```
Using repo : /path/to/repo-cleanup.git

Found 45 objects to protect
Found 3 commit-pointing refs : HEAD, refs/heads/main, refs/remotes/origin/main

Protected commits
-----------------

These are your protected commits, and so their contents will NOT be altered:

 * commit 12345678 (HEAD, refs/heads/main, refs/remotes/origin/main) - contains 0 dirty files :
    - .env (123 B)

Cleaning
--------

Found 125 commits
Cleaning commits:       100% (125/125)
Cleaning commit messages:       100% (125/125)
Cleaning trees:         100% (125/125)

BFG run is complete!
```

#### 3.3 Cleanup Repository

**PowerShell:**
```powershell
cd repo-cleanup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Linux/Mac:**
```bash
cd repo-cleanup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### 3.4 Force Push Cleaned History

**PowerShell:**
```powershell
git push --force origin
cd ..
```

**Linux/Mac:**
```bash
git push --force origin
cd ..
```

### Phase 4: Update Local Repository

#### 4.1 Reset Local Repository

**PowerShell:**
```powershell
# Fetch cleaned history
git fetch origin

# Reset to match cleaned remote
git reset --hard origin/main
```

**Linux/Mac:**
```bash
# Fetch cleaned history
git fetch origin

# Reset to match cleaned remote
git reset --hard origin/main
```

#### 4.2 Restore Your Work

**PowerShell:**
```powershell
# Cherry-pick your backed up work
git cherry-pick my-work-backup

# Push restored work
git push origin main
```

**Linux/Mac:**
```bash
# Cherry-pick your backed up work
git cherry-pick my-work-backup

# Push restored work
git push origin main
```

### Phase 5: Cleanup

#### 5.1 Remove Temporary Files

**PowerShell:**
```powershell
# Remove BFG files
Remove-Item -Recurse -Force repo-cleanup.git
Remove-Item -Recurse -Force repo-cleanup.git.bfg-report

# Delete backup branch
git branch -D my-work-backup
```

**Linux/Mac:**
```bash
# Remove BFG files
rm -rf repo-cleanup.git repo-cleanup.git.bfg-report

# Delete backup branch
git branch -D my-work-backup
```

---

## ✅ Verification

### Verify .env Removal

**PowerShell & Linux/Mac:**
```bash
# Check if file exists in history (should fail)
git show <old-commit-hash>:.env
# Expected: fatal: path '.env' exists on disk, but not in '<commit-hash>'

# Search for .env in git objects (should return nothing)
git rev-list --objects --all | grep .env
```

### Check Repository Size

**PowerShell & Linux/Mac:**
```bash
# Before and after comparison
git count-objects -vH
```

---

## 🛡️ Prevention Strategies

### 1. Update .gitignore

Add to your `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
```

### 2. Use .env.example

Create template files:
```bash
# .env.example
DATABASE_URL=postgresql://username:password@localhost/dbname
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Pre-commit Hooks

Install and configure:
```bash
pip install pre-commit
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-added-large-files
      - id: detect-private-key
      - id: check-merge-conflict
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### 4. Environment Variable Validation

Add to your startup code:
```python
# Python example
import os
from typing import Optional

def validate_env_vars() -> None:
    required_vars = [
        'DATABASE_URL',
        'API_KEY',
        'JWT_SECRET'
    ]

    missing = [var for var in required_vars if not os.getenv(var)]

    if missing:
        raise EnvironmentError(f"Missing required environment variables: {missing}")

# Call on app startup
validate_env_vars()
```

---

## 🔄 Alternative Methods

### Method 1: git filter-branch (Built-in)

**PowerShell & Linux/Mac:**
```bash
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all

git push --force --all origin
```

**Pros:** No external tools needed
**Cons:** Slower, more complex, harder to use

### Method 2: git filter-repo (Recommended Alternative)

**Installation:**
```bash
pip install git-filter-repo
```

**Usage:**
```bash
git filter-repo --path .env --invert-paths
git remote add origin <remote-url>
git push --force origin main
```

**Pros:** Fast, modern, actively maintained
**Cons:** Requires Python/pip

### Method 3: Secret Rotation (Safest)

Instead of rewriting history:
1. **Change all credentials** in your services
2. **Revoke old API keys**
3. **Update passwords**
4. **Generate new JWT secrets**

**Pros:** No git complexity, immediate security
**Cons:** Exposed credentials remain in history

---

## 🚨 Troubleshooting

### Issue 1: "Working tree has modifications"

**Solution:**
```bash
git stash
# Run cleanup process
git stash pop
```

### Issue 2: "fatal: refusing to merge unrelated histories"

**Solution:**
```bash
git pull origin main --allow-unrelated-histories
```

### Issue 3: Team Members Get Errors

**Solution for team members:**
```bash
# Backup their work
git stash

# Delete and reclone
cd ..
rm -rf project-folder
git clone <repo-url>
cd project-folder

# Restore their work
git stash pop
```

### Issue 4: Large Repository Takes Forever

**Solution:**
```bash
# Use shallow clone
git clone --depth=1 --mirror <repo-url> repo-cleanup.git

# Or process specific commits
java -jar bfg.jar --delete-files .env --no-blob-protection repo-cleanup.git
```

### Issue 5: Multiple .env Files

**Solution:**
```bash
# Remove all .env variants
java -jar bfg.jar --delete-files .env* repo-cleanup.git

# Or specific patterns
java -jar bfg.jar --delete-files "{.env,.env.local,.env.production}" repo-cleanup.git
```

---

## 📊 Performance Comparison

| Method | Speed | Safety | Complexity | Tools Required |
|--------|-------|---------|------------|----------------|
| BFG Repo-Cleaner | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Java |
| git filter-branch | ⭐⭐ | ⭐⭐⭐ | ⭐ | Git only |
| git filter-repo | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Python |
| Secret Rotation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | None |

---

## 🎯 Key Takeaways

1. **Act Fast:** The longer secrets are exposed, the higher the risk
2. **Backup First:** Always save your work before history manipulation
3. **Team Communication:** Inform team members about force pushes
4. **Prevention:** Implement safeguards to prevent future incidents
5. **Secret Rotation:** Consider rotating credentials regardless of method chosen

---

## 🔗 Useful Resources

- [BFG Repo-Cleaner Documentation](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Filter-Repo Guide](https://github.com/newren/git-filter-repo)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitLab Secret Detection](https://docs.gitlab.com/ee/user/application_security/secret_detection/)
- [Pre-commit Hooks](https://pre-commit.com/)

---

## 📝 Final Notes

**Remember:** This process rewrites git history and requires coordination with your team. Always:

- ✅ Communicate with team members
- ✅ Schedule maintenance windows
- ✅ Have rollback plans
- ✅ Rotate compromised credentials
- ✅ Implement prevention measures

**Security is not a one-time fix - it's an ongoing practice!**

---

*💡 Pro Tip: Set up monitoring for accidental commits using GitHub's secret scanning or GitLab's secret detection to catch these issues automatically.*

---

**Blog Author:** Generated from real incident response
**Last Updated:** June 20, 2025
**Incident Status:** ✅ RESOLVED - All sensitive data removed from git history
