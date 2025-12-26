# Implementation Roadmap & Task Breakdown - QuantFlow

## Overview

This document outlines the phased implementation roadmap, broken down into 3-day sprints. **Agents should update task progress and completion status in this document**.

---

## Phase 0: Infrastructure Setup (Completed)

### Objective
Establish development environment, CI/CD pipeline, and project structure.

### Task 0.1: Backend Infrastructure
**Status**: ✅ Completed

**Deliverables**:
- ✅ Python backend with UV package manager
- ✅ FastAPI application structure
- ✅ pytest, flake8, black configuration
- ✅ Docker configuration for backend
- ✅ Unit and integration tests

**Notes**: Backend is fully configured with modern Python tooling. Mock tests implemented for CI/CD verification.

---

### Task 0.2: Frontend Infrastructure
**Status**: ✅ Completed

**Deliverables**:
- ✅ Vite + React + TypeScript setup
- ✅ TailwindCSS + shadcn-ui ready
- ✅ ESLint, Prettier configuration
- ✅ useSWR for data fetching
- ✅ Vitest for testing
- ✅ Docker configuration for frontend

**Notes**: Frontend using latest packages, yarn for package management. Mock tests implemented.

---

### Task 0.3: Database & Infrastructure
**Status**: ✅ Completed

**Deliverables**:
- ✅ TimescaleDB configuration
- ✅ Database initialization scripts
- ✅ Redis and Qdrant services
- ✅ docker-compose.yml with all services
- ✅ Environment variable configuration

**Notes**: Complete Docker Compose setup with database, backend, frontend, Redis, and Qdrant.

---

### Task 0.4: CI/CD Pipeline
**Status**: ✅ Completed

**Deliverables**:
- ✅ GitHub Actions workflow
- ✅ Backend build and test jobs
- ✅ Frontend build and test jobs
- ✅ Integration tests
- ✅ CI success check step

**Notes**: Complete CI/CD pipeline runs on every push/PR. Tests both backend and frontend.

---

## Phase 1: Foundation & Data Layer (Days 1-9)

### Objective
Establish core infrastructure and data ingestion pipelines.

### Task 1.1 (Days 1-3): Infrastructure Setup
**Status**: ✅ Completed (Phase 0)

**Deliverables**:
- ✅ Configure Docker Compose with services: app (FastAPI), db (TimescaleDB), redis, qdrant
- ✅ Configure pg_hba.conf for secure database access
- ✅ Set up Git repository with pre-commit hooks for linting
- ✅ Document environment setup (`.env.example`)

**Notes**: All infrastructure is ready. Can proceed with feature development.

---

### Task 1.2 (Days 4-6): Market Data Ingestion (DNSE)
**Status**: ✅ Completed

**Deliverables**:
- ✅ Implement Python `DNSEClient` (Migrated to use `vnstock` library)
- ✅ Create background worker (`MarketWorker`) for data polling
- ✅ Batch insert ticks into TimescaleDB
- ✅ Error handling and reconnection logic

**Notes**:
- Migrated from raw DNSE WebSocket to `vnstock` library for easier maintenance and API compatibility.
- Implemented `VNStockService` to abstract `vnstock` usage.
- Used polling mechanism as `vnstock` (free tier/public) does not support WebSocket streaming for all data types or is limited.

---

### Task 1.3 (Days 7-9): Authentication & Security
**Status**: ⬜ Not Started

**Deliverables**:
- Implement OAuth2 with Password Flow in FastAPI
- Create Fernet encryption utility for broker API tokens
- Validate "Place Order" API connection with sandbox account
- JWT token implementation and validation

**Notes**:

---

## Phase 2: Visual Layer & Market Intelligence (Days 10-18)

### Objective
Build frontend visualization tools.

### Task 2.1 (Days 10-12): Big Picture Dashboard
**Status**: ⬜ Not Started

**Deliverables**:
- React layout with responsive grid
- Implement `GET /market/snapshot` endpoint
- Integrate react-grid-layout for widgets
- Real-time index updates via Redis

**Notes**:

---

### Task 2.2 (Days 13-15): Recursive Heatmap
**Status**: ⬜ Not Started

**Deliverables**:
- Implement D3.js Treemap component
- Backend aggregation query for sector market cap
- "Click-to-Zoom" transition logic
- Sector/Industry/Ticker drill-down

**Notes**:

---

### Task 2.3 (Days 16-18): TradingView Integration
**Status**: ⬜ Not Started

**Deliverables**:
- Integrate tradingview-widget library
- Implement UDF Adapter: `GET /market/history`
- TimescaleDB query translation to TradingView format
- Support for multiple chart resolutions (1D, 1H, 15m)

**Notes**:

---

## Phase 3: Value Chain & AI Engine (Days 19-27)

### Objective
Implement advanced analytic engines and AI memory system.

### Task 3.1 (Days 19-21): Value Chain Graph
**Status**: ⬜ Not Started

**Deliverables**:
- Define ValueChain database schema
- Populate initial data for key sectors (Steel, Banking)
- Implement React visualization using react-force-graph
- Graph traversal and query endpoints

**Notes**:

---

### Task 3.2 (Days 22-24): Mem0 & Agent Core
**Status**: ⬜ Not Started

**Deliverables**:
- Set up Mem0 client and Qdrant integration
- Implement `AuditorAgent` class in Python
- Test RAG pipeline: PDF ingestion → embedding → retrieval
- Verify memory persistence and context injection

**Notes**:

---

### Task 3.3 (Days 25-27): Lead-Lag Analysis Model
**Status**: ⬜ Not Started

**Deliverables**:
- Implement XGBoost training pipeline
- Create lead-lag optimization endpoint
- Test with 3+ years of historical data
- Generate correlation visualizations

**Notes**:

---

## Phase 4: Low-Code Strategy Orchestrator (Days 28-36)

### Objective
Build drag-and-drop strategy builder and execution engine.

### Task 4.1 (Days 28-30): Workflow Canvas (Frontend)
**Status**: ⬜ Not Started

**Deliverables**:
- Implement React Flow canvas
- Custom node components: TriggerNode, DataNode, LogicNode, ActionNode
- Configuration panels in sidebar
- Graph-to-JSON serialization

**Notes**:

---

### Task 4.2 (Days 31-33): Execution Engine (Backend)
**Status**: ⬜ Not Started

**Deliverables**:
- Implement `WorkflowEngine` class
- Graph parsing and topological sort (networkx)
- Execute methods for all node types
- Async execution support
- **Integrate `pandas-ta` for technical analysis strategy blocks**

**Notes**:
- Use `pandas-ta` library to simplify indicator calculations as requested by user.

---

### Task 4.3 (Days 34-36): Integration & Testing
**Status**: ⬜ Not Started

**Deliverables**:
- Connect ActionNode to DNSEClient
- End-to-end test: Create strategy → Trigger → Verify order (Sandbox)
- Generate execution logs
- Sandbox trading verification

**Notes**:

---

## Status Legend

- ⬜ Not Started
- 🔵 In Progress
- ✅ Completed
- 🔴 Blocked

---

## Progress Notes

*Record any blockers, decisions, or important milestones here.*
