import { ChatInterface } from './components/ChatInterface';
import { Workspace } from './components/Workspace';
import './index.css';

function App() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Vibe Trading - Vietnam Stock Market</h1>
          <p className="text-sm text-muted-foreground">
            Multi-agent AI assistant for stock analysis and trading
          </p>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Left side - Workspace */}
          <div className="h-full">
            <Workspace />
          </div>
          
          {/* Right side - Chat Interface */}
          <div className="h-full">
            <ChatInterface />
          </div>
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-2 text-center text-sm text-muted-foreground">
          <p>Vietnam Stock Trading Platform | Multi-Agent System with AWS Bedrock</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
