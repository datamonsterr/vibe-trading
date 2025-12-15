# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- Initial release of Vibe Trading platform
- Multi-agent chat interface for Vietnam stock market
- AWS CDK infrastructure with Lambda, API Gateway, DynamoDB
- AWS Bedrock integration for AI-powered analysis
- Stock data fetching and visualization
- Technical analysis with RSI, MACD, SMA, EMA, Bollinger Bands
- News sentiment analysis
- Order management (CRUD operations)
- React frontend with shadcn/ui components
- Split-screen UI: Workspace + Chat Interface
- Support for HOSE, HNX, and UPCOM exchanges
- Multi-model support (OpenAI and Google via Bedrock)
- Comprehensive documentation (README, ARCHITECTURE, API, DEPLOYMENT)
- CI/CD pipeline with GitHub Actions
- MCP server implementations for multi-agent architecture

### Features
- Real-time chat with AI assistant
- Stock price monitoring
- Technical indicator calculations
- Market news aggregation
- Sentiment analysis
- Order tracking and management
- Responsive design
- Dark mode support (via shadcn/ui)

### Infrastructure
- 5 Lambda functions for different agents
- 3 DynamoDB tables (Orders, StockData, ChatHistory)
- S3 bucket for analysis results
- API Gateway REST API
- IAM roles with least privilege
- CloudWatch logging and monitoring

### Security
- CORS enabled for API Gateway
- DynamoDB encryption at rest
- No hardcoded credentials
- Proper IAM role separation

## [Unreleased]

### Planned
- WebSocket support for real-time updates
- Advanced charting with TradingView
- Backtesting capabilities
- Portfolio management
- Mobile app (React Native)
- Integration with real Vietnam stock APIs
- Email/SMS notifications
- Vietnamese language support
- Advanced technical indicators
- Machine learning price predictions
