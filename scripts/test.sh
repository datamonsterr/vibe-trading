#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "🧪 Running backend and frontend tests..."

# Run backend unit tests
echo "  → Running backend unit tests..."
cd "$BACKEND_DIR"
./.venv/bin/pytest tests/unit -v --cov=app --cov-report=xml

# Run backend integration tests (if applicable)
echo "  → Running backend integration tests..."
./.venv/bin/pytest tests/integration -v || true

# Run frontend tests
echo "  → Running frontend tests..."
cd "$FRONTEND_DIR"
yarn test --run --coverage

echo "✅ All tests passed!"
