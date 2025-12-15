# Example Configuration Files

## Backend Environment Variables

For local development, create a `.env` file in the `backend` directory:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# DynamoDB Table Names (automatically set by CDK)
ORDERS_TABLE_NAME=VibeTradingStack-OrdersTable-XXXXX
STOCK_DATA_TABLE_NAME=VibeTradingStack-StockDataTable-XXXXX
CHAT_HISTORY_TABLE_NAME=VibeTradingStack-ChatHistoryTable-XXXXX
ANALYSIS_BUCKET_NAME=vibetradingstack-analysisbucket-xxxxx

# API Keys (if needed)
STOCK_API_KEY=your-stock-api-key
NEWS_API_KEY=your-news-api-key
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# API Configuration
VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

# Feature Flags
VITE_ENABLE_WEBSOCKET=false
VITE_ENABLE_DARK_MODE=true

# Analytics (optional)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX
```

## AWS Configuration

### ~/.aws/credentials
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
```

### ~/.aws/config
```ini
[default]
region = us-east-1
output = json

[profile vibe-trading]
region = us-east-1
output = json
```

## CDK Configuration

### cdk.context.json
```json
{
  "stackName": "VibeTradingStack",
  "environment": "production",
  "domainName": "trading.example.com",
  "enableMonitoring": true,
  "enableBackup": true
}
```

## API Gateway Configuration

### Custom Domain
```bash
# Create custom domain
aws apigateway create-domain-name \
  --domain-name api.trading.example.com \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID

# Map domain to API
aws apigateway create-base-path-mapping \
  --domain-name api.trading.example.com \
  --rest-api-id API_ID \
  --stage prod
```

## CloudWatch Alarms

### Lambda Error Alarm
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ChatHandlerErrors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=ChatHandler
```

## Vietnam Stock Market API Keys

### SSI iBoard API
```bash
# Register at https://iboard.ssi.com.vn/
# Get API credentials
SSI_API_KEY=your-ssi-api-key
SSI_API_SECRET=your-ssi-api-secret
```

### VNDirect API
```bash
# Register at VNDirect
VNDIRECT_API_KEY=your-vndirect-key
```

## GitHub Secrets

For CI/CD, add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `STAGING_BUCKET` (S3 bucket name for staging)
- `PRODUCTION_BUCKET` (S3 bucket name for production)
- `CLOUDFRONT_DISTRIBUTION_ID` (for cache invalidation)

## Docker Configuration (Optional)

If you want to run the application in Docker:

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=https://your-api.amazonaws.com/prod
```

## Monitoring Configuration

### X-Ray Tracing
```typescript
// Add to Lambda functions
import AWSXRay from 'aws-xray-sdk-core';
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
```

### CloudWatch Dashboard
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Invocations", { "stat": "Sum" }],
          [".", "Errors", { "stat": "Sum" }],
          [".", "Duration", { "stat": "Average" }]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Lambda Metrics"
      }
    }
  ]
}
```

## Backup Configuration

### DynamoDB Backup
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name OrdersTable \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### S3 Versioning
```bash
# Enable versioning on S3 bucket
aws s3api put-bucket-versioning \
  --bucket analysis-bucket \
  --versioning-configuration Status=Enabled
```

## Security Configuration

### WAF Rules
```bash
# Create WAF WebACL
aws wafv2 create-web-acl \
  --name VibeTradingWAF \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### Secrets Manager
```bash
# Store API keys in Secrets Manager
aws secretsmanager create-secret \
  --name vibe-trading/api-keys \
  --secret-string '{"ssi_key":"xxx","vndirect_key":"yyy"}'
```

## Performance Configuration

### Lambda Provisioned Concurrency
```bash
# Set provisioned concurrency for ChatHandler
aws lambda put-provisioned-concurrency-config \
  --function-name ChatHandler \
  --provisioned-concurrent-executions 5
```

### API Gateway Caching
```bash
# Enable caching on API Gateway
aws apigateway update-stage \
  --rest-api-id API_ID \
  --stage-name prod \
  --patch-operations op=replace,path=/cacheClusterEnabled,value=true
```
