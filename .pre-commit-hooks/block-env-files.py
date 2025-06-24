#!/usr/bin/env python3
"""
Custom pre-commit hook to prevent .env files from being committed.
This script provides more detailed error messages and suggestions.
"""

import sys
import os
import re
from pathlib import Path

# Environment file patterns to block
ENV_PATTERNS = [r"\.env$", r"\.env\..*$", r".*\.env$", r"\.envrc$", r"\.env_.*$"]

# Exceptions (files that are OK to commit)
ALLOWED_PATTERNS = [
    r"\.env\.example$",
    r"\.env\.template$",
    r"\.env\.sample$",
    r"\.env\.dist$",
]


def is_env_file(filename):
    """Check if filename matches environment file patterns."""
    # Check if it's an allowed pattern first
    for pattern in ALLOWED_PATTERNS:
        if re.search(pattern, filename, re.IGNORECASE):
            return False

    # Check if it matches blocked patterns
    for pattern in ENV_PATTERNS:
        if re.search(pattern, filename, re.IGNORECASE):
            return True

    return False


def main():
    """Main function to check staged files."""
    exit_code = 0
    staged_files = sys.argv[1:] if len(sys.argv) > 1 else []

    blocked_files = []

    for file_path in staged_files:
        if is_env_file(file_path):
            blocked_files.append(file_path)

    if blocked_files:
        print("🚨 COMMIT BLOCKED: Environment files detected!")
        print("=" * 60)
        print("The following environment files cannot be committed:")
        print()

        for file_path in blocked_files:
            print(f"  ❌ {file_path}")

        print()
        print("🔧 How to fix:")
        print("1. Remove files from staging:")
        for file_path in blocked_files:
            print(f"   git reset HEAD {file_path}")

        print()
        print("2. Add files to .gitignore:")
        print("   echo '.env' >> .gitignore")
        print("   echo '.env.*' >> .gitignore")

        print()
        print("3. Create example files instead:")
        for file_path in blocked_files:
            example_path = file_path.replace(".env", ".env.example")
            print(f"   cp {file_path} {example_path}")

        print()
        print("4. Stage the changes:")
        print("   git add .gitignore")
        for file_path in blocked_files:
            example_path = file_path.replace(".env", ".env.example")
            print(f"   git add {example_path}")

        print()
        print("💡 Remember: Never commit real environment files!")
        print("   They contain sensitive information like API keys.")
        print("=" * 60)

        exit_code = 1

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
