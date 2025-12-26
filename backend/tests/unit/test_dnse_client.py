import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.dnse_client import DNSEClient
import json

@pytest.mark.asyncio
async def test_dnse_client_connect():
    with patch("websockets.connect", new_callable=AsyncMock) as mock_connect:
        mock_ws = AsyncMock()
        mock_connect.return_value = mock_ws
        
        client = DNSEClient("wss://test.url")
        await client.connect()
        
        assert client.is_connected
        mock_connect.assert_called_with("wss://test.url")

@pytest.mark.asyncio
async def test_dnse_client_subscribe():
    with patch("websockets.connect", new_callable=AsyncMock) as mock_connect:
        mock_ws = AsyncMock()
        mock_connect.return_value = mock_ws
        
        client = DNSEClient("wss://test.url")
        await client.connect()
        
        await client.subscribe("STOCK_INFO")
        
        expected_payload = json.dumps({"action": "subscribe", "channel": "STOCK_INFO"})
        mock_ws.send.assert_called_with(expected_payload)

@pytest.mark.asyncio
async def test_dnse_client_message_handling():
    with patch("websockets.connect", new_callable=AsyncMock) as mock_connect:
        mock_ws = AsyncMock()
        mock_connect.return_value = mock_ws
        
        # Mock incoming messages
        mock_ws.__aiter__.return_value = [
            json.dumps({"data": {"symbol": "HPG", "price": 25000}})
        ]
        
        client = DNSEClient("wss://test.url")
        
        callback = AsyncMock()
        client.add_callback(callback)
        
        await client.connect()
        # Wait for listen task to process (it runs in background)
        await asyncio.sleep(0.1)
        
        callback.assert_called_once()
        call_args = callback.call_args[0][0]
        assert call_args["data"]["symbol"] == "HPG"
