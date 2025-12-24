# Using Context7 for vnstock Library

## Overview

This document provides guidance on using the Context7 MCP (Model Context Protocol) to access vnstock library documentation and examples.

## What is vnstock?

`vnstock` is a Python library for accessing Vietnam stock market data. It provides APIs to fetch:
- Real-time stock prices
- Historical data
- Company financials
- Market indices (VN-Index, VN30, HNX, etc.)
- Trading volumes and liquidity data

## Using Context7 for vnstock Documentation

### Step 1: Resolve Library ID

Before accessing vnstock documentation, resolve the library ID:

```typescript
// The agent will use this tool to get the exact library ID
mcp_context7_resolve-library-id({
  libraryName: "vnstock"
})
```

This returns a Context7-compatible library ID like `/thinh-vu/vnstock` or similar.

### Step 2: Get Documentation

Once you have the library ID, fetch documentation:

```typescript
// For API references and code examples (default mode)
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/thinh-vu/vnstock",
  mode: "code",
  topic: "stock data fetching",
  page: 1
})

// For conceptual guides and architecture
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/thinh-vu/vnstock",
  mode: "info",
  topic: "getting started",
  page: 1
})
```

## Common Use Cases

### 1. Fetching Stock Prices

**Query**: "How to fetch real-time stock prices using vnstock?"

The agent should:
1. Resolve library ID for vnstock
2. Get documentation with `topic: "stock prices"` and `mode: "code"`
3. Provide code examples and implementation guidance

### 2. Historical Data Retrieval

**Query**: "Get historical OHLCV data for VN30 stocks"

The agent should:
1. Use Context7 to find relevant APIs
2. Topic: `"historical data"` or `"OHLCV"`
3. Return code snippets and best practices

### 3. Market Indices

**Query**: "How to get VN-Index and HNX-Index data?"

The agent should:
1. Query with topic: `"indices"` or `"market indices"`
2. Provide examples of index data fetching

### 4. Company Financials

**Query**: "Fetch financial statements for a specific ticker"

The agent should:
1. Topic: `"financials"` or `"balance sheet"`
2. Return relevant API methods and parameters

## Best Practices

### When to Use Context7

✅ **Use Context7 when:**
- User asks about vnstock-specific APIs
- Need up-to-date vnstock documentation
- Looking for code examples from vnstock
- Understanding vnstock data structures
- Troubleshooting vnstock integration

❌ **Don't use Context7 for:**
- General Python questions
- FastAPI implementation (unless vnstock integration)
- Database queries (unless storing vnstock data)
- Frontend development

### Pagination

If initial results are insufficient:
- Increment `page` parameter: `page: 2`, `page: 3`, etc.
- Maximum page number is 10
- Try different topics if pagination doesn't help

### Mode Selection

- **`mode: "code"`** (default): Use when you need:
  - API references
  - Code snippets
  - Function signatures
  - Usage examples

- **`mode: "info"`**: Use when you need:
  - Conceptual explanations
  - Architecture overview
  - Installation guides
  - General understanding

## Integration with QuantFlow

### Market Data Ingestion Pipeline

When implementing Task 1.2 (Market Data Ingestion), use Context7 to:

```python
# Example: Using vnstock for data fetching
# Agent should query Context7 first to get the latest API

from vnstock import Vnstock

# Initialize client
stock = Vnstock().stock(symbol='VNM', source='VCI')

# Fetch real-time data
quote = stock.quote.history(start='2024-01-01', end='2024-12-31')

# Get company info
company_info = stock.company.overview()
```

### Integration Points

1. **Real-time Data Stream**: Use vnstock alongside DNSE WebSocket
2. **Historical Backfill**: Use vnstock for initial data population
3. **Fundamental Analysis**: Fetch financial ratios and statements
4. **Market Screening**: Filter stocks by market cap, P/E ratio, etc.

## Example Workflow

```
User: "How do I get stock data for VNM ticker?"

Agent Actions:
1. Call mcp_context7_resolve-library-id({ libraryName: "vnstock" })
2. Get library ID: "/thinh-vu/vnstock"
3. Call mcp_context7_get-library-docs({
     context7CompatibleLibraryID: "/thinh-vu/vnstock",
     mode: "code",
     topic: "stock data VNM ticker",
     page: 1
   })
4. Parse results and provide code example
5. Explain how to integrate with QuantFlow backend
```

## Troubleshooting

### No Results Found

If Context7 returns no results:
1. Try broader topic: `"stock"` instead of `"stock historical data OHLCV"`
2. Switch to `mode: "info"` for overview
3. Check if library name is correct: `"vnstock"` not `"vn-stock"`

### Outdated Documentation

If documentation seems outdated:
1. Note the version in Context7 response
2. Cross-reference with official GitHub: `https://github.com/thinh-vu/vnstock`
3. Document any discrepancies

### Rate Limits

Context7 may have rate limits:
- Cache frequently used documentation
- Batch queries when possible
- Don't query repeatedly for the same topic

## References

- **vnstock GitHub**: https://github.com/thinh-vu/vnstock
- **vnstock Documentation**: https://vnstock.site/
- **Context7 MCP**: Internal documentation on Context7 usage

---

**Last Updated**: December 24, 2025
**Maintainer**: QuantFlow Development Team
