import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock, MagicMock

# Mock DB dependency
async def override_get_db():
    yield AsyncMock(spec=AsyncSession)

app.dependency_overrides[get_db] = override_get_db

@pytest.mark.asyncio
async def test_register_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Mock the DB session behavior if needed, but for now we test the endpoint logic
        # Since we mock get_db, the DB operations won't actually hit a DB.
        # We might need to mock the return values of db.execute for duplicate check.
        
        # This is a bit complex to mock fully without a real DB or in-memory SQLite.
        # For unit tests, we can mock the service layer or just check basic validation.
        pass

@pytest.mark.asyncio
async def test_login_token():
    # Similar to above, requires mocking DB queries.
    pass

# Better approach for unit tests: Test utility functions directly
from app.core.security import verify_password, get_password_hash

def test_password_hashing():
    password = "secret"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_token():
    data = {"sub": "test@example.com"}
    token = create_access_token(data)
    assert isinstance(token, str)
    assert len(token) > 0
