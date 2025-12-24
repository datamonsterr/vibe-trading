# Agent Behavior & Best Practices - QuantFlow

## Overview

This document defines best practices, workflow, and guidelines for AI agents (both human engineers and LLM assistants) working on the QuantFlow project.

---

## Documentation Reading Guide

**Start here** (this file) → Understand workflow and document structure

**Then read by role**:

### For Backend Implementation
1. [requirements.md](../../guidelines/requirements.md) - SRS & use cases
2. [database.md](../../guidelines/database.md) - Schema details
3. [backend.md](./backend.md) - Implementation guidelines
4. [testing.md](../../guidelines/testing.md) - Test examples
5. [tasks.md](../../guidelines/tasks.md) - Track progress here

### For Frontend Implementation
1. [requirements.md](../../guidelines/requirements.md) - SRS & use cases
2. [frontend.md](./frontend.md) - Implementation guidelines
3. [testing.md](../../guidelines/testing.md) - Test examples
4. [tasks.md](../../guidelines/tasks.md) - Track progress here

### For Database Work
1. [database.md](../../guidelines/database.md) - Current schema
2. [requirements.md](../../guidelines/requirements.md) - Functional requirements
3. [tasks.md](../../guidelines/tasks.md) - Update task status

---

## Work Workflow

### 1. Starting a Task

**Before coding**:
- Read the task description in [tasks.md](../../guidelines/tasks.md)
- Understand the functional requirement in [requirements.md](../../guidelines/requirements.md)
- Check affected database tables in [database.md](../../guidelines/database.md)
- Review test expectations in [testing.md](../../guidelines/testing.md)

**Mark status** in [tasks.md](../../guidelines/tasks.md):
```markdown
### Task X.X: Task Name
**Status**: 🔵 In Progress
```

### 2. During Implementation

**Coding standards**:
- Follow patterns in [backend.md](./backend.md) or [frontend.md](./frontend.md)
- Write tests as you code (TDD)
- Update [database.md](../../guidelines/database.md) if schema changes
- Use type hints (Python), TypeScript, or strict mode

**Commit messages** (Conventional Commits):
```
feat: Add RSI calculation to workflow engine
fix: Handle WebSocket reconnection on timeout
refactor: Split WorkflowEngine into separate modules
docs: Update schema documentation for new table
```

### 3. Completing a Task

**Before marking complete**:
- All unit tests pass
- Integration tests pass
- Code reviewed for style/security
- Documentation updated

**Mark status** in [tasks.md](../../guidelines/tasks.md):
```markdown
### Task X.X: Task Name
**Status**: ✅ Completed

**Notes**: Implemented X, Y, Z. Minor issue with Z resolved via Mem0 fallback.
```

### 4. Blockers

If stuck, mark as blocked:
```markdown
### Task X.X: Task Name
**Status**: 🔴 Blocked

**Notes**: Waiting for DNSE API credentials from broker. Cannot test live connection.
```

---

## Best Practices by Discipline

### Backend Development

**Architecture**:
- ✅ Use async/await throughout (FastAPI)
- ✅ Stateless execution engine
- ✅ Encrypt sensitive data at rest
- ✅ Type hints on all functions

**Code Quality**:
- ✅ 80%+ test coverage
- ✅ No hardcoded credentials
- ✅ Proper error handling with logging
- ✅ UTC timestamps in DB

**Database**:
- ✅ Use TimescaleDB for time-series
- ✅ Create indexes for common queries
- ✅ Use `Decimal` for financial values
- ✅ Cascade deletes for consistency

### Frontend Development

**Components**:
- ✅ Small, focused components (<200 lines)
- ✅ Explicit TypeScript interfaces for props
- ✅ Memoization for expensive components
- ✅ Custom hooks for reusable logic

**State Management**:
- ✅ Use Context API for global state
- ✅ useCallback for stable references
- ✅ Lazy load pages and heavy components
- ✅ Proper error boundaries

**Styling**:
- ✅ Tailwind CSS only (no CSS files)
- ✅ Consistent spacing (4/8/12/16px)
- ✅ Dark mode support via theme context
- ✅ Responsive design (mobile-first)

### Testing

**Unit Tests**:
- ✅ Mock external dependencies
- ✅ Test happy path + edge cases
- ✅ Test error handling
- ✅ Clear test names describing behavior

**Integration Tests**:
- ✅ Use test database/Redis instances
- ✅ Clean up after each test (fixtures)
- ✅ Test full workflow end-to-end
- ✅ Verify database state changes

**Coverage**:
- ✅ Backend: 80%+ code coverage
- ✅ Frontend: 75%+ component coverage
- ✅ Critical paths (auth, orders): 100%

---

## Documentation Standards

### When to Update Docs

**Update [requirements.md](../../guidelines/requirements.md)** if:
- Adding new user story or use case
- Changing functional requirements
- Adding new API endpoint specifications

**Update [database.md](../../guidelines/database.md)** if:
- Creating new table
- Adding/removing columns
- Changing relationships or constraints
- Creating new indexes

**Update [testing.md](../../guidelines/testing.md)** if:
- Adding new test types/patterns
- Changing coverage expectations
- Adding new testing tools

**Update [tasks.md](../../guidelines/tasks.md)** for:
- Progress updates (every commit/end of session)
- Blockers or issues encountered
- Learnings and notes for next developer

### Documentation Format

**Use Markdown**:
- Headers: # for title, ## for sections
- Code blocks with language: \```python\```
- Tables for structured data
- Links to related docs

**Always include**:
- Clear section headings
- Purpose/why (not just what)
- Code examples where applicable
- Links to related documentation

---

## Common Issues & Solutions

### Issue: "Workflow graph has cycles"
**Solution**: Review workflow edges in React Flow. Cycles not allowed. Use topological sort in backend validation.

### Issue: "TimescaleDB query slow"
**Solution**: Check indexes in [database.md](../../guidelines/database.md). Add composite indexes for (symbol, time) queries.

### Issue: "AI memory (Mem0) context not retrieved"
**Solution**: Ensure Qdrant is running. Check memory payload structure matches what Mem0 expects.

### Issue: "WebSocket connection drops"
**Solution**: Implement exponential backoff + retry logic in frontend WebSocket hook. Log disconnections for debugging.

---

## Development Checklist

Before submitting work:

- [ ] Code follows style guide (backend.md / frontend.md)
- [ ] All tests pass (unit + integration)
- [ ] Test coverage ≥ target (80% backend, 75% frontend)
- [ ] No hardcoded secrets or credentials
- [ ] Documentation updated (requirements/database/testing as needed)
- [ ] tasks.md status updated with notes
- [ ] Commit messages clear and conventional
- [ ] No console.log or print() statements in production code
- [ ] Security checklist completed (if applicable)
- [ ] Database migrations created (if schema changed)

---

## Useful Commands

### Backend

```bash
# Run tests with coverage
cd backend && pytest tests/ -v --cov=app --cov-report=html

# Lint and format
black app/ && isort app/

# Type checking
mypy app/

# Database migration
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend

```bash
# Run tests with coverage
cd frontend && npm test -- --coverage

# Lint and format
npm run lint && npm run format

# Build for production
npm run build

# E2E tests
npx playwright test
```

---

## Communication

**Document changes**: Update affected markdown files
**Track progress**: Update [tasks.md](../../guidelines/tasks.md) regularly
**Blockers**: Mark in tasks.md with 🔴 status
**Learnings**: Add to task notes for next developer

---

## Key Principles

1. **Documentation is code** - Keep it updated with implementation
2. **Fail fast** - Run tests before commit
3. **Type safety** - Use TypeScript, Python type hints, Pydantic
4. **Encryption** - Never store secrets in repo
5. **Testing first** - Write tests alongside code
6. **Async always** - Use async/await in backend
7. **Accessibility** - Frontend components should be accessible
8. **Monitoring** - Log important events (data ingestion, trades, errors)

---

## References

- [requirements.md](../../guidelines/requirements.md) - Full SRS
- [database.md](../../guidelines/database.md) - Schema details
- [backend.md](./backend.md) - Backend implementation
- [frontend.md](./frontend.md) - Frontend implementation
- [testing.md](../../guidelines/testing.md) - Testing strategy
- [tasks.md](../../guidelines/tasks.md) - Implementation roadmap (update progress here)
