#!/usr/bin/env python3
"""
Validate commit message format for MockBox project.

This script validates that commit messages follow conventional commit format:
- feat: description
- fix: description
- docs: description
- style: description
- refactor: description
- test: description
- chore: description

Examples of valid commit messages:
✓ feat: add user authentication
✓ fix: resolve login button styling issue
✓ docs: update API documentation
✓ chore: update dependencies

Examples of invalid commit messages:
X add feature
X Fix bug
X updated docs
"""

import sys
import re
from pathlib import Path


def validate_commit_message(message):
    """
    Validate commit message format.

    Args:
        message (str): The commit message to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    # Remove leading/trailing whitespace
    message = message.strip()

    # Skip validation for merge commits
    if message.startswith("Merge ") or message.startswith("Revert "):
        return True, ""

    # Skip validation for fixup/squash commits
    if message.startswith("fixup!") or message.startswith("squash!"):
        return True, ""    # Define the conventional commit pattern
    pattern = r"^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?: .+$"

    if not re.match(pattern, message):
        return False, f"""
X Invalid commit message format!

Your commit message: "{message}"

✓ Expected format: <type>: <description>

Valid types:
- feat:     A new feature
- fix:      A bug fix
- docs:     Documentation changes
- style:    Code style changes (formatting, etc.)
- refactor: Code refactoring
- perf:     Performance improvements
- test:     Adding or updating tests
- chore:    Maintenance tasks, dependency updates
- ci:       CI/CD pipeline changes
- build:    Build system changes

Examples:
✓ feat: add user authentication system
✓ fix: resolve login button styling issue
✓ docs: update API documentation
✓ chore: update npm dependencies

Optional scope:
✓ feat(auth): add OAuth integration
✓ fix(ui): resolve button alignment issue
"""

    return True, ""


def main():
    """Main function to validate commit message."""
    # Read commit message from file (passed as argument by git)
    if len(sys.argv) != 2:
        print("X Error: Commit message file not provided")
        return 1

    commit_msg_file = sys.argv[1]

    try:
        with open(commit_msg_file, 'r', encoding='utf-8') as f:
            commit_message = f.read().strip()
    except FileNotFoundError:
        print(f"X Error: Could not read commit message file: {commit_msg_file}")
        return 1
    except Exception as e:
        print(f"X Error reading commit message: {e}")
        return 1

    # Skip empty commit messages
    if not commit_message:
        print("X Error: Empty commit message")
        return 1

    # Validate the commit message
    is_valid, error_message = validate_commit_message(commit_message)

    if not is_valid:
        print(error_message)
        print("\n! Tip: Use 'git commit --amend' to fix your commit message")
        return 1

    print("✓ Commit message format is valid!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
