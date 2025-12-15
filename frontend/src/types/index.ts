export interface StockData {
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Order {
  orderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
}

export interface TechnicalAnalysis {
  symbol: string;
  indicators: {
    RSI?: number;
    MACD?: any;
    SMA_20?: number;
    SMA_50?: number;
    EMA_12?: number;
    EMA_26?: number;
    BollingerBands?: any;
  };
  analysis: string;
  timestamp: number;
}

export interface NewsArticle {
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: string;
}
