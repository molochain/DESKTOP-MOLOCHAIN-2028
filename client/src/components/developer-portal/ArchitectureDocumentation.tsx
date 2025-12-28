// Architecture Documentation Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Archive, 
  Database, 
  Globe, 
  Server, 
  Zap, 
  Network,
  Shield,
  Monitor,
  FileJson,
  Book,
  ExternalLink,
  Code,
  GitBranch
} from 'lucide-react';
import { Link } from 'wouter';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'beta' | 'deprecated';
  dependencies: string[];
  components: string[];
  hooks: string[];
  services: string[];
  apiEndpoints: number;
  documentation: string;
}

const moduleData: ModuleInfo[] = [
  {
    id: 'authentication',
    name: 'Authentication Module',
    description: 'Complete user authentication system with JWT, session management, and multi-factor authentication',
    version: '2.1.0',
    status: 'active',
    dependencies: ['shared', 'security'],
    components: ['LoginForm', 'RegisterForm', 'ProfileSettings', 'TwoFactorAuth'],
    hooks: ['useAuth', 'useSession', 'useProfile', 'useTwoFactor'],
    services: ['authService', 'sessionService', 'securityService'],
    apiEndpoints: 8,
    documentation: '/docs/modules/authentication'
  },
  {
    id: 'tracking',
    name: 'Tracking Module',
    description: 'Real-time shipment tracking with location services and status updates',
    version: '1.8.2',
    status: 'active',
    dependencies: ['websocket', 'shared', 'notifications'],
    components: ['TrackingDashboard', 'TrackingMap', 'StatusTimeline', 'TrackingForm'],
    hooks: ['useTracking', 'useLocation', 'useUpdates'],
    services: ['trackingService', 'locationService', 'notificationService'],
    apiEndpoints: 12,
    documentation: '/docs/modules/tracking'
  },
  {
    id: 'commodities',
    name: 'Commodities Module',
    description: 'Commodity trading platform with real-time market data and price alerts',
    version: '1.5.4',
    status: 'active',
    dependencies: ['websocket', 'analytics', 'notifications'],
    components: ['CommodityList', 'PriceChart', 'AlertSettings', 'TradingInterface'],
    hooks: ['useCommodities', 'usePrices', 'useAlerts'],
    services: ['commodityService', 'marketDataService', 'alertService'],
    apiEndpoints: 15,
    documentation: '/docs/modules/commodities'
  },
  {
    id: 'analytics',
    name: 'Analytics Module',
    description: 'Business intelligence and data visualization platform',
    version: '2.0.1',
    status: 'active',
    dependencies: ['shared', 'performance'],
    components: ['Dashboard', 'Charts', 'Reports', 'DataTable'],
    hooks: ['useAnalytics', 'useCharts', 'useReports'],
    services: ['analyticsService', 'dataService', 'reportService'],
    apiEndpoints: 10,
    documentation: '/docs/modules/analytics'
  },
  {
    id: 'collaboration',
    name: 'Collaboration Module',
    description: 'Real-time collaboration tools with document sharing and team communication',
    version: '1.6.3',
    status: 'active',
    dependencies: ['websocket', 'file-management', 'notifications'],
    components: ['CollaborationSpace', 'DocumentEditor', 'ChatInterface', 'FileShare'],
    hooks: ['useCollaboration', 'useDocuments', 'useChat'],
    services: ['collaborationService', 'documentService', 'chatService'],
    apiEndpoints: 18,
    documentation: '/docs/modules/collaboration'
  },
  {
    id: 'admin',
    name: 'Admin Module',
    description: 'Administrative interface for user management and system configuration',
    version: '2.2.0',
    status: 'active',
    dependencies: ['authentication', 'security', 'performance'],
    components: ['UserManagement', 'SystemSettings', 'AuditLogs', 'SecurityPanel'],
    hooks: ['useAdmin', 'useUsers', 'useSettings'],
    services: ['adminService', 'userService', 'configService'],
    apiEndpoints: 25,
    documentation: '/docs/modules/admin'
  },
  {
    id: 'health',
    name: 'Health Module',
    description: 'System health monitoring with real-time metrics and automated alerts',
    version: '1.9.1',
    status: 'active',
    dependencies: ['performance', 'notifications'],
    components: ['HealthDashboard', 'MetricsChart', 'AlertPanel', 'SystemStatus'],
    hooks: ['useHealth', 'useMetrics', 'useAlerts'],
    services: ['healthService', 'metricsService', 'alertService'],
    apiEndpoints: 8,
    documentation: '/docs/modules/health'
  },
  {
    id: 'websocket',
    name: 'WebSocket Module',
    description: 'Real-time communication infrastructure with multiple service endpoints',
    version: '1.7.0',
    status: 'active',
    dependencies: ['shared'],
    components: ['WebSocketProvider', 'ConnectionStatus', 'EventHandler'],
    hooks: ['useWebSocket', 'useConnection', 'useEvents'],
    services: ['websocketService', 'connectionService', 'eventService'],
    apiEndpoints: 7,
    documentation: '/docs/modules/websocket'
  },
  {
    id: 'file-management',
    name: 'File Management Module',
    description: 'Document storage and management with Google Drive integration',
    version: '1.4.2',
    status: 'active',
    dependencies: ['authentication', 'collaboration'],
    components: ['FileExplorer', 'UploadInterface', 'ShareDialog', 'FilePreview'],
    hooks: ['useFiles', 'useUpload', 'useShare'],
    services: ['fileService', 'uploadService', 'shareService'],
    apiEndpoints: 12,
    documentation: '/docs/modules/file-management'
  },
  {
    id: 'notifications',
    name: 'Notifications Module',
    description: 'Multi-channel notification system with email, SMS, and push notifications',
    version: '1.3.5',
    status: 'active',
    dependencies: ['websocket', 'shared'],
    components: ['NotificationCenter', 'AlertPanel', 'Settings'],
    hooks: ['useNotifications', 'useAlerts', 'useSettings'],
    services: ['notificationService', 'emailService', 'pushService'],
    apiEndpoints: 6,
    documentation: '/docs/modules/notifications'
  },
  {
    id: 'security',
    name: 'Security Module',
    description: 'Advanced security features with audit logging and threat detection',
    version: '2.0.3',
    status: 'active',
    dependencies: ['authentication', 'performance'],
    components: ['SecurityDashboard', 'AuditLog', 'ThreatMonitor'],
    hooks: ['useSecurity', 'useAudit', 'useThreats'],
    services: ['securityService', 'auditService', 'threatService'],
    apiEndpoints: 9,
    documentation: '/docs/modules/security'
  },
  {
    id: 'performance',
    name: 'Performance Module',
    description: 'Performance monitoring and optimization with automated tuning',
    version: '1.8.0',
    status: 'active',
    dependencies: ['health', 'shared'],
    components: ['PerformanceDashboard', 'MetricsView', 'OptimizationPanel'],
    hooks: ['usePerformance', 'useMetrics', 'useOptimization'],
    services: ['performanceService', 'metricsService', 'optimizationService'],
    apiEndpoints: 7,
    documentation: '/docs/modules/performance'
  },
  {
    id: 'services',
    name: 'Services Module',
    description: 'Core business services for logistics operations and booking management',
    version: '2.1.1',
    status: 'active',
    dependencies: ['tracking', 'analytics', 'notifications'],
    components: ['ServiceCatalog', 'BookingForm', 'OrderTracking', 'ServiceRecommender'],
    hooks: ['useServices', 'useBooking', 'useOrders'],
    services: ['serviceService', 'bookingService', 'orderService'],
    apiEndpoints: 20,
    documentation: '/docs/modules/services'
  },
  {
    id: 'shared',
    name: 'Shared Module',
    description: 'Common utilities, types, and components used across all modules',
    version: '1.9.2',
    status: 'active',
    dependencies: [],
    components: ['Layout', 'ErrorBoundary', 'LoadingSpinner', 'Modal'],
    hooks: ['useApi', 'useStorage', 'useValidation'],
    services: ['apiService', 'storageService', 'validationService'],
    apiEndpoints: 5,
    documentation: '/docs/modules/shared'
  },
  {
    id: 'developer-portal',
    name: 'Developer Portal Module',
    description: 'Comprehensive developer tools and documentation platform',
    version: '1.2.0',
    status: 'active',
    dependencies: ['health', 'authentication', 'shared'],
    components: ['DeveloperPortal', 'APITester', 'DocumentationViewer', 'BrandAssets'],
    hooks: ['useSystemHealth', 'useApiDocs', 'useBrandAssets'],
    services: ['developerService', 'docsService', 'brandService'],
    apiEndpoints: 12,
    documentation: '/docs/modules/developer-portal'
  }
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'beta': return 'secondary';
    case 'deprecated': return 'destructive';
    default: return 'outline';
  }
};

export function ArchitectureDocumentation() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const totalEndpoints = moduleData.reduce((sum, module) => sum + module.apiEndpoints, 0);
  const totalComponents = moduleData.reduce((sum, module) => sum + module.components.length, 0);
  const totalHooks = moduleData.reduce((sum, module) => sum + module.hooks.length, 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Platform Architecture</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          MoloChain platform consists of 15 specialized modules providing comprehensive logistics and business management capabilities.
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleData.length}</div>
            <p className="text-xs text-muted-foreground">Active modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">REST endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComponents}</div>
            <p className="text-xs text-muted-foreground">React components</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Hooks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHooks}</div>
            <p className="text-xs text-muted-foreground">React hooks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Module Overview</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="api">API Structure</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleData.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(module.status)}>
                      {module.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Version {module.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Components:</span>
                      <span className="font-medium">{module.components.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hooks:</span>
                      <span className="font-medium">{module.hooks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">API Endpoints:</span>
                      <span className="font-medium">{module.apiEndpoints}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedModule(module.id)}
                    >
                      View Details
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={module.documentation}>
                        <Book className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dependencies">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Module Dependencies
                </CardTitle>
                <CardDescription>
                  Dependency relationships between platform modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleData.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{module.name}</h4>
                        <Badge variant="outline">{module.dependencies.length} deps</Badge>
                      </div>
                      {module.dependencies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {module.dependencies.map((dep) => (
                            <Badge key={dep} variant="secondary">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No dependencies</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Endpoint Distribution
                </CardTitle>
                <CardDescription>
                  REST API endpoints organized by module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleData
                    .sort((a, b) => b.apiEndpoints - a.apiEndpoints)
                    .map((module) => (
                      <div key={module.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{module.name}</span>
                          <Badge variant="outline">{module.version}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(module.apiEndpoints / 25) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {module.apiEndpoints}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Documentation Resources
                </CardTitle>
                <CardDescription>
                  Comprehensive documentation for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/developer/help">
                      <FileJson className="h-4 w-4 mr-2" />
                      API Reference
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/developer/auth">
                      <Shield className="h-4 w-4 mr-2" />
                      Authentication Guide
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/developer/websockets">
                      <Network className="h-4 w-4 mr-2" />
                      WebSocket Guide
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/developer/sdks">
                      <Code className="h-4 w-4 mr-2" />
                      SDK Libraries
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Developer Tools
                </CardTitle>
                <CardDescription>
                  Tools for development and testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Testing Console
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Database Schema
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    System Monitoring
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Testing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {moduleData.find(m => m.id === selectedModule)?.name}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedModule(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const module = moduleData.find(m => m.id === selectedModule);
                if (!module) return null;
                
                return (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">{module.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Components</h4>
                        <div className="space-y-1">
                          {module.components.map(comp => (
                            <Badge key={comp} variant="outline" className="mr-1 mb-1">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Hooks</h4>
                        <div className="space-y-1">
                          {module.hooks.map(hook => (
                            <Badge key={hook} variant="secondary" className="mr-1 mb-1">
                              {hook}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="space-y-1">
                        {module.services.map(service => (
                          <Badge key={service} variant="default" className="mr-1 mb-1">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button asChild>
                        <Link href={module.documentation}>
                          View Documentation
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedModule(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}