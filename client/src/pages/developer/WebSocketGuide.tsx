import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Copy, Check, BookOpen, MessageSquare, Radio, Bell, Box, Activity, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function WebSocketGuide() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState<string | null>(null);
  
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const connectionExample = `// Browser (frontend)
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.host;
const wsUrl = \`\${protocol}//\${host}/ws/main\`;

const socket = new WebSocket(wsUrl);

socket.onopen = () => {
  console.log("WebSocket connection established");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received data:", data);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
  // Optional: implement reconnection logic
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};`;

  const nodeClientExample = `// Node.js (using WebSocket package)
import WebSocket from 'ws';

const socket = new WebSocket('wss://your-domain.com/ws/main');

socket.on('open', () => {
  console.log('Connected to the WebSocket server');
  
  // Send a message to the server
  socket.send(JSON.stringify({
    type: 'auth',
    token: 'your-auth-token'
  }));
});

socket.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
});

socket.on('close', () => {
  console.log('Disconnected from the WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});`;

  const pythonExample = `# Python (using websockets library)
import asyncio
import json
import websockets

async def connect_websocket():
    uri = "wss://your-domain.com/ws/main"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")
        
        # Send authentication message
        await websocket.send(json.dumps({
            "type": "auth",
            "token": "your-auth-token"
        }))
        
        # Listen for messages
        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received: {data}")
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed")
                break

asyncio.run(connect_websocket())`;

  const reconnectionExample = `// WebSocket reconnection logic
function createWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const wsUrl = \`\${protocol}//\${host}/ws/main\`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log("WebSocket connection established");
    // Reset reconnection attempts on successful connection
    reconnectionAttempts = 0;
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);
  };
  
  socket.onclose = (event) => {
    console.log("WebSocket connection closed", event.code, event.reason);
    // Only try to reconnect if the connection was closed abnormally
    if (event.code !== 1000) {
      handleReconnection();
    }
  };
  
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  
  return socket;
}

let socket;
let reconnectionAttempts = 0;
const maxReconnectionAttempts = 5;
const reconnectionDelay = 3000; // 3 seconds

function handleReconnection() {
  if (reconnectionAttempts < maxReconnectionAttempts) {
    reconnectionAttempts++;
    console.log(\`Attempting to reconnect (attempt \${reconnectionAttempts}/\${maxReconnectionAttempts})\`);
    
    // Exponential backoff strategy
    const delay = reconnectionDelay * Math.pow(1.5, reconnectionAttempts - 1);
    
    setTimeout(() => {
      socket = createWebSocket();
    }, delay);
  } else {
    console.error("Max reconnection attempts reached. Please refresh the page.");
  }
}

// Initial connection
socket = createWebSocket();`;

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t('developer.websocket.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('developer.websocket.subtitle')}
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">{t('developer.websocket.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="endpoints">{t('developer.websocket.tabs.endpoints')}</TabsTrigger>
            <TabsTrigger value="authentication">{t('developer.websocket.tabs.authentication')}</TabsTrigger>
            <TabsTrigger value="examples">{t('developer.websocket.tabs.codeExamples')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>{t('developer.websocket.alert.title')}</AlertTitle>
                <AlertDescription>
                  {t('developer.websocket.alert.description')}
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.websocket.sections.introduction')}</h2>
                <p>
                  {t('developer.websocket.sections.introductionDescription')}
                </p>
                
                <h3>{t('developer.websocket.sections.keyBenefits')}</h3>
                <ul>
                  <li><strong>{t('developer.websocket.benefits.realTimeUpdates')}:</strong> {t('developer.websocket.benefits.realTimeUpdatesDesc')}</li>
                  <li><strong>{t('developer.websocket.benefits.reducedLatency')}:</strong> {t('developer.websocket.benefits.reducedLatencyDesc')}</li>
                  <li><strong>{t('developer.websocket.benefits.bidirectional')}:</strong> {t('developer.websocket.benefits.bidirectionalDesc')}</li>
                  <li><strong>{t('developer.websocket.benefits.efficientBandwidth')}:</strong> {t('developer.websocket.benefits.efficientBandwidthDesc')}</li>
                </ul>
                
                <h3>{t('developer.websocket.sections.whenToUse')}</h3>
                <p>
                  {t('developer.websocket.sections.whenToUseDescription')}
                </p>
                <ul>
                  <li>{t('developer.websocket.useCases.liveTracking')}</li>
                  <li>{t('developer.websocket.useCases.realTimeNotifications')}</li>
                  <li>{t('developer.websocket.useCases.collaborativeEditing')}</li>
                  <li>{t('developer.websocket.useCases.liveDashboards')}</li>
                  <li>{t('developer.websocket.useCases.chatMessaging')}</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('developer.websocket.cards.availableServices.title')}</CardTitle>
                    <CardDescription>
                      {t('developer.websocket.cards.availableServices.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">{t('developer.websocket.services.main.title')}</span>
                          <p className="text-sm text-muted-foreground">{t('developer.websocket.services.main.description')}</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">{t('developer.websocket.services.tracking.title')}</span>
                          <p className="text-sm text-muted-foreground">{t('developer.websocket.services.tracking.description')}</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">{t('developer.websocket.services.notifications.title')}</span>
                          <p className="text-sm text-muted-foreground">{t('developer.websocket.services.notifications.description')}</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">{t('developer.websocket.services.collaboration.title')}</span>
                          <p className="text-sm text-muted-foreground">{t('developer.websocket.services.collaboration.description')}</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('developer.websocket.cards.gettingStarted.title')}</CardTitle>
                    <CardDescription>
                      {t('developer.websocket.cards.gettingStarted.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.websocket.gettingStarted.step1.title')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.websocket.gettingStarted.step1.description')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.websocket.gettingStarted.step2.title')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.websocket.gettingStarted.step2.description')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.websocket.gettingStarted.step3.title')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.websocket.gettingStarted.step3.description')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.websocket.gettingStarted.step4.title')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.websocket.gettingStarted.step4.description')}</p>
                      </li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild>
                      <Link href="#examples">
                        <p>{t('developer.websocket.buttons.viewCodeExamples')}</p>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="endpoints">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert mb-6">
                <h2>{t('developer.websocket.endpoints.title')}</h2>
                <p>
                  {t('developer.websocket.endpoints.description')}
                </p>
              </div>
              
              <div className="space-y-6">
                <Card id="main-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <CardTitle>{t('developer.websocket.endpoints.main.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.websocket.endpoints.main.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{t('developer.websocket.endpoints.endpointUrl')}</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/main
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('developer.websocket.endpoints.messageTypes')}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('developer.websocket.table.type')}</TableHead>
                              <TableHead>{t('developer.websocket.table.direction')}</TableHead>
                              <TableHead>{t('developer.websocket.table.description')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">auth</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.main.auth')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">system_update</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.main.systemUpdate')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">ping</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.main.ping')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">pong</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.main.pong')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card id="tracking-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Radio className="h-6 w-6 text-primary" />
                      <CardTitle>{t('developer.websocket.endpoints.tracking.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.websocket.endpoints.tracking.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{t('developer.websocket.endpoints.endpointUrl')}</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/tracking
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('developer.websocket.endpoints.messageTypes')}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('developer.websocket.table.type')}</TableHead>
                              <TableHead>{t('developer.websocket.table.direction')}</TableHead>
                              <TableHead>{t('developer.websocket.table.description')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">subscribe_tracking</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.tracking.subscribe')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">tracking_update</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.tracking.update')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">tracking_event</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.tracking.event')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">unsubscribe_tracking</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.tracking.unsubscribe')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card id="notifications-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-6 w-6 text-primary" />
                      <CardTitle>{t('developer.websocket.endpoints.notifications.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.websocket.endpoints.notifications.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{t('developer.websocket.endpoints.endpointUrl')}</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/notifications
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('developer.websocket.endpoints.messageTypes')}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('developer.websocket.table.type')}</TableHead>
                              <TableHead>{t('developer.websocket.table.direction')}</TableHead>
                              <TableHead>{t('developer.websocket.table.description')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">notification</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.notifications.notification')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">mark_read</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.notifications.markRead')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">preferences_update</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.notifications.preferencesUpdate')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card id="collaboration-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Box className="h-6 w-6 text-primary" />
                      <CardTitle>{t('developer.websocket.endpoints.collaboration.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.websocket.endpoints.collaboration.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{t('developer.websocket.endpoints.endpointUrl')}</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/collaboration
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('developer.websocket.endpoints.messageTypes')}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('developer.websocket.table.type')}</TableHead>
                              <TableHead>{t('developer.websocket.table.direction')}</TableHead>
                              <TableHead>{t('developer.websocket.table.description')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">join_room</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.collaboration.joinRoom')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">leave_room</TableCell>
                              <TableCell>{t('developer.websocket.table.clientToServer')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.collaboration.leaveRoom')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">document_update</TableCell>
                              <TableCell>{t('developer.websocket.table.bidirectional')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.collaboration.documentUpdate')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">presence_update</TableCell>
                              <TableCell>{t('developer.websocket.table.serverToClient')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.collaboration.presenceUpdate')}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">cursor_position</TableCell>
                              <TableCell>{t('developer.websocket.table.bidirectional')}</TableCell>
                              <TableCell>{t('developer.websocket.messages.collaboration.cursorPosition')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="authentication">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.websocket.authentication.title')}</h2>
                <p>
                  {t('developer.websocket.authentication.description')}
                </p>
                
                <h3>{t('developer.websocket.authentication.methods.title')}</h3>
                <p>
                  {t('developer.websocket.authentication.methods.description')}
                </p>
                
                <h4>{t('developer.websocket.authentication.tokenAuth.title')}</h4>
                <p>
                  {t('developer.websocket.authentication.tokenAuth.description')}
                </p>
                
                <h4>{t('developer.websocket.authentication.sessionAuth.title')}</h4>
                <p>
                  {t('developer.websocket.authentication.sessionAuth.description')}
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('developer.websocket.authentication.example.title')}</CardTitle>
                  <CardDescription>
                    {t('developer.websocket.authentication.example.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// After WebSocket connection is established
socket.onopen = () => {
  // Send authentication message
  socket.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token-here'
  }));
};

// Handle authentication response
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'auth_success') {
    console.log('Successfully authenticated');
  } else if (data.type === 'auth_error') {
    console.error('Authentication failed:', data.message);
  }
};`}</code>
                  </pre>
                </CardContent>
              </Card>
              
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>{t('developer.websocket.authentication.securityNote.title')}</AlertTitle>
                <AlertDescription>
                  {t('developer.websocket.authentication.securityNote.description')}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" id="examples">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.websocket.examples.title')}</h2>
                <p>
                  {t('developer.websocket.examples.description')}
                </p>
              </div>
              
              <Tabs defaultValue="browser">
                <TabsList>
                  <TabsTrigger value="browser">{t('developer.websocket.examples.tabs.browser')}</TabsTrigger>
                  <TabsTrigger value="nodejs">{t('developer.websocket.examples.tabs.nodejs')}</TabsTrigger>
                  <TabsTrigger value="python">{t('developer.websocket.examples.tabs.python')}</TabsTrigger>
                  <TabsTrigger value="reconnection">{t('developer.websocket.examples.tabs.reconnection')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="browser" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('developer.websocket.examples.browser.title')}</CardTitle>
                      <CardDescription>
                        {t('developer.websocket.examples.browser.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{connectionExample}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(connectionExample, "browser")}
                        >
                          {copied === "browser" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="nodejs" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('developer.websocket.examples.nodejs.title')}</CardTitle>
                      <CardDescription>
                        {t('developer.websocket.examples.nodejs.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{nodeClientExample}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(nodeClientExample, "nodejs")}
                        >
                          {copied === "nodejs" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="python" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('developer.websocket.examples.python.title')}</CardTitle>
                      <CardDescription>
                        {t('developer.websocket.examples.python.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{pythonExample}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(pythonExample, "python")}
                        >
                          {copied === "python" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reconnection" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('developer.websocket.examples.reconnection.title')}</CardTitle>
                      <CardDescription>
                        {t('developer.websocket.examples.reconnection.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{reconnectionExample}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(reconnectionExample, "reconnection")}
                        >
                          {copied === "reconnection" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
