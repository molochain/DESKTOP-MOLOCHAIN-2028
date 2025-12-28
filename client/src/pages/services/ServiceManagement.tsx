import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Activity,
  Plus,
  RefreshCw,
  Heart,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Cpu,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Eye,
  Server
} from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface Service {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string;
  type: string;
  status: string;
  version: string;
  tags: string[] | null;
  healthStatus: string | null;
  lastHealthCheck: string | null;
  metrics: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  successRate: number;
  uptime: number;
  lastError?: string;
}

interface ServiceHealthLog {
  id: number;
  status: string;
  responseTime: number | null;
  errorRate: string | null;
  successRate: string | null;
  consecutiveFailures: number | null;
  createdAt: string;
}

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

function ServiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all services
  const { data: servicesData, isLoading: isLoadingServices, refetch: refetchServices } = useQuery({
    queryKey: ['/api/services', categoryFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('active', 'true');
      
      const response = await apiRequest('GET', `/api/services?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch service statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/services/stats/summary'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/services/stats/summary');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch selected service metrics
  const { data: metricsData } = useQuery({
    queryKey: ['/api/services', selectedService?.code, 'metrics'],
    queryFn: async () => {
      if (!selectedService) return null;
      const response = await apiRequest('GET', `/api/services/${selectedService.code}/metrics`);
      return response.json();
    },
    enabled: !!selectedService
  });

  // Fetch selected service health history
  const { data: healthHistoryData } = useQuery({
    queryKey: ['/api/services', selectedService?.code, 'health-history'],
    queryFn: async () => {
      if (!selectedService) return null;
      const response = await apiRequest('GET', `/api/services/${selectedService.code}/health-history?limit=20`);
      return response.json();
    },
    enabled: !!selectedService
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/services', data);
    },
    onSuccess: () => {
      toast({
        title: 'Service Created',
        description: 'The service has been created successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services/stats/summary'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create service',
        variant: 'destructive'
      });
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ code, data }: { code: string; data: any }) => {
      return apiRequest('PUT', `/api/services/${code}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Service Updated',
        description: 'The service has been updated successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update service',
        variant: 'destructive'
      });
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('DELETE', `/api/services/${code}`);
    },
    onSuccess: () => {
      toast({
        title: 'Service Deleted',
        description: 'The service has been deleted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services/stats/summary'] });
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service',
        variant: 'destructive'
      });
    }
  });

  // Restart service mutation
  const restartServiceMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('POST', `/api/services/${code}/restart`);
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Service Restart Initiated',
        description: `Service ${variables} is being restarted.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restart service',
        variant: 'destructive'
      });
    }
  });

  const services = servicesData || [];
  const stats = statsData;
  const metrics = metricsData;
  const healthHistory = healthHistoryData || [];

  const filteredServices = services.filter((service: Service) => {
    if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !service.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getHealthStatusIcon = (status: string | null) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      case 'deprecated':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="service-management-container">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Service Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor, manage, and configure all system services
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetchServices()}
            variant="outline"
            size="sm"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-service">
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>
                  Register a new service in the system
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createServiceMutation.mutate({
                    code: formData.get('code'),
                    name: formData.get('name'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    type: formData.get('type'),
                    version: formData.get('version') || '1.0.0'
                  });
                }}
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="code">Service Code</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="e.g., payment-service"
                    required
                    data-testid="input-service-code"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Payment Processing Service"
                    required
                    data-testid="input-service-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Service description..."
                    data-testid="input-service-description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger data-testid="select-service-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                      <SelectItem value="WAREHOUSING">Warehousing</SelectItem>
                      <SelectItem value="CUSTOMS">Customs</SelectItem>
                      <SelectItem value="FREIGHT">Freight</SelectItem>
                      <SelectItem value="LOGISTICS">Logistics</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="INTEGRATION">Integration</SelectItem>
                      <SelectItem value="MONITORING">Monitoring</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger data-testid="select-service-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-create">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-services">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeServices} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-healthy-services">{stats.healthyServices}</div>
              <Progress
                value={(stats.healthyServices / stats.totalServices) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Degraded</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-degraded-services">{stats.degradedServices}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unhealthy</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-unhealthy-services">{stats.unhealthyServices}</div>
              <p className="text-xs text-muted-foreground">
                Critical issues
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-categories-count">
                {Object.keys(stats.byCategory).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Service categories
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring" data-testid="tab-monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="instances" data-testid="tab-instances">Instances</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Manage and monitor all registered services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="SHIPPING">Shipping</SelectItem>
                    <SelectItem value="WAREHOUSING">Warehousing</SelectItem>
                    <SelectItem value="CUSTOMS">Customs</SelectItem>
                    <SelectItem value="FREIGHT">Freight</SelectItem>
                    <SelectItem value="LOGISTICS">Logistics</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="INTEGRATION">Integration</SelectItem>
                    <SelectItem value="MONITORING">Monitoring</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Services Table */}
              {isLoadingServices ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Last Check</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service: Service) => (
                        <TableRow key={service.id} data-testid={`row-service-${service.code}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-xs text-muted-foreground">{service.code}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.category}</Badge>
                          </TableCell>
                          <TableCell>{service.type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(service.status)}>
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getHealthStatusIcon(service.healthStatus)}
                              <span className="text-sm">
                                {service.healthStatus || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{service.version}</TableCell>
                          <TableCell>
                            {service.lastHealthCheck ? (
                              <div className="text-xs">
                                {format(new Date(service.lastHealthCheck), 'MMM d, HH:mm')}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-menu-${service.code}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setSelectedService(service)}
                                  data-testid={`menu-view-${service.code}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedService(service);
                                    setIsEditDialogOpen(true);
                                  }}
                                  data-testid={`menu-edit-${service.code}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => restartServiceMutation.mutate(service.code)}
                                  data-testid={`menu-restart-${service.code}`}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Restart
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => deleteServiceMutation.mutate(service.code)}
                                  data-testid={`menu-delete-${service.code}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedService.name}</CardTitle>
                <CardDescription>{selectedService.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{selectedService.category}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm">{selectedService.type}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={getStatusBadgeVariant(selectedService.status)}>
                      {selectedService.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Health Status</Label>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(selectedService.healthStatus)}
                      <span className="text-sm">{selectedService.healthStatus || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {metrics && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Metrics</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Total Requests</Label>
                        <p className="text-2xl font-bold">{metrics.requestCount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Success Rate</Label>
                        <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Avg Response Time</Label>
                        <p className="text-2xl font-bold">{metrics.averageResponseTime}ms</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Error Count</Label>
                        <p className="text-2xl font-bold">{metrics.errorCount}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Uptime</Label>
                        <p className="text-2xl font-bold">{formatUptime(metrics.uptime)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Monitoring</CardTitle>
              <CardDescription>Real-time health and performance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedService ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Monitoring data for <strong>{selectedService.name}</strong>
                    </AlertDescription>
                  </Alert>

                  {healthHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Health History</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Response Time</TableHead>
                            <TableHead>Success Rate</TableHead>
                            <TableHead>Failures</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {healthHistory.map((log: ServiceHealthLog) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getHealthStatusIcon(log.status)}
                                  {log.status}
                                </div>
                              </TableCell>
                              <TableCell>{log.responseTime || '-'}ms</TableCell>
                              <TableCell>{log.successRate || '-'}%</TableCell>
                              <TableCell>{log.consecutiveFailures || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a service to view monitoring data
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Instances</CardTitle>
              <CardDescription>Manage service instances and deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Service instance management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Integrations</CardTitle>
              <CardDescription>Configure external service integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Integration management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Service Dialog */}
      {selectedService && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service configuration
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateServiceMutation.mutate({
                  code: selectedService.code,
                  data: {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    status: formData.get('status')
                  }
                });
              }}
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedService.name}
                  required
                  data-testid="input-edit-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedService.description || ''}
                  data-testid="input-edit-description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedService.category}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHIPPING">Shipping</SelectItem>
                    <SelectItem value="WAREHOUSING">Warehousing</SelectItem>
                    <SelectItem value="CUSTOMS">Customs</SelectItem>
                    <SelectItem value="FREIGHT">Freight</SelectItem>
                    <SelectItem value="LOGISTICS">Logistics</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="INTEGRATION">Integration</SelectItem>
                    <SelectItem value="MONITORING">Monitoring</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={selectedService.status}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="button-submit-edit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ServiceManagement;