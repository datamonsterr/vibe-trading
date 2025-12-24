import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface HealthResponse {
  status: string;
}

export interface RootResponse {
  message: string;
  status: string;
}

export interface CalculationRequest {
  a: number;
  b: number;
}

export interface CalculationResponse {
  result: number;
  operation: string;
}

// API functions
export const api = {
  health: () => apiClient.get<HealthResponse>('/health'),
  root: () => apiClient.get<RootResponse>('/'),
  add: (data: CalculationRequest) => apiClient.post<CalculationResponse>('/calculate/add', data),
  multiply: (data: CalculationRequest) =>
    apiClient.post<CalculationResponse>('/calculate/multiply', data),
};

export { API_BASE_URL };
