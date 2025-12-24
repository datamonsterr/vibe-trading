# System Architecture - QuantFlow

## High-Level Overview

QuantFlow is a Hybrid Neuro-Symbolic trading platform:

- **Symbolic Layer**: Deterministic DAG-based workflow engine for rule-based strategies
- **Neural Layer**: LLM-powered AI agents for financial analysis and insights

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ Market Dashboard │  │ Heatmap Viz      │  │ Workflow     │   │
│  │                  │  │                  │  │ Canvas       │   │
│  └──────┬───────────┘  └────────┬─────────┘  └──────┬───────┘   │
└─────────┼──────────────────────┼────────────────────┼────────────┘
          │                      │                    │
       HTTPS/WSS                 │                  JSON Graph
          │                      │                    │
┌─────────▼──────────────────────▼────────────────────▼────────────┐
│                    FastAPI Backend (Python)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ Market Service   │  │ Workflow Engine  │  │ Agent Service│   │
│  │ (DNSE, Redis)    │  │ (Executor)       │  │ (Mem0, LLM)  │   │
│  └────────┬─────────┘  └─────────┬────────┘  └──────┬───────┘   │
└───────────┼──────────────────────┼────────────────────┼───────────┘
            │                      │                    │
    ┌───────┴────────┐      ┌──────┴───────┐      ┌────┴─────┐
    │                │      │              │      │          │
┌───▼─────┐  ┌──────▼───┐  │  ┌────────┐  │  ┌──▼─────┐  ┌─▼───┐
│TimescaleDB PostgreSQL │  │  │Qdrant  │  │  │Mem0    │  │Redis│
│(OHLCV)  │(App Data)  │  │  │(Vector)│  │  │(Memory)│  │Cache│
└──────────┴────────────┘  │  └────────┘  │  └────────┘  └─────┘
                           │              │
                    ┌──────┴──────────────┴──────┐
                    │   Data Persistence Layer   │
                    └────────────────────────────┘
```

---

## Core Components

### 1. Frontend (React.js + React Flow)

**Responsibilities**:
- User authentication & session management
- Display market data, heatmaps, charts
- Workflow canvas for strategy building
- Portfolio management UI
- Real-time updates via WebSocket

**Key Technologies**:
- React 18 + TypeScript
- React Flow for DAG visualization
- TradingView Charting Library
- D3.js for Treemaps
- Tailwind CSS for styling

### 2. Backend API (FastAPI)

**Responsibilities**:
- RESTful API for all frontend operations
- WebSocket server for real-time market updates
- Workflow validation and execution
- User authentication & authorization
- Broker API integration (DNSE)
- AI agent orchestration

**Key Modules**:
- `api/market.py` - Market data endpoints
- `api/workflows.py` - Workflow CRUD
- `api/auth.py` - Authentication
- `api/agent.py` - AI agent endpoints
- `services/workflow_engine.py` - Core execution logic

### 3. Workflow Engine (Python)

**Responsibilities**:
- Parse React Flow JSON graphs
- Validate DAG structure
- Topological sort for execution order
- Execute nodes asynchronously
- Handle node outputs and branching
- Generate execution logs

**Execution Model**:
```python
1. Load workflow JSON from PostgreSQL
2. Construct networkx.DiGraph() in memory
3. Topological sort for execution order
4. Iterate through sorted nodes:
   - Data Node: Query Redis/TimescaleDB
   - Logic Node: Evaluate condition, prune branches
   - Action Node: Call broker API or Mem0
5. Store result in execution_logs table
```

### 4. Market Data Pipeline

**Flow**:
```
DNSE WebSocket → DNSEClient → Batch Processing → TimescaleDB
                                      ↓
                                  Redis Cache
                                      ↓
                                   FastAPI
```

**Responsibilities**:
- Connect to DNSE/Entrade X WebSocket
- Parse incoming tick data
- Batch insert into TimescaleDB (efficient bulk operations)
- Update Redis cache for real-time dashboard
- Publish to Celery tasks for async processing

**Data Volume**:
- ~VN50 = 50 stocks × 10+ ticks/second = 500 ticks/sec peak
- TimescaleDB hypertables auto-partition by 1-week chunks
- Continuous aggregates pre-compute hourly/daily OHLC

### 5. Value Chain Analysis Engine

**Components**:
- **Value Chain Graph**: PostgreSQL tables (nodes, edges)
- **Lead-Lag Optimizer**: XGBoost ML model
- **Graph Visualization**: React Force Graph

**Process** (UC-C3):
```
1. User selects edge: Iron Ore → HPG stock
2. Backend fetches 5 years of daily prices
3. XGBoost trains models for lag t=0 to t=30
4. Identifies optimal t (e.g., 14 days)
5. Frontend displays overlaid price charts
```

### 6. AI Agent Service (Mem0 + GPT-4o)

**Responsibilities**:
- Financial report analysis (BCTC audit)
- Sentiment analysis from news/documents
- Context-aware recommendations
- User preference learning

**Memory Flow**:
```
User Action → Extraction → Embedding → Qdrant Storage
                                ↓
                        (On next analysis)
                        Query Qdrant + Context → GPT-4o
```

### 7. Data Persistence Layer

**TimescaleDB** (Time-series):
- `market_candles` - OHLCV tick data (hypertable, partitioned by 1 week)
- `market_candles_1h` - Continuous aggregate (pre-computed hourly OHLC)
- Indexes on (symbol, time) for fast queries

**PostgreSQL** (Relational):
- `users` - User accounts
- `workflows` - User-defined trading strategies
- `workflow_execution_logs` - Audit trail
- `value_chain_nodes` - Supply chain entities
- `value_chain_edges` - Relationships + correlations
- `portfolio_allocations` - Recommended portfolios

**Qdrant** (Vector Store):
- Collections: `user_memories_{user_id}`
- Stores embeddings of analyses, findings, preferences

**Redis** (Cache):
- `market:snapshot:{type}` - Real-time index values (TTL 60s)
- `ratelimit:{user_id}` - API rate limiting (Token Bucket)

---

## Data Flow by Use Case

### UC-V1: Big Picture Dashboard

```
1. Frontend → GET /market/snapshot
2. Backend queries Redis cache
3. If stale (>1 min), async fetch from DNSE
4. Return JSON snapshot
5. WebSocket listener for real-time updates
6. Frontend receives update, re-render dashboard
```

### UC-S1: Workflow Execution

```
1. Frontend: User builds workflow (React Flow canvas)
2. Frontend: POST /workflows (graph JSON)
3. Backend: Validate JSON + graph structure
4. Backend: Serialize and store in PostgreSQL
5. Trigger: Frontend POST /workflows/{id}/execute
6. Backend WorkflowEngine:
   - Load workflow from PostgreSQL
   - Parse JSON → networkx.DiGraph()
   - Topological sort
   - Execute each node:
     * Data node → query TimescaleDB/Redis
     * Logic node → evaluate condition
     * Action node → call DNSE API
7. Backend: Store result in execution_logs
8. Frontend: Poll GET /workflows/{id}/logs or WebSocket update
```

### UC-S2: AI Financial Audit

```
1. Frontend: POST /agent/audit { symbol: "HPG", report_url: "..." }
2. Backend (async task):
   - Download report PDF
   - Extract text (OCR or text extraction)
   - Retrieve Mem0 context: "Previous findings for HPG"
   - Build prompt: "Context: [memory]. Task: Analyze report"
   - Call OpenAI GPT-4o
   - Parse response → generate audit result
   - Store finding in Mem0/Qdrant
3. Frontend: GET /agent/audit/{task_id} to poll result
```

### UC-C3: Lead-Lag Optimization

```
1. Frontend: User selects edge on value chain
2. Frontend: POST /analysis/lead-lag { source: "Iron Ore", target: "HPG" }
3. Backend (async task):
   - Fetch 5 years of daily closes for both assets
   - Train XGBoost models for t=0 to t=30
   - Identify optimal t with highest R² or IC
   - Return optimal_lag + correlation score
4. Frontend: Display overlaid price chart (source shifted by t)
```

---

## Security & Encryption

### Data at Rest

**Broker Tokens**: Encrypted with Fernet (symmetric encryption)
```python
from cryptography.fernet import Fernet
key = os.getenv("ENCRYPTION_KEY")
cipher = Fernet(key)
encrypted_token = cipher.encrypt(dnse_token.encode())
```

**Passwords**: Hashed with bcrypt (never stored in plaintext)

### Data in Transit

**HTTPS**: All API calls encrypted
**WSS**: WebSocket connections encrypted (WSS protocol)
**JWT**: Stateless authentication with short-lived tokens

### API Security

**Authentication**: OAuth2 with Password Flow (FastAPI)
**Authorization**: Role-based access control (ACT-01, ACT-02, ACT-03, ACT-04)
**Rate Limiting**: Token Bucket via Redis (prevent API abuse)
**Input Validation**: Pydantic schemas on all endpoints

---

## Scalability Considerations

### Current Architecture (Single Instance)

- **Bottleneck**: FastAPI single process
- **Solution**: Use Gunicorn with multiple workers

### For High Volume

**Option 1: Horizontal Scaling**
```yaml
# docker-compose-prod.yml
api:
  image: quantflow-api
  deploy:
    replicas: 4  # 4 FastAPI workers
  environment:
    WORKERS: 4

load-balancer:  # Nginx or AWS ELB
  ...
```

**Option 2: Microservices**
- Separate `workflow-executor` service
- Separate `market-data-ingester` service
- Message queue (RabbitMQ/Kafka) between services

### Database Scaling

**TimescaleDB**:
- ✅ Built for time-series at scale
- Hypertables auto-partition data
- Continuous aggregates prevent re-aggregation

**PostgreSQL Replication**:
- Read replicas for heavy queries
- Streaming replication for HA

---

## Error Handling & Resilience

### WebSocket Reconnection

```python
# Frontend: useWebSocket hook
if (connection_failed) {
  exponential_backoff(attempt);
  reconnect();
}
```

### Broker API Failures

```python
# Backend: DNSEClient retry logic
@retry(max_attempts=3, backoff=exponential)
async def place_order(order):
    return await dnse_client.place_order(order)
```

### Database Connection Pooling

```python
# SQLAlchemy with asyncpg
engine = create_async_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10
)
```

---

## Deployment

### Development

```bash
docker-compose up -d  # All services locally
```

### Staging/Production

```bash
docker-compose -f docker-compose.prod.yml up -d
# Includes: Nginx reverse proxy, multiple API workers, DB replicas
```

### Environment Variables

See `.env.example` for all required variables:
- `POSTGRES_*` - Database credentials
- `DNSE_*` - Broker credentials
- `OPENAI_API_KEY` - LLM integration
- `QDRANT_*` - Vector DB connection
- `REDIS_*` - Cache connection
- `ENCRYPTION_KEY` - Fernet key for token encryption

---

## Monitoring & Logging

**Backend Logs**:
- Level: INFO (data ingestion, workflow starts/ends)
- Level: ERROR (exceptions, API failures)
- Level: DEBUG (development only)

**Frontend Analytics**:
- Page views, click events (optional: Mixpanel/GA)
- Error tracking (optional: Sentry)

**Database Monitoring**:
- Query performance (pg_stat_statements)
- Storage usage (hypertable disk consumption)
- Replication lag (streaming replication)

---

## See Also

- [requirements.md](../guidelines/requirements.md) - Functional requirements
- [database.md](../guidelines/database.md) - Schema details
- [backend.md](.github/instructions/backend.md) - Backend implementation
- [frontend.md](.github/instructions/frontend.md) - Frontend implementation
- [tasks.md](../guidelines/tasks.md) - Implementation phases
