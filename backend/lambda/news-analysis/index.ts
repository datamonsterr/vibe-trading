import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import axios from 'axios';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface NewsAnalysisRequest {
  symbol?: string;
  keywords?: string[];
  limit?: number;
}

export const handler = async (event: any) => {
  try {
    const body: NewsAnalysisRequest = JSON.parse(event.body || '{}');
    const { symbol, keywords = [], limit = 10 } = body;

    // Fetch news articles related to the symbol or keywords
    const newsArticles = await fetchVietnamStockNews(symbol, keywords, limit);

    // Analyze sentiment and impact using AI
    const analysis = await analyzeNewsWithAI(newsArticles, symbol);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        articles: newsArticles,
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

async function fetchVietnamStockNews(symbol?: string, keywords: string[] = [], limit: number = 10) {
  // Placeholder implementation
  // In production, integrate with actual Vietnam news APIs:
  // - Cafef.vn
  // - VnExpress
  // - Vietnam Investment Review
  // - SSI News
  
  // For now, return mock news data
  const mockNews = [
    {
      title: `${symbol || 'VN30'} stock shows strong performance in Q4`,
      content: 'The stock has shown resilient growth despite market volatility...',
      source: 'VnExpress',
      url: 'https://vnexpress.net/example',
      publishedAt: new Date().toISOString(),
      sentiment: 'positive',
    },
    {
      title: 'Vietnam stock market outlook for 2024',
      content: 'Analysts predict moderate growth with opportunities in technology and banking sectors...',
      source: 'Cafef',
      url: 'https://cafef.vn/example',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: 'neutral',
    },
    {
      title: `Foreign investors increase holdings in ${symbol || 'Vietnamese stocks'}`,
      content: 'Foreign investment flows show confidence in Vietnam market recovery...',
      source: 'Vietnam Investment Review',
      url: 'https://vir.com.vn/example',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: 'positive',
    },
  ];

  return mockNews.slice(0, limit);
}

async function analyzeNewsWithAI(articles: any[], symbol?: string) {
  const articlesText = articles.map((article, idx) => 
    `Article ${idx + 1}:
Title: ${article.title}
Content: ${article.content}
Source: ${article.source}
Published: ${article.publishedAt}
---`
  ).join('\n\n');

  const prompt = `Analyze the following news articles ${symbol ? `related to ${symbol} stock` : 'about Vietnam stock market'}:

${articlesText}

Please provide:
1. Overall sentiment analysis (positive/negative/neutral) with confidence score
2. Key themes and topics mentioned
3. Potential impact on ${symbol || 'the market'} (bullish/bearish/neutral)
4. Important events or catalysts identified
5. Risk factors mentioned
6. Summary of investment implications`;

  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
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
    
    return {
      sentiment: determineSentiment(responseBody.content[0].text),
      analysis: responseBody.content[0].text,
      articlesAnalyzed: articles.length,
    };
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return {
      sentiment: 'neutral',
      analysis: 'AI analysis unavailable',
      articlesAnalyzed: articles.length,
    };
  }
}

function determineSentiment(analysisText: string): { overall: string; score: number } {
  const text = analysisText.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  const positiveWords = ['positive', 'bullish', 'growth', 'strong', 'increase', 'opportunity'];
  const negativeWords = ['negative', 'bearish', 'decline', 'weak', 'decrease', 'risk'];
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) {
    return { overall: 'positive', score: 0.6 + (positiveScore * 0.1) };
  } else if (negativeScore > positiveScore) {
    return { overall: 'negative', score: 0.6 + (negativeScore * 0.1) };
  } else {
    return { overall: 'neutral', score: 0.5 };
  }
}
