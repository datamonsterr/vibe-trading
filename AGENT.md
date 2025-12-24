# QuantFlow - Agent Development Guide

## Quick Start

This is a **Algorithmic Trading & Financial Intelligence Platform** for Vietnam Stock Market (VN50/VN100) that combines low-code workflow automation with AI-powered financial analysis.

---

## 📖 Where to Start

**👉 Go to [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) first** - It's your navigation hub.

Choose your path based on what you're working on:

### For Backend Development
1. [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Navigation guide
2. [guidelines/requirements.md](guidelines/requirements.md) - What you're building
3. [guidelines/database.md](guidelines/database.md) - Database schema
4. [.github/instructions/backend.md](.github/instructions/backend.md) - How to build it
5. [guidelines/testing.md](guidelines/testing.md) - Test examples

### For Frontend Development
1. [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Navigation guide
2. [guidelines/requirements.md](guidelines/requirements.md) - What you're building
3. [.github/instructions/frontend.md](.github/instructions/frontend.md) - How to build it
4. [guidelines/testing.md](guidelines/testing.md) - Test examples

### For Database Work
1. [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Navigation guide
2. [guidelines/database.md](guidelines/database.md) - Current schema
3. [guidelines/requirements.md](guidelines/requirements.md) - Requirements

---

## 🚀 Work Workflow

1. **Start**: Read [.github/instructions/behavior.md](.github/instructions/behavior.md) - Agent workflow & best practices
2. **Pick task**: Find in [guidelines/tasks.md](guidelines/tasks.md)
3. **Mark status**: 🔵 In Progress
4. **During work**: Update progress regularly
5. **Complete**: Mark ✅ Completed + add notes for next developer

---

## 📋 Key Documents

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Overview, quick start, contributing |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | **Navigation hub by role** ⭐ |
| [guidelines/architecture.md](guidelines/architecture.md) | System design & data flows |
| [guidelines/requirements.md](guidelines/requirements.md) | SRS, use cases, actors |
| [guidelines/database.md](guidelines/database.md) | Schema, SQL, relationships |
| [guidelines/tasks.md](guidelines/tasks.md) | **Roadmap & progress tracking** ⭐ |
| [guidelines/testing.md](guidelines/testing.md) | Testing strategy & examples |
| [.github/instructions/behavior.md](.github/instructions/behavior.md) | **Agent workflow & best practices** ⭐ |
| [.github/instructions/backend.md](.github/instructions/backend.md) | Backend tech stack & patterns |
| [.github/instructions/frontend.md](.github/instructions/frontend.md) | Frontend tech stack & patterns |

---

## ⭐ Most Important Files

1. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Start here! Your navigation guide
2. **[guidelines/tasks.md](guidelines/tasks.md)** - Update progress as you work
3. **[.github/instructions/behavior.md](.github/instructions/behavior.md)** - Agent workflow & standards

---

## 🎯 Tech Stack

- **Backend**: FastAPI (Python), PostgreSQL + TimescaleDB, Qdrant, Redis
- **Frontend**: React + TypeScript, React Flow, TradingView, D3.js
- **AI**: OpenAI GPT-4o + Mem0 (persistent memory)
- **Broker**: DNSE/Entrade X API

---

## 💡 How to Contribute

Follow the agent workflow in [.github/instructions/behavior.md](.github/instructions/behavior.md):

1. Read [guidelines/tasks.md](guidelines/tasks.md) for task description
2. Read [guidelines/requirements.md](guidelines/requirements.md) for "what"
3. Read [guidelines/database.md](guidelines/database.md) for database schema
4. Read implementation guide: [backend.md](.github/instructions/backend.md) or [frontend.md](.github/instructions/frontend.md)
5. Write code + tests
6. Update [guidelines/tasks.md](guidelines/tasks.md) with ✅ Completed status
7. Add notes for next developer

---

## ❓ Questions?

- **System design?** → [guidelines/architecture.md](guidelines/architecture.md)
- **What to build?** → [guidelines/requirements.md](guidelines/requirements.md)
- **Database schema?** → [guidelines/database.md](guidelines/database.md)
- **How to code it?** → [backend.md](.github/instructions/backend.md) or [frontend.md](.github/instructions/frontend.md)
- **How to test?** → [guidelines/testing.md](guidelines/testing.md)
- **What's next?** → [guidelines/tasks.md](guidelines/tasks.md)
- **Workflow & standards?** → [.github/instructions/behavior.md](.github/instructions/behavior.md)

---

## 📌 Remember

⭐ **Always start with [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - it's your guide!

**Update [guidelines/tasks.md](guidelines/tasks.md)** as you work to track progress.

All detailed specifications have been split into focused, maintainable documents. Happy coding! 🚀
