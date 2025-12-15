import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  sendMessage: async (message: string, sessionId: string, model?: 'openai' | 'google') => {
    const response = await api.post('/chat', { message, sessionId, model });
    return response.data;
  },
};

export const stockApi = {
  getStocks: async (symbols?: string[]) => {
    const params = symbols ? { symbols: symbols.join(',') } : {};
    const response = await api.get('/stocks', { params });
    return response.data;
  },
  getStockDetail: async (symbol: string) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },
};

export const analysisApi = {
  getTechnicalAnalysis: async (symbol: string, indicators?: string[]) => {
    const response = await api.post('/analysis/technical', { symbol, indicators });
    return response.data;
  },
  getNewsAnalysis: async (symbol?: string, keywords?: string[], limit?: number) => {
    const response = await api.post('/analysis/news', { symbol, keywords, limit });
    return response.data;
  },
};

export const orderApi = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  createOrder: async (order: any) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  updateOrder: async (orderId: string, updates: any) => {
    const response = await api.put(`/orders/${orderId}`, updates);
    return response.data;
  },
  deleteOrder: async (orderId: string) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },
};

export default api;
