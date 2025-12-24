# QuantFlow - Project Setup Guide

## 🎉 Project Successfully Initialized!

This document provides an overview of the completed infrastructure setup and how to get started.

---

## 📁 Project Structure

```
vibe-trading/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   └── __init__.py
│   ├── tests/
│   │   ├── unit/              # Unit tests
│   │   └── integration/       # Integration tests
│   ├── pyproject.toml         # UV/Python configuration
│   ├── requirements.txt       # Production dependencies
│   ├── requirements-dev.txt   # Development dependencies
│   ├── .flake8               # Flake8 configuration
│   ├── Dockerfile            # Backend Docker image
│   └── .env                  # Backend environment variables
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── lib/              # Utility functions
│   │   ├── services/         # API services
│   │   └── tests/            # Frontend tests
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # TailwindCSS configuration
│   ├── eslint.config.js      # ESLint configuration
│   ├── .prettierrc           # Prettier configuration
│   ├── Dockerfile            # Frontend Docker image
│   ├── nginx.conf            # Nginx configuration
│   └── .env                  # Frontend environment variables
│
├── database/                   # Database configurations
│   ├── init.sql              # Database initialization
│   ├── postgresql.conf       # PostgreSQL configuration
│   └── pg_hba.conf           # Access control
│
├── .github/
│   └── workflows/
│       └── ci.yaml           # CI/CD pipeline
│
├── docker-compose.yml         # Docker orchestration
├── .env                      # Root environment variables
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:
- **Database**: TimescaleDB (PostgreSQL 16) on port 5432
- **Redis**: Cache on port 6379
- **Qdrant**: Vector database on port 6333
- **Backend**: FastAPI on port 8000
- **Frontend**: React app on port 3000

### 2. Verify Services

```bash
# Check all services are running
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

### 3. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🧪 Running Tests

### Backend Tests

```bash
# Using Docker
docker-compose exec backend pytest tests/unit -v

# Or locally (with UV)
cd backend
uv pip install --system -r requirements-dev.txt
pytest tests/unit -v --cov=app
```

### Frontend Tests

```bash
# Using Docker
docker-compose exec frontend yarn test

# Or locally
cd frontend
yarn install
yarn test
```

### Integration Tests

```bash
# Full integration test suite
docker-compose up -d
docker-compose exec backend pytest tests/integration -v
```

---

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Install dependencies with UV
uv pip install --system -r requirements-dev.txt

# Run linting
flake8 app/ tests/

# Format code
black app/ tests/

# Run tests
pytest tests/ -v --cov=app
```

### Frontend Development

```bash
cd frontend

# Install dependencies
yarn install

# Start dev server
yarn dev

# Run linting
yarn lint

# Format code
yarn format

# Run tests
yarn test
```

---

## 📦 Technology Stack

### Backend
- **Framework**: FastAPI 0.115+
- **Python**: 3.11+
- **Package Manager**: UV
- **Testing**: pytest, pytest-asyncio, pytest-cov
- **Code Quality**: black, flake8, mypy

### Frontend
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite 7+
- **Package Manager**: Yarn
- **Styling**: TailwindCSS 4+
- **Data Fetching**: SWR
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier

### Infrastructure
- **Database**: TimescaleDB (PostgreSQL 16)
- **Cache**: Redis 7
- **Vector DB**: Qdrant
- **Containerization**: Docker & Docker Compose

---

## 🔐 Environment Variables

### Root `.env`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `POSTGRES_PORT`, `REDIS_PORT`, `QDRANT_PORT`
- `BACKEND_PORT`, `FRONTEND_PORT`

### Backend `.env`
- Database connection strings
- API keys (DNSE, OpenAI)
- JWT configuration
- CORS settings

### Frontend `.env`
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`, `VITE_APP_VERSION`
- Feature flags

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yaml`) runs on every push/PR:

1. **Backend Tests**
   - Linting (flake8)
   - Code formatting check (black)
   - Unit tests with coverage
   - Integration tests

2. **Frontend Tests**
   - Linting (ESLint)
   - Code formatting check (Prettier)
   - Unit tests with coverage
   - Build verification

3. **Integration Tests**
   - Docker Compose build
   - Services health check
   - End-to-end API tests

4. **CI Success Check**
   - Verifies all jobs passed

---

## 📝 Next Steps

1. ✅ Infrastructure setup complete
2. 🔄 Implement Market Data Ingestion (Task 1.2)
3. 🔄 Add Authentication & Security (Task 1.3)
4. 🔄 Build Big Picture Dashboard (Task 2.1)

See [guidelines/tasks.md](guidelines/tasks.md) for detailed roadmap.

---

## 🆘 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

### Database connection errors

```bash
# Check database is healthy
docker-compose exec database pg_isready -U postgres

# Check TimescaleDB extension
docker-compose exec database psql -U postgres -d quantflow -c "\dx"
```

### Port conflicts

If ports are already in use, modify `.env`:
```bash
BACKEND_PORT=8001
FRONTEND_PORT=3001
POSTGRES_PORT=5433
```

---

## 📚 Documentation

- [AGENT.md](AGENT.md) - Agent development guide
- [README.md](README.md) - Project overview
- [guidelines/tasks.md](guidelines/tasks.md) - Implementation roadmap
- [guidelines/requirements.md](guidelines/requirements.md) - Functional requirements
- [guidelines/database.md](guidelines/database.md) - Database schema

---

## ✅ Infrastructure Checklist

- ✅ Python backend with UV package manager
- ✅ FastAPI with mock endpoints
- ✅ React + TypeScript frontend with Vite
- ✅ TailwindCSS styling
- ✅ useSWR for data fetching
- ✅ TimescaleDB database
- ✅ Redis cache
- ✅ Qdrant vector database
- ✅ Docker Compose orchestration
- ✅ Complete test suites (backend & frontend)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Code quality tools (black, flake8, ESLint, Prettier)
- ✅ Environment configuration
- ✅ Documentation

**Status**: 🎉 All infrastructure setup is complete and verified!

---

Happy coding! 🚀
