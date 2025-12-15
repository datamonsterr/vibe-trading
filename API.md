# API Documentation

## Base URL

```
https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

All endpoints return JSON responses.

## Authentication

Currently, the API is open (no authentication required). In production, consider adding:
- API Keys
- AWS Cognito
- IAM authorization

## Endpoints

### Chat

#### POST /chat

Send a message to the AI trading assistant.

**Request Body:**
```json
{
  "message": "What's the current price of VCB?",
  "sessionId": "session-12345",
  "model": "openai"
}
```

**Parameters:**
- `message` (string, required): The user's message
- `sessionId` (string, required): Unique session identifier
- `model` (string, optional): AI model to use ("openai" or "google"), defaults to "openai"

**Response:**
```json
{
  "message": "The current price of VCB (Vietcombank) is 95,000 VND...",
  "sessionId": "session-12345",
  "timestamp": 1703001234567
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request (missing required fields)
- 500: Internal server error

---

### Stock Data

#### GET /stocks

Get current stock data for multiple symbols.

**Query Parameters:**
- `symbols` (string, optional): Comma-separated list of stock symbols
  - Default: "VN30,VCB,FPT,HPG,VHM"

**Example:**
```
GET /stocks?symbols=VCB,FPT,HPG
```

**Response:**
```json
{
  "stocks": [
    {
      "symbol": "VCB",
      "price": 95000,
      "change": 1500,
      "changePercent": 1.6,
      "volume": 2500000,
      "high": 96000,
      "low": 93500,
      "open": 94000,
      "timestamp": 1703001234567
    }
  ],
  "timestamp": 1703001234567
}
```

#### GET /stocks/{symbol}

Get detailed stock data including historical information.

**Path Parameters:**
- `symbol` (string, required): Stock symbol (e.g., "VCB", "FPT")

**Response:**
```json
{
  "current": {
    "symbol": "VCB",
    "price": 95000,
    "change": 1500,
    "changePercent": 1.6,
    "volume": 2500000,
    "high": 96000,
    "low": 93500,
    "open": 94000,
    "timestamp": 1703001234567
  },
  "history": [
    {
      "symbol": "VCB",
      "price": 94000,
      "timestamp": 1702987834567
    }
  ]
}
```

---

### Technical Analysis

#### POST /analysis/technical

Request technical analysis for a stock.

**Request Body:**
```json
{
  "symbol": "VCB",
  "indicators": ["RSI", "MACD", "SMA", "EMA", "Bollinger Bands"]
}
```

**Parameters:**
- `symbol` (string, required): Stock symbol
- `indicators` (array, optional): List of technical indicators to calculate
  - Available: "RSI", "MACD", "SMA", "EMA", "Bollinger Bands"
  - Default: All indicators

**Response:**
```json
{
  "symbol": "VCB",
  "indicators": {
    "RSI": 65.5,
    "MACD": {
      "MACD": 250.5,
      "signal": 225.45,
      "histogram": 25.05
    },
    "SMA_20": 94000,
    "SMA_50": 92000,
    "EMA_12": 94500,
    "EMA_26": 93000,
    "BollingerBands": {
      "upper": 97000,
      "middle": 94000,
      "lower": 91000
    }
  },
  "analysis": "The stock is showing bullish momentum with RSI at 65.5...",
  "timestamp": 1703001234567
}
```

**Status Codes:**
- 200: Success
- 400: Invalid symbol or parameters
- 404: No historical data found for symbol
- 500: Internal server error

---

### News Analysis

#### POST /analysis/news

Get news articles and sentiment analysis.

**Request Body:**
```json
{
  "symbol": "VCB",
  "keywords": ["banking", "interest rate"],
  "limit": 10
}
```

**Parameters:**
- `symbol` (string, optional): Stock symbol to focus on
- `keywords` (array, optional): Additional keywords to search for
- `limit` (number, optional): Maximum number of articles, default: 10

**Response:**
```json
{
  "articles": [
    {
      "title": "VCB stock shows strong performance in Q4",
      "content": "Vietcombank has demonstrated...",
      "source": "VnExpress",
      "url": "https://vnexpress.net/example",
      "publishedAt": "2024-01-01T10:00:00Z",
      "sentiment": "positive"
    }
  ],
  "analysis": {
    "sentiment": {
      "overall": "positive",
      "score": 0.75
    },
    "analysis": "Overall market sentiment is positive...",
    "articlesAnalyzed": 10
  },
  "timestamp": 1703001234567
}
```

---

### Orders

#### GET /orders

List all orders.

**Response:**
```json
{
  "orders": [
    {
      "orderId": "uuid-1234",
      "symbol": "VCB",
      "type": "buy",
      "quantity": 100,
      "price": 95000,
      "status": "pending",
      "timestamp": 1703001234567,
      "exchange": "HOSE"
    }
  ],
  "count": 1
}
```

#### GET /orders/{orderId}

Get details of a specific order.

**Path Parameters:**
- `orderId` (string, required): Order ID

**Response:**
```json
{
  "orderId": "uuid-1234",
  "symbol": "VCB",
  "type": "buy",
  "quantity": 100,
  "price": 95000,
  "status": "pending",
  "timestamp": 1703001234567,
  "exchange": "HOSE"
}
```

**Status Codes:**
- 200: Success
- 404: Order not found

#### POST /orders

Create a new order.

**Request Body:**
```json
{
  "symbol": "VCB",
  "type": "buy",
  "quantity": 100,
  "price": 95000,
  "exchange": "HOSE"
}
```

**Parameters:**
- `symbol` (string, required): Stock symbol
- `type` (string, required): Order type ("buy" or "sell")
- `quantity` (number, required): Number of shares
- `price` (number, required): Price per share in VND
- `exchange` (string, optional): Exchange name (HOSE, HNX, UPCOM), default: "HOSE"

**Response:**
```json
{
  "orderId": "uuid-1234",
  "symbol": "VCB",
  "type": "buy",
  "quantity": 100,
  "price": 95000,
  "status": "pending",
  "timestamp": 1703001234567,
  "exchange": "HOSE"
}
```

**Status Codes:**
- 201: Order created
- 400: Invalid parameters
- 500: Internal server error

#### PUT /orders/{orderId}

Update an existing order.

**Path Parameters:**
- `orderId` (string, required): Order ID

**Request Body:**
```json
{
  "status": "cancelled",
  "quantity": 50,
  "price": 96000
}
```

**Parameters:**
- `status` (string, optional): New status ("pending", "filled", "cancelled")
- `quantity` (number, optional): Updated quantity
- `price` (number, optional): Updated price

**Response:**
```json
{
  "message": "Order updated successfully",
  "orderId": "uuid-1234"
}
```

**Status Codes:**
- 200: Order updated
- 400: Invalid updates
- 404: Order not found
- 500: Internal server error

#### DELETE /orders/{orderId}

Delete an order.

**Path Parameters:**
- `orderId` (string, required): Order ID

**Response:**
```json
{
  "message": "Order deleted successfully",
  "orderId": "uuid-1234"
}
```

**Status Codes:**
- 200: Order deleted
- 404: Order not found
- 500: Internal server error

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Rate Limits

- Default: 10,000 requests per second (API Gateway limit)
- Can be customized per endpoint
- Returns 429 (Too Many Requests) when exceeded

## CORS

All endpoints support CORS with the following configuration:
- Allowed Origins: `*` (all origins)
- Allowed Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allowed Headers: `Content-Type, Authorization`

In production, restrict allowed origins to your frontend domain.

## Webhooks (Future)

Coming soon:
- Order status updates
- Stock price alerts
- News notifications

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api.amazonaws.com/prod',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Send chat message
const response = await api.post('/chat', {
  message: 'What is VCB stock price?',
  sessionId: 'my-session-123',
});

// Get stock data
const stocks = await api.get('/stocks?symbols=VCB,FPT');

// Create order
const order = await api.post('/orders', {
  symbol: 'VCB',
  type: 'buy',
  quantity: 100,
  price: 95000,
});
```

### Python

```python
import requests

BASE_URL = 'https://your-api.amazonaws.com/prod'

# Send chat message
response = requests.post(f'{BASE_URL}/chat', json={
    'message': 'What is VCB stock price?',
    'sessionId': 'my-session-123'
})

# Get stock data
stocks = requests.get(f'{BASE_URL}/stocks?symbols=VCB,FPT')

# Create order
order = requests.post(f'{BASE_URL}/orders', json={
    'symbol': 'VCB',
    'type': 'buy',
    'quantity': 100,
    'price': 95000
})
```

### cURL

```bash
# Send chat message
curl -X POST https://your-api.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is VCB stock price?", "sessionId": "my-session-123"}'

# Get stock data
curl https://your-api.amazonaws.com/prod/stocks?symbols=VCB,FPT

# Create order
curl -X POST https://your-api.amazonaws.com/prod/orders \
  -H "Content-Type: application/json" \
  -d '{"symbol": "VCB", "type": "buy", "quantity": 100, "price": 95000}'
```
