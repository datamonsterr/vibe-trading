import pytest
from unittest.mock import patch
from app.services.vnstock_service import VNStockService


@pytest.fixture
def mock_vnstock_lib():
    with (
        patch("app.services.vnstock_service.Vnstock") as MockVnstock,
        patch("app.services.vnstock_service.Listing") as MockListing,
    ):
        yield MockVnstock, MockListing


def test_vnstock_init(mock_vnstock_lib):
    service = VNStockService(source="vci")
    assert service.source == "VCI"
    # Should initialize Vnstock and Listing
    mock_vnstock_lib[0].assert_called_once()
    mock_vnstock_lib[1].assert_called_once_with(source="vci")


def test_get_group_symbols_list(mock_vnstock_lib):
    MockVnstock, MockListing = mock_vnstock_lib
    mock_listing_instance = MockListing.return_value

    # Setup mock return for symbols_by_group
    # Case 1: Returns valid DataFrame with symbol column
    import pandas as pd

    mock_df = pd.DataFrame({"symbol": ["AAA", "BBB"]})
    mock_listing_instance.symbols_by_group.return_value = mock_df

    service = VNStockService()
    symbols = service.get_group_symbols("VN30")

    assert symbols == ["AAA", "BBB"]
    mock_listing_instance.symbols_by_group.assert_called_with("VN30")


def test_get_group_symbols_series(mock_vnstock_lib):
    MockVnstock, MockListing = mock_vnstock_lib
    mock_listing_instance = MockListing.return_value

    # Case 2: Returns Series
    import pandas as pd

    mock_series = pd.Series(["CCC", "DDD"])
    mock_listing_instance.symbols_by_group.return_value = mock_series

    service = VNStockService()
    symbols = service.get_group_symbols("VN30")

    assert symbols == ["CCC", "DDD"]


def test_get_latest_ticks_success(mock_vnstock_lib):
    MockVnstock, MockListing = mock_vnstock_lib
    mock_stock_instance = MockVnstock.return_value.stock.return_value
    mock_quote_adapter = mock_stock_instance.quote

    # Mock data return
    import pandas as pd

    mock_data = pd.DataFrame(
        [
            {"time": "2024-01-01 10:00:00", "price": 10000, "volume": 100},
            {"time": "2024-01-01 10:01:00", "price": 10100, "volume": 200},
        ]
    )
    mock_quote_adapter.intraday.return_value = mock_data

    service = VNStockService()
    ticks = service.get_latest_ticks("ABC")

    assert len(ticks) == 2
    assert ticks[0]["price"] == 10000
    # Correctly called underlying chain
    MockVnstock.return_value.stock.assert_called_with(
        symbol="ABC", source="VCI"
    )
    mock_quote_adapter.intraday.assert_called_with(symbol="ABC", page_size=100)


def test_get_latest_ticks_error(mock_vnstock_lib):
    MockVnstock, MockListing = mock_vnstock_lib
    mock_stock_instance = MockVnstock.return_value.stock.return_value
    mock_quote_adapter = mock_stock_instance.quote

    # Mock exception
    mock_quote_adapter.intraday.side_effect = Exception("API Error")

    service = VNStockService()
    ticks = service.get_latest_ticks("ABC")

    assert ticks == []
