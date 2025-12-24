"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str = Field(..., description="Health status of the API")


class RootResponse(BaseModel):
    """Root endpoint response model."""

    message: str = Field(..., description="Welcome message")
    status: str = Field(..., description="API status")


class CalculationRequest(BaseModel):
    """Calculation request model."""

    a: int = Field(..., description="First number", example=5)
    b: int = Field(..., description="Second number", example=3)


class CalculationResponse(BaseModel):
    """Calculation response model."""

    result: int = Field(..., description="Calculation result")
    operation: str = Field(..., description="Operation performed")


app = FastAPI(
    title="QuantFlow API",
    description="Algorithmic Trading & Financial Intelligence Platform",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=RootResponse)
async def root() -> RootResponse:
    """Root endpoint."""
    return RootResponse(message="QuantFlow API is running", status="healthy")


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy")


@app.post("/calculate/add", response_model=CalculationResponse)
async def add_numbers(request: CalculationRequest) -> CalculationResponse:
    """Add two numbers."""
    result = request.a + request.b
    return CalculationResponse(result=result, operation="addition")


@app.post("/calculate/multiply", response_model=CalculationResponse)
async def multiply_numbers(request: CalculationRequest) -> CalculationResponse:
    """Multiply two numbers."""
    result = request.a * request.b
    return CalculationResponse(result=result, operation="multiplication")


def add(a: int, b: int) -> int:
    """Add two numbers (utility function)."""
    return a + b


def multiply(a: int, b: int) -> int:
    """Multiply two numbers (utility function)."""
    return a * b
