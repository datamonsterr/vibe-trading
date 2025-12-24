# Documentation Index - QuantFlow

## Quick Links

| File | Purpose | Read First? |
|------|---------|------------|
| [README.md](README.md) | Overview, prerequisites, quick start | ✅ YES |
| [guidelines/architecture.md](guidelines/architecture.md) | System architecture & data flows | ✅ YES |
| [guidelines/requirements.md](guidelines/requirements.md) | SRS, use cases, functional requirements | 📖 Before coding |
| [guidelines/database.md](guidelines/database.md) | Schema design, tables, relationships | 📖 Before database work |
| [guidelines/tasks.md](guidelines/tasks.md) | Implementation roadmap, progress tracking | 📋 Update as you work |
| [guidelines/testing.md](guidelines/testing.md) | Testing strategy, unit/integration examples | 🧪 While testing |
| [.github/instructions/behavior.md](.github/instructions/behavior.md) | Agent workflow, best practices | ✅ Before starting work |
| [.github/instructions/backend.md](.github/instructions/backend.md) | Backend implementation guide | 📖 For backend work |
| [.github/instructions/frontend.md](.github/instructions/frontend.md) | Frontend implementation guide | 📖 For frontend work |

---

## Reading Guide by Role

### I'm Starting Fresh
1. [README.md](README.md) - Understand the project
2. [guidelines/architecture.md](guidelines/architecture.md) - See how components fit together
3. Pick your role below

### I'm Working on Backend
1. [.github/instructions/behavior.md](.github/instructions/behavior.md) - Workflow & best practices
2. [guidelines/requirements.md](guidelines/requirements.md) - What to build
3. [guidelines/database.md](guidelines/database.md) - Database schema
4. [.github/instructions/backend.md](.github/instructions/backend.md) - How to build it
5. [guidelines/testing.md](guidelines/testing.md) - Test examples
6. **Track progress**: Update [guidelines/tasks.md](guidelines/tasks.md)

### I'm Working on Frontend
1. [.github/instructions/behavior.md](.github/instructions/behavior.md) - Workflow & best practices
2. [guidelines/requirements.md](guidelines/requirements.md) - What to build
3. [.github/instructions/frontend.md](.github/instructions/frontend.md) - How to build it
4. [guidelines/testing.md](guidelines/testing.md) - Test examples
5. **Track progress**: Update [guidelines/tasks.md](guidelines/tasks.md)

### I'm Working on Database
1. [guidelines/database.md](guidelines/database.md) - Current schema
2. [guidelines/requirements.md](guidelines/requirements.md) - Functional requirements
3. Update [guidelines/database.md](guidelines/database.md) with changes
4. Update [guidelines/tasks.md](guidelines/tasks.md) with notes

### I'm Testing
1. [guidelines/testing.md](guidelines/testing.md) - Testing strategy
2. Follow examples for unit/integration tests
3. Update [guidelines/tasks.md](guidelines/tasks.md) with coverage notes

---

## Documentation Organization

```
vibe-trading/
├── README.md                          # ← Start here
├── AGENT.md                           # Legacy (superseded by split docs)
├── guidelines/                        # Technical specifications
│   ├── architecture.md               # System design & components
│   ├── requirements.md               # SRS & use cases
│   ├── database.md                   # Schema & relationships
│   ├── tasks.md                      # Implementation roadmap (UPDATE PROGRESS HERE)
│   └── testing.md                    # Testing strategy & examples
└── .github/instructions/              # Implementation guides
    ├── behavior.md                   # Agent workflow, best practices
    ├── backend.md                    # Backend tech stack & patterns
    └── frontend.md                   # Frontend tech stack & patterns
```

---

## Key Concepts

### Workflow Engine
- **What**: DAG-based execution system for user-defined trading strategies
- **Where**: Backend: `app/services/workflow_engine.py`
- **Learn**: See UC-S1 in [requirements.md](guidelines/requirements.md) → Execution model in [architecture.md](guidelines/architecture.md)

### Value Chain Analysis
- **What**: Supply chain dependency mapping + lead-lag correlation discovery
- **Where**: Backend: `app/services/value_chain.py` + Frontend: Value Chain visualization
- **Learn**: See UC-C1/UC-C3 in [requirements.md](guidelines/requirements.md)

### Mem0 AI Memory
- **What**: Persistent context for AI agents across sessions
- **Where**: Backend: `app/agents/` + Qdrant vector DB
- **Learn**: See UC-S2 in [requirements.md](guidelines/requirements.md) → Memory flow in [architecture.md](guidelines/architecture.md)

### Market Data Pipeline
- **What**: Real-time stock price ingestion from DNSE → TimescaleDB
- **Where**: Backend: `app/services/market_service.py` + DNSEClient
- **Learn**: See Market Data Pipeline in [architecture.md](guidelines/architecture.md)

---

## Common Tasks

### Start a New Feature
1. Read [.github/instructions/behavior.md](.github/instructions/behavior.md) - Workflow section
2. Find task in [guidelines/tasks.md](guidelines/tasks.md)
3. Mark status: 🔵 In Progress
4. Read relevant requirements from [guidelines/requirements.md](guidelines/requirements.md)
5. Implement following [backend.md](.github/instructions/backend.md) or [frontend.md](.github/instructions/frontend.md)
6. Write tests per [guidelines/testing.md](guidelines/testing.md)
7. Mark status: ✅ Completed + add notes

### Report a Bug or Issue
1. Find task in [guidelines/tasks.md](guidelines/tasks.md)
2. Mark status: 🔴 Blocked
3. Add detailed notes about the issue
4. Reference relevant doc sections

### Update Schema
1. Review current schema in [guidelines/database.md](guidelines/database.md)
2. Determine table/relationship changes needed
3. Update [guidelines/database.md](guidelines/database.md) with:
   - SQL migrations
   - Relationship diagrams
   - Field descriptions
4. Update related tasks in [guidelines/tasks.md](guidelines/tasks.md)
5. Create Alembic migration

### Add Test Coverage
1. Review [guidelines/testing.md](guidelines/testing.md) for patterns
2. Check coverage requirements in [.github/instructions/behavior.md](.github/instructions/behavior.md)
3. Write unit + integration tests
4. Run: `pytest --cov=app` (backend) or `npm test -- --coverage` (frontend)

---

## File Size Breakdown

| File | Lines | Content |
|------|-------|---------|
| [guidelines/requirements.md](guidelines/requirements.md) | ~400 | SRS, actors, use cases |
| [guidelines/architecture.md](guidelines/architecture.md) | ~450 | System design, data flows |
| [guidelines/database.md](guidelines/database.md) | ~600 | Schema, tables, relationships |
| [guidelines/testing.md](guidelines/testing.md) | ~550 | Unit/integration test examples |
| [guidelines/tasks.md](guidelines/tasks.md) | ~250 | Implementation phases & tracking |
| [.github/instructions/behavior.md](.github/instructions/behavior.md) | ~300 | Workflow, best practices |
| [.github/instructions/backend.md](.github/instructions/backend.md) | ~150 | Backend guidelines |
| [.github/instructions/frontend.md](.github/instructions/frontend.md) | ~150 | Frontend guidelines |
| [README.md](README.md) | ~200 | Overview, quick start |
| **TOTAL** | **~2,750** | Well-organized, discoverable |

*Previously AGENT.md was ~1,500+ lines - now split into 9 focused documents.*

---

## Pro Tips

- **Bookmark** this file (index.md coming soon) for quick reference
- **Search** documentation using `Ctrl+F` (or `Cmd+F` on Mac)
- **Links** between docs help you navigate - follow them!
- **Update [guidelines/tasks.md](guidelines/tasks.md)** regularly for transparency
- **Version your docs** - mark schema changes with dates/versions

---

## Questions?

- **System design question?** → [guidelines/architecture.md](guidelines/architecture.md)
- **What should I build?** → [guidelines/requirements.md](guidelines/requirements.md)
- **How do I build it?** → [.github/instructions/backend.md](.github/instructions/backend.md) or [frontend.md](.github/instructions/frontend.md)
- **Where's the database table?** → [guidelines/database.md](guidelines/database.md)
- **How do I test it?** → [guidelines/testing.md](guidelines/testing.md)
- **What should I do next?** → [guidelines/tasks.md](guidelines/tasks.md)
- **What's the workflow?** → [.github/instructions/behavior.md](.github/instructions/behavior.md)

---

## Last Updated

December 24, 2025 - Documentation reorganized from AGENT.md into focused, maintainable guides.
