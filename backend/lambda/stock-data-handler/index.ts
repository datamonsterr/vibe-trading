import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

export const handler = async (event: any) => {
  try {
    const { httpMethod, pathParameters, queryStringParameters } = event;

    if (httpMethod === 'GET') {
      if (pathParameters?.symbol) {
        // Get specific stock data
        const symbol = pathParameters.symbol.toUpperCase();
        return await getStockData(symbol);
      } else {
        // Get list of stocks
        const symbols = queryStringParameters?.symbols?.split(',') || ['VN30', 'VCB', 'FPT', 'HPG', 'VHM'];
        return await getMultipleStocks(symbols);
      }
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

async function getStockData(symbol: string) {
  try {
    // Fetch stock data from Vietnam stock market API
    // This is a placeholder - in production, use actual Vietnam stock market APIs
    // such as SSI API, VNDirect API, or other market data providers
    const stockData = await fetchVietnamStockData(symbol);

    // Store in DynamoDB
    await dynamoClient.send(new PutCommand({
      TableName: process.env.STOCK_DATA_TABLE_NAME,
      Item: stockData,
    }));

    // Get historical data
    const historyResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.STOCK_DATA_TABLE_NAME,
      KeyConditionExpression: 'symbol = :symbol',
      ExpressionAttributeValues: {
        ':symbol': symbol,
      },
      Limit: 30,
      ScanIndexForward: false,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        current: stockData,
        history: historyResponse.Items || [],
      }),
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

async function getMultipleStocks(symbols: string[]) {
  const results = await Promise.all(
    symbols.map(symbol => fetchVietnamStockData(symbol.toUpperCase()))
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      stocks: results,
      timestamp: Date.now(),
    }),
  };
}

async function fetchVietnamStockData(symbol: string): Promise<StockData> {
  // Placeholder implementation
  // In production, integrate with actual Vietnam stock market APIs:
  // - SSI iBoard API (https://iboard.ssi.com.vn)
  // - VNDirect API
  // - Cafef.vn API
  // - Vietstock API
  
  // For now, return mock data
  const mockPrice = 50000 + Math.random() * 50000;
  const mockChange = (Math.random() - 0.5) * 2000;
  
  return {
    symbol,
    price: mockPrice,
    change: mockChange,
    changePercent: (mockChange / mockPrice) * 100,
    volume: Math.floor(Math.random() * 10000000),
    high: mockPrice + Math.random() * 1000,
    low: mockPrice - Math.random() * 1000,
    open: mockPrice - mockChange,
    timestamp: Date.now(),
  };
}
