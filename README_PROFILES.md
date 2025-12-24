# Docker Compose Profiles

This project uses Docker Compose profiles to support different deployment scenarios.

## Available Profiles

### `dev` - Local Development (Databases Only)
Runs only the database services (PostgreSQL, Redis, Qdrant) for local development. Use this when you want to run backend and frontend locally with hot reload.

```bash
# Start only databases
docker compose --profile dev up -d

# Stop databases
docker compose --profile dev down
```

**Services included:**
- PostgreSQL/TimescaleDB (port 5432)
- Redis (port 6379)
- Qdrant (port 6333)

**Services excluded:**
- Backend (run locally: `cd backend && uv run uvicorn app.main:app --reload`)
- Frontend (run locally: `cd frontend && yarn dev`)

### `full` - Full Stack
Runs all services including backend and frontend in containers.

```bash
# Start all services
docker compose --profile full up -d

# Or use the default profile
docker compose up -d

# Stop all services
docker compose --profile full down
```

**Services included:**
- PostgreSQL/TimescaleDB (port 5432)
- Redis (port 6379)
- Qdrant (port 6333)
- Backend (port 8000)
- Frontend (port 3000)

## Local Development Workflow

### 1. Start Database Services
```bash
docker compose --profile dev up -d
```

### 2. Run Backend Locally
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000` with hot reload enabled.

### 3. Run Frontend Locally
```bash
cd frontend
yarn dev
```

Frontend will be available at `http://localhost:5173` (Vite default) with HMR enabled.

### 4. Environment Variables
Make sure your `.env` files point to localhost:

**backend/.env**
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=quantflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:8000
```

## Useful Commands

### Check Running Services
```bash
# Check services in dev profile
docker compose --profile dev ps

# Check all services
docker compose ps
```

### View Logs
```bash
# Database logs
docker compose --profile dev logs -f database

# All services logs
docker compose --profile dev logs -f
```

### Restart Services
```bash
# Restart dev services
docker compose --profile dev restart

# Restart specific service
docker compose restart database
```

### Clean Up
```bash
# Stop and remove containers (keeps volumes)
docker compose --profile dev down

# Stop and remove containers and volumes
docker compose --profile dev down -v
```

## Benefits of This Setup

### Development Profile (`dev`)
- ✅ Fast backend changes with hot reload
- ✅ Fast frontend changes with HMR
- ✅ Full IDE support and debugging
- ✅ No need to rebuild Docker images
- ✅ Reduced resource usage (only 3 containers vs 5)

### Full Profile (`full`)
- ✅ Production-like environment
- ✅ Test complete Docker setup
- ✅ CI/CD pipeline testing
- ✅ Isolation from host system

## Troubleshooting

### Port Conflicts
If ports are already in use on your host:

**Option 1**: Stop conflicting services
```bash
# Check what's using the port
lsof -i :5432

# Stop the service
sudo systemctl stop postgresql
```

**Option 2**: Change ports in docker-compose.yml or .env
```env
POSTGRES_PORT=5433
REDIS_PORT=6380
QDRANT_PORT=6334
```

### Connection Issues
Make sure your local backend/frontend can connect to containerized databases:
- Use `localhost` (not `database`, `redis`, `qdrant` - those are container names)
- Ensure Docker containers expose ports correctly
- Check firewall settings if connections fail

### Database Persistence
Data is stored in Docker volumes:
```bash
# List volumes
docker volume ls | grep vibe-trading

# Backup database
docker compose exec database pg_dump -U postgres quantflow > backup.sql

# Restore database
docker compose exec -T database psql -U postgres quantflow < backup.sql
```
