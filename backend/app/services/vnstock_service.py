import logging
import pandas as pd
from typing import Optional, Dict, Any, List
from vnstock import Vnstock, Quote, Listing
# We import Trade just to have it available or for future use, 
# but this service focuses on generic market data.
from vnstock.connector.dnse.trade import Trade

logger = logging.getLogger(__name__)

class VNStockService:
    def __init__(self, source: str = 'vci'):
        self.source = source.upper()
        # Vnstock factory to get the stock object which contains the quote adapter
        # We don't necessarily need a specific symbol at init, but Vnstock().stock() requires it.
        # We can create a helper to get quote adapter for a symbol.
        self._vnstock = Vnstock()
        self._listing = Listing(source=source)

    def _get_quote_adapter(self, symbol: str) -> Quote:
        # returns stock.quote
        return self._vnstock.stock(symbol=symbol, source=self.source).quote

    def get_group_symbols(self, group: str = 'VN30') -> List[str]:
        """
        Get list of symbols for a group.
        """
        try:
            data = self._listing.symbols_by_group(group)
            if data is not None and not data.empty:
                # symbols_by_group returns a Series of symbols directly in some versions/sources
                if isinstance(data, pd.Series):
                    return data.tolist()
                elif isinstance(data, pd.DataFrame) and 'symbol' in data.columns:
                    return data['symbol'].tolist()
            return []
        except Exception as e:
            logger.error(f"Error fetching symbols for group {group}: {e}")
            return []

    def get_latest_ticks(self, symbol: str, page_size: int = 100) -> List[Dict[str, Any]]:
        """
        Fetch intraday ticks. Returns list of dicts.
        """
        try:
            quote = self._get_quote_adapter(symbol)
            df = quote.intraday(symbol=symbol, page_size=page_size)
            if df is not None and not df.empty:
                # Convert to list of dicts
                # Expected columns: time, price, volume, etc.
                # Standardize keys if needed
                return df.to_dict('records')
            return []
        except Exception as e:
            logger.error(f"Error fetching intraday for {symbol} via {self.source}: {e}")
            return []

    def get_price_depth(self, symbol: str) -> List[Dict[str, Any]]:
        """
        Fetch price depth (order book).
        """
        try:
            quote = self._get_quote_adapter(symbol)
            df = quote.price_depth(symbol=symbol)
            if df is not None and not df.empty:
                return df.to_dict('records')
            return []
        except Exception as e:
            logger.error(f"Error fetching price depth for {symbol}: {e}")
            return []
