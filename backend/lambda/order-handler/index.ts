import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface Order {
  orderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
}

export const handler = async (event: any) => {
  try {
    const { httpMethod, pathParameters, body } = event;

    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.orderId) {
          return await getOrder(pathParameters.orderId);
        } else {
          return await listOrders();
        }
      
      case 'POST':
        return await createOrder(JSON.parse(body || '{}'));
      
      case 'PUT':
        if (pathParameters?.orderId) {
          return await updateOrder(pathParameters.orderId, JSON.parse(body || '{}'));
        }
        break;
      
      case 'DELETE':
        if (pathParameters?.orderId) {
          return await deleteOrder(pathParameters.orderId);
        }
        break;
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
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

async function createOrder(orderData: Partial<Order>) {
  const { symbol, type, quantity, price, exchange = 'HOSE' } = orderData;

  if (!symbol || !type || !quantity || !price) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields: symbol, type, quantity, price' }),
    };
  }

  const order: Order = {
    orderId: randomUUID(),
    symbol: symbol.toUpperCase(),
    type,
    quantity,
    price,
    status: 'pending',
    timestamp: Date.now(),
    exchange,
  };

  await dynamoClient.send(new PutCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    Item: order,
  }));

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(order),
  };
}

async function getOrder(orderId: string) {
  // Need to query with both partition and sort key
  // For simplicity, we'll scan or use a GSI in production
  const response = await dynamoClient.send(new QueryCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    KeyConditionExpression: 'orderId = :orderId',
    ExpressionAttributeValues: {
      ':orderId': orderId,
    },
    Limit: 1,
  }));

  if (!response.Items || response.Items.length === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Order not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(response.Items[0]),
  };
}

async function listOrders() {
  // In production, add pagination and filtering
  // This is a simplified scan - use GSI for better performance
  const response = await dynamoClient.send(new QueryCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    Limit: 50,
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      orders: response.Items || [],
      count: response.Items?.length || 0,
    }),
  };
}

async function updateOrder(orderId: string, updates: Partial<Order>) {
  const allowedUpdates = ['status', 'quantity', 'price'];
  const updateExpressions: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  Object.keys(updates).forEach((key, index) => {
    if (allowedUpdates.includes(key)) {
      updateExpressions.push(`#attr${index} = :val${index}`);
      expressionAttributeNames[`#attr${index}`] = key;
      expressionAttributeValues[`:val${index}`] = updates[key as keyof Order];
    }
  });

  if (updateExpressions.length === 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'No valid updates provided' }),
    };
  }

  // Get the order first to get the timestamp
  const getResponse = await dynamoClient.send(new QueryCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    KeyConditionExpression: 'orderId = :orderId',
    ExpressionAttributeValues: {
      ':orderId': orderId,
    },
    Limit: 1,
  }));

  if (!getResponse.Items || getResponse.Items.length === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Order not found' }),
    };
  }

  const order = getResponse.Items[0];

  await dynamoClient.send(new UpdateCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    Key: {
      orderId,
      timestamp: order.timestamp,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ message: 'Order updated successfully', orderId }),
  };
}

async function deleteOrder(orderId: string) {
  // Get the order first to get the timestamp
  const getResponse = await dynamoClient.send(new QueryCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    KeyConditionExpression: 'orderId = :orderId',
    ExpressionAttributeValues: {
      ':orderId': orderId,
    },
    Limit: 1,
  }));

  if (!getResponse.Items || getResponse.Items.length === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Order not found' }),
    };
  }

  const order = getResponse.Items[0];

  await dynamoClient.send(new DeleteCommand({
    TableName: process.env.ORDERS_TABLE_NAME,
    Key: {
      orderId,
      timestamp: order.timestamp,
    },
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ message: 'Order deleted successfully', orderId }),
  };
}
