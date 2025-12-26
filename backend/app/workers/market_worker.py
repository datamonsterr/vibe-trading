import asyncio
import logging
import os
from datetime import datetime
from app.services.vnstock_service import VNStockService
from app.services.timescale_service import TimescaleService
from app.db.database import AsyncSessionLocal
from app.models.market import MarketTick

logger = logging.getLogger(__name__)

class MarketWorker:
    def __init__(self):
        self.vnstock = VNStockService(source='vci')
        self.batch = []
        self.BATCH_SIZE = 100
        self.FLUSH_INTERVAL = 1.0 # seconds
        self.symbols = []

    async def start(self):
        logger.info("Starting Market Worker (VNStock Polling)...")
        # Fetch initial symbols
        self.symbols = self.vnstock.get_group_symbols("VN30")
        logger.info(f"Monitoring {len(self.symbols)} symbols from VN30")
        
        asyncio.create_task(self.poll_loop())
        asyncio.create_task(self.flush_loop())

    async def poll_loop(self):
        while True:
            try:
                for symbol in self.symbols:
                    # Run generic sync call in thread pool
                    ticks = await asyncio.to_thread(self.vnstock.get_latest_ticks, symbol)
                    
                    if ticks:
                        # Process only the latest tick for now, or all new ones if we track last time
                        # For simplicity, we take the last one (latest)
                        latest = ticks[-1]
                        await self.handle_tick(symbol, latest)
                    
                    await asyncio.sleep(0.2) # Throttle requests
                
                await asyncio.sleep(5) # Wait before next cycle
            except Exception as e:
                logger.error(f"Error in poll loop: {e}")
                await asyncio.sleep(5)

    async def handle_tick(self, symbol: str, tick_data: dict):
        # Map vnstock data to MarketTick
        try:
            # vnstock intraday keys might be 'time', 'price', 'volume' etc.
            # Adjust based on actual DF columns 
            price = tick_data.get('price', tick_data.get('close', 0))
            volume = tick_data.get('volume', 0)
            
            tick = MarketTick(
                symbol=symbol,
                time=datetime.now(), # generic timestamp, ideally parse tick_data['time']
                price=float(price),
                volume=float(volume)
            )
            self.batch.append(tick)
            
            if len(self.batch) >= self.BATCH_SIZE:
                await self.flush_batch()
        except Exception as e:
            logger.error(f"Error processing tick for {symbol}: {e}")

    async def flush_batch(self):
        if not self.batch:
            return
            
        async with AsyncSessionLocal() as db:
            service = TimescaleService(db)
            await service.insert_ticks_batch(self.batch)
            self.batch = []

    async def flush_loop(self):
        while True:
            await asyncio.sleep(self.FLUSH_INTERVAL)
            await self.flush_batch()

    async def stop(self):
        # Cleanup
        pass
