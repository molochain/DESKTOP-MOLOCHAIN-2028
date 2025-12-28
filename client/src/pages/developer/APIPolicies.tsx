import { useState } from "react";
import { Link } from "wouter";
import { Clock, AlertTriangle, Info, Shield, Copy, Check, RefreshCw, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getDocumentationApiUrl } from '@/lib/apiConfig';

export default function APIPolicies() {
  const [activeTab, setActiveTab] = useState("rate-limiting");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const headerExample = `// Example of handling rate limit headers in JavaScript
fetch('/api/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(response => {
  // Check and log rate limit information
  const rateLimit = {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
    reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0')
  };
  
  console.log(\`Rate limit: \${rateLimit.remaining}/\${rateLimit.limit} requests remaining\`);
  console.log(\`Rate limit resets in \${Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)} seconds\`);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    console.error(\`Rate limit exceeded. Retry after \${retryAfter} seconds\`);
    
    // Implement retry logic here
    setTimeout(() => {
      // Retry the request
    }, retryAfter * 1000);
    
    return null;
  }
  
  return response.json();
})
.then(data => {
  if (data) {
    console.log('Data:', data);
  }
})
.catch(error => console.error('Error:', error));`;

  const backoffExample = `// Exponential backoff implementation in JavaScript
async function fetchWithBackoff(url, options = {}, maxRetries = 5) {
  let retries = 0;
  let delay = 1000; // Start with a 1 second delay
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // If not rate limited, return the response
      if (response.status !== 429) {
        return response;
      }
      
      // Handle rate limiting
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      
      // Use the server's retry-after or exponential backoff
      const waitTime = retryAfter ? retryAfter * 1000 : delay;
      
      console.warn(\`Rate limited. Retrying in \${waitTime / 1000} seconds (retry \${retries + 1}/\${maxRetries})\`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Exponential backoff with jitter
      delay = Math.min(delay * 2, 60000) * (0.8 + Math.random() * 0.4);
      retries++;
    } catch (error) {
      console.error('Request failed:', error);
      
      // For network errors, also implement backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 60000);
      retries++;
    }
  }
  
  throw new Error(\`Maximum retries (\${maxRetries}) exceeded\`);
}

// Example usage
fetchWithBackoff('/api/shipments', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));`;

  const versioningExample = `// API versioning in headers
fetch('/api/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Accept': 'application/json',
    'X-API-Version': '2023-10-15'  // Date-based version
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));

// API versioning in URL
fetch('/api/v2/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));`;

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">API Policies</h1>
          <p className="text-xl text-muted-foreground">
            Important information about rate limiting and API versioning
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid grid-cols-2 w-[400px] mb-6">
            <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
            <TabsTrigger value="versioning">API Versioning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rate-limiting">
            <div className="space-y-8">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Rate Limits Apply</AlertTitle>
                <AlertDescription>
                  All API endpoints are subject to rate limiting to ensure platform stability and fair usage.
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>Rate Limiting Policy</h2>
                <p>
                  MOLOCHAIN implements rate limiting to protect our infrastructure and ensure fair usage
                  of our API resources. Rate limits are applied on a per-endpoint and per-authentication basis.
                </p>
                
                <h3>Rate Limit Tiers</h3>
                <p>
                  Rate limits vary based on your account tier:
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Burst Limit</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Developer</TableCell>
                    <TableCell>60 requests/minute</TableCell>
                    <TableCell>100 requests/minute</TableCell>
                    <TableCell>Free tier for development and testing</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Basic</TableCell>
                    <TableCell>300 requests/minute</TableCell>
                    <TableCell>500 requests/minute</TableCell>
                    <TableCell>For small to medium businesses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Professional</TableCell>
                    <TableCell>1,000 requests/minute</TableCell>
                    <TableCell>1,500 requests/minute</TableCell>
                    <TableCell>For medium to large businesses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Enterprise</TableCell>
                    <TableCell>5,000+ requests/minute</TableCell>
                    <TableCell>7,500+ requests/minute</TableCell>
                    <TableCell>Custom limits available</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>Rate Limit Headers</h3>
                <p>
                  All API responses include headers that provide information about your current rate limit status:
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Header</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Example</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Limit</TableCell>
                    <TableCell>The maximum number of requests allowed in the current time window</TableCell>
                    <TableCell className="font-mono text-xs">1000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Remaining</TableCell>
                    <TableCell>The number of requests remaining in the current time window</TableCell>
                    <TableCell className="font-mono text-xs">985</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Reset</TableCell>
                    <TableCell>The Unix timestamp when the rate limit resets</TableCell>
                    <TableCell className="font-mono text-xs">1635789654</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">Retry-After</TableCell>
                    <TableCell>The number of seconds to wait before retrying (only present when rate limited)</TableCell>
                    <TableCell className="font-mono text-xs">30</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>Handling Rate Limits</h3>
                <p>
                  When a rate limit is exceeded, the API will respond with a 429 Too Many Requests status code.
                  Clients should implement proper error handling and backoff strategies.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Best Practices for Rate Limiting</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Do</h4>
                      <ul className="space-y-1 list-disc list-inside text-sm">
                        <li>Monitor your rate limit usage via response headers</li>
                        <li>Implement exponential backoff for retries</li>
                        <li>Cache responses when appropriate</li>
                        <li>Batch requests when possible</li>
                        <li>Optimize your API usage patterns</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Don't</h4>
                      <ul className="space-y-1 list-disc list-inside text-sm">
                        <li>Repeatedly retry requests without backoff</li>
                        <li>Ignore rate limit headers</li>
                        <li>Make unnecessary duplicate requests</li>
                        <li>Share API credentials across multiple applications</li>
                        <li>Scrape data unnecessarily</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Code Examples</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Handling Rate Limit Headers</CardTitle>
                    <CardDescription>
                      How to track and respond to rate limit information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{headerExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(headerExample, "header-example")}
                      >
                        {copied === "header-example" ? (
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
                    <CardTitle>Implementing Exponential Backoff</CardTitle>
                    <CardDescription>
                      Advanced retry strategy for rate limited requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{backoffExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(backoffExample, "backoff-example")}
                      >
                        {copied === "backoff-example" ? (
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
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Need Higher Limits?</AlertTitle>
                <AlertDescription>
                  If you need higher rate limits, please contact our sales team to discuss Enterprise options.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="versioning">
            <div className="space-y-8">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Versioning Strategy</AlertTitle>
                <AlertDescription>
                  Our API uses date-based versioning to ensure backward compatibility while enabling new features.
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>API Versioning</h2>
                <p>
                  MOLOCHAIN uses a versioning strategy to ensure that changes to our API don't break existing
                  integrations. We provide stable API versions with clear deprecation timelines.
                </p>
                
                <h3>Date-Based Versioning</h3>
                <p>
                  We use date-based versioning in the format <code>YYYY-MM-DD</code>. This approach allows us to:
                </p>
                <ul>
                  <li>Release new features without breaking existing integrations</li>
                  <li>Provide a clear timeline for API changes</li>
                  <li>Allow clients to select specific API behavior</li>
                  <li>Support multiple API versions simultaneously</li>
                </ul>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Specifying API Version</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    You can specify which API version to use through one of the following methods:
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="header">
                      <AccordionTrigger>HTTP Header (Recommended)</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          Include the <code>X-API-Version</code> header in your request:
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">X-API-Version: 2023-10-15</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="url">
                      <AccordionTrigger>URL Path</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          Include the major version number in the URL path:
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">{getDocumentationApiUrl()}/v2/shipments</code>
                        </pre>
                        <p className="text-sm mt-2 text-muted-foreground">
                          Note: URL versioning only supports major version numbers (v1, v2, etc.), not specific dates.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="accept">
                      <AccordionTrigger>Accept Header</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          Include the version in the Accept header:
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">Accept: application/json; version=2023-10-15</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="bg-muted rounded-md p-4 mt-4">
                    <p className="text-sm font-medium mb-1">Default Version</p>
                    <p className="text-sm">
                      If no version is specified, the API will use the oldest non-deprecated version. However, 
                      we strongly recommend always specifying a version explicitly.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">API Version Timeline</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End-of-Life Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2023-10-15</TableCell>
                      <TableCell>Oct 15, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Current</Badge>
                      </TableCell>
                      <TableCell>Oct 15, 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2023-04-20</TableCell>
                      <TableCell>Apr 20, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500">Maintained</Badge>
                      </TableCell>
                      <TableCell>Apr 20, 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2022-11-30</TableCell>
                      <TableCell>Nov 30, 2022</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500">Maintained</Badge>
                      </TableCell>
                      <TableCell>Nov 30, 2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2022-05-15</TableCell>
                      <TableCell>May 15, 2022</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500">Deprecated</Badge>
                      </TableCell>
                      <TableCell>May 15, 2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-12-01</TableCell>
                      <TableCell>Dec 1, 2021</TableCell>
                      <TableCell>
                        <Badge className="bg-red-500">End-of-Life</Badge>
                      </TableCell>
                      <TableCell>Dec 1, 2023</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="bg-muted rounded-md p-4">
                  <h4 className="font-medium mb-2">Version Status Definitions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">Current</Badge>
                      <span>Latest stable version with all new features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">Maintained</Badge>
                      <span>Fully supported with security updates but no new features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-orange-500">Deprecated</Badge>
                      <span>Still available but planned for removal, migration recommended</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-red-500">End-of-Life</Badge>
                      <span>No longer supported or available</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>Version Support Policy</h3>
                <ul>
                  <li>Each API version is supported for at least 24 months after its release</li>
                  <li>Deprecated versions will continue to function but will receive only critical security updates</li>
                  <li>We will provide at least 6 months notice before a version reaches end-of-life</li>
                  <li>Breaking changes will only be introduced in new API versions</li>
                </ul>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Code Examples</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Specifying API Version in Code</CardTitle>
                    <CardDescription>
                      How to include version information in your API requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{versioningExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(versioningExample, "versioning-example")}
                      >
                        {copied === "versioning-example" ? (
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
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Breaking Changes</AlertTitle>
                <AlertDescription>
                  Breaking changes will never be made to an existing API version after its release.
                  When we need to make breaking changes, we will release a new API version and provide clear migration guides.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8" />
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Security Recommendations</CardTitle>
                </div>
                <CardDescription>
                  Best practices for secure API integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Always use HTTPS for all API requests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Store API keys and tokens securely, never in client-side code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Implement proper error handling for security-related errors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>Rotate API keys regularly and when team members change</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/developer/security">
                    View Security Guide
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <CardTitle>Status & Uptime</CardTitle>
                </div>
                <CardDescription>
                  Current API status and historical uptime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">All Systems Operational</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check our status page for real-time and historical system performance
                  information, including planned maintenance windows.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <a href="https://status.molochain.com" target="_blank" rel="noopener noreferrer">
                    View Status Page
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/developer">
              Back to Developer Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}