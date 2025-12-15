"""
MCP Server for Technical Analysis Agent
Provides technical analysis indicators and signals
"""

from typing import Dict, List, Optional
import numpy as np

class TechnicalAnalysisMCPServer:
    """MCP Server for technical analysis calculations"""
    
    def __init__(self):
        self.name = "technical-analysis-server"
        self.version = "1.0.0"
        
    async def calculate_indicators(
        self,
        prices: List[float],
        indicators: List[str]
    ) -> Dict:
        """
        Calculate technical indicators
        
        Args:
            prices: List of price data
            indicators: List of indicator names (RSI, MACD, SMA, etc.)
            
        Returns:
            Dict with calculated indicators
        """
        results = {}
        
        if "RSI" in indicators:
            results["RSI"] = self._calculate_rsi(prices)
            
        if "MACD" in indicators:
            results["MACD"] = self._calculate_macd(prices)
            
        if "SMA" in indicators:
            results["SMA_20"] = self._calculate_sma(prices, 20)
            results["SMA_50"] = self._calculate_sma(prices, 50)
            
        return results
    
    def _calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate RSI indicator"""
        if len(prices) < period + 1:
            return 50.0
        
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return float(rsi)
    
    def _calculate_macd(self, prices: List[float]) -> Dict:
        """Calculate MACD indicator"""
        ema_12 = self._calculate_ema(prices, 12)
        ema_26 = self._calculate_ema(prices, 26)
        macd_line = ema_12 - ema_26
        
        return {
            "MACD": float(macd_line),
            "signal": float(macd_line * 0.9),
            "histogram": float(macd_line * 0.1)
        }
    
    def _calculate_sma(self, prices: List[float], period: int) -> float:
        """Calculate Simple Moving Average"""
        if len(prices) < period:
            return float(np.mean(prices))
        return float(np.mean(prices[-period:]))
    
    def _calculate_ema(self, prices: List[float], period: int) -> float:
        """Calculate Exponential Moving Average"""
        if len(prices) < period:
            return float(np.mean(prices))
        
        multiplier = 2 / (period + 1)
        ema = self._calculate_sma(prices[:period], period)
        
        for price in prices[period:]:
            ema = (price - ema) * multiplier + ema
        
        return float(ema)

if __name__ == "__main__":
    server = TechnicalAnalysisMCPServer()
    print(f"Starting {server.name} v{server.version}")
