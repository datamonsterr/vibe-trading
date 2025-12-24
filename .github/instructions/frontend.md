# Frontend Implementation Guide - QuantFlow

## Tech Stack Summary

**Framework**: React 18 + TypeScript  
**Workflow Builder**: React Flow  
**Charting**: TradingView Widget + D3.js  
**State Management**: React Context API / Zustand  
**Styling**: Tailwind CSS  
**Testing**: Jest + React Testing Library + Playwright

---

## Architecture Principles

### 1. Component-Driven Development
- Decompose UI into small, reusable components
- Each component has clear props interface and single responsibility
- Use TypeScript interfaces for all props

### 2. React Flow for Workflows
- Nodes represent operations (Trigger, Data, Logic, Action)
- Edges show data flow
- On save, serialize to JSON and POST to backend
- Validate graph before save (FastAPI validates again)

### 3. Real-Time Updates via WebSocket
- Establish WebSocket connection on app mount
- Listen for market data updates
- Update Dashboard, Heatmap, and Charts in real-time
- Graceful reconnection on disconnect

### 4. TradingView Charting
- Integrate tradingview-widget library
- Backend provides UDF endpoint matching TradingView format
- Support multiple resolutions (1D, 1H, 15m)

---

## Project Layout

```
frontend/
├── public/
├── src/
│   ├── App.tsx                  # Root component
│   ├── components/
│   │   ├── Dashboard/           # Big Picture Dashboard
│   │   ├── Heatmap/             # Industry Heatmap
│   │   ├── ChartPanel/          # TradingView integration
│   │   ├── WorkflowCanvas/      # React Flow canvas
│   │   ├── NodeConfigs/         # Node configuration panels
│   │   ├── ValueChain/          # Value chain visualization
│   │   └── Layout/              # Common layout components
│   ├── pages/
│   │   ├── MarketOverview.tsx
│   │   ├── StrategyBuilder.tsx
│   │   ├── Portfolio.tsx
│   │   └── Audit.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts      # WebSocket management
│   │   ├── useWorkflow.ts       # Workflow state
│   │   └── useMarketData.ts     # Market data fetching
│   ├── services/
│   │   ├── api.ts              # API client (axios/fetch)
│   │   └── websocket.ts        # WebSocket client
│   ├── context/
│   │   ├── AuthContext.tsx     # Auth state
│   │   └── MarketContext.tsx   # Market data state
│   ├── utils/
│   │   ├── formatters.ts       # Number/date formatting
│   │   └── validators.ts       # Input validation
│   ├── App.css
│   └── index.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── e2e/
│   └── tests/
├── package.json
└── tailwind.config.js
```

---

## Key UI Components

### 1. Dashboard (Market Snapshot)
**File**: `src/components/Dashboard/`

**Features**:
- Display VN-Index, DXY, Foreign net flow
- Real-time updates via WebSocket
- Responsive grid layout
- Widgets: Index sparkline, correlation gauge, sector summary

### 2. Recursive Heatmap
**File**: `src/components/Heatmap/`

**Features**:
- D3.js Treemap visualization
- Drill-down from Sector → Industry → Ticker
- Color = % change, Size = Market Cap
- Tooltip with real-time price

### 3. Workflow Canvas (React Flow)
**File**: `src/components/WorkflowCanvas/`

**Features**:
- Drag-and-drop node creation
- Node types: Trigger, Data, Logic, Action
- Configuration panels (sidebar)
- Graph validation before save
- Visual feedback on save success

**Node Types**:
```typescript
type NodeType = "trigger" | "data" | "logic" | "action";

interface WorkflowNode {
  id: string;
  type: NodeType;
  data: {
    label: string;
    config: Record<string, any>;
  };
  position: { x: number; y: number };
}
```

### 4. TradingView Chart
**File**: `src/components/ChartPanel/`

**Features**:
- Integration with tradingview-widget
- UDF data feed from backend
- Multiple chart types
- Technical indicator overlays

---

## Code Standards

**TypeScript**: Use strict mode, explicit types
```typescript
interface MarketSnapshot {
  vn_index: number;
  dxy: number;
  timestamp: Date;
}

const Dashboard: React.FC<{ data: MarketSnapshot }> = ({ data }) => {
  return <div>{data.vn_index}</div>;
};
```

**Component Naming**: PascalCase for components, camelCase for hooks/utils

**Props Interface**: Always define explicit interfaces
```typescript
interface DashboardProps {
  refreshInterval?: number;
  onError?: (error: Error) => void;
}
```

**Styling**: Use Tailwind CSS classes (no inline styles)
```typescript
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
```

**Async/Await**: Always handle errors with try-catch or .catch()
```typescript
try {
  const data = await api.getMarketSnapshot();
} catch (error) {
  logger.error("Failed to fetch snapshot", error);
}
```

---

## State Management

**React Context**: For global state (auth, market data)
```typescript
const MarketContext = React.createContext<MarketSnapshot | null>(null);

export const useMarketData = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarketData outside provider");
  return context;
};
```

**Custom Hooks**: For component-level logic
```typescript
export const useWorkflow = (workflowId: string) => {
  const [workflow, setWorkflow] = useState(null);
  useEffect(() => {
    api.fetchWorkflow(workflowId).then(setWorkflow);
  }, [workflowId]);
  return workflow;
};
```

---

## API Communication

**Axios Instance**:
```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

**API Service Methods**:
```typescript
export const marketAPI = {
  getSnapshot: () => api.get("/market/snapshot"),
  getHistory: (symbol: string, from: number, to: number) =>
    api.get(`/market/history`, { params: { symbol, from, to } }),
};
```

---

## WebSocket Integration

**Hook**:
```typescript
export const useWebSocket = (url: string) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (e) => setData(JSON.parse(e.data));
    return () => ws.close();
  }, [url]);
  return data;
};
```

**Usage**:
```typescript
const marketUpdate = useWebSocket("ws://localhost:8000/ws/market");
```

---

## Testing Requirements

Every component must have tests:
- Unit: Component renders correctly, props work
- Integration: API calls work, WebSocket updates trigger renders

Run: `npm test -- --coverage`

---

## Performance Tips

- Use `React.memo()` for expensive components
- Lazy load pages: `const Page = lazy(() => import("./Page"))`
- Memoize callbacks: `useCallback()` for event handlers
- Virtualize long lists: react-window
- Optimize renders: DevTools Profiler

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## See Also

- [requirements.md](../../guidelines/requirements.md) - Functional requirements
- [testing.md](../../guidelines/testing.md) - Frontend test examples
- [behavior.md](./behavior.md) - Best practices & workflow
