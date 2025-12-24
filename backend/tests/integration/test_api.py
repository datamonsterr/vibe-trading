"""Integration tests for API endpoints."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_api_integration() -> None:
    """Test API integration flow."""
    # Test root endpoint
    response = client.get("/")
    assert response.status_code == 200

    # Test health check
    health_response = client.get("/health")
    assert health_response.status_code == 200
    assert health_response.json()["status"] == "healthy"

    # Test calculation endpoints
    add_response = client.post("/calculate/add", json={"a": 10, "b": 5})
    assert add_response.status_code == 200
    assert add_response.json()["result"] == 15

    multiply_response = client.post(
        "/calculate/multiply", json={"a": 4, "b": 7}
    )
    assert multiply_response.status_code == 200
    assert multiply_response.json()["result"] == 28


def test_cors_headers() -> None:
    """Test CORS headers are present."""
    response = client.options(
        "/",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_pydantic_validation() -> None:
    """Test Pydantic validation for invalid input."""
    # Test missing fields
    response = client.post("/calculate/add", json={"a": 5})
    assert response.status_code == 422

    # Test invalid types
    response = client.post("/calculate/add", json={"a": "invalid", "b": 5})
    assert response.status_code == 422
