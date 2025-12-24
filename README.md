# QuantFlow - Algorithmic Trading & Financial Intelligence Platform

## Overview

QuantFlow is a next-generation Algorithmic Trading and Financial Intelligence platform specifically architected for the Vietnam Stock Market (VN50/VN100). It unifies Macro-level Market Intelligence, Micro-level Value Chain Analysis, and Agentic Automation into a cohesive, low-code ecosystem.

### Key Features

- **Big Picture Market Dashboard**: Real-time VN-Index visualization with global macro indicators
- **Recursive Industry Heatmap**: Drill-down from Sector → Industry → Stock performance
- **Value Chain Analysis**: Interactive visualization of supply chain dependencies
- **Lead-Lag Optimization**: ML-based discovery of optimal trading delays (e.g., Commodity → Stock)
- **Smart Portfolio Generator**: Wizard-based portfolio optimization using Mean-Variance Optimization
- **Low-Code Strategy Builder**: Drag-and-drop interface for building complex trading workflows
- **AI-Powered Financial Analysis**: Persistent AI memory (Mem0) for context-aware audit and analysis

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Time-Series DB**: TimescaleDB (PostgreSQL extension)
- **Vector Store**: Qdrant (for AI memory)
- **Cache**: Redis
- **AI/LLM**: OpenAI GPT-4o + Mem0
- **ML**: XGBoost, Pandas, NumPy

### Frontend
- **Framework**: React.js + TypeScript
- **Workflow Builder**: React Flow
- **Charting**: TradingView Charting Library, D3.js
- **Styling**: Tailwind CSS

### Infrastructure
- **Containerization**: Docker Compose
- **Task Queue**: Celery (optional, for background jobs)
- **API Documentation**: OpenAPI (FastAPI auto-generates)
- **Testing**: pytest (backend), Jest/Playwright (frontend)

---

## Prerequisites

### System Requirements
- **OS**: Linux/macOS/Windows (with WSL2)
- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Node.js**: v18+ (for frontend development)
- **Python**: v3.11+ (for backend development)

### API Credentials
- **DNSE/Entrade X**: Broker account with API access
- **OpenAI**: API key for GPT-4o integration
- **Optional**: Yahoo Finance / Alpha Vantage (for macro data)

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/vibe-trading.git
cd vibe-trading
```

### 2. Environment Setup

Create `.env` file in project root:

```env
# Backend
FASTAPI_ENV=development
SECRET_KEY=your-secret-key-here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=quantflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Broker Integration
DNSE_CLIENT_ID=your_client_id
DNSE_CLIENT_SECRET=your_secret
DNSE_SANDBOX=true

# AI & Memory
OPENAI_API_KEY=sk-...
QDR ANT_HOST=localhost
QDRANT_PORT=6333

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### 3. Docker Compose Up

```bash
docker-compose up -d
```

**Services started**:
- FastAPI (port 8000)
- PostgreSQL + TimescaleDB (port 5432)
- Redis (port 6379)
- Qdrant (port 6333)

### 4. Initialize Database

```bash
# Apply migrations
docker exec quantflow_backend python scripts/migrate_db.py

# Load sample data (optional)
docker exec quantflow_backend python scripts/load_fixtures.py
```

### 5. Start Frontend Development

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

### 6. Test Setup

```bash
# Backend tests
cd backend
pip install -r requirements-test.txt
pytest tests/unit -v

# Frontend tests
cd frontend
npm test
```

---

## Project Structure

```
vibe-trading/
├── backend/                    # Python FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── api/               # API route handlers
│   │   ├── models/            # SQLAlchemy/Pydantic models
│   │   ├── services/          # Business logic
│   │   ├── agents/            # AI agents (Mem0, Auditor)
│   │   └── schemas/           # Pydantic schemas
│   ├── tests/                 # Unit & integration tests
│   ├── migrations/            # Alembic DB migrations
│   └── requirements.txt
├── frontend/                   # React.js SPA
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml         # Service orchestration
├── guidelines/
│   ├── requirements.md        # SRS & use cases
│   ├── tasks.md              # Implementation roadmap
│   ├── database.md           # Schema documentation
│   └── testing.md            # Testing strategy
├── .github/
│   ├── instructions/
│   │   ├── backend.md        # Backend implementation guide
│   │   ├── frontend.md       # Frontend implementation guide
│   │   └── behavior.md       # Agent behavior guidelines
│   └── workflows/            # CI/CD workflows
└── README.md
```

---

## Key Documentation Files

Read in this order:

1. **[requirements.md](guidelines/requirements.md)** - Functional requirements & use cases
2. **[tasks.md](guidelines/tasks.md)** - Implementation roadmap (update progress here)
3. **[database.md](guidelines/database.md)** - Schema design & relationships
4. **[testing.md](guidelines/testing.md)** - Testing strategy & examples
5. **[.github/instructions/backend.md](.github/instructions/backend.md)** - Backend guidelines
6. **[.github/instructions/frontend.md](.github/instructions/frontend.md)** - Frontend guidelines
7. **[.github/instructions/behavior.md](.github/instructions/behavior.md)** - Best practices & agent workflow

---

## Development Workflow

### For Backend Development

1. Create feature branch: `git checkout -b feature/feature-name`
2. Install dependencies: `pip install -r requirements-dev.txt`
3. Write tests in `backend/tests/`
4. Run tests: `pytest -v`
5. Code follows PEP 8 + type hints (Pylance)
6. Commit with conventional messages: `feat:`, `fix:`, `refactor:`

### For Frontend Development

1. Create feature branch: `git checkout -b feature/feature-name`
2. Install dependencies: `npm install`
3. Write tests in `frontend/tests/`
4. Run tests: `npm test`
5. Code follows ESLint + Prettier rules
6. Commit with conventional messages

### For AI Agent Implementation

1. Read [behavior.md](.github/instructions/behavior.md) for guidelines
2. Update [tasks.md](guidelines/tasks.md) with progress
3. Document schema changes in [database.md](guidelines/database.md)
4. Add tests in relevant test directories

---

## API Documentation

Interactive API docs auto-generated by FastAPI:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Common Tasks

### Run Backend Tests

```bash
cd backend
pytest tests/unit -v --cov=app
```

### Run Frontend Tests

```bash
cd frontend
npm test -- --coverage
```

### Run E2E Tests

```bash
npx playwright test
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head
```

### Deploy to Staging

```bash
docker-compose -f docker-compose.staging.yml up -d
```

---

## Troubleshooting

### TimescaleDB Connection Issues

```bash
# Check TimescaleDB status
docker exec quantflow_postgres psql -U postgres -d quantflow -c "\dx"

# Should show timescaledb extension
```

### Redis Cache Issues

```bash
# Clear Redis cache
docker exec quantflow_redis redis-cli FLUSHALL
```

### Qdrant Vector DB Issues

```bash
# Check Qdrant health
curl http://localhost:6333/health
```

---

## Contributing

1. Follow the implementation guides in [.github/instructions/](./github/instructions/)
2. Update relevant docs when making changes
3. Ensure all tests pass before submitting PR
4. Update [tasks.md](guidelines/tasks.md) with progress

---

## References

- **Vietnam Stock Exchange**: https://www.hsx.vn
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Flow**: https://reactflow.dev
- **TimescaleDB Docs**: https://docs.timescale.com
- **OpenAI GPT-4o**: https://platform.openai.com/docs

---

## License

Proprietary - All rights reserved
