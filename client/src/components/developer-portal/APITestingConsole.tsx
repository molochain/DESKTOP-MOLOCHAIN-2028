// API Testing Console Component
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Copy, 
  Check, 
  Clock, 
  Server, 
  Database, 
  Zap,
  AlertCircle,
  CheckCircle,
  Code,
  FileJson,
  Globe
} from 'lucide-react';
import { getDocumentationApiUrl } from '@/lib/apiConfig';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
}

interface TestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  timestamp: string;
}

const apiEndpoints: APIEndpoint[] = [
  // Authentication endpoints
  { method: 'POST', path: '/api/auth/login', description: 'User login', category: 'Authentication', requiresAuth: false },
  { method: 'POST', path: '/api/auth/register', description: 'User registration', category: 'Authentication', requiresAuth: false },
  { method: 'GET', path: '/api/auth/me', description: 'Get current user', category: 'Authentication', requiresAuth: true },
  { method: 'POST', path: '/api/auth/logout', description: 'User logout', category: 'Authentication', requiresAuth: true },

  // Health endpoints
  { method: 'GET', path: '/api/health/system', description: 'System health status', category: 'Health', requiresAuth: false },
  { method: 'GET', path: '/api/health/endpoints', description: 'Service endpoints health', category: 'Health', requiresAuth: false },
  { method: 'GET', path: '/api/health-recommendations', description: 'Health recommendations', category: 'Health', requiresAuth: false },

  // Services endpoints
  { method: 'GET', path: '/api/services', description: 'List all services', category: 'Services', requiresAuth: false },
  { method: 'GET', path: '/api/services/:id', description: 'Get service details', category: 'Services', requiresAuth: false },
  { method: 'GET', path: '/api/services/:id/availability/:regionCode', description: 'Service availability', category: 'Services', requiresAuth: false },

  // Tracking endpoints
  { method: 'GET', path: '/api/tracking/shipments', description: 'List shipments', category: 'Tracking', requiresAuth: true },
  { method: 'POST', path: '/api/tracking/shipments', description: 'Create shipment', category: 'Tracking', requiresAuth: true },
  { method: 'GET', path: '/api/tracking/shipments/:id', description: 'Get shipment details', category: 'Tracking', requiresAuth: true },

  // Analytics endpoints
  { method: 'GET', path: '/api/analytics/dashboard', description: 'Dashboard analytics', category: 'Analytics', requiresAuth: true },
  { method: 'GET', path: '/api/analytics/reports', description: 'Analytics reports', category: 'Analytics', requiresAuth: true },

  // Collaboration endpoints
  { method: 'GET', path: '/api/collaboration/projects', description: 'List projects', category: 'Collaboration', requiresAuth: true },
  { method: 'POST', path: '/api/collaboration/projects', description: 'Create project', category: 'Collaboration', requiresAuth: true },

  // Admin endpoints
  { method: 'GET', path: '/api/admin/users', description: 'List users', category: 'Admin', requiresAuth: true },
  { method: 'POST', path: '/api/admin/users', description: 'Create user', category: 'Admin', requiresAuth: true },
  { method: 'GET', path: '/api/admin/settings', description: 'System settings', category: 'Admin', requiresAuth: true }
];

export function APITestingConsole() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{}');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [activeTab, setActiveTab] = useState('endpoints');

  const executeTest = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const endpoint = selectedEndpoint ? selectedEndpoint.path : customEndpoint;
      const requestMethod = selectedEndpoint ? selectedEndpoint.method : method;
      
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      const requestOptions: RequestInit = {
        method: requestMethod,
        headers: parsedHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && body.trim()) {
        try {
          JSON.parse(body); // Validate JSON
          requestOptions.body = body;
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      const response = await fetch(endpoint, requestOptions);
      const endTime = performance.now();
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const result: TestResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };

      setTestResult(result);
    } catch (error) {
      const endTime = performance.now();
      const result: TestResult = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: (error as Error).message },
        responseTime: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };
      setTestResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = async () => {
    if (testResult) {
      await navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return 'default';
    if (status >= 300 && status < 400) return 'secondary';
    if (status >= 400 && status < 500) return 'destructive';
    if (status >= 500) return 'destructive';
    return 'outline';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status >= 300 && status < 400) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    if (status >= 400) return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const categories = [...new Set(apiEndpoints.map(endpoint => endpoint.category))];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">API Testing Console</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Test MoloChain API endpoints directly in your browser with real-time responses and debugging information.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">Available Endpoints</TabsTrigger>
          <TabsTrigger value="custom">Custom Request</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Endpoint List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
                <CardDescription>
                  Select an endpoint to test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category}>
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="space-y-2">
                        {apiEndpoints.filter(ep => ep.category === category).map((endpoint, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedEndpoint === endpoint ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedEndpoint(endpoint)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{endpoint.method}</Badge>
                                <code className="text-sm">{endpoint.path}</code>
                              </div>
                              {endpoint.requiresAuth && (
                                <Badge variant="secondary">Auth</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Request Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Request Configuration
                </CardTitle>
                <CardDescription>
                  Configure and execute API requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedEndpoint && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Testing: <strong>{selectedEndpoint.method} {selectedEndpoint.path}</strong>
                        {selectedEndpoint.requiresAuth && (
                          <span className="block text-yellow-600 mt-1">
                            This endpoint requires authentication
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="headers">Headers (JSON)</Label>
                    <Textarea
                      id="headers"
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>

                  {selectedEndpoint && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                    <div>
                      <Label htmlFor="body">Request Body (JSON)</Label>
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                        placeholder='{\n  "key": "value"\n}'
                      />
                    </div>
                  )}

                  <Button 
                    onClick={executeTest} 
                    disabled={!selectedEndpoint || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {testResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Response
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(testResult.status)}>
                      {getStatusIcon(testResult.status)}
                      <span className="ml-2">{testResult.status} {testResult.statusText}</span>
                    </Badge>
                    <Button size="sm" variant="outline" onClick={copyResult}>
                      {copiedResult ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Response time: {testResult.responseTime}ms • {new Date(testResult.timestamp).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="body">
                  <TabsList>
                    <TabsTrigger value="body">Response Body</TabsTrigger>
                    <TabsTrigger value="headers">Response Headers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="body">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {typeof testResult.data === 'string' 
                          ? testResult.data 
                          : JSON.stringify(testResult.data, null, 2)
                        }
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="headers">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(testResult.headers, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Custom API Request
              </CardTitle>
              <CardDescription>
                Create and test custom API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="custom-method">Method</Label>
                    <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="custom-endpoint">Endpoint URL</Label>
                    <Input
                      id="custom-endpoint"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="/api/your-endpoint"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-headers">Headers (JSON)</Label>
                  <Textarea
                    id="custom-headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div>
                    <Label htmlFor="custom-body">Request Body (JSON)</Label>
                    <Textarea
                      id="custom-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='{\n  "key": "value"\n}'
                    />
                  </div>
                )}

                <Button 
                  onClick={executeTest} 
                  disabled={!customEndpoint || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Custom Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
{`// Fetch system health
const response = await fetch('/api/health/system');
const healthData = await response.json();

// Create shipment with authentication
const shipmentResponse = await fetch('/api/tracking/shipments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    origin: 'New York',
    destination: 'Los Angeles',
    cargo: 'Electronics'
  })
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>cURL Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
{`# Get system health
curl -X GET ${getDocumentationApiUrl()}/api/health/system

# Create user (with authentication)
curl -X POST ${getDocumentationApiUrl()}/api/admin/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "username": "newuser",
    "email": "user@molochain.com",
    "role": "user"
  }'`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}