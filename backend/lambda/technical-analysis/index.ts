import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface TechnicalAnalysisRequest {
  symbol: string;
  indicators?: string[];
}

export const handler = async (event: any) => {
  try {
    const body: TechnicalAnalysisRequest = JSON.parse(event.body || '{}');
    const { symbol, indicators = ['RSI', 'MACD', 'SMA', 'EMA', 'Bollinger Bands'] } = body;

    if (!symbol) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'symbol is required' }),
      };
    }

    // Fetch historical stock data
    const historyResponse = await dynamoClient.send(new QueryCommand({
      TableName: process.env.STOCK_DATA_TABLE_NAME,
      KeyConditionExpression: 'symbol = :symbol',
      ExpressionAttributeValues: {
        ':symbol': symbol.toUpperCase(),
      },
      Limit: 100,
      ScanIndexForward: false,
    }));

    const historicalData = historyResponse.Items || [];

    if (historicalData.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No historical data found for symbol' }),
      };
    }

    // Calculate technical indicators
    const technicalIndicators = calculateTechnicalIndicators(historicalData, indicators);

    // Use Bedrock AI to analyze the indicators
    const analysis = await analyzeWithAI(symbol, historicalData, technicalIndicators);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        symbol,
        indicators: technicalIndicators,
        analysis,
        timestamp: Date.now(),
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

function calculateTechnicalIndicators(data: any[], requestedIndicators: string[]) {
  const prices = data.map(d => d.price);
  const indicators: any = {};

  if (requestedIndicators.includes('SMA')) {
    indicators.SMA_20 = calculateSMA(prices, 20);
    indicators.SMA_50 = calculateSMA(prices, 50);
  }

  if (requestedIndicators.includes('EMA')) {
    indicators.EMA_12 = calculateEMA(prices, 12);
    indicators.EMA_26 = calculateEMA(prices, 26);
  }

  if (requestedIndicators.includes('RSI')) {
    indicators.RSI = calculateRSI(prices, 14);
  }

  if (requestedIndicators.includes('MACD')) {
    const macd = calculateMACD(prices);
    indicators.MACD = macd;
  }

  if (requestedIndicators.includes('Bollinger Bands')) {
    indicators.BollingerBands = calculateBollingerBands(prices, 20, 2);
  }

  return indicators;
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices, period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 0; i < period; i++) {
    const change = prices[i] - prices[i + 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  return {
    MACD: macdLine,
    signal: macdLine * 0.9, // Simplified signal line
    histogram: macdLine * 0.1,
  };
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number) {
  const sma = calculateSMA(prices, period);
  const variance = prices.slice(0, period).reduce((sum, price) => {
    return sum + Math.pow(price - sma, 2);
  }, 0) / period;
  const sd = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * sd),
    middle: sma,
    lower: sma - (stdDev * sd),
  };
}

async function analyzeWithAI(symbol: string, historicalData: any[], indicators: any) {
  const prompt = `Analyze the following technical indicators for ${symbol} stock in Vietnam market:

Historical Data Points: ${historicalData.length}
Current Price: ${historicalData[0]?.price}

Technical Indicators:
${JSON.stringify(indicators, null, 2)}

Please provide:
1. Overall trend analysis (bullish/bearish/neutral)
2. Key support and resistance levels
3. Trading signals based on indicators
4. Risk assessment
5. Recommendation (buy/sell/hold) with reasoning`;

  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return 'AI analysis unavailable';
  }
}
