/**
 * Communication System Demo Component
 * 
 * Demonstrates WebSocket connectivity and communication features
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wifi, 
  WifiOff, 
  Send, 
  MessageSquare,
  Activity
} from 'lucide-react';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  messageId: string;
}

export function CommunicationDemo() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

  const connectWebSocket = () => {
    if (ws?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnectionStatus('connected');
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
        
        // Handle connection establishment
        if (message.type === 'connection_established') {
          setConnectionId(message.payload.connectionId);
        }
      } catch (error) {
        // Failed to parse WebSocket message
      }
    };

    socket.onclose = () => {
      setConnectionStatus('disconnected');
      setConnectionId(null);
    };

    socket.onerror = () => {
      setConnectionStatus('error');
    };

    setWs(socket);
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const sendTestMessage = () => {
    if (ws?.readyState === WebSocket.OPEN && testMessage.trim()) {
      const message = {
        type: 'test_message',
        payload: { message: testMessage },
        timestamp: Date.now(),
        messageId: crypto.randomUUID()
      };

      ws.send(JSON.stringify(message));
      setTestMessage('');
    }
  };

  const sendHeartbeat = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'heartbeat',
        payload: {},
        timestamp: Date.now(),
        messageId: crypto.randomUUID()
      };

      ws.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const getStatusBadge = () => {
    const configs = {
      connected: { variant: 'default' as const, icon: Wifi, text: 'Connected', className: 'bg-green-100 text-green-800' },
      connecting: { variant: 'secondary' as const, icon: Activity, text: 'Connecting...', className: 'bg-blue-100 text-blue-800' },
      disconnected: { variant: 'secondary' as const, icon: WifiOff, text: 'Disconnected', className: 'bg-gray-100 text-gray-800' },
      error: { variant: 'destructive' as const, icon: WifiOff, text: 'Error', className: 'bg-red-100 text-red-800' }
    };

    const config = configs[connectionStatus];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WebSocket Communication Demo</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={connectWebSocket} 
              disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
              variant="default"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Connect
            </Button>
            
            <Button 
              onClick={disconnectWebSocket} 
              disabled={connectionStatus !== 'connected'}
              variant="outline"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>

            <Button 
              onClick={sendHeartbeat} 
              disabled={connectionStatus !== 'connected'}
              variant="outline"
            >
              <Activity className="h-4 w-4 mr-2" />
              Heartbeat
            </Button>
          </div>

          {connectionId && (
            <div className="text-sm text-gray-600">
              Connection ID: <code className="bg-gray-100 px-2 py-1 rounded">{connectionId}</code>
            </div>
          )}

          <div className="text-sm text-gray-600">
            WebSocket URL: <code className="bg-gray-100 px-2 py-1 rounded">{wsUrl}</code>
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Enter test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTestMessage()}
              disabled={connectionStatus !== 'connected'}
            />
            <Button 
              onClick={sendTestMessage} 
              disabled={connectionStatus !== 'connected' || !testMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            WebSocket Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Connect and send a test message!
              </div>
            ) : (
              messages.slice(-10).reverse().map((message, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-mono">{message.type}</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(message.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}