import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  message: string;
  sessionId: string;
  model?: 'openai' | 'google';
  context?: any;
}

export const handler = async (event: any) => {
  try {
    const body: ChatRequest = JSON.parse(event.body || '{}');
    const { message, sessionId, model = 'openai', context } = body;

    if (!message || !sessionId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'message and sessionId are required' }),
      };
    }

    // Retrieve chat history
    const historyResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.CHAT_HISTORY_TABLE_NAME,
      KeyConditionExpression: 'sessionId = :sessionId',
      ExpressionAttributeValues: {
        ':sessionId': sessionId,
      },
      Limit: 10,
      ScanIndexForward: false,
    }));

    const history: ChatMessage[] = (historyResponse.Items || [])
      .reverse()
      .map(item => ({
        role: item.role,
        content: item.content,
      }));

    // Build prompt for multi-agent system
    const systemPrompt = `You are a helpful AI assistant for Vietnam stock market trading. You can:
1. Fetch and analyze stock data from Vietnam stock market (VN30, HNX, etc.)
2. Perform technical analysis on stocks
3. Fetch and analyze news sentiment and its impact on stocks
4. Help manage DSNE orders (Create, Read, Update, Delete)

When users ask about stocks, technical analysis, news, or orders, provide relevant information and suggestions.
Use the context provided to give accurate and helpful responses.`;

    // Prepare messages
    const messages = [
      ...history,
      { role: 'user', content: message },
    ];

    // Call Bedrock with the selected model
    const modelId = model === 'google' 
      ? 'anthropic.claude-3-sonnet-20240229-v1:0' // Using Claude as placeholder for multi-model
      : 'anthropic.claude-3-sonnet-20240229-v1:0';

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const assistantMessage = responseBody.content[0].text;

    // Save messages to history
    const timestamp = Date.now();
    await dynamoClient.send(new PutCommand({
      TableName: process.env.CHAT_HISTORY_TABLE_NAME,
      Item: {
        sessionId,
        timestamp,
        role: 'user',
        content: message,
      },
    }));

    await dynamoClient.send(new PutCommand({
      TableName: process.env.CHAT_HISTORY_TABLE_NAME,
      Item: {
        sessionId,
        timestamp: timestamp + 1,
        role: 'assistant',
        content: assistantMessage,
      },
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: assistantMessage,
        sessionId,
        timestamp,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error', details: String(error) }),
    };
  }
};
