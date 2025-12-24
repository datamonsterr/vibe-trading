import { useHealth } from './hooks/useApi';
import { Activity } from 'lucide-react';

function App() {
  const { data, error, isLoading } = useHealth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <Activity className="w-12 h-12 text-indigo-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">QuantFlow</h1>
        </div>

        <p className="text-center text-gray-600 mb-8">
          Algorithmic Trading & Financial Intelligence Platform
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">API Status</h2>
          {isLoading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              Loading...
            </div>
          )}
          {error && (
            <div className="text-red-600">
              ❌ Error: Unable to connect to API
            </div>
          )}
          {data && (
            <div className="text-green-600 flex items-center">
              ✓ Connected - Status: {data.status}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">Market Data</h3>
            <p className="text-sm text-indigo-700">Real-time VN50/VN100</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-indigo-700">GPT-4o + Mem0</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">Low-Code</h3>
            <p className="text-sm text-indigo-700">Strategy Builder</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
