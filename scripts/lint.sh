#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "🔎 Linting backend and frontend code..."

# Lint backend with flake8
echo "  → Linting backend with flake8..."
cd "$BACKEND_DIR"
flake8 app/ tests/

# Lint frontend with ESLint
echo "  → Linting frontend with ESLint..."
cd "$FRONTEND_DIR"
yarn lint

echo "✅ All linting checks passed!"
