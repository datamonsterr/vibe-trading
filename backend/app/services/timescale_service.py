from sqlalchemy.ext.asyncio import AsyncSession
from app.models.market import MarketTick
from typing import List
import logging

logger = logging.getLogger(__name__)


class TimescaleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def insert_ticks_batch(self, ticks: List[MarketTick]):
        try:
            self.db.add_all(ticks)
            await self.db.commit()
            logger.info(f"Inserted {len(ticks)} ticks")
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to insert ticks: {e}")
            raise
