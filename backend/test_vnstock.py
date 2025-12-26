import asyncio
import logging
from app.services.vnstock_service import VNStockService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_vnstock_service():
    logger.info("Initializing VNStockService...")
    service = VNStockService(source="vci")

    logger.info("Fetching VN30 symbols...")
    symbols = service.get_group_symbols("VN30")
    logger.info(f"Retrieved {len(symbols)} symbols. First 5: {symbols[:5]}")

    if not symbols:
        logger.error("No symbols found!")
        return

    test_symbol = symbols[0]
    logger.info(f"Fetching ticks for {test_symbol}...")
    ticks = service.get_latest_ticks(test_symbol)

    if ticks:
        # Avoid printing entire list
        logger.info(f"Retrieved {len(ticks)} ticks.")
        logger.info(f"Latest tick: {ticks[-1]}")
    else:
        logger.warning(f"No ticks found for {test_symbol}")

    logger.info("Test complete.")


if __name__ == "__main__":
    asyncio.run(test_vnstock_service())
