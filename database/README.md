# Database Configuration for QuantFlow

## Overview

This directory contains database initialization scripts, schema definitions, and configuration files for TimescaleDB.

## Files

- `init.sql`: Initial database setup and TimescaleDB extension installation
- `schema.sql`: Complete schema definition (to be created in Phase 1)
- `seed.sql`: Sample data for development and testing (optional)

## TimescaleDB Setup

TimescaleDB is a PostgreSQL extension optimized for time-series data. It's perfect for storing:
- Market tick data (OHLCV)
- Real-time price updates
- Order book snapshots
- Trading signals and indicators

## Local Development

Database runs in Docker container:
- **Host**: localhost
- **Port**: 5432
- **Database**: quantflow
- **User**: postgres (configurable via .env)

## Production Considerations

1. **Backup Strategy**: Daily automated backups
2. **Retention Policy**: Configure data retention for historical data
3. **Indexing**: Add indices for frequently queried columns
4. **Partitioning**: Use TimescaleDB hypertables for time-series data

## Schema Evolution

Use Alembic for database migrations:
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Security

- Database credentials stored in `.env` files (not committed)
- Use strong passwords in production
- Configure `pg_hba.conf` for restricted access
- Enable SSL connections in production
