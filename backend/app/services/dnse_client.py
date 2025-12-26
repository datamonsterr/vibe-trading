import logging
import asyncio
from typing import Optional
from vnstock.connector.dnse.trade import Trade

logger = logging.getLogger(__name__)

class DNSEClient:
    """
    DNSEClient wrapping vnstock.connector.dnse.trade.Trade.
    Maintains compatibility with previous interface where possible,
    but primarily serves as a bridge to vnstock's DNSE integration.
    """
    def __init__(self, ws_url: Optional[str] = None, token: Optional[str] = None):
        # ws_url is legacy (DNSEClient was raw WS). vnstock uses its own endpoints.
        # we might store it if needed, but vnstock Trade manages connection.
        self.ws_url = ws_url
        self.token = token
        self.trade = Trade() # Initialize vnstock Trade connector
        self.is_connected = False
        self.callbacks = []

    async def connect(self):
        """
        Initialize connection/login using vnstock.
        Note: vnstock Trade is synchronous.
        """
        try:
            logger.info("Initializing DNSE Trade connection via vnstock...")
            # Ideally we call login here if we have credentials.
            # self.trade.login(username=..., password=...) 
            # For now, we assume credentials are managed by env vars or passed elsewhere,
            # or simply mark as connected to the library wrapper.
            self.is_connected = True
            logger.info("DNSE Trade wrapper initialized")
        except Exception as e:
            logger.error(f"Failed to initialize DNSE Trade: {e}")
            self.is_connected = False
            raise

    async def authenticate(self):
        """
        Authenticate using vnstock mechanisms.
        """
        if self.token:
             # vnstock might use token?
             # Trade.login might accept it?
             pass
        # If using env vars, vnstock might auto-detect.

    async def subscribe(self, topic: str):
        """
        Legacy WS subscription method.
        vnstock Trade does not support WS subscription for market data.
        """
        logger.warning(f"Subscribe {topic} not supported by vnstock Trade connector. Use VNStockService for market data.")

    async def _listen(self):
        """
        Legacy listener. No-op in vnstock wrapper.
        """
        pass

    def add_callback(self, callback):
        self.callbacks.append(callback)

    async def disconnect(self):
        self.is_connected = False
