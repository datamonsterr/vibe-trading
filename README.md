# Vibe Trading - Vietnam Stock Market Trading Platform

A multi-agent chat interface for analyzing and trading stocks in the Vietnam stock market. Built with AWS CDK, Lambda, Bedrock, and React with shadcn/ui.

## Architecture

### Tech Stack

- **Backend**: AWS CDK, AWS Lambda, AWS Bedrock, DynamoDB, API Gateway, S3
- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **AI Models**: AWS Bedrock (Claude) with support for multiple models (OpenAI, Google)
- **MCP Servers**: Model Context Protocol servers for multi-agent architecture

### Features

- ✅ Multi-agent AI system for stock analysis and trading
- ✅ Real-time chat interface with AI assistant
- ✅ Stock data fetching and visualization (Vietnam market: HOSE, HNX, UPCOM)
- ✅ Technical analysis (RSI, MACD, SMA, EMA, Bollinger Bands)
- ✅ News sentiment analysis
- ✅ CRUD operations for orders (DSNE)
- ✅ Split-screen UI: Workspace (left) + Chat (right)

## Project Structure

```
vibe-trading/
├── backend/                    # AWS CDK Infrastructure
│   ├── bin/                   # CDK app entry point
│   ├── lib/                   # CDK stack definitions
│   ├── lambda/                # Lambda function handlers
│   │   ├── chat-handler/      # Multi-agent chat handler
│   │   ├── stock-data-handler/    # Stock data fetching
│   │   ├── technical-analysis/    # Technical analysis agent
│   │   ├── news-analysis/         # News sentiment agent
│   │   └── order-handler/         # Order CRUD operations
│   └── mcp-servers/           # MCP server implementations
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── ChatInterface.tsx
│   │   │   └── Workspace.tsx
│   │   ├── lib/              # Utilities and API client
│   │   ├── types/            # TypeScript type definitions
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS Account with access to:
  - Lambda
  - API Gateway
  - DynamoDB
  - Bedrock (Claude models)
  - S3

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Bootstrap CDK (first time only):
```bash
cdk bootstrap
```

3. Deploy infrastructure:
```bash
npm run deploy
```

This will create:
- API Gateway REST API
- 5 Lambda functions
- 3 DynamoDB tables (Orders, StockData, ChatHistory)
- S3 bucket for analysis results
- IAM roles and policies

4. Note the API Gateway URL from the deployment output.

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API Gateway URL:
```
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

### Building for Production

#### Backend
```bash
cd backend
npm run build
npm run deploy
```

#### Frontend
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`. Deploy to:
- AWS S3 + CloudFront
- Vercel
- Netlify
- Any static hosting service

## Usage

### Chat Interface

The AI assistant can help you with:

1. **Stock Data**: "Show me the latest price for VCB"
2. **Technical Analysis**: "Analyze FPT stock with RSI and MACD"
3. **News Analysis**: "What's the sentiment on Vietnam bank stocks?"
4. **Order Management**: "Create a buy order for 100 shares of HPG at 25,000 VND"

### API Endpoints

- `POST /chat` - Send messages to AI assistant
- `GET /stocks` - Get stock data
- `GET /stocks/{symbol}` - Get specific stock details
- `POST /analysis/technical` - Request technical analysis
- `POST /analysis/news` - Request news sentiment analysis
- `GET /orders` - List all orders
- `POST /orders` - Create new order
- `PUT /orders/{orderId}` - Update order
- `DELETE /orders/{orderId}` - Delete order

## Multi-Agent Architecture

The system uses multiple specialized agents:

1. **Chat Agent**: Main orchestrator, handles user conversations
2. **Stock Data Agent**: Fetches real-time stock data from Vietnam market
3. **Technical Analysis Agent**: Performs technical analysis using various indicators
4. **News Analysis Agent**: Fetches and analyzes news sentiment
5. **Order Management Agent**: Handles CRUD operations for trading orders

Each agent runs as a separate Lambda function and can be invoked independently or through the chat interface.

## Vietnam Stock Market Integration

### Supported Exchanges

- **HOSE** (Ho Chi Minh Stock Exchange)
- **HNX** (Hanoi Stock Exchange)
- **UPCOM** (Unlisted Public Company Market)

### Data Sources

The platform is designed to integrate with:
- SSI iBoard API
- VNDirect API
- Cafef.vn
- Vietstock
- VnExpress

*Note: Current implementation includes mock data. Replace with actual API integrations in production.*

## AWS Bedrock Models

The system supports multiple AI models through AWS Bedrock:

- **Claude 3 Sonnet** (default)
- **Claude 3 Haiku** (faster, lower cost)
- OpenAI models (via Bedrock)
- Google models (via Bedrock)

Configure model selection in the chat interface or via API.

## Security Considerations

- All Lambda functions use least-privilege IAM roles
- API Gateway with CORS enabled
- DynamoDB tables with encryption at rest
- Secrets stored in AWS Secrets Manager (recommended for production)
- No credentials stored in code

## Cost Optimization

- DynamoDB uses on-demand billing
- Lambda functions have appropriate memory/timeout settings
- S3 bucket lifecycle policies for old analysis data
- API Gateway caching (can be enabled)

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run build
```

## Roadmap

- [ ] Real-time stock price updates via WebSocket
- [ ] Advanced charting with TradingView
- [ ] Backtesting capabilities
- [ ] Portfolio management
- [ ] Alerts and notifications
- [ ] Mobile app (React Native)
- [ ] Integration with actual brokerage APIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Disclaimer

This software is for educational and informational purposes only. It is not financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.
