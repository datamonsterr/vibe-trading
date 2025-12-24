#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Running complete code quality pipeline..."

# Run formatting check
echo ""
echo "Step 1/4: Checking formatting..."
"$SCRIPT_DIR/format-check.sh"

# Run linting
echo ""
echo "Step 2/4: Linting..."
"$SCRIPT_DIR/lint.sh"

# Run tests
echo ""
echo "Step 3/4: Running tests..."
"$SCRIPT_DIR/test.sh"

echo ""
echo "✅ All checks passed! Code quality pipeline successful!"
