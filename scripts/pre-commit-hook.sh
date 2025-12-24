#!/bin/bash
# Pre-commit hook - Copy this to .git/hooks/pre-commit to run automatically
# Usage: cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit checks..."

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts"

# Run format check
if ! "$SCRIPTS_DIR/format-check.sh"; then
    echo ""
    echo "❌ Formatting check failed!"
    echo "Run './scripts/format.sh' to fix formatting issues."
    exit 1
fi

# Run lint check
if ! "$SCRIPTS_DIR/lint.sh"; then
    echo ""
    echo "❌ Linting check failed!"
    exit 1
fi

echo ""
echo "✅ Pre-commit checks passed!"
exit 0
