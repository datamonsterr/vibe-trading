#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "🎨 Formatting backend and frontend code..."

# Format backend with black
echo "  → Formatting backend with black..."
cd "$BACKEND_DIR"
./.venv/bin/black app/ tests/

# Format frontend with prettier
echo "  → Formatting frontend with prettier..."
cd "$FRONTEND_DIR"
yarn format
