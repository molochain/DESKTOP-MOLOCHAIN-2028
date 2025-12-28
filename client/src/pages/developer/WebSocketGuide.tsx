import { useState } from "react";
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">WebSocket API Guide</h1>
          <p className="text-xl text-muted-foreground">
            Learn how to integrate with our real-time WebSocket APIs for live updates and notifications
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Documentation Purpose</AlertTitle>
                <AlertDescription>
                  This documentation covers how to interact with the MOLOCHAIN platform's WebSocket APIs for real-time data.
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>Introduction to WebSockets</h2>
                <p>
                  WebSockets provide a persistent connection between a client and server, allowing for bi-directional, 
                  real-time data transfer. Unlike HTTP, which follows a request-response pattern, WebSockets enable the 
                  server to push data to clients without the client having to request it.
                </p>
                
                <h3>Key Benefits</h3>
                <ul>
                  <li><strong>Real-time updates:</strong> Receive instant notifications and data updates without polling</li>
                  <li><strong>Reduced latency:</strong> Minimize communication overhead with persistent connections</li>
                  <li><strong>Bi-directional communication:</strong> Enable interactive features and real-time collaboration</li>
                  <li><strong>Efficient bandwidth usage:</strong> Lower data transfer overhead compared to HTTP polling</li>
                </ul>
                
                <h3>When to Use WebSockets</h3>
                <p>
                  WebSockets are ideal for applications that require real-time functionality, such as:
                </p>
                <ul>
                  <li>Live tracking of shipments and logistics operations</li>
                  <li>Real-time notifications and alerts</li>
                  <li>Collaborative editing and planning</li>
                  <li>Live dashboards and monitoring</li>
                  <li>Chat and messaging features</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available WebSocket Services</CardTitle>
                    <CardDescription>
                      Our platform offers multiple WebSocket endpoints for specific use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Main WebSocket</span>
                          <p className="text-sm text-muted-foreground">General-purpose real-time updates and events</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Tracking WebSocket</span>
                          <p className="text-sm text-muted-foreground">Real-time shipment and container tracking updates</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Notifications WebSocket</span>
                          <p className="text-sm text-muted-foreground">User notifications and alerts</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Radio className="h-5 w-5 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Collaboration WebSocket</span>
                          <p className="text-sm text-muted-foreground">Real-time collaborative features</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                      Follow these steps to start using our WebSocket APIs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="text-sm">
                        <span className="font-medium">Register for an API key</span>
                        <p className="pl-5 text-muted-foreground">Required for authenticated WebSocket connections</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Choose the appropriate WebSocket endpoint</span>
                        <p className="pl-5 text-muted-foreground">Select the endpoint that matches your requirements</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Implement client-side WebSocket handling</span>
                        <p className="pl-5 text-muted-foreground">Use our code examples to connect to the WebSocket service</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Handle connection management</span>
                        <p className="pl-5 text-muted-foreground">Implement reconnection logic for robust connectivity</p>
                      </li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild>
                      <Link href="#examples">
                        <p>View Code Examples</p>
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
                <h2>WebSocket Endpoints</h2>
                <p>
                  Our platform provides multiple WebSocket endpoints, each designed for specific types of real-time communication.
                  Connect to the appropriate endpoint based on your integration needs.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card id="main-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <CardTitle>Main WebSocket</CardTitle>
                    </div>
                    <CardDescription>
                      General-purpose WebSocket for platform-wide events and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Endpoint URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/main
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Message Types</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Direction</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">auth</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Authentication with JWT token</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">system_update</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>System-wide updates and announcements</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">ping</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Keep-alive message to prevent connection timeout</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">pong</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>Response to ping message</TableCell>
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
                      <CardTitle>Tracking WebSocket</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time tracking updates for shipments, containers, and vehicles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Endpoint URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/tracking
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Message Types</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Direction</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">subscribe_tracking</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Subscribe to tracking updates for specific shipments</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">tracking_update</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>Real-time location and status updates</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">tracking_event</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>Significant events (e.g., arrival, departure, customs clearance)</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">unsubscribe_tracking</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Unsubscribe from tracking updates</TableCell>
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
                      <CardTitle>Notifications WebSocket</CardTitle>
                    </div>
                    <CardDescription>
                      User-specific notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Endpoint URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/notifications
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Message Types</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Direction</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">notification</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>User notifications (alerts, reminders, updates)</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">mark_read</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Mark notifications as read</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">preferences_update</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Update notification preferences</TableCell>
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
                      <CardTitle>Collaboration WebSocket</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time collaboration features for multi-user interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Endpoint URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/collaboration
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Message Types</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Direction</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">join_room</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Join a collaboration room/session</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">leave_room</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Leave a collaboration room/session</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">document_update</TableCell>
                              <TableCell>Bi-directional</TableCell>
                              <TableCell>Changes to shared documents or projects</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">user_presence</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>User presence/activity updates</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card id="project-updates-ws">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="h-6 w-6 text-primary" />
                      <CardTitle>Project Updates WebSocket</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time updates for specific projects and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Endpoint URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          wss://your-domain.com/ws/project-updates
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Message Types</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Direction</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">subscribe_project</TableCell>
                              <TableCell>Client → Server</TableCell>
                              <TableCell>Subscribe to updates for specific projects</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">project_update</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>Status and progress updates for projects</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">milestone_completed</TableCell>
                              <TableCell>Server → Client</TableCell>
                              <TableCell>Notification when project milestones are reached</TableCell>
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
                <h2>WebSocket Authentication</h2>
                <p>
                  Most WebSocket endpoints require authentication to ensure secure access to user-specific data.
                  We support two authentication methods for WebSocket connections:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Token-Based Authentication</CardTitle>
                    <CardDescription>
                      Authenticate using a JWT token in the initial WebSocket message
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      After establishing a WebSocket connection, send an authentication message with your JWT token:
                    </p>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{`// Send this message after connection is established
socket.send(JSON.stringify({
  type: "auth",
  token: "your-jwt-token"
}));`}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(`// Send this message after connection is established
socket.send(JSON.stringify({
  type: "auth",
  token: "your-jwt-token"
}));`, "token-auth")}
                      >
                        {copied === "token-auth" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cookie-Based Authentication</CardTitle>
                    <CardDescription>
                      Use existing session cookies for authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      If you're already authenticated in the browser, your session cookies will be automatically included in the WebSocket connection request.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Note: This method only works in web browsers and requires the WebSocket connection to be made to the same domain as your authenticated session.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Alert>
                <AlertTitle>Authentication Failure Handling</AlertTitle>
                <AlertDescription>
                  If authentication fails, the server will send an error message and close the connection.
                  Your client should handle this by attempting to re-authenticate or notifying the user.
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert mt-6">
                <h3>Authentication Error Handling</h3>
                <p>
                  When authentication fails, the server will send an error message with a specific code before closing the connection:
                </p>
                
                <div className="not-prose">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>4001</TableCell>
                        <TableCell>Authentication Required</TableCell>
                        <TableCell>No authentication provided</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4002</TableCell>
                        <TableCell>Invalid Token</TableCell>
                        <TableCell>The provided token is invalid or expired</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4003</TableCell>
                        <TableCell>Insufficient Permissions</TableCell>
                        <TableCell>The authenticated user lacks permission for this WebSocket endpoint</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <h3>Keeping Authentication Valid</h3>
                <p>
                  JWT tokens have expiration times. To maintain a long-lived WebSocket connection:
                </p>
                <ul>
                  <li>Listen for authentication expiration messages from the server</li>
                  <li>Re-authenticate with a new token when the current one is about to expire</li>
                  <li>Handle connection interruptions by re-authenticating upon reconnection</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert mb-6">
                <h2>Code Examples</h2>
                <p>
                  Below are examples of how to connect to our WebSocket endpoints in different programming languages.
                </p>
              </div>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="browser">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4" />
                      Browser JavaScript
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{connectionExample}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(connectionExample, "browser-code")}
                      >
                        {copied === "browser-code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="nodejs">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4" />
                      Node.js
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{nodeClientExample}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(nodeClientExample, "node-code")}
                      >
                        {copied === "node-code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="python">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4" />
                      Python
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{pythonExample}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(pythonExample, "python-code")}
                      >
                        {copied === "python-code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reconnection">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconnection Logic
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{reconnectionExample}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(reconnectionExample, "reconnect-code")}
                      >
                        {copied === "reconnect-code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator className="my-8" />
              
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Advanced Usage Examples</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subscribing to Tracking Updates</CardTitle>
                    <CardDescription>
                      How to subscribe to real-time tracking updates for specific shipments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{`// First connect to the tracking WebSocket
const socket = new WebSocket('wss://your-domain.com/ws/tracking');

socket.onopen = () => {
  console.log("Connected to tracking WebSocket");
  
  // Authenticate
  socket.send(JSON.stringify({
    type: "auth",
    token: "your-jwt-token"
  }));
  
  // Subscribe to tracking updates for specific shipments
  socket.send(JSON.stringify({
    type: "subscribe_tracking",
    tracking_ids: ["MOLO123456789", "MOLO987654321"]
  }));
};

// Handle incoming tracking updates
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "tracking_update") {
    console.log("Shipment location updated:", data.tracking_id);
    console.log("New location:", data.location);
    console.log("Status:", data.status);
    
    // Update your UI with the new tracking information
    updateShipmentUI(data);
  }
  
  if (data.type === "tracking_event") {
    console.log("Tracking event occurred:", data.tracking_id);
    console.log("Event:", data.event_type);
    console.log("Details:", data.details);
    
    // Show notification for important events
    if (data.event_type === "arrived" || data.event_type === "departed") {
      showNotification(data);
    }
  }
};`}</code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(`// First connect to the tracking WebSocket
const socket = new WebSocket('wss://your-domain.com/ws/tracking');

socket.onopen = () => {
  console.log("Connected to tracking WebSocket");
  
  // Authenticate
  socket.send(JSON.stringify({
    type: "auth",
    token: "your-jwt-token"
  }));
  
  // Subscribe to tracking updates for specific shipments
  socket.send(JSON.stringify({
    type: "subscribe_tracking",
    tracking_ids: ["MOLO123456789", "MOLO987654321"]
  }));
};

// Handle incoming tracking updates
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "tracking_update") {
    console.log("Shipment location updated:", data.tracking_id);
    console.log("New location:", data.location);
    console.log("Status:", data.status);
    
    // Update your UI with the new tracking information
    updateShipmentUI(data);
  }
  
  if (data.type === "tracking_event") {
    console.log("Tracking event occurred:", data.tracking_id);
    console.log("Event:", data.event_type);
    console.log("Details:", data.details);
    
    // Show notification for important events
    if (data.event_type === "arrived" || data.event_type === "departed") {
      showNotification(data);
    }
  }
};`, "tracking-example")}
                      >
                        {copied === "tracking-example" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button asChild>
                  <Link href="/developer">
                    Back to Developer Portal
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}