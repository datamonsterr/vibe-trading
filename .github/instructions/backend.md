# Backend Implementation Guide - QuantFlow

## Tech Stack Summary

**Framework**: FastAPI (async Python)  
**Database**: PostgreSQL + TimescaleDB (time-series)  
**Vector Store**: Qdrant (AI memory)  
**Cache**: Redis  
**AI**: OpenAI GPT-4o + Mem0 library  
**Task Queue**: Celery (optional)

---

## Architecture Principles

### 1. Async-First Design
Use FastAPI's `async`/`await` throughout. All DB operations must be non-blocking (asyncpg for PostgreSQL, async Redis client).

### 2. Layered Architecture
```
API Routes (FastAPI) 
    ↓
Services (Business Logic)
    ↓
Data Access Layer (SQLAlchemy ORM)
    ↓
Databases (PostgreSQL, TimescaleDB, Redis, Qdrant)
```

### 3. Workflow Engine is Stateless
The execution engine parses React Flow JSON and runs deterministically. No persistent state between cycles except via Mem0 or explicit persistence.

### 4. Security First
- Encrypt broker tokens at rest (Fernet)
- Use JWT for API authentication
- Validate all workflow JSON inputs
- Rate-limit API endpoints (Token Bucket via Redis)

---

## Project Layout

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── api/
│   │   ├── market.py          # Market data endpoints
│   │   ├── workflows.py       # Workflow CRUD endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   └── agent.py           # AI agent endpoints
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic request/response models
│   ├── services/
│   │   ├── workflow_engine.py # Core execution logic
│   │   ├── market_service.py  # Market data service
│   │   ├── auth_service.py    # Auth logic
│   │   └── agent_service.py   # AI agent service
│   ├── agents/
│   │   ├── auditor.py         # Financial auditor agent
│   │   └── base_agent.py      # Base agent class
│   ├── db/
│   │   ├── database.py        # SQLAlchemy setup
│   │   └── redis.py           # Redis client setup
│   └── utils/
│       ├── security.py        # Encryption, hashing
│       └── validators.py      # Input validation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── migrations/                # Alembic migrations
├── requirements.txt
└── .env.example
```

---

## Key Development Tasks

### 1. Workflow Engine (Core)
**File**: `app/services/workflow_engine.py`

**Requirements**:
- Parse React Flow JSON (nodes + edges)
- Validate DAG (no cycles, connected nodes)
- Topological sort for execution order
- Execute nodes asynchronously
- Prune branches on False logic conditions

**Example Execution Flow**:
```
Trigger(cron) → Data(RSI=25) → Logic(RSI<30?=True) → Action(BUY)
```

---

### 2. API Endpoints
**Key Routes**:
- `POST /auth/token` - JWT token generation
- `GET /market/snapshot` - Real-time market state
- `GET /market/history` - TradingView UDF format
- `POST /workflows` - Create workflow
- `POST /workflows/{id}/execute` - Manual execution
- `POST /agent/audit` - Trigger AI audit

---

### 3. Database Integration
- Use SQLAlchemy async sessions
- Use `asyncpg` for PostgreSQL connection pooling
- Create indexes for common queries (user_id, symbol, time)
- Handle timezone conversions in UTC

---

## Code Standards

**Type Hints**: Mandatory for all functions
```python
async def get_market_snapshot(symbol: str) -> MarketSnapshot:
    pass
```

**Error Handling**: Use FastAPI exceptions
```python
from fastapi import HTTPException
raise HTTPException(status_code=404, detail="Workflow not found")
```

**Decimal Arithmetic**: Always use `Decimal` for financial values
```python
from decimal import Decimal
price = Decimal("1000.50")  # NOT float(1000.50)
```

**Logging**: Use Python's logging module
```python
import logging
logger = logging.getLogger(__name__)
logger.info(f"Executing workflow {workflow_id}")
```

---

## Security Checklist

- [ ] All broker tokens encrypted with Fernet
- [ ] JWT tokens have short TTL (15 min) + refresh tokens
- [ ] Rate limiting implemented for broker API calls
- [ ] All inputs validated via Pydantic schemas
- [ ] SQL injection prevented (use ORM only)
- [ ] CORS configured properly
- [ ] Secrets stored in environment variables, never in code

---

## Testing Requirements

Every new feature must have:
- Unit tests (mocked dependencies)
- Integration test (real DB/services)
- Example in tests/fixtures/ for test data

Run: `pytest backend/tests/ -v --cov=app`

---

## Common Patterns

### 1. Async Database Query
```python
async with db.SessionLocal() as session:
    result = await session.execute(
        select(MarketCandle).where(MarketCandle.symbol == "HPG")
    )
    return result.scalars().all()
```

### 2. WebSocket Real-Time Updates
```python
@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for update in market_stream:
        await websocket.send_json(update)
```

### 3. Background Task (Celery)
```python
from celery import shared_task

@shared_task
def audit_financial_report(user_id: str, symbol: str):
    agent = AuditorAgent(user_id=user_id)
    return agent.audit(symbol)
```

---

## See Also

- [requirements.md](../../guidelines/requirements.md) - Full SRS
- [database.md](../../guidelines/database.md) - Schema details
- [testing.md](../../guidelines/testing.md) - Test examples
- [behavior.md](./behavior.md) - Best practices & workflow
