# Software Requirement Specification (SRS) - QuantFlow

## Executive Summary

QuantFlow is a next-generation Algorithmic Trading and Financial Intelligence platform specifically architected for the Vietnam Stock Market (VN50/VN100). It unifies Macro-level Market Intelligence, Micro-level Value Chain Analysis, and Agentic Automation into a cohesive, low-code ecosystem.

### Strategic Engineering Objectives

1. **Democratization of Quantitative Finance**: Enable non-coders to build sophisticated trading algorithms via a visual node-based interface (React Flow).
2. **Persistent Agentic Memory**: Create AI agents that "remember" previous analyses, user risk profiles, and company inventory issues (e.g., HPG's steel inventory cycles).
3. **High-Fidelity Simulation & Execution**: Integrate real-time market data with high-performance time-series storage for accurate backtesting and low-latency live execution.
4. **Value Chain Visibility**: Model upstream/downstream dependencies to predict price impacts using Lead-Lag optimization.

---

## 2. Actors and User Roles

| Actor ID | Actor Name | Role Definition | Access Privileges |
|----------|-----------|-----------------|-------------------|
| ACT-01 | Retail Trader (Basic) | Individual investor using platform for manual analysis and price alerts | Read-only access to Market Intelligence dashboards |
| ACT-02 | Algo-Trader (Pro) | Advanced user building custom automated workflows and executing trades | Full access to Strategy Orchestrator, Backtesting, Broker API |
| ACT-03 | System Admin | Platform maintainer responsible for infrastructure and user management | Root access to all modules, logs, databases |
| ACT-04 | AI Agent (System) | Automated background process for financial auditing and scheduled workflows | Internal system actor triggered by time/event triggers |

---

## 3. Functional Domains

### Domain A: Market Intelligence & Big Picture Visualization

#### UC-V1: Vietnam Market "Big Picture" Dashboard
**Description**: Real-time executive dashboard visualizing VN-Index health relative to global macro indicators.

**Data Requirements**:
| Field | Type | Source | Update Frequency |
|-------|------|--------|------------------|
| vn_index_value | Float | DNSE API (WebSocket) | Real-time (Tick) |
| dxy_value | Float | External Macro API | 15 minutes |
| foreign_net_flow | Float | DNSE API | Real-time |
| market_liquidity | Float | DNSE API | Real-time |
| correlation_coeff | Float | Internal Calculation | Daily |

**Key Requirements**:
- Render latency < 200ms
- WebSocket connection for real-time updates
- Cache handling with stale data indicators
- Background async refresh via Celery/FastAPI

#### UC-V2: Recursive Industry Heatmap
**Description**: Hierarchical visualization with drill-down from Sector → Industry → Ticker using Treemap (tile size = Market Cap, color = Price Change %).

---

### Domain B: Value Chain Analysis Engine

#### UC-C1: Visual Value Chain Mapper
**Description**: Interactive directed graph showing Upstream (suppliers), Midstream (producers), and Downstream (consumers) relationships.

**Requirements**:
- Graph query with recursive traversal
- Edge weighting based on correlation coefficient (β)
- Real-time visualization with hover tooltips

#### UC-C3: Time Lag Optimization
**Description**: ML-based process to determine optimal lead-lag delay (t) for price reflection using XGBoost/LSTM.

**Requirements**:
- 3+ years of daily OHLC data for backtesting
- Test lag variables t from 0 to 30 days
- Optimize for R-squared or Information Coefficient
- Visual verification with overlaid charts

---

### Domain C: Smart Investment Advisor

#### UC-I1: Personalized Portfolio Generation
**Description**: Wizard-based module transforming user constraints and goals into optimized portfolios using Mean-Variance Optimization (MVO) or Black-Litterman models.

**Input Parameters**:
- risk_tolerance (Low/Medium/High)
- initial_capital
- financial_goal
- time_horizon
- sector_interests

**Output**:
- Suggested allocation percentages
- Probability of achieving goal
- Projected growth chart

---

### Domain D: Low-code Strategy Orchestrator

#### UC-S1: Workflow Construction & Validation
**Description**: Users build automated trading algorithms by dragging and connecting nodes (Trigger, Data, Logic, Action).

**Node Types**:
| Node Type | Config | Inputs | Outputs |
|-----------|--------|--------|---------|
| Trigger | cron_expression | None | Signal |
| Data | symbol, metric, period | Signal | Float/Series |
| Logic | operator, threshold | Float | Boolean |
| Action | action, volume, order_type | Boolean | Order ID |

**Requirements**:
- Graph validation (no disconnected/cyclic nodes)
- JSON serialization for persistence
- Low-latency execution (no Airflow)

#### UC-S2: AI-Driven Financial Auditing
**Description**: Context-aware AI analysis of financial reports using Mem0 for historical context.

**Process**:
1. Trigger AI Node for "Audit BCTC" (financial report)
2. Retrieve report text content
3. Query Mem0 for previous audit findings
4. Inject context into LLM prompt
5. Process with GPT-4o
6. Store new insights in Mem0/Qdrant

---

## 4. Data Specifications

All time-series data stored in **UTC**. Conversion to Asia/Ho_Chi_Minh (GMT+7) at API response/Frontend layer.

**Financial Calculations**: Use Python's `Decimal` type, not `float`, to avoid precision errors in order sizing.

**Security**:
- Broker access tokens encrypted at rest using Fernet
- Token Bucket algorithm for API rate limiting
- Never store credentials in codebase
