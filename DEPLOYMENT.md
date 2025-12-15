# Deployment Guide

## Prerequisites

1. **AWS Account Setup**
   - AWS CLI installed and configured
   - AWS credentials with appropriate permissions
   - Access to AWS Bedrock (request access if needed)

2. **Required Permissions**
   - Lambda, API Gateway, DynamoDB, S3, IAM, CloudFormation
   - Bedrock InvokeModel permissions

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
# Root directory
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure AWS CDK

```bash
# Bootstrap CDK (first time only)
cd backend
npx cdk bootstrap

# Verify configuration
npx cdk synth
```

### 3. Deploy Backend Infrastructure

```bash
cd backend

# Review what will be deployed
npx cdk diff

# Deploy the stack
npx cdk deploy --all --require-approval never

# Note the API Gateway URL from the output
```

Expected output:
```
Outputs:
VibeTradingStack.ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
VibeTradingStack.OrdersTableName = VibeTradingStack-OrdersTable-XXXXX
VibeTradingStack.StockDataTableName = VibeTradingStack-StockDataTable-XXXXX
```

### 4. Configure Frontend

```bash
cd frontend

# Create .env file
cp .env.example .env

# Edit .env and add your API URL
# VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### 5. Build and Test Locally

```bash
cd frontend

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### 6. Deploy Frontend

#### Option A: AWS S3 + CloudFront

```bash
cd frontend

# Build the frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Create CloudFront distribution (optional)
# Follow AWS Console or use CDK
```

#### Option B: Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option C: Netlify

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## Environment Variables

### Backend (CDK)
- `CDK_DEFAULT_ACCOUNT` - AWS account ID
- `CDK_DEFAULT_REGION` - AWS region (default: us-east-1)

### Frontend (.env)
- `VITE_API_URL` - API Gateway URL

## Post-Deployment Configuration

### 1. Enable AWS Bedrock Access

If you haven't already, request access to Claude models:
1. Go to AWS Bedrock Console
2. Request model access for Claude 3 Sonnet
3. Wait for approval (usually instant)

### 2. Test API Endpoints

```bash
# Get API URL
export API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/prod"

# Test stock data endpoint
curl $API_URL/stocks

# Test chat endpoint
curl -X POST $API_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test-123"}'
```

### 3. Monitor CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/VibeTradingStack-ChatHandler --follow

# View API Gateway logs (if enabled)
aws logs tail API-Gateway-Execution-Logs --follow
```

## Troubleshooting

### Issue: CDK Deploy Fails

**Solution**: Check IAM permissions
```bash
aws sts get-caller-identity
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Issue: Bedrock Access Denied

**Solution**: Request model access
1. AWS Console → Bedrock → Model access
2. Request access to Claude 3 Sonnet
3. Redeploy Lambda functions after approval

### Issue: CORS Errors

**Solution**: Verify API Gateway CORS settings
- Check CDK stack has CORS enabled
- Verify allowed origins include your frontend URL

### Issue: Lambda Timeout

**Solution**: Increase timeout in CDK stack
```typescript
timeout: cdk.Duration.seconds(60)
```

### Issue: DynamoDB Throttling

**Solution**: Check table settings
- Verify on-demand billing mode
- Or increase provisioned capacity

## Updating the Deployment

### Update Backend

```bash
cd backend

# Make changes to Lambda functions or CDK stack
# Then deploy
npm run build
npx cdk deploy --all
```

### Update Frontend

```bash
cd frontend

# Make changes
# Then build and redeploy
npm run build

# Redeploy to your hosting service
# (S3, Vercel, Netlify, etc.)
```

## Rollback

### Rollback CDK Stack

```bash
cd backend

# List stack history
aws cloudformation describe-stacks --stack-name VibeTradingStack

# Rollback to previous version
aws cloudformation cancel-update-stack --stack-name VibeTradingStack
```

### Rollback Lambda Functions

```bash
# List function versions
aws lambda list-versions-by-function --function-name ChatHandler

# Update to previous version
aws lambda update-function-configuration \
  --function-name ChatHandler \
  --version PREVIOUS_VERSION
```

## Cleanup

To remove all resources:

```bash
cd backend

# Destroy the stack
npx cdk destroy --all

# This will delete:
# - Lambda functions
# - API Gateway
# - DynamoDB tables
# - S3 buckets
# - IAM roles
```

⚠️ **Warning**: This will permanently delete all data!

## Cost Monitoring

### Set up Billing Alerts

```bash
# Create SNS topic for billing alerts
aws sns create-topic --name billing-alerts

# Subscribe to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT:billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name MonthlyBillingAlarm \
  --alarm-description "Alert when monthly charges exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT:billing-alerts
```

## Security Best Practices

1. **Use Secrets Manager** for sensitive data
2. **Enable CloudTrail** for audit logging
3. **Set up WAF** for API Gateway protection
4. **Enable VPC** for Lambda functions (optional)
5. **Use API Keys** for API Gateway authentication
6. **Enable encryption** for DynamoDB and S3
7. **Regular security audits** with AWS Security Hub

## Production Checklist

- [ ] Enable CloudWatch alarms for errors
- [ ] Set up backup for DynamoDB tables
- [ ] Configure custom domain for API Gateway
- [ ] Enable API Gateway caching
- [ ] Set up CloudFront for frontend
- [ ] Enable WAF for DDoS protection
- [ ] Configure auto-scaling policies
- [ ] Set up monitoring dashboards
- [ ] Enable X-Ray tracing
- [ ] Document incident response procedures
