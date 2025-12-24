# Database Schema Design - QuantFlow

## Overview

QuantFlow uses a hybrid database architecture:
- **TimescaleDB** for financial time-series data (high-frequency writes, fast aggregations)
- **PostgreSQL** for relational application data
- **Qdrant** for vector embeddings (AI memory)

---

## TimescaleDB Schema (Financial Time-Series)

### OHLCV Candles Table

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- OHLCV Table for market candles
CREATE TABLE market_candles (
    time        TIMESTAMPTZ       NOT NULL,
    symbol      TEXT              NOT NULL,
    open        DOUBLE PRECISION  NOT NULL,
    high        DOUBLE PRECISION  NOT NULL,
    low         DOUBLE PRECISION  NOT NULL,
    close       DOUBLE PRECISION  NOT NULL,
    volume      BIGINT            NOT NULL,
    UNIQUE (time, symbol)
);

-- Convert to Hypertable (auto-partitioned by 1-week chunks)
SELECT create_hypertable('market_candles', 'time', chunk_time_interval => INTERVAL '1 week');

-- Create indexes for fast queries
CREATE INDEX ON market_candles (symbol, time DESC);
CREATE INDEX ON market_candles (time DESC);
```

**Purpose**: Stores tick data ingested from DNSE. Partitioned by time for efficient data management.

**Fields**:
- `time`: Timestamptz in UTC (timezone-aware)
- `symbol`: Stock ticker (e.g., "HPG", "VCB")
- `open`, `high`, `low`, `close`: Price in VND
- `volume`: Number of shares traded

---

### Continuous Aggregate: 1-Hour Candles

```sql
CREATE MATERIALIZED VIEW market_candles_1h
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    symbol,
    FIRST(open, time) as open,
    MAX(high) as high,
    MIN(low) as low,
    LAST(close, time) as close,
    SUM(volume) as volume
FROM market_candles
GROUP BY bucket, symbol
WITH DATA;
```

**Purpose**: Auto-resamples 1-minute (or tick) data into 1-hour OHLC without re-aggregation on query.

**Benefits**:
- Eliminates need to query millions of rows for chart rendering
- Instant response times for frontend charting

---

## PostgreSQL Schema (Relational Data)

### Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    dnse_client_id  VARCHAR(255) UNIQUE,
    dnse_token      TEXT,  -- Encrypted with Fernet
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships**:
- One user can have many workflows
- One user has one DNSE broker connection

**Security**:
- `dnse_token` must be encrypted at rest using Fernet
- Encryption key stored in environment variables, never in codebase

---

### Workflows Table

```sql
CREATE TABLE workflows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    json_graph      JSONB NOT NULL,  -- React Flow JSON serialization
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX ON workflows (user_id, is_active);
```

**Relationships**:
- Foreign key to users (One user → Many workflows)
- One workflow has many execution logs

**Fields**:
- `json_graph`: Serialized React Flow graph with nodes/edges
- `is_active`: Whether workflow is scheduled or active
- Indexes for fast user lookups

---

### Workflow Execution Logs Table

```sql
CREATE TABLE workflow_execution_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL,  -- 'pending', 'running', 'success', 'failed'
    executed_at     TIMESTAMPTZ DEFAULT NOW(),
    result          JSONB,  -- Execution result and node outputs
    error_message   TEXT,
    duration_ms     INTEGER
);

CREATE INDEX ON workflow_execution_logs (workflow_id, executed_at DESC);
```

**Purpose**: Audit trail for all workflow executions.

---

### Value Chain Nodes Table

```sql
CREATE TABLE value_chain_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20),  -- Stock ticker (nullable for non-stocks)
    name            VARCHAR(255) NOT NULL,
    sector          VARCHAR(255) NOT NULL,  -- ICB Classification
    node_type       VARCHAR(50) NOT NULL,  -- 'Upstream', 'Midstream', 'Downstream'
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON value_chain_nodes (sector, node_type);
CREATE UNIQUE INDEX ON value_chain_nodes (symbol) WHERE symbol IS NOT NULL;
```

**Purpose**: Represents entities in the supply chain (e.g., HPG, Iron Ore Commodity, CTD).

**Fields**:
- `node_type`: Position in value chain
- `sector`: ICB classification or commodity category

---

### Value Chain Edges Table

```sql
CREATE TABLE value_chain_edges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id       UUID NOT NULL REFERENCES value_chain_nodes(id) ON DELETE CASCADE,
    target_id       UUID NOT NULL REFERENCES value_chain_nodes(id) ON DELETE CASCADE,
    relationship    VARCHAR(255),  -- e.g., "supplies", "uses", "sells_to"
    correlation_coeff DOUBLE PRECISION,  -- Beta coefficient (-1 to 1)
    lead_time_days  INTEGER,  -- Optimal lag in days
    weight          DOUBLE PRECISION,  -- Visualization weight
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON value_chain_edges (source_id, target_id);
CREATE INDEX ON value_chain_edges (source_id);
CREATE INDEX ON value_chain_edges (target_id);
```

**Purpose**: Defines directional relationships between value chain nodes.

**Relationships**:
- source_id → target_id (directed edge)
- Examples: HPG ←supplies← Iron Ore, HPG →sells_to→ CTD

**Fields**:
- `correlation_coeff`: Statistical correlation between source and target price movements
- `lead_time_days`: Optimal t-value from lead-lag analysis
- `weight`: Relative importance for visualization (edge thickness)

---

### Portfolio Allocations Table

```sql
CREATE TABLE portfolio_allocations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    allocation_pct  DOUBLE PRECISION NOT NULL,  -- 0-100%
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX ON portfolio_allocations (user_id);
```

**Purpose**: Stores recommended portfolio allocations from UC-I1 (Portfolio Generation).

---

## Qdrant Vector Store

### Memory Collections

**Collection**: `user_memories_{user_id}`

**Vector Dimension**: 1536 (OpenAI Ada embedding size)

**Payload Structure**:
```json
{
    "user_id": "usr_01",
    "memory_type": "audit_finding|preference|analysis",
    "company": "HPG",
    "timestamp": "2025-12-24T10:00:00Z",
    "content": "Previous audit found high inventory risk due to falling steel prices",
    "embedding": [0.123, 0.456, ...]
}
```

**Purpose**: Persistent storage of AI analysis and user preferences for Mem0 integration.

---

## Redis Cache

### Real-time Market Data

**Key Format**: `market:snapshot:{market_type}`

**TTL**: 60 seconds

**Payload**:
```json
{
    "vn_index": 1200.5,
    "dxy": 105.2,
    "foreign_net_flow": 50000000,
    "market_liquidity": 1000000000,
    "timestamp": "2025-12-24T10:00:00Z"
}
```

**Purpose**: Fast cache for market snapshot queries to reduce DB load.

---

## Data Integrity & Constraints

1. **Foreign Key Relationships**: All FK constraints use `ON DELETE CASCADE` for users and workflows
2. **Unique Constraints**: User email, user+workflow name pairs
3. **Check Constraints**: 
   - `allocation_pct` between 0 and 100
   - `correlation_coeff` between -1 and 1
4. **NOT NULL Constraints**: All critical fields enforced

---

## Migration Strategy

1. Initialize TimescaleDB extension on database creation
2. Create hypertables first (before application startup)
3. Create continuous aggregates with materialized views
4. Set up indexes after table creation for performance

---

## UTC Timezone Convention

**CRITICAL**: All timestamps stored in UTC (TIMESTAMPTZ).

**Conversion happens at**:
- API response layer (convert to Asia/Ho_Chi_Minh, GMT+7)
- Frontend component rendering
- Never in database queries to maintain consistency

**Example Python**:
```python
from datetime import datetime
from pytz import timezone

# Store in UTC
utc_time = datetime.now(timezone('UTC'))

# Convert for display
hcm_tz = timezone('Asia/Ho_Chi_Minh')
display_time = utc_time.astimezone(hcm_tz)
```

---

## Financial Precision

Use `DOUBLE PRECISION` for OHLC prices and `Decimal` in Python code for calculations to avoid floating-point precision errors in order sizing.
