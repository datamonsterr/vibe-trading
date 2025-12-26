import pytest
from unittest.mock import patch
from app.services.dnse_client import DNSEClient


@pytest.mark.asyncio
async def test_dnse_client_connect():
    # DNSEClient now wraps vnstock Trade, so we mock Trade
    with patch("app.services.dnse_client.Trade"):
        client = DNSEClient(ws_url="wss://ignored.url")
        await client.connect()

        assert client.is_connected
        # We don't verify Trade.login calls yet as implementation is minimal
        # but we verify it doesn't crash


@pytest.mark.asyncio
async def test_dnse_client_subscribe_warning():
    # Subscribe now warns
    with (
        patch("app.services.dnse_client.Trade"),
        patch("app.services.dnse_client.logger") as mock_logger,
    ):

        client = DNSEClient()
        await client.connect()
        await client.subscribe("STOCK_INFO")

        # Should verify warning is logged
        mock_logger.warning.assert_called()


# Dropping test_dnse_client_message_handling as DNSEClient no longer listens to WS
