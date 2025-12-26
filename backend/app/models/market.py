from sqlalchemy import Column, String, Float, DateTime
from app.db.database import Base


class MarketTick(Base):
    __tablename__ = "market_ticks"

    symbol = Column(String, primary_key=True, index=True)
    time = Column(DateTime(timezone=True), primary_key=True, index=True)
    price = Column(Float)
    volume = Column(Float)

    # TimescaleDB hypertable will be created on (time)
