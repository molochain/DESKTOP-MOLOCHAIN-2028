import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { WebSocketProvider, useWebSocket } from '@/contexts/WebSocketContext';
import { LogMessage, LogLevel } from '@/types/logging';
import { Badge } from "@/components/ui/badge";

function ConnectionLog({ logs }: { logs: LogMessage[] }) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={logContainerRef}
      className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-96 overflow-y-auto"
    >
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span 
            className={
              log.level === LogLevel.ERROR ? 'text-red-400' : 
              log.level === LogLevel.WARN ? 'text-yellow-400' : 
              log.level === LogLevel.INFO ? 'text-blue-400' : 
              'text-green-400'
            }
          >
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConnectionStatus({ isConnected, state }: { isConnected: boolean, state: any }) {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Reconnect Attempts:</span> {state.reconnectAttempts}/{state.maxAttempts}
        </div>
        <div>
          <span className="text-gray-500">Authenticated:</span> {state.isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="text-gray-500">Last Heartbeat:</span> {state.lastHeartbeat ? new Date(state.lastHeartbeat).toLocaleTimeString() : 'Never'}
        </div>
        <div>
          <span className="text-gray-500">Last Error:</span> {state.lastError || 'None'}
        </div>
      </div>
    </div>
  );
}

function WebSocketStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Connection Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total Connections:</span>
              <span className="font-mono">{stats?.connections || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Active Connections:</span>
              <span className="font-mono">{(stats?.connections || 0) - (stats?.disconnections || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Error Count:</span>
              <span className="font-mono">{stats?.errors || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Avg. Latency:</span>
              <span className="font-mono">{stats?.avgLatency || 'N/A'} ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg. Connection Duration:</span>
              <span className="font-mono">{stats?.avgConnectionDuration ? `${Math.round(stats.avgConnectionDuration / 1000)}s` : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Messages Exchanged:</span>
              <span className="font-mono">{(stats?.messagesReceived || 0) + (stats?.messagesSent || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessageTester({ onSendMessage, onClear }: { onSendMessage: (message: string) => void, onClear: () => void }) {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex mb-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a test message..."
          className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="rounded-l-none">Send</Button>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSendMessage(JSON.stringify({type: 'ping', timestamp: Date.now()}))}
        >
          Send Ping
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSendMessage(JSON.stringify({type: 'echo', message: 'Hello Server!', timestamp: Date.now()}))}
        >
          Echo Test
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
        >
          Clear Logs
        </Button>
      </div>
    </div>
  );
}

interface DiagnosticToolProps {
  isConnected: boolean;
  connectionState: any;
  sendMessage: (data: any) => boolean;
  reconnect: () => void;
}

function DiagnosticsTool({ isConnected, connectionState, sendMessage, reconnect }: DiagnosticToolProps) {
  const [activeTab, setActiveTab] = useState('main');
  const [healthData, setHealthData] = useState<any>(null);
  const [connectionLogs, setConnectionLogs] = useState<LogMessage[]>([]);
  const [healthLogs, setHealthLogs] = useState<LogMessage[]>([]);
  const [dedicatedLogs, setDedicatedLogs] = useState<LogMessage[]>([]);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const { toast } = useToast();
  
  // Reference to WebSocket connections
  const healthWsRef = useRef<WebSocket | null>(null);
  const dedicatedWsRef = useRef<WebSocket | null>(null);

  // Add a log message to the appropriate log
  const addLog = (message: string, level: LogLevel = LogLevel.INFO, logType: 'main' | 'health' | 'dedicated' = 'main') => {
    const logMessage: LogMessage = {
      timestamp: Date.now(),
      message,
      level
    };
    
    if (logType === 'main') {
      setConnectionLogs(prev => [...prev, logMessage]);
    } else if (logType === 'health') {
      setHealthLogs(prev => [...prev, logMessage]);
    } else {
      setDedicatedLogs(prev => [...prev, logMessage]);
    }
  };

  // Fetch WebSocket health data
  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/ws-health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.metrics);
        addLog(`Fetched health data: ${data.status}`, LogLevel.INFO, 'main');
      } else {
        addLog(`Failed to fetch health data: ${response.status}`, LogLevel.ERROR, 'main');
      }
    } catch (error) {
      addLog(`Error fetching health data: ${error}`, LogLevel.ERROR, 'main');
    }
  };

  // Connect to the health WebSocket
  const connectToHealthWs = () => {
    // Close existing connection if any
    if (healthWsRef.current && healthWsRef.current.readyState === WebSocket.OPEN) {
      healthWsRef.current.close();
    }
    
    try {
      addLog('Connecting to health WebSocket...', LogLevel.INFO, 'health');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/health`;
      
      const ws = new WebSocket(wsUrl);
      healthWsRef.current = ws;
      
      ws.addEventListener('open', () => {
        addLog('Health WebSocket connection established', LogLevel.INFO, 'health');
      });
      
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`Received: ${JSON.stringify(data)}`, LogLevel.INFO, 'health');
        } catch (err) {
          addLog(`Failed to parse message: ${event.data}`, LogLevel.ERROR, 'health');
        }
      });
      
      ws.addEventListener('close', (event) => {
        addLog(`Health WebSocket connection closed: ${event.code} ${event.reason}`, LogLevel.WARN, 'health');
      });
      
      ws.addEventListener('error', (error) => {
        addLog(`Health WebSocket error: ${error}`, LogLevel.ERROR, 'health');
        setErrorOccurred(true);
      });
      
    } catch (error) {
      addLog(`Failed to connect to health WebSocket: ${error}`, LogLevel.ERROR, 'health');
      setErrorOccurred(true);
    }
  };

  // Connect to the dedicated health WebSocket
  const connectToDedicatedWs = () => {
    // Close existing connection if any
    if (dedicatedWsRef.current && dedicatedWsRef.current.readyState === WebSocket.OPEN) {
      dedicatedWsRef.current.close();
    }
    
    try {
      addLog('Connecting to dedicated health WebSocket...', LogLevel.INFO, 'dedicated');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/dedicated-health`;
      
      const ws = new WebSocket(wsUrl);
      dedicatedWsRef.current = ws;
      
      ws.addEventListener('open', () => {
        addLog('Dedicated health WebSocket connection established', LogLevel.INFO, 'dedicated');
      });
      
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`Received: ${JSON.stringify(data)}`, LogLevel.INFO, 'dedicated');
        } catch (err) {
          addLog(`Failed to parse message: ${event.data}`, LogLevel.ERROR, 'dedicated');
        }
      });
      
      ws.addEventListener('close', (event) => {
        addLog(`Dedicated health WebSocket connection closed: ${event.code} ${event.reason}`, LogLevel.WARN, 'dedicated');
      });
      
      ws.addEventListener('error', (error) => {
        addLog(`Dedicated health WebSocket error: ${error}`, LogLevel.ERROR, 'dedicated');
        setErrorOccurred(true);
      });
      
    } catch (error) {
      addLog(`Failed to connect to dedicated health WebSocket: ${error}`, LogLevel.ERROR, 'dedicated');
      setErrorOccurred(true);
    }
  };

  // Send a message to the health WebSocket
  const sendHealthMessage = (message: string) => {
    if (healthWsRef.current && healthWsRef.current.readyState === WebSocket.OPEN) {
      try {
        healthWsRef.current.send(message);
        addLog(`Sent: ${message}`, LogLevel.INFO, 'health');
      } catch (error) {
        addLog(`Failed to send message: ${error}`, LogLevel.ERROR, 'health');
      }
    } else {
      addLog('Cannot send message: WebSocket not connected', LogLevel.WARN, 'health');
    }
  };

  // Send a message to the dedicated health WebSocket
  const sendDedicatedMessage = (message: string) => {
    if (dedicatedWsRef.current && dedicatedWsRef.current.readyState === WebSocket.OPEN) {
      try {
        dedicatedWsRef.current.send(message);
        addLog(`Sent: ${message}`, LogLevel.INFO, 'dedicated');
      } catch (error) {
        addLog(`Failed to send message: ${error}`, LogLevel.ERROR, 'dedicated');
      }
    } else {
      addLog('Cannot send message: WebSocket not connected', LogLevel.WARN, 'dedicated');
    }
  };

  // Send a message to the main WebSocket
  const sendMainMessage = (message: string) => {
    try {
      // Try to parse the message as JSON
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch (e) {
        // If not valid JSON, send as a string message
        parsedMessage = { type: 'message', content: message };
      }
      
      const success = sendMessage(parsedMessage);
      if (success) {
        addLog(`Sent: ${JSON.stringify(parsedMessage)}`, LogLevel.INFO, 'main');
      } else {
        addLog('Failed to send message: not connected', LogLevel.WARN, 'main');
      }
    } catch (error) {
      addLog(`Error sending message: ${error}`, LogLevel.ERROR, 'main');
    }
  };

  // Reset logs
  const clearLogs = (logType: 'main' | 'health' | 'dedicated' = 'main') => {
    if (logType === 'main') {
      setConnectionLogs([]);
    } else if (logType === 'health') {
      setHealthLogs([]);
    } else {
      setDedicatedLogs([]);
    }
  };

  // Initialize tabs on component mount
  useEffect(() => {
    // Add initial logs
    addLog('WebSocket diagnostics tool initialized', LogLevel.INFO, 'main');
    addLog('Ready to connect to health WebSocket', LogLevel.INFO, 'health');
    addLog('Ready to connect to dedicated health WebSocket', LogLevel.INFO, 'dedicated');
    
    // Fetch initial health data
    fetchHealthData();
    
    // Set up interval to fetch health data
    const interval = setInterval(fetchHealthData, 5000);
    
    return () => {
      clearInterval(interval);
      
      // Close WebSocket connections on unmount
      if (healthWsRef.current) {
        healthWsRef.current.close();
      }
      if (dedicatedWsRef.current) {
        dedicatedWsRef.current.close();
      }
    };
  }, []);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      addLog('Main WebSocket connected', LogLevel.INFO, 'main');
    } else if (connectionState.reconnectAttempts > 0) {
      addLog(`Main WebSocket disconnected, reconnect attempt: ${connectionState.reconnectAttempts}`, LogLevel.WARN, 'main');
    }
    
    if (connectionState.lastError) {
      addLog(`Connection error: ${connectionState.lastError}`, LogLevel.ERROR, 'main');
    }
  }, [isConnected, connectionState]);

  // Show error notification when an error occurs
  useEffect(() => {
    if (errorOccurred) {
      toast({
        title: "WebSocket Error",
        description: "One or more WebSocket connections experienced errors. Check the logs for details.",
        variant: "destructive"
      });
      setErrorOccurred(false);
    }
  }, [errorOccurred, toast]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">WebSocket Diagnostics</h1>
      
      {connectionState.lastError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {connectionState.lastError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <Badge variant={isConnected ? "default" : "destructive"} className={`mr-2 ${isConnected ? "bg-green-500 text-white" : ""}`}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant="outline">
            Reconnects: {connectionState.reconnectAttempts}/{connectionState.maxAttempts}
          </Badge>
        </div>
        <Button onClick={() => reconnect()} disabled={isConnected && connectionState.reconnectAttempts === 0}>
          Reconnect Main WebSocket
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="main">Main Connection</TabsTrigger>
          <TabsTrigger value="health">Health Service</TabsTrigger>
          <TabsTrigger value="dedicated">Dedicated Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main">
          <Card>
            <CardHeader>
              <CardTitle>Main WebSocket Connection</CardTitle>
              <CardDescription>
                Monitor and diagnose the primary WebSocket connection used by the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionStatus isConnected={isConnected} state={connectionState} />
              <MessageTester onSendMessage={sendMainMessage} onClear={() => clearLogs('main')} />
              <ConnectionLog logs={connectionLogs} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health WebSocket Service</CardTitle>
              <CardDescription>
                Connect to the health WebSocket endpoint to test connection stability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthData && <WebSocketStats stats={healthData} />}
              
              <div className="flex justify-between mb-4">
                <Button onClick={connectToHealthWs}>
                  Connect to Health WebSocket
                </Button>
                <Button onClick={fetchHealthData} variant="outline">
                  Refresh Stats
                </Button>
              </div>
              
              <MessageTester onSendMessage={sendHealthMessage} onClear={() => clearLogs('health')} />
              <ConnectionLog logs={healthLogs} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dedicated">
          <Card>
            <CardHeader>
              <CardTitle>Dedicated Health Service</CardTitle>
              <CardDescription>
                Connect to the dedicated health endpoint for low-level WebSocket diagnostics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={connectToDedicatedWs}>
                  Connect to Dedicated Health
                </Button>
              </div>
              
              <MessageTester onSendMessage={sendDedicatedMessage} onClear={() => clearLogs('dedicated')} />
              <ConnectionLog logs={dedicatedLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Create a component that uses WebSocket inside the provider
function DiagnosticsWithWebSocket() {
  const { isConnected, connectionState, sendMessage, reconnect } = useWebSocket();
  
  return (
    <DiagnosticsTool 
      isConnected={isConnected}
      connectionState={connectionState}
      sendMessage={sendMessage}
      reconnect={reconnect}
    />
  );
}

// Wrap with WebSocketProvider  
export default function WebSocketHealth() {
  return (
    <WebSocketProvider endpoint="/ws/health" reconnectConfig={{ maxAttempts: 5 }}>
      <DiagnosticsWithWebSocket />
    </WebSocketProvider>
  );
}