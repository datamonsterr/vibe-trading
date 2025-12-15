import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { stockApi, analysisApi, orderApi } from '@/lib/api';
import { StockData, Order } from '@/types';
import { TrendingUp, TrendingDown, Activity, FileText, ShoppingCart } from 'lucide-react';

export function Workspace() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'orders' | 'analysis'>('stocks');
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStocks();
    loadOrders();
  }, []);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getStocks(['VN30', 'VCB', 'FPT', 'HPG', 'VHM', 'VIC']);
      setStocks(data.stocks || []);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <div className="flex gap-2 p-4">
          <Button
            variant={activeTab === 'stocks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stocks')}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Stocks
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analysis')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Analysis
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vietnam Stock Market</h2>
              <Button onClick={loadStocks} disabled={loading}>
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stocks.map((stock) => (
                <Card key={stock.symbol}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{stock.symbol}</span>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(stock.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <span className="font-semibold">
                          {stock.price.toLocaleString()} VND
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Change:</span>
                        <span
                          className={`font-semibold ${
                            stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volume:</span>
                        <span>{stock.volume.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Open</div>
                          <div className="font-medium">{stock.open.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">High</div>
                          <div className="font-medium text-green-500">
                            {stock.high.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Low</div>
                          <div className="font-medium text-red-500">
                            {stock.low.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Orders</h2>
              <Button onClick={loadOrders}>Refresh</Button>
            </div>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <p className="text-sm mt-2">Create orders through the chat interface</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.orderId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {order.symbol} - {order.type.toUpperCase()}
                          </CardTitle>
                          <CardDescription>
                            {new Date(order.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === 'filled'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Quantity</div>
                          <div className="font-medium">{order.quantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-medium">{order.price.toLocaleString()} VND</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Exchange</div>
                          <div className="font-medium">{order.exchange}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Market Analysis</h2>
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Request analysis through the chat interface</p>
                <p className="text-sm mt-2">
                  Ask for technical analysis or news sentiment analysis
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
