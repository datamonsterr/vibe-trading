# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │   Workspace Panel    │      │   Chat Interface Panel   │    │
│  │  - Stock Prices      │      │  - Multi-agent Chat      │    │
│  │  - Orders            │      │  - AI Responses          │    │
│  │  - Analysis Results  │      │  - Command Input         │    │
│  └──────────────────────┘      └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                 │
│  - /chat           - /stocks/{symbol}                           │
│  - /stocks         - /analysis/technical                        │
│  - /orders         - /analysis/news                             │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│Chat Handler  │   │Stock Handler │   │Order Handler │
│Lambda        │   │Lambda        │   │Lambda        │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ AWS Bedrock  │   │Technical     │   │  News        │
│ (AI Models)  │   │Analysis      │   │  Analysis    │
│              │   │Lambda        │   │  Lambda      │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ DynamoDB     │   │ DynamoDB     │   │ DynamoDB     │
│ ChatHistory  │   │ StockData    │   │ Orders       │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Multi-Agent System

### Agent Architecture

```
                    ┌─────────────────┐
                    │  Chat Orchestrator │
                    │      Agent          │
                    └─────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │Stock Data    │ │Technical     │ │News          │
    │Agent         │ │Analysis Agent│ │Analysis Agent│
    └──────────────┘ └──────────────┘ └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │Order         │
                    │Management    │
                    │Agent         │
                    └──────────────┘
```

### Agent Responsibilities

1. **Chat Orchestrator Agent**
   - Main entry point for user interactions
   - Routes requests to specialized agents
   - Maintains conversation context
   - Synthesizes responses from multiple agents

2. **Stock Data Agent**
   - Fetches real-time stock prices
   - Provides historical data
   - Monitors market movements
   - Integrates with Vietnam stock APIs

3. **Technical Analysis Agent**
   - Calculates technical indicators
   - Identifies patterns and trends
   - Provides trading signals
   - Uses MCP server for calculations

4. **News Analysis Agent**
   - Fetches financial news
   - Analyzes sentiment
   - Identifies market-moving events
   - Correlates news with stock movements

5. **Order Management Agent**
   - Creates, reads, updates, deletes orders
   - Validates order parameters
   - Tracks order status
   - Manages order history

## Data Flow

### Chat Flow
```
1. User sends message → API Gateway → Chat Handler Lambda
2. Chat Handler calls AWS Bedrock for AI response
3. Bedrock analyzes intent and calls appropriate agents
4. Agents process requests and return data
5. Chat Handler synthesizes final response
6. Response sent back to user
7. Conversation saved to ChatHistory DynamoDB
```

### Stock Data Flow
```
1. Frontend requests stock data → API Gateway
2. Stock Handler Lambda invoked
3. Lambda fetches data from Vietnam stock APIs
4. Data cached in StockData DynamoDB
5. Response sent to frontend
6. Frontend updates Workspace panel
```

### Order Flow
```
1. User creates order via chat or direct API
2. Order Handler Lambda validates parameters
3. Order saved to Orders DynamoDB
4. Confirmation sent to user
5. Order status tracked and updated
6. Workspace panel shows order status
```

## MCP (Model Context Protocol) Integration

### MCP Servers

Each agent has an associated MCP server that provides:
- Standardized interfaces
- Context management
- Data transformations
- Business logic

### MCP Benefits

- **Modularity**: Each agent is independent
- **Scalability**: Agents can scale independently
- **Testability**: Easy to test in isolation
- **Maintainability**: Clear separation of concerns

## AWS Services Used

### Lambda Functions
- **Runtime**: Node.js 18.x
- **Memory**: 256MB - 512MB
- **Timeout**: 30s - 60s
- **Concurrency**: Auto-scaling

### DynamoDB Tables
- **Billing**: On-demand (pay per request)
- **Encryption**: At rest
- **Backup**: Point-in-time recovery enabled

### API Gateway
- **Type**: REST API
- **CORS**: Enabled for all origins
- **Throttling**: 10,000 requests/second
- **Caching**: Can be enabled

### AWS Bedrock
- **Models**: Claude 3 Sonnet, Haiku
- **Token limit**: 4096 input, 2048 output
- **Streaming**: Supported but not implemented yet

### S3
- **Purpose**: Store analysis results, reports
- **Lifecycle**: Auto-delete after 30 days
- **Versioning**: Disabled

## Security Architecture

### Authentication & Authorization
- API Gateway with API keys (optional)
- AWS IAM roles for Lambda execution
- Least privilege access policies

### Data Protection
- TLS 1.2+ for all communications
- DynamoDB encryption at rest
- S3 bucket encryption
- No sensitive data in logs

### Network Security
- VPC for Lambda functions (optional)
- Security groups and NACLs
- Private subnets for databases

## Scalability Considerations

### Horizontal Scaling
- Lambda auto-scales with demand
- DynamoDB on-demand scales automatically
- API Gateway handles high throughput

### Vertical Scaling
- Increase Lambda memory for better performance
- Use provisioned concurrency for consistent latency
- Enable DynamoDB DAX for caching

### Performance Optimizations
- Lambda keeps connections warm
- Batch operations where possible
- Efficient DynamoDB queries with proper keys
- API Gateway caching for frequent requests

## Monitoring & Logging

### CloudWatch Metrics
- Lambda invocations, duration, errors
- API Gateway requests, latency
- DynamoDB read/write capacity
- Custom business metrics

### CloudWatch Logs
- All Lambda function logs
- API Gateway access logs
- Structured logging with context

### Alarms
- Lambda error rate > 5%
- API Gateway 5xx errors
- DynamoDB throttling
- High latency alerts

## Disaster Recovery

### Backup Strategy
- DynamoDB point-in-time recovery
- S3 versioning for analysis data
- Infrastructure as Code (CDK) for quick rebuild

### RTO/RPO
- **RTO**: < 1 hour (redeploy CDK stack)
- **RPO**: < 5 minutes (DynamoDB PITR)

## Cost Estimation

### Monthly Costs (estimated for 10,000 users)
- Lambda: $50 - $100
- DynamoDB: $25 - $75
- API Gateway: $35 - $50
- Bedrock: $200 - $500 (varies by usage)
- S3: $5 - $15
- **Total**: ~$315 - $740/month

*Note: Actual costs vary based on usage patterns*

## Deployment Strategy

### CI/CD Pipeline
1. Code commit to GitHub
2. Run tests
3. Build artifacts
4. CDK synth
5. Deploy to staging
6. Integration tests
7. Deploy to production

### Blue-Green Deployment
- Deploy new version alongside old
- Gradually shift traffic
- Monitor for errors
- Rollback if needed

### Rollback Strategy
- Keep previous Lambda versions
- Revert API Gateway stage
- Restore DynamoDB from backup if needed
