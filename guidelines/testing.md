# Testing Strategy - QuantFlow

## Overview

Comprehensive testing approach covering unit tests, integration tests, and end-to-end scenarios. All tests should be deterministic and use mock/fixture data.

---

## Unit Tests

### Backend Unit Tests (Python)

**Location**: `backend/tests/unit/`

#### 1. Market Data Ingestion Tests

```python
# tests/unit/test_dnse_client.py

def test_dnse_websocket_connection():
    """Verify WebSocket connection to DNSE."""
    client = DNSEClient(sandbox=True)
    assert client.connected == True

def test_dnse_data_parsing():
    """Verify tick data parsing from raw DNSE message."""
    raw_msg = {"symbol": "HPG", "price": 1000, "volume": 1000}
    parsed = DNSEClient.parse_tick(raw_msg)
    assert parsed.symbol == "HPG"
    assert parsed.price == 1000.0

def test_dnse_batch_insert():
    """Verify batch insertion into TimescaleDB."""
    ticks = [
        Tick(symbol="HPG", open=1000, high=1010, low=990, close=1005, volume=1000),
        Tick(symbol="VCB", open=200, high=210, low=190, close=205, volume=500),
    ]
    result = insert_ticks_batch(ticks)
    assert result.row_count == 2
```

**Coverage**: Data parsing, connection handling, batch operations.

---

#### 2. Authentication & Security Tests

```python
# tests/unit/test_auth.py

def test_jwt_token_generation():
    """Verify JWT token creation."""
    token = create_jwt_token(user_id="usr_01")
    decoded = decode_jwt_token(token)
    assert decoded["user_id"] == "usr_01"

def test_fernet_encryption():
    """Verify broker token encryption."""
    plaintext = "dnse_token_secret_12345"
    encrypted = encrypt_token(plaintext)
    decrypted = decrypt_token(encrypted)
    assert decrypted == plaintext

def test_password_hashing():
    """Verify password hashing is non-reversible."""
    password = "SecurePassword123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed) == True
    assert verify_password("WrongPassword", hashed) == False
```

**Coverage**: JWT generation, encryption, password hashing.

---

#### 3. Workflow Engine Tests

```python
# tests/unit/test_workflow_engine.py

def test_workflow_graph_validation():
    """Verify workflow JSON graph validation."""
    valid_graph = {
        "nodes": [
            {"id": "1", "type": "trigger", "config": {"cron": "* * * * *"}},
            {"id": "2", "type": "data", "config": {"symbol": "HPG"}},
            {"id": "3", "type": "action", "config": {"action": "buy"}}
        ],
        "edges": [{"source": "1", "target": "2"}, {"source": "2", "target": "3"}]
    }
    assert validate_workflow_graph(valid_graph) == True

def test_workflow_topological_sort():
    """Verify execution order is correct."""
    graph_json = {...}  # Valid workflow
    execution_order = get_execution_order(graph_json)
    assert execution_order == [node1, node2, node3]

def test_logic_node_evaluation():
    """Verify logic node operator evaluation."""
    node = LogicNode(operator="lt", threshold=30)
    assert node.execute({"input_value": 20}) == True
    assert node.execute({"input_value": 40}) == False
```

**Coverage**: Graph validation, execution order, node logic.

---

#### 4. AI Agent & Memory Tests

```python
# tests/unit/test_mem0_agent.py

def test_mem0_context_storage():
    """Verify memory is stored in Mem0."""
    agent = AuditorAgent(user_id="usr_01")
    memory_text = "HPG has high inventory risk"
    agent.store_memory(memory_text)
    
    # Verify storage by retrieval
    retrieved = agent.retrieve_memory("inventory risk")
    assert memory_text in retrieved

def test_mem0_context_injection():
    """Verify context is injected into LLM prompt."""
    agent = AuditorAgent(user_id="usr_01")
    agent.store_memory("Previous analysis: HPG inventory declining")
    
    prompt = agent.build_audit_prompt("HPG")
    assert "inventory declining" in prompt

def test_lm_audit_response():
    """Verify audit analysis with mocked LLM."""
    mock_openai = Mock(return_value={"choices": [{"text": "Inventory risk mitigated."}]})
    agent = AuditorAgent(llm=mock_openai)
    result = agent.audit("HPG", report_text="...")
    assert "mitigated" in result
```

**Coverage**: Memory storage/retrieval, prompt construction, LLM integration.

---

#### 5. Value Chain Analysis Tests

```python
# tests/unit/test_value_chain.py

def test_lead_lag_optimization():
    """Verify lead-lag analysis with synthetic data."""
    source_prices = [100, 101, 102, 103, 104]
    target_prices = [100, 100, 101, 102, 103]  # 2-day lag
    
    optimal_lag = optimize_lead_lag(source_prices, target_prices)
    assert optimal_lag == 2

def test_graph_traversal():
    """Verify value chain graph traversal."""
    graph = get_value_chain_graph("HPG")
    upstream = get_upstream_nodes(graph, "HPG")
    downstream = get_downstream_nodes(graph, "HPG")
    
    assert "Iron Ore" in upstream
    assert "CTD" in downstream
```

**Coverage**: Lead-lag calculation, graph traversal.

---

### Frontend Unit Tests (React/TypeScript)

**Location**: `frontend/tests/unit/`

#### 1. React Components

```typescript
// tests/unit/Dashboard.test.tsx

describe("MarketSnapshotDashboard", () => {
  it("renders market data correctly", () => {
    const mockData = {
      vn_index: 1200.5,
      dxy: 105.2,
      foreign_net_flow: 50000000,
    };
    const { getByText } = render(<Dashboard data={mockData} />);
    expect(getByText("1200.5")).toBeInTheDocument();
  });

  it("handles WebSocket updates", async () => {
    const { getByText } = render(<Dashboard />);
    // Simulate WebSocket message
    fireEvent.message(window, {
      data: JSON.stringify({ vn_index: 1210 }),
    });
    expect(getByText("1210")).toBeInTheDocument();
  });
});
```

---

#### 2. React Flow Canvas Tests

```typescript
// tests/unit/WorkflowCanvas.test.tsx

describe("WorkflowCanvas", () => {
  it("renders nodes and edges", () => {
    const nodes = [
      { id: "1", data: { label: "Trigger" }, position: { x: 0, y: 0 } },
    ];
    const { getByText } = render(<WorkflowCanvas nodes={nodes} />);
    expect(getByText("Trigger")).toBeInTheDocument();
  });

  it("serializes graph to JSON on save", async () => {
    const { getByRole } = render(<WorkflowCanvas />);
    const saveBtn = getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);
    
    expect(mockSaveWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: expect.any(Array) })
    );
  });
});
```

---

## Integration Tests

### Backend API Integration Tests

**Location**: `backend/tests/integration/`

#### 1. Market Data Pipeline

```python
# tests/integration/test_market_data_pipeline.py

@pytest.fixture
def db():
    """Create test database."""
    setup_test_db()
    yield
    teardown_test_db()

def test_dnse_to_timescaledb_pipeline(db):
    """Integration test: DNSE → Processing → TimescaleDB."""
    # Mock DNSE WebSocket
    with mock_dnse_websocket():
        client = DNSEClient(sandbox=True)
        
        # Simulate tick ingestion
        ticks = [create_test_tick() for _ in range(100)]
        inserted = batch_insert_market_candles(ticks)
        
        # Verify data persisted
        stored_ticks = fetch_market_candles("HPG", time_range="1h")
        assert len(stored_ticks) == 100
        
        # Verify continuous aggregate updated
        hourly_candles = fetch_hourly_candles("HPG")
        assert len(hourly_candles) > 0
```

**Coverage**: Full data ingestion pipeline, database persistence, aggregations.

---

#### 2. Workflow Execution Integration

```python
# tests/integration/test_workflow_execution.py

def test_workflow_execution_end_to_end(db):
    """Integration test: User creates workflow → System executes."""
    user = create_test_user()
    workflow_json = {
        "nodes": [
            {"id": "t1", "type": "trigger", "config": {"cron": "* * * * *"}},
            {"id": "d1", "type": "data", "config": {"symbol": "HPG", "metric": "rsi", "period": 14}},
            {"id": "l1", "type": "logic", "config": {"operator": "lt", "threshold": 30}},
            {"id": "a1", "type": "action", "config": {"action": "buy", "volume": 100}},
        ],
        "edges": [
            {"source": "t1", "target": "d1"},
            {"source": "d1", "target": "l1"},
            {"source": "l1", "target": "a1"},
        ]
    }
    
    workflow = save_workflow(user_id=user.id, graph=workflow_json)
    
    # Execute workflow
    engine = WorkflowEngine(workflow)
    result = engine.execute()
    
    assert result.status == "success"
    assert result.action_id is not None
    
    # Verify execution log created
    logs = get_workflow_execution_logs(workflow.id)
    assert len(logs) == 1
```

**Coverage**: Full workflow lifecycle.

---

#### 3. AI Agent Integration

```python
# tests/integration/test_agent_audit.py

def test_agent_audit_with_mem0(db):
    """Integration test: AI Agent audits report with Mem0 context."""
    user = create_test_user()
    
    # Store initial memory
    agent = AuditorAgent(user_id=user.id)
    agent.store_memory("HPG has declining inventory trends")
    
    # Perform audit
    report_text = load_test_report("HPG_Q3_2025.pdf")
    audit_result = agent.audit("HPG", report_text=report_text)
    
    # Verify context was used
    assert "inventory" in audit_result["analysis"].lower()
    
    # Verify new insights stored in Mem0
    memories = agent.retrieve_memory("HPG")
    assert len(memories) > 1  # Original + new insight
```

**Coverage**: Mem0 integration, LLM processing, memory persistence.

---

### Frontend Integration Tests

**Location**: `frontend/tests/integration/`

#### 1. Dashboard Data Flow

```typescript
// tests/integration/Dashboard.integration.test.tsx

describe("Dashboard Integration", () => {
  it("fetches and displays market snapshot", async () => {
    // Mock API endpoint
    mockFetch("GET", "/api/market/snapshot", {
      vn_index: 1200,
      dxy: 105,
    });

    const { getByText } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(getByText("1200")).toBeInTheDocument();
    });
  });

  it("updates in real-time via WebSocket", async () => {
    mockFetch("GET", "/api/market/snapshot", { vn_index: 1200 });
    const { getByText } = render(<Dashboard />);

    // Simulate WebSocket message
    await act(async () => {
      simulateWebSocketMessage({ vn_index: 1250 });
    });

    expect(getByText("1250")).toBeInTheDocument();
  });
});
```

---

#### 2. Workflow Builder Integration

```typescript
// tests/integration/WorkflowBuilder.integration.test.tsx

describe("Workflow Builder Integration", () => {
  it("creates and saves workflow end-to-end", async () => {
    const { getByRole, getByLabelText } = render(<WorkflowBuilder />);
    
    // Add nodes via UI
    fireEvent.click(getByRole("button", { name: /add trigger/i }));
    fireEvent.click(getByRole("button", { name: /add data/i }));
    fireEvent.click(getByRole("button", { name: /add action/i }));
    
    // Configure nodes
    fireEvent.change(getByLabelText(/symbol/i), { target: { value: "HPG" } });
    
    // Save workflow
    fireEvent.click(getByRole("button", { name: /save/i }));
    
    await waitFor(() => {
      expect(mockSaveWorkflow).toHaveBeenCalled();
    });
  });
});
```

---

## End-to-End (E2E) Tests

**Location**: `e2e/tests/`

**Framework**: Playwright or Cypress

```typescript
// e2e/tests/user_workflow.e2e.ts

import { test, expect } from '@playwright/test';

test("User creates and executes trading strategy", async ({ page }) => {
  // Login
  await page.goto("http://localhost:3000");
  await page.fill("input[name=email]", "test@example.com");
  await page.fill("input[name=password]", "password123");
  await page.click("button:has-text('Login')");
  
  // Navigate to strategy builder
  await page.click("a:has-text('Strategy Builder')");
  
  // Add nodes
  await page.click("button[data-action='add-trigger']");
  await page.click("button[data-action='add-data']");
  await page.click("button[data-action='add-logic']");
  await page.click("button[data-action='add-action']");
  
  // Configure trigger (every 15 minutes)
  await page.fill("input[name='trigger-cron']", "*/15 * * * *");
  
  // Configure data node
  await page.fill("input[name='data-symbol']", "HPG");
  await page.selectOption("select[name='data-metric']", "RSI");
  
  // Configure logic (RSI < 30)
  await page.selectOption("select[name='logic-operator']", "lt");
  await page.fill("input[name='logic-threshold']", "30");
  
  // Configure action (Buy 100 shares)
  await page.selectOption("select[name='action-type']", "buy");
  await page.fill("input[name='action-volume']", "100");
  
  // Save workflow
  await page.click("button:has-text('Save Workflow')");
  expect(page.url()).toContain("strategy");
  
  // Execute workflow (test mode)
  await page.click("button:has-text('Execute')");
  
  // Verify execution logs
  await page.goto("http://localhost:3000/workflows/logs");
  expect(page.locator("text=Execution Successful")).toBeVisible();
});
```

---

## Test Data & Fixtures

**Location**: `tests/fixtures/`

```python
# tests/fixtures/market_data.py

@pytest.fixture
def sample_market_ticks():
    """Sample tick data for testing."""
    return [
        Tick(symbol="HPG", time=..., price=1000, volume=1000),
        Tick(symbol="HPG", time=..., price=1005, volume=1200),
    ]

@pytest.fixture
def sample_workflow_json():
    """Sample workflow for testing."""
    return {
        "nodes": [...],
        "edges": [...]
    }

@pytest.fixture
def test_user(db):
    """Create test user."""
    return User.create(email="test@example.com", password_hash="...")
```

---

## Continuous Integration (CI)

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r requirements-test.txt
      - run: pytest backend/tests/ --cov=backend --cov-report=xml
      - uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: docker-compose up -d
      - run: npx playwright test
```

---

## Coverage Goals

- **Backend**: ≥ 80% code coverage
- **Frontend**: ≥ 75% component coverage
- **Critical Paths**: 100% coverage for auth, payment, data handling

---

## Running Tests Locally

```bash
# Backend unit tests
pytest backend/tests/unit -v

# Backend integration tests
pytest backend/tests/integration -v

# Frontend tests
npm test

# E2E tests
npx playwright test

# Full test suite with coverage
pytest --cov=backend --cov-report=html && npm test -- --coverage
```
