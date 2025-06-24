# 🛡️ MockBox Pre-Commit Hooks Setup

This directory contains comprehensive pre-commit hooks to ensure code quality, security, and prevent accidental commits of sensitive information.

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
# Dependencies are already installed in backend/venv
# If you need to reinstall:
pip install pre-commit detect-secrets
```

### 2. Install Hooks
```bash
# Install pre-commit hooks
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit install

# Install commit message hooks
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit install --hook-type commit-msg
```

### 3. Run Manual Checks

**PowerShell:**
```powershell
# Run all checks
.\check-pre-commit.ps1

# Run specific checks
.\check-pre-commit.ps1 -Check env        # Check for .env files
.\check-pre-commit.ps1 -Check secrets    # Secret detection
.\check-pre-commit.ps1 -Check format     # Code formatting
.\check-pre-commit.ps1 -Check install    # Install/update hooks
```

**Python:**
```bash
# Run all checks
python check-pre-commit.py

# Run specific checks
python check-pre-commit.py --env         # Check for .env files
python check-pre-commit.py --secrets     # Secret detection
python check-pre-commit.py --format      # Code formatting
python check-pre-commit.py --install     # Install/update hooks
```

## 🔒 Security Features

### Environment File Protection
- **Blocks all .env files** from being committed
- **Custom error messages** with fix suggestions
- **Allows .env.example** files for templates

### Secret Detection
- **Scans for high-entropy strings** (potential passwords/tokens)
- **Detects private keys** and certificates
- **Checks for hardcoded secrets** in source code
- **Maintains baseline** to ignore known false positives

### File Safety
- **Prevents large files** (>1MB) from being committed
- **Detects merge conflicts** in files
- **Checks for case conflicts** (Windows/Mac compatibility)

## 🎨 Code Quality Features

### Python (Backend)
- **Black** - Code formatting
- **isort** - Import sorting
- **flake8** - Linting and style guide enforcement
- **Bandit** - Security vulnerability scanning

### TypeScript/JavaScript (Frontend)
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **JSON/YAML validation**

### Docker
- **Hadolint** - Dockerfile linting and best practices

### Git
- **Conventional Commits** validation
- **Trailing whitespace** removal
- **End-of-file** fixing
- **Mixed line ending** normalization

## 📁 File Structure

```
.pre-commit-hooks/
├── block-env-files.py         # Custom .env blocker with helpful messages
└── README.md                  # This file

.pre-commit-config.yaml         # Main configuration file
.secrets.baseline               # Detect-secrets baseline
check-pre-commit.py            # Python manual runner
check-pre-commit.ps1           # PowerShell manual runner
```

## 🔧 Configuration Details

### Environment File Patterns (Blocked)
```regex
\.env$                  # .env
\.env\..*$             # .env.production, .env.local, etc.
.*\.env$               # anything.env
\.envrc$               # .envrc (direnv)
\.env_.*$              # .env_backup, etc.
```

### Allowed Patterns
```regex
\.env\.example$        # .env.example
\.env\.template$       # .env.template
\.env\.sample$         # .env.sample
\.env\.dist$           # .env.dist
```

### Secret Detection Exclusions
- Lock files (package-lock.json, pnpm-lock.yaml)
- Minified files (*.min.js)
- Source maps (*.map)
- Example files (*.env.example)

## 🚨 What Happens When Hooks Fail?

### Environment File Detection
```
🚨 COMMIT BLOCKED: Environment files detected!
============================================================
The following environment files cannot be committed:

  ❌ .env

🔧 How to fix:
1. Remove files from staging:
   git reset HEAD .env

2. Add files to .gitignore:
   echo '.env' >> .gitignore

3. Create example files instead:
   cp .env .env.example

4. Stage the changes:
   git add .gitignore
   git add .env.example

💡 Remember: Never commit real environment files!
   They contain sensitive information like API keys.
============================================================
```

### Secret Detection
```
detect-secrets scan detected potential secrets:
{
  "filename": "backend/config.py",
  "line_number": 15,
  "type": "High Entropy String",
  "is_verified": false
}
```

### Code Formatting Issues
```
black would reformat backend/main.py
flake8: line too long (98 > 88 characters)
eslint: missing semicolon
```

## 🛠️ Manual Commands

### Run Specific Hooks
```bash
# Check for .env files only
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit run block-env-files --all-files

# Run secret detection only
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit run detect-secrets --all-files

# Format Python code only
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit run black --all-files

# Format frontend code only
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit run prettier --all-files
```

### Update Hooks
```bash
# Update to latest hook versions
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit autoupdate

# Clean and reinstall hooks
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit clean
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit install
```

### Bypass Hooks (Emergency Only)
```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "Emergency commit"

# Skip specific hook
SKIP=detect-secrets git commit -m "Commit message"
```

## 🔄 Integration with CI/CD

The hooks can be integrated with GitHub Actions or other CI/CD systems:

```yaml
# .github/workflows/pre-commit.yml
name: Pre-commit checks
on: [push, pull_request]
jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - uses: pre-commit/action@v3.0.0
```

## 📊 Hook Performance

| Hook Category | Files Checked | Avg Time | Impact |
|---------------|---------------|----------|---------|
| Environment Protection | All files | <1s | High Security |
| Secret Detection | Source files | 2-5s | High Security |
| Python Formatting | *.py | 1-3s | Code Quality |
| Frontend Formatting | *.ts,*.js | 1-2s | Code Quality |
| JSON/YAML Validation | *.json,*.yaml | <1s | File Integrity |

## 🆘 Troubleshooting

### Common Issues

**Hook installation fails:**
```bash
# Check Python path
which python
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe --version

# Reinstall pre-commit
pip install --upgrade pre-commit
```

**Secrets baseline issues:**
```bash
# Regenerate baseline
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m detect_secrets scan --baseline .secrets.baseline --force-use-all-plugins
```

**Hook runs too slowly:**
```bash
# Run on changed files only
c:/Users/PC/Documents/MockBox/backend/venv/Scripts/python.exe -m pre_commit run

# Skip slow hooks in development
SKIP=bandit,hadolint git commit -m "Quick commit"
```

### Getting Help

1. **Check hook output** - Most hooks provide detailed error messages
2. **Run manual checks** - Use the runner scripts for detailed feedback
3. **Check .pre-commit-config.yaml** - Review hook configuration
4. **Update hooks** - Run `pre_commit autoupdate` for latest versions

## 🎯 Best Practices

1. **Run hooks before committing** - Use manual runners during development
2. **Keep .env.example updated** - Always provide template files
3. **Review hook output** - Don't just bypass failing hooks
4. **Update regularly** - Keep hooks and tools updated
5. **Team alignment** - Ensure all team members have hooks installed

---

## 📞 Support

If you encounter issues with the pre-commit setup:

1. Check this README for troubleshooting steps
2. Run manual checks for detailed error messages
3. Review the specific hook documentation
4. Ensure all dependencies are properly installed

**Remember: These hooks are your first line of defense against security incidents!**
