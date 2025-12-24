#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "🔍 Checking code formatting..."

# Check backend formatting with black
echo "  → Checking backend formatting with black..."
cd "$BACKEND_DIR"
./.venv/bin/black --check app/ tests/

# Check frontend formatting with prettier
echo "  → Checking frontend formatting with prettier..."
cd "$FRONTEND_DIR"
yarn format --check

echo "✅ All formatting checks passed!"
