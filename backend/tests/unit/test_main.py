"""Unit tests for main application."""
from fastapi.testclient import TestClient

from app.main import add, app, multiply

client = TestClient(app)


def test_root() -> None:
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "QuantFlow API is running"
    assert data["status"] == "healthy"


def test_health_check() -> None:
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_add_endpoint() -> None:
    """Test add endpoint."""
    response = client.post("/calculate/add", json={"a": 2, "b": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 5
    assert data["operation"] == "addition"


def test_multiply_endpoint() -> None:
    """Test multiply endpoint."""
    response = client.post("/calculate/multiply", json={"a": 2, "b": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 6
    assert data["operation"] == "multiplication"


def test_add() -> None:
    """Test add utility function."""
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0


def test_multiply() -> None:
    """Test multiply utility function."""
    assert multiply(2, 3) == 6
    assert multiply(-1, 1) == -1
    assert multiply(0, 5) == 0
