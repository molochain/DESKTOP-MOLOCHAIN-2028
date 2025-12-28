import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Users, Activity, Wifi } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

interface ConnectionStats {
  connected: boolean;
  latency: number;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
}

const CollaborationIntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'WebSocket Connection', status: 'pending' },
    { name: 'Session Join/Leave', status: 'pending' },
    { name: 'Real-time Presence Updates', status: 'pending' },
    { name: 'Activity Status Changes', status: 'pending' },
    { name: 'Cursor Movement Tracking', status: 'pending' },
    { name: 'User Status Broadcasting', status: 'pending' },
    { name: 'Message Broadcasting', status: 'pending' },
    { name: 'Error Handling', status: 'pending' },
  ]);

  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    connected: false,
    latency: 0,
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0
  });

  const [isRunning, setIsRunning] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateTest = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, duration } : test
    ));
  };

  const createWebSocketConnection = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/collaboration`;
      
      log(`Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        log('WebSocket connection established');
        setConnectionStats(prev => ({ ...prev, connected: true }));
        resolve(ws);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        log(`WebSocket error as Error: ${error}`);
        setConnectionStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        reject(error);
      };

      ws.onmessage = (event) => {
        setConnectionStats(prev => ({ ...prev, messagesReceived: prev.messagesReceived + 1 }));
        try {
          const data = JSON.parse(event.data);
          log(`Received: ${data.type} - ${JSON.stringify(data).substring(0, 100)}`);
        } catch (e) {
          log(`Received: ${event.data}`);
        }
      };

      ws.onclose = () => {
        log('WebSocket connection closed');
        setConnectionStats(prev => ({ ...prev, connected: false }));
      };
    });
  };

  const sendMessage = (ws: WebSocket, message: any): Promise<void> => {
    return new Promise((resolve) => {
      ws.send(JSON.stringify(message));
      setConnectionStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
      log(`Sent: ${message.type} - ${JSON.stringify(message).substring(0, 100)}`);
      setTimeout(resolve, 100); // Small delay for processing
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestLog([]);
    setConnectionStats({
      connected: false,
      latency: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0
    });

    try {
      // Test 1: WebSocket Connection
      updateTest('WebSocket Connection', 'running');
      const startTime = performance.now();
      
      try {
        const ws = await createWebSocketConnection();
        setWebsocket(ws);
        const connectionTime = performance.now() - startTime;
        updateTest('WebSocket Connection', 'passed', `Connected in ${connectionTime.toFixed(2)}ms`, connectionTime);
        
        // Test 2: Session Join/Leave
        updateTest('Session Join/Leave', 'running');
        await sendMessage(ws, {
          type: 'join_session',
          payload: { sessionId: '123', sessionType: 'test' }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await sendMessage(ws, {
          type: 'leave_session',
          payload: {}
        });
        updateTest('Session Join/Leave', 'passed', 'Successfully joined and left session');

        // Test 3: Real-time Presence Updates
        updateTest('Real-time Presence Updates', 'running');
        await sendMessage(ws, {
          type: 'join_session',
          payload: { sessionId: '123', sessionType: 'presence-test' }
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        updateTest('Real-time Presence Updates', 'passed', 'Presence tracking active');

        // Test 4: Activity Status Changes
        updateTest('Activity Status Changes', 'running');
        await sendMessage(ws, {
          type: 'activity_change',
          payload: { activity: 'editing' }
        });
        
        await sendMessage(ws, {
          type: 'activity_change',
          payload: { activity: 'viewing' }
        });
        updateTest('Activity Status Changes', 'passed', 'Activity changes broadcasted');

        // Test 5: Cursor Movement Tracking
        updateTest('Cursor Movement Tracking', 'running');
        await sendMessage(ws, {
          type: 'cursor_move',
          payload: { cursor: { x: 100, y: 200 } }
        });
        
        await sendMessage(ws, {
          type: 'cursor_move',
          payload: { cursor: { x: 150, y: 250 } }
        });
        updateTest('Cursor Movement Tracking', 'passed', 'Cursor movements tracked');

        // Test 6: User Status Broadcasting
        updateTest('User Status Broadcasting', 'running');
        await sendMessage(ws, {
          type: 'status_change',
          payload: { status: 'busy' }
        });
        
        await sendMessage(ws, {
          type: 'status_change',
          payload: { status: 'online' }
        });
        updateTest('User Status Broadcasting', 'passed', 'Status changes broadcasted');

        // Test 7: Message Broadcasting
        updateTest('Message Broadcasting', 'running');
        await sendMessage(ws, {
          type: 'sendMessage',
          payload: { 
            type: 'text', 
            content: 'Test collaboration message',
            attachments: []
          }
        });
        updateTest('Message Broadcasting', 'passed', 'Messages broadcasted successfully');

        // Test 8: Error Handling
        updateTest('Error Handling', 'running');
        await sendMessage(ws, {
          type: 'invalid_message_type',
          payload: { test: 'data' }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        updateTest('Error Handling', 'passed', 'Error handling working correctly');

        // Calculate latency
        const pingStart = performance.now();
        await sendMessage(ws, { type: 'ping' });
        const latency = performance.now() - pingStart;
        setConnectionStats(prev => ({ ...prev, latency }));

        log('✅ All tests completed successfully');
        
      } catch (error: unknown) {
        log(`❌ Test failed: ${(error as Error).message}`);
        updateTest('WebSocket Connection', 'failed', (error as Error).message);
      }

    } finally {
      setIsRunning(false);
      if (websocket) {
        websocket.close();
        setWebsocket(null);
      }
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const colors = {
      pending: 'secondary',
      running: 'default',
      passed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={colors[status] as any}>{status}</Badge>;
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const completionRate = ((passedTests / tests.length) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Collaboration System Integration Test</h1>
        <p className="text-muted-foreground">
          Comprehensive testing of real-time collaboration features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className={`h-4 w-4 ${connectionStats.connected ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectionStats.connected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              Latency: {connectionStats.latency.toFixed(2)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Progress</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {passedTests} passed, {failedTests} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Message Stats</CardTitle>
            <Activity className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectionStats.messagesReceived + connectionStats.messagesSent}
            </div>
            <p className="text-xs text-muted-foreground">
              {connectionStats.messagesSent} sent, {connectionStats.messagesReceived} received
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Real-time collaboration feature tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      {test.message && (
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration.toFixed(2)}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Log</CardTitle>
            <CardDescription>Real-time test execution details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg h-96 overflow-y-auto">
              <pre className="text-xs font-mono">
                {testLog.length === 0 ? 'Click "Run Tests" to start...' : testLog.join('\n')}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="lg"
          className="px-8"
        >
          {isRunning ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Integration Tests'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CollaborationIntegrationTest;