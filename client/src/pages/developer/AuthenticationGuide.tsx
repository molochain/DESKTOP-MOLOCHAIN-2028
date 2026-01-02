import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import { Copy, Check, Key, User, LockKeyhole, RefreshCw, Shield, AlertCircle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuthenticationGuide() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState<string | null>(null);
  
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const loginExample = `// Example: Login API Request
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for storing cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-secure-password'
  })
})
.then(response => {
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
})
.then(data => {
  console.log('Login successful:', data);
  // Store token if using token-based auth
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
})
.catch(error => console.error('Error:', error));`;

  const authorizationExample = `// Example: Making an authenticated API request
// Option 1: Using session cookies (automatically included)
fetch('/api/protected-resource', {
  method: 'GET',
  credentials: 'include', // Important for sending cookies
})
.then(response => {
  if (response.status === 401) {
    // Redirect to login page or show login prompt
    window.location.href = '/login';
    return;
  }
  return response.json();
})
.then(data => console.log('Protected data:', data))
.catch(error => console.error('Error:', error));

// Option 2: Using JWT token in Authorization header
const token = localStorage.getItem('auth_token');
fetch('/api/protected-resource', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
.then(response => {
  if (response.status === 401) {
    // Token may be expired, try to refresh or redirect to login
    refreshToken();
    return;
  }
  return response.json();
})
.then(data => console.log('Protected data:', data))
.catch(error => console.error('Error:', error));`;

  const tokenRefreshExample = `// Example: Token refresh function
function refreshToken() {
  return fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Important for cookie-based refresh
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    return response.json();
  })
  .then(data => {
    // Store the new token
    localStorage.setItem('auth_token', data.token);
    console.log('Token refreshed successfully');
    return data.token;
  })
  .catch(error => {
    console.error('Error refreshing token:', error);
    // Redirect to login page if refresh fails
    window.location.href = '/login';
    return null;
  });
}

// Auto-refresh token before expiration
function setupTokenRefresh(expiresInSeconds) {
  // Refresh 5 minutes before expiration
  const refreshTime = (expiresInSeconds - 300) * 1000;
  setTimeout(() => {
    refreshToken().then(newToken => {
      if (newToken) {
        // Reset the refresh timer with the new token's expiration
        setupTokenRefresh(expiresInSeconds);
      }
    });
  }, refreshTime);
}`;

  const mfaExample = `// Example: Two-factor authentication verification
function verifyTwoFactorCode(code) {
  return fetch('/api/auth/verify-2fa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      code: code
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('2FA verification failed');
    }
    return response.json();
  })
  .then(data => {
    console.log('2FA verification successful');
    
    // Store token if provided
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
    return true;
  })
  .catch(error => {
    console.error('Error verifying 2FA code:', error);
    return false;
  });
}

// Usage in a form
document.getElementById('2fa-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const code = document.getElementById('2fa-code').value;
  verifyTwoFactorCode(code);
});`;

  const nodeAuthenticationExample = `// Node.js example with Axios
const axios = require('axios');

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://your-domain.com/api',
  timeout: 10000
});

// Login function
async function login(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    // Store the token
    const token = response.data.token;
    
    // Set the token for all future requests
    api.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
    
    return token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Make authenticated request
async function fetchProtectedData() {
  try {
    const response = await api.get('/protected-resource');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      
      // Retry the request
      const retryResponse = await api.get('/protected-resource');
      return retryResponse.data;
    }
    
    console.error('Request failed:', error.response?.data || error.message);
    throw error;
  }
}

// Refresh token
async function refreshToken() {
  try {
    const response = await api.post('/auth/refresh');
    const newToken = response.data.token;
    
    // Update authorization header
    api.defaults.headers.common['Authorization'] = \`Bearer \${newToken}\`;
    
    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    throw error;
  }
}`;

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t('developer.authGuide.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('developer.authGuide.subtitle')}
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">{t('developer.authGuide.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="authentication">{t('developer.authGuide.tabs.authentication')}</TabsTrigger>
            <TabsTrigger value="authorization">{t('developer.authGuide.tabs.authorization')}</TabsTrigger>
            <TabsTrigger value="examples">{t('developer.authGuide.tabs.codeExamples')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('developer.authGuide.alerts.authVsAuthz')}</AlertTitle>
                <AlertDescription>
                  {t('developer.authGuide.alerts.authVsAuthzDesc')}
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.authGuide.overview.title')}</h2>
                <p>
                  {t('developer.authGuide.overview.description')}
                </p>
                
                <h3>{t('developer.authGuide.overview.methodsTitle')}</h3>
                <p>{t('developer.authGuide.overview.methodsDescription')}</p>
                <ul>
                  <li><strong>{t('developer.authGuide.overview.methods.session')}:</strong> {t('developer.authGuide.overview.methods.sessionDesc')}</li>
                  <li><strong>{t('developer.authGuide.overview.methods.jwt')}:</strong> {t('developer.authGuide.overview.methods.jwtDesc')}</li>
                  <li><strong>{t('developer.authGuide.overview.methods.twoFactor')}:</strong> {t('developer.authGuide.overview.methods.twoFactorDesc')}</li>
                  <li><strong>{t('developer.authGuide.overview.methods.apiKey')}:</strong> {t('developer.authGuide.overview.methods.apiKeyDesc')}</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <CardTitle>{t('developer.authGuide.flow.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.authGuide.flow.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="space-y-2 list-decimal list-inside">
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.authGuide.flow.step1')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.authGuide.flow.step1Desc')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.authGuide.flow.step2')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.authGuide.flow.step2Desc')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.authGuide.flow.step3')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.authGuide.flow.step3Desc')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.authGuide.flow.step4')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.authGuide.flow.step4Desc')}</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">{t('developer.authGuide.flow.step5')}</span>
                        <p className="pl-5 text-muted-foreground">{t('developer.authGuide.flow.step5Desc')}</p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>{t('developer.authGuide.security.title')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('developer.authGuide.security.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.https')}</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.storeTokens')}</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.refresh')}</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.twoFactor')}</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.validate')}</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{t('developer.authGuide.security.errorHandling')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="authentication">
            <div className="space-y-8">
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.authGuide.endpoints.title')}</h2>
                <p>
                  {t('developer.authGuide.endpoints.description')}
                </p>
              </div>
              
              <Card id="login-endpoint">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.authGuide.endpoints.login.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('developer.authGuide.endpoints.login.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">POST /api/auth/login</h3>
                    <p className="text-sm text-muted-foreground mb-4">Authenticates a user and returns a session cookie or JWT token</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold">Request Body</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">email</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>User's email address</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">password</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>User's password</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">remember</TableCell>
                              <TableCell>boolean</TableCell>
                              <TableCell>Optional. Set to true for extended session duration</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold">Response</h4>
                        <p className="text-sm mb-2">Success (200 OK)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Only provided for token-based auth
  "mfa_required": false
}`}</code>
                          </pre>
                        </div>
                        
                        <p className="text-sm mt-4 mb-2">With MFA Required (200 OK)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": true,
  "mfa_required": true,
  "mfa_type": "totp",
  "temp_token": "temporary-token-for-mfa-verification"
}`}</code>
                          </pre>
                        </div>
                        
                        <p className="text-sm mt-4 mb-2">Failure (401 Unauthorized)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": false,
  "message": "Invalid email or password"
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card id="register-endpoint">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.authGuide.endpoints.register.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('developer.authGuide.endpoints.register.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">POST /api/auth/register</h3>
                    <p className="text-sm text-muted-foreground mb-4">Creates a new user account</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold">Request Body</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono text-xs">email</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>User's email address</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">password</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>User's password (min 8 characters)</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">name</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>User's full name</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono text-xs">company</TableCell>
                              <TableCell>string</TableCell>
                              <TableCell>Optional. User's company name</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold">Response</h4>
                        <p className="text-sm mb-2">Success (201 Created)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Only provided for token-based auth
}`}</code>
                          </pre>
                        </div>
                        
                        <p className="text-sm mt-4 mb-2">Failure (400 Bad Request)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}`}</code>
                          </pre>
                        </div>
                        
                        <p className="text-sm mt-4 mb-2">Conflict (409 Conflict)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": false,
  "message": "User with this email already exists"
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card id="refresh-endpoint">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.authGuide.endpoints.refresh.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('developer.authGuide.endpoints.refresh.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">POST /api/auth/refresh</h3>
                    <p className="text-sm text-muted-foreground mb-4">Refreshes an expired JWT token using a refresh token or session cookie</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold">Request</h4>
                        <p className="text-sm mb-2">
                          This endpoint requires either:
                        </p>
                        <ul className="list-disc list-inside text-sm mb-4">
                          <li>A valid refresh token in the request body</li>
                          <li>A valid HTTP-only cookie containing the refresh token</li>
                        </ul>
                        
                        <p className="text-sm mb-2">With refresh token in body:</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "refresh_token": "refresh-token-value"
}`}</code>
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold">Response</h4>
                        <p className="text-sm mb-2">Success (200 OK)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600 // Token expiration in seconds
}`}</code>
                          </pre>
                        </div>
                        
                        <p className="text-sm mt-4 mb-2">Failure (401 Unauthorized)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": false,
  "message": "Invalid or expired refresh token"
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card id="logout-endpoint">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.authGuide.endpoints.logout.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('developer.authGuide.endpoints.logout.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">POST /api/auth/logout</h3>
                    <p className="text-sm text-muted-foreground mb-4">Logs out the current user by invalidating their session or token</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold">Request</h4>
                        <p className="text-sm">
                          No request body is required. The server identifies the user from:
                        </p>
                        <ul className="list-disc list-inside text-sm">
                          <li>Session cookie (for cookie-based auth)</li>
                          <li>Authorization header (for token-based auth)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold">Response</h4>
                        <p className="text-sm mb-2">Success (200 OK)</p>
                        <div className="relative">
                          <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{`{
  "success": true,
  "message": "Logged out successfully"
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="authorization">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.authGuide.authorization.title')}</h2>
                <p>
                  {t('developer.authGuide.authorization.description')}
                </p>
                
                <h3>{t('developer.authGuide.authorization.methodsTitle')}</h3>
                <p>{t('developer.authGuide.authorization.methodsDescription')}</p>
                <ul>
                  <li><strong>{t('developer.authGuide.authorization.methods.rbac')}:</strong> {t('developer.authGuide.authorization.methods.rbacDesc')}</li>
                  <li><strong>{t('developer.authGuide.authorization.methods.resource')}:</strong> {t('developer.authGuide.authorization.methods.resourceDesc')}</li>
                  <li><strong>{t('developer.authGuide.authorization.methods.scoped')}:</strong> {t('developer.authGuide.authorization.methods.scopedDesc')}</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t('developer.authGuide.authorization.rolesTitle')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('developer.authGuide.authorization.rolesDescription')}
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Admin</TableCell>
                      <TableCell>System administrators</TableCell>
                      <TableCell>Full access to all platform features and user management</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Manager</TableCell>
                      <TableCell>Organization managers</TableCell>
                      <TableCell>Access to organization data, users, and projects</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Agent</TableCell>
                      <TableCell>Logistics agents</TableCell>
                      <TableCell>Access to assigned shipments, tracking, and client communication</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Client</TableCell>
                      <TableCell>End clients</TableCell>
                      <TableCell>Access to own shipments, tracking, and service requests</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">API</TableCell>
                      <TableCell>API integrations</TableCell>
                      <TableCell>Limited access based on API token scopes</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{t('developer.authGuide.authorization.scopesTitle')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('developer.authGuide.authorization.scopesDescription')}
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs">tracking:read</TableCell>
                      <TableCell>Read-only access to tracking information</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">shipments:read</TableCell>
                      <TableCell>Read-only access to shipment data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">shipments:write</TableCell>
                      <TableCell>Create and update shipments</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">documents:read</TableCell>
                      <TableCell>Access to shipping documents</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">documents:write</TableCell>
                      <TableCell>Upload and update shipping documents</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">rates:read</TableCell>
                      <TableCell>Access to shipping rates and quotes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">users:read</TableCell>
                      <TableCell>Read user information (admin only)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">users:write</TableCell>
                      <TableCell>Create and update users (admin only)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('developer.authGuide.authorization.makingRequests')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.authorization.makingRequestsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-medium">Bearer Token Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your JWT token or API key in the Authorization header:
                  </p>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`, "bearer-auth")}
                    >
                      {copied === "bearer-auth" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                  
                  <h4 className="font-medium mt-4">Cookie Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    When using cookie-based authentication, include the credentials option in your fetch or axios requests:
                  </p>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{`fetch('/api/protected-resource', {
  method: 'GET',
  credentials: 'include' // Important for sending cookies
})`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(`fetch('/api/protected-resource', {
  method: 'GET',
  credentials: 'include' // Important for sending cookies
})`, "cookie-auth")}
                    >
                      {copied === "cookie-auth" ? (
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
                  <CardTitle>{t('developer.authGuide.authorization.handlingErrors')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.authorization.handlingErrorsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status Code</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Handling Strategy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>401 Unauthorized</TableCell>
                        <TableCell>Missing or invalid authentication</TableCell>
                        <TableCell>Redirect to login or refresh token</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>403 Forbidden</TableCell>
                        <TableCell>Insufficient permissions</TableCell>
                        <TableCell>Show error message explaining required permissions</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>429 Too Many Requests</TableCell>
                        <TableCell>Rate limit exceeded</TableCell>
                        <TableCell>Implement exponential backoff and retry</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="examples">
            <div className="space-y-6">
              <div className="prose max-w-none dark:prose-invert mb-6">
                <h2>{t('developer.authGuide.examples.title')}</h2>
                <p>
                  {t('developer.authGuide.examples.description')}
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('developer.authGuide.examples.login')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.examples.loginDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{loginExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(loginExample, "login-example")}
                    >
                      {copied === "login-example" ? (
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
                  <CardTitle>{t('developer.authGuide.examples.authorizedRequests')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.examples.authorizedRequestsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{authorizationExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(authorizationExample, "auth-example")}
                    >
                      {copied === "auth-example" ? (
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
                  <CardTitle>{t('developer.authGuide.examples.tokenRefresh')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.examples.tokenRefreshDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{tokenRefreshExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(tokenRefreshExample, "refresh-example")}
                    >
                      {copied === "refresh-example" ? (
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
                  <CardTitle>{t('developer.authGuide.examples.twoFactor')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.examples.twoFactorDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{mfaExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(mfaExample, "mfa-example")}
                    >
                      {copied === "mfa-example" ? (
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
                  <CardTitle>{t('developer.authGuide.examples.nodejs')}</CardTitle>
                  <CardDescription>
                    {t('developer.authGuide.examples.nodejsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                      <code className="text-sm">{nodeAuthenticationExample}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(nodeAuthenticationExample, "node-example")}
                    >
                      {copied === "node-example" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-6">
                <Button asChild>
                  <Link href="/developer">
                    {t('developer.authGuide.backToPortal')}
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