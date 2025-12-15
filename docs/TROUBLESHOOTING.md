# Troubleshooting Guide

Common issues and their solutions.

## Table of Contents

- [Deployment Issues](#deployment-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [API Issues](#api-issues)
- [AWS Issues](#aws-issues)
- [Performance Issues](#performance-issues)

## Deployment Issues

### CDK Bootstrap Fails

**Symptoms:**
```
Error: This stack uses assets, so the toolkit stack must be deployed to the environment
```

**Solution:**
```bash
cd backend
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### CDK Deploy Timeout

**Symptoms:**
- Deployment takes longer than 30 minutes
- CloudFormation stack shows "CREATE_IN_PROGRESS" for too long

**Solution:**
1. Check CloudWatch Logs for Lambda errors
2. Verify Lambda function code compiles
3. Check DynamoDB table creation
4. Retry deployment: `npx cdk deploy --all`

### Missing Permissions

**Symptoms:**
```
User: arn:aws:iam::XXX:user/YYY is not authorized to perform: lambda:CreateFunction
```

**Solution:**
Add required IAM permissions:
```bash
# Check current permissions
aws iam list-attached-user-policies --user-name YOUR_USER

# Attach AdministratorAccess (for development)
aws iam attach-user-policy \
  --user-name YOUR_USER \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

## Backend Issues

### Lambda Function Timeout

**Symptoms:**
- API returns 504 Gateway Timeout
- CloudWatch shows Task timed out after X seconds

**Solution:**
Increase timeout in CDK stack:
```typescript
timeout: cdk.Duration.seconds(60), // Increase from 30
memorySize: 512, // More memory = more CPU
```

### Bedrock Access Denied

**Symptoms:**
```
AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel
```

**Solution:**
1. Go to AWS Console → Bedrock
2. Click "Model access" in left sidebar
3. Request access to Claude models
4. Wait for approval (usually instant)
5. Verify with:
```bash
aws bedrock list-foundation-models --region us-east-1
```

### DynamoDB Throttling

**Symptoms:**
```
ProvisionedThroughputExceededException
```

**Solution:**
Tables already use on-demand billing. Check if you're making too many requests:
```bash
aws dynamodb describe-table --table-name OrdersTable
```

### Lambda Out of Memory

**Symptoms:**
```
Process exited before completing request
Runtime exited with error: signal: killed
```

**Solution:**
Increase memory in CDK stack:
```typescript
memorySize: 1024, // Increase from 512
```

## Frontend Issues

### Build Fails

**Symptoms:**
```
npm run build fails with TypeScript errors
```

**Solution:**
```bash
cd frontend
# Clear cache
rm -rf node_modules dist
npm install
# Fix TypeScript errors
npm run lint
npm run build
```

### API Connection Failed

**Symptoms:**
- Chat doesn't respond
- Stock data shows "Loading..." forever
- Console shows network errors

**Solution:**
1. Check `.env` file:
```bash
cat frontend/.env
# Should show: VITE_API_URL=https://...
```

2. Test API directly:
```bash
curl https://your-api-url.com/prod/stocks
```

3. Verify CORS settings in backend

### Hot Reload Not Working

**Symptoms:**
- Changes don't appear in browser
- Need to restart dev server for changes

**Solution:**
```bash
# Kill any existing processes
pkill -f "vite"
# Clear cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

### TypeScript Errors

**Symptoms:**
```
Property 'X' does not exist on type 'Y'
```

**Solution:**
```bash
# Regenerate types
npm run build
# Or temporarily ignore
// @ts-ignore
```

## API Issues

### CORS Errors

**Symptoms:**
```
Access to fetch at 'https://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
CORS is configured in CDK stack, but verify:
```typescript
defaultCorsPreflightOptions: {
  allowOrigins: apigateway.Cors.ALL_ORIGINS,
  allowMethods: apigateway.Cors.ALL_METHODS,
}
```

For production, restrict origins:
```typescript
allowOrigins: ['https://your-domain.com'],
```

### 403 Forbidden

**Symptoms:**
- All API requests return 403
- Even simple GET requests fail

**Solution:**
1. Check API Gateway deployment
2. Verify stage is deployed:
```bash
aws apigateway get-stages --rest-api-id YOUR_API_ID
```
3. Redeploy API:
```bash
cd backend
npx cdk deploy --all
```

### 500 Internal Server Error

**Symptoms:**
- API returns 500 for certain requests
- No clear error message

**Solution:**
1. Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/ChatHandler --follow
```

2. Enable detailed logging in Lambda
3. Check Lambda environment variables
4. Verify DynamoDB table names are correct

### Rate Limiting

**Symptoms:**
```
429 Too Many Requests
```

**Solution:**
API Gateway has default limits:
- 10,000 requests per second
- 5,000 burst

Increase in CDK or add caching:
```typescript
// Enable caching
stage.methodSettings = [{
  resourcePath: '/*/*',
  httpMethod: '*',
  cachingEnabled: true,
  cacheTtlInSeconds: 300,
}];
```

## AWS Issues

### No Bedrock in Region

**Symptoms:**
```
Bedrock is not available in region XX
```

**Solution:**
Bedrock is only available in certain regions. Use:
- us-east-1 (N. Virginia)
- us-west-2 (Oregon)
- eu-west-1 (Ireland)

Change region in CDK:
```typescript
env: { region: 'us-east-1' }
```

### Cost Alerts

**Symptoms:**
- Unexpected AWS charges
- High Bedrock costs

**Solution:**
1. Check CloudWatch billing metrics
2. Review Lambda invocation count
3. Check Bedrock token usage
4. Set up billing alarms:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name HighBillingAlarm \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

### Account Limits

**Symptoms:**
```
LimitExceededException: You have exceeded the limit for X
```

**Solution:**
Request limit increase:
1. AWS Console → Service Quotas
2. Search for the service
3. Request quota increase

## Performance Issues

### Slow API Response

**Symptoms:**
- API takes > 5 seconds to respond
- Users see loading spinners for too long

**Solutions:**

1. **Enable Lambda SnapStart** (for Java/Node.js):
```typescript
const handler = new lambda.Function(this, 'Handler', {
  // ... other config
  snapStart: lambda.SnapStartConf.ON_PUBLISHED_VERSIONS,
});
```

2. **Use Provisioned Concurrency**:
```bash
aws lambda put-provisioned-concurrency-config \
  --function-name ChatHandler \
  --provisioned-concurrent-executions 5
```

3. **Enable API Gateway Caching**

4. **Optimize Lambda code**:
   - Reuse connections
   - Minimize cold starts
   - Use Lambda layers for dependencies

### High Bedrock Costs

**Symptoms:**
- Bedrock charges are unexpectedly high

**Solutions:**
1. Use cheaper models:
   - Claude 3 Haiku (faster, cheaper)
   - Instead of Claude 3 Sonnet

2. Reduce token usage:
   - Shorter system prompts
   - Limit conversation history
   - Lower max_tokens

3. Cache responses:
   - Store common queries
   - Reuse analysis results

### DynamoDB Slow Queries

**Symptoms:**
- Queries take > 1 second
- High read latency

**Solutions:**
1. **Use proper keys**:
   - Query with partition key
   - Avoid scans

2. **Add GSI** for frequent queries:
```typescript
table.addGlobalSecondaryIndex({
  indexName: 'StatusIndex',
  partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
});
```

3. **Enable DAX** (DynamoDB Accelerator) for caching

## Debugging Tips

### Enable Detailed Logging

```typescript
// In Lambda functions
console.log(JSON.stringify({
  level: 'INFO',
  message: 'Processing request',
  data: event,
  timestamp: Date.now(),
}));
```

### Use X-Ray Tracing

```typescript
import AWSXRay from 'aws-xray-sdk-core';
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
```

### Test Lambda Locally

```bash
# Install SAM CLI
brew install aws-sam-cli

# Test function
sam local invoke ChatHandler \
  --event test-event.json
```

### Monitor CloudWatch

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/ChatHandler --follow --format short

# Filter errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/ChatHandler \
  --filter-pattern "ERROR"
```

## Still Having Issues?

1. **Check GitHub Issues**: https://github.com/datamonsterr/vibe-trading/issues
2. **Review Documentation**: See README.md and other docs
3. **Ask for Help**: Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Logs (CloudWatch, browser console)

## Emergency Rollback

If something goes wrong in production:

```bash
# Rollback CDK stack
cd backend
aws cloudformation cancel-update-stack \
  --stack-name VibeTradingStack

# Or delete and redeploy
npx cdk destroy --all
npx cdk deploy --all
```

⚠️ **Warning**: This will cause downtime and may lose data!
