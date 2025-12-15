# Adding New Agents Guide

This guide shows how to easily add new agents to the Vibe Trading system using the modular architecture.

## Overview

The system uses the `AgentConstruct` which provides a standardized way to create agents with:
- Lambda function
- DynamoDB table (optional)
- SQS queue for async processing (optional)
- EventBridge scheduled execution (optional)
- IAM roles and permissions

## Step-by-Step Guide

### 1. Create the MCP Server

Create a new Python MCP server in `backend/mcp-servers/`:

```python
# backend/mcp-servers/my_new_agent_server.py

class MyNewAgentServer:
    def __init__(self):
        self.name = "my-new-agent-server"
        self.version = "1.0.0"
    
    async def do_something(self, params):
        """
        Implement your agent's functionality
        """
        pass
    
    def optimize_data_for_model(self, data):
        """
        Format data for optimal model consumption
        """
        return formatted_data
```

### 2. Create the Lambda Handler

Create a new Lambda function in `backend/lambda/my-new-agent/`:

```typescript
// backend/lambda/my-new-agent/index.ts

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  try {
    // Your agent logic here
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ result: 'success' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
```

```json
// backend/lambda/my-new-agent/package.json

{
  "name": "my-new-agent",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.490.0",
    "@aws-sdk/lib-dynamodb": "^3.490.0"
  }
}
```

### 3. Add Agent to AgentsStack

Edit `backend/lib/stacks/agents-stack.ts`:

```typescript
// Add to AgentsStack class

public readonly myNewAgent: AgentConstruct;

constructor(scope: Construct, id: string, props: AgentsStackProps) {
  super(scope, id, props);
  
  // ... existing agents ...
  
  // Add your new agent
  this.myNewAgent = new AgentConstruct(this, 'MyNewAgent', {
    agentName: 'my-new-agent',
    description: 'Description of what this agent does',
    codePath: path.join(__dirname, '../../lambda/my-new-agent'),
    environment: {
      ...commonEnv,
      // Add any custom environment variables
      CUSTOM_VAR: 'value',
    },
    memorySize: 512,
    timeout: 60,
    
    // Optional: Create a DynamoDB table for this agent
    createTable: true,
    tableConfig: {
      partitionKey: 'myId',
      sortKey: 'timestamp',
    },
    
    // Optional: Create SQS queue for async processing
    createQueue: true,
    
    // Optional: Schedule periodic execution
    schedule: {
      rate: cdk.Duration.hours(1),  // Run every hour
    },
    
    lambdaRole,
  });
  
  // Grant permissions
  if (this.myNewAgent.table) {
    props.someOtherTable.grantReadData(this.myNewAgent.lambda);
  }
  
  // Allow chat agent to invoke this new agent
  this.myNewAgent.lambda.grantInvoke(this.chatAgent.lambda);
  
  // Update chat agent environment with new agent ARN
  this.chatAgent.lambda.addEnvironment(
    'MY_NEW_AGENT_ARN',
    this.myNewAgent.lambda.functionArn
  );
}
```

### 4. Add API Routes (Optional)

If your agent needs API endpoints, edit `backend/lib/stacks/api-stack.ts`:

```typescript
export interface ApiStackProps extends cdk.NestedStackProps {
  // ... existing handlers ...
  myNewAgentHandler: lambda.IFunction;  // Add this
}

constructor(scope: Construct, id: string, props: ApiStackProps) {
  super(scope, id, props);
  
  // ... existing routes ...
  
  // Add routes for your new agent
  const myNewResource = this.api.root.addResource('my-new-agent');
  myNewResource.addMethod('GET', new apigateway.LambdaIntegration(props.myNewAgentHandler));
  myNewResource.addMethod('POST', new apigateway.LambdaIntegration(props.myNewAgentHandler));
}
```

### 5. Update Main Stack

Edit `backend/lib/vibe-trading-stack.ts`:

```typescript
const apiStack = new ApiStack(this, 'ApiStack', {
  // ... existing handlers ...
  myNewAgentHandler: agentsStack.myNewAgent.lambda,  // Add this
});
```

### 6. Deploy

```bash
cd backend
npm run build
npx cdk deploy --all
```

## Examples

### Example 1: Simple Agent (No Database, No Schedule)

```typescript
const simpleAgent = new AgentConstruct(this, 'SimpleAgent', {
  agentName: 'simple-agent',
  description: 'A simple agent that does one thing',
  codePath: path.join(__dirname, '../../lambda/simple-agent'),
  environment: commonEnv,
  lambdaRole,
});
```

### Example 2: Agent with Database

```typescript
const dataAgent = new AgentConstruct(this, 'DataAgent', {
  agentName: 'data-agent',
  description: 'Agent that stores data',
  codePath: path.join(__dirname, '../../lambda/data-agent'),
  environment: commonEnv,
  createTable: true,
  tableConfig: {
    partitionKey: 'dataId',
    sortKey: 'timestamp',
  },
  lambdaRole,
});

// Access the table
dataAgent.table.grantReadData(otherAgent.lambda);
```

### Example 3: Agent with Async Processing

```typescript
const asyncAgent = new AgentConstruct(this, 'AsyncAgent', {
  agentName: 'async-agent',
  description: 'Agent that processes jobs asynchronously',
  codePath: path.join(__dirname, '../../lambda/async-agent'),
  environment: commonEnv,
  createQueue: true,  // Creates SQS queue
  timeout: 120,  // Longer timeout for processing
  lambdaRole,
});

// Send messages to the queue from another agent
asyncAgent.queue.grantSendMessages(anotherAgent.lambda);
anotherAgent.lambda.addEnvironment(
  'ASYNC_AGENT_QUEUE_URL',
  asyncAgent.queue.queueUrl
);
```

### Example 4: Scheduled Agent

```typescript
const scheduledAgent = new AgentConstruct(this, 'ScheduledAgent', {
  agentName: 'scheduled-agent',
  description: 'Agent that runs on a schedule',
  codePath: path.join(__dirname, '../../lambda/scheduled-agent'),
  environment: commonEnv,
  schedule: {
    rate: cdk.Duration.minutes(30),  // Run every 30 minutes
  },
  createTable: true,
  lambdaRole,
});
```

### Example 5: Full-Featured Agent

```typescript
const fullAgent = new AgentConstruct(this, 'FullAgent', {
  agentName: 'full-featured-agent',
  description: 'Agent with all features',
  codePath: path.join(__dirname, '../../lambda/full-agent'),
  environment: {
    ...commonEnv,
    CUSTOM_CONFIG: 'value',
  },
  memorySize: 1024,
  timeout: 180,
  createTable: true,
  tableConfig: {
    partitionKey: 'id',
    sortKey: 'timestamp',
  },
  createQueue: true,
  schedule: {
    rate: cdk.Duration.hours(6),
  },
  lambdaRole,
});
```

## Agent Communication

### Allow One Agent to Invoke Another

```typescript
// Agent A can invoke Agent B
agentB.lambda.grantInvoke(agentA.lambda);

// Agent A gets Agent B's ARN in environment
agentA.lambda.addEnvironment('AGENT_B_ARN', agentB.lambda.functionArn);

// In Agent A's code:
const lambda = new LambdaClient({});
await lambda.send(new InvokeCommand({
  FunctionName: process.env.AGENT_B_ARN,
  Payload: JSON.stringify({ data: 'hello' }),
}));
```

### Allow One Agent to Access Another's Table

```typescript
// Agent A can read from Agent B's table
agentB.table.grantReadData(agentA.lambda);

// Or full access
agentB.table.grantReadWriteData(agentA.lambda);

// Agent A gets table name in environment
agentA.lambda.addEnvironment('AGENT_B_TABLE', agentB.table.tableName);
```

### Allow One Agent to Send to Another's Queue

```typescript
// Agent A can send messages to Agent B's queue
agentB.queue.grantSendMessages(agentA.lambda);

agentA.lambda.addEnvironment('AGENT_B_QUEUE_URL', agentB.queue.queueUrl);

// In Agent A's code:
const sqs = new SQSClient({});
await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.AGENT_B_QUEUE_URL,
  MessageBody: JSON.stringify({ task: 'process this' }),
}));
```

## Best Practices

### 1. Agent Naming

- Use kebab-case: `my-agent-name`
- Be descriptive: `stock-price-fetcher` not `fetcher`
- Include domain: `news-sentiment-analyzer` not just `analyzer`

### 2. Environment Variables

- Always use `commonEnv` as base
- Add only what the agent needs
- Use descriptive names: `NEWS_API_KEY` not `KEY1`

### 3. Memory and Timeout

- Start with 512MB memory
- Increase if seeing OOM errors
- Set timeout based on actual needs (don't just use max)

### 4. Database Design

- Use meaningful partition keys
- Always use timestamp as sort key for time-series data
- Add GSI only when needed
- Enable TTL for temporary data

### 5. Error Handling

- Always catch and log errors
- Return proper HTTP status codes
- Include error details (but not sensitive info)
- Use CloudWatch for debugging

### 6. Security

- Never hardcode secrets
- Use Secrets Manager for API keys
- Follow least-privilege for IAM
- Validate all inputs

## Troubleshooting

### Agent Not Deploying

```bash
# Check CDK synth output
cd backend
npx cdk synth

# Check for TypeScript errors
npm run build
```

### Agent Failing at Runtime

```bash
# View logs
aws logs tail /aws/lambda/my-agent-handler --follow

# Check environment variables
aws lambda get-function-configuration \
  --function-name my-agent-handler \
  --query 'Environment.Variables'
```

### Permission Errors

```bash
# Check Lambda execution role
aws iam get-role --role-name AgentLambdaRole

# Check role policies
aws iam list-attached-role-policies --role-name AgentLambdaRole
```

## Next Steps

- Read [Architecture Documentation](docs/ARCHITECTURE.md)
- See [API Documentation](docs/API.md) for endpoint patterns
- Check [Examples](docs/EXAMPLES.md) for configuration examples
- Review existing agents for patterns

## Questions?

Open an issue on GitHub or refer to the main documentation.
