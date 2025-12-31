import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Server, RefreshCw, Activity, CheckCircle, XCircle, 
  AlertTriangle, ExternalLink, FileText, RotateCcw, Clock,
  Cpu, HardDrive, Network, MemoryStick, Gauge, Layers
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Microservice {
  id: string;
  name: string;
  status: "healthy" | "unhealthy" | "not_found" | "starting";
  port: number | null;
  containerId: string | null;
  uptime: string | null;
  responseTime: number | null;
  lastCheck: string;
  category?: string;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    loadAvg: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    freePercentage: number;
    usedGB: string;
    totalGB: string;
  };
  disk: {
    used: number;
    total: number;
    freePercentage: number;
    usedGB: string;
    totalGB: string;
  };
  network: {
    connections: number;
    bytesReceived: string;
    bytesSent: string;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

interface MicroservicesResponse {
  microservices: Microservice[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    healthPercentage: number;
  };
  systemMetrics: SystemMetrics | null;
  categories: string[];
  grafanaUrl: string;
  prometheusUrl: string;
  lastUpdated: string;
}

const statusConfig = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    iconClass: "text-green-500"
  },
  unhealthy: {
    label: "Unhealthy", 
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    iconClass: "text-red-500"
  },
  not_found: {
    label: "Not Found",
    icon: AlertTriangle,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    iconClass: "text-yellow-500"
  },
  starting: {
    label: "Starting",
    icon: RefreshCw,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    iconClass: "text-blue-500 animate-spin"
  }
};

function SystemMetricsCards({ metrics }: { metrics: SystemMetrics | null }) {
  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const cpuUsage = metrics.cpu.usage;
  const memoryUsed = 100 - metrics.memory.freePercentage;
  const diskUsed = 100 - metrics.disk.freePercentage;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="card-cpu-metrics">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-500" />
            CPU Usage
          </CardDescription>
          <CardTitle className="text-2xl">{cpuUsage.toFixed(1)}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(cpuUsage, 100)} className="h-2" />
          <div className="text-xs text-muted-foreground mt-2">
            Load: {metrics.cpu.loadAvg.map(l => l.toFixed(2)).join(", ")}
            <br />
            Cores: {metrics.cpu.cores}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-memory-metrics">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4 text-purple-500" />
            Memory
          </CardDescription>
          <CardTitle className="text-2xl">{memoryUsed.toFixed(1)}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={memoryUsed} 
            className={`h-2 ${memoryUsed > 90 ? "[&>div]:bg-red-500" : memoryUsed > 75 ? "[&>div]:bg-yellow-500" : ""}`} 
          />
          <div className="text-xs text-muted-foreground mt-2">
            {metrics.memory.usedGB} GB / {metrics.memory.totalGB} GB
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-disk-metrics">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-orange-500" />
            Disk
          </CardDescription>
          <CardTitle className="text-2xl">{diskUsed.toFixed(1)}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={diskUsed} 
            className={`h-2 ${diskUsed > 90 ? "[&>div]:bg-red-500" : diskUsed > 75 ? "[&>div]:bg-yellow-500" : ""}`}
          />
          <div className="text-xs text-muted-foreground mt-2">
            {metrics.disk.usedGB} GB / {metrics.disk.totalGB} GB
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-network-metrics">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Network className="h-4 w-4 text-green-500" />
            Network
          </CardDescription>
          <CardTitle className="text-2xl">{metrics.network.connections}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            <span className="text-green-600">↓ {metrics.network.bytesReceived}</span>
            <br />
            <span className="text-blue-600">↑ {metrics.network.bytesSent}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LogsDialogState {
  open: boolean;
  serviceId: string;
  containerName: string;
  logs: string[];
  loading: boolean;
}

export default function MicroservicesPanel() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [logsDialog, setLogsDialog] = useState<LogsDialogState>({
    open: false,
    serviceId: "",
    containerName: "",
    logs: [],
    loading: false
  });

  const { data, isLoading, error, refetch } = useQuery<MicroservicesResponse>({
    queryKey: ["/api/admin/microservices"],
    refetchInterval: 30000
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Microservices status updated"
    });
  };

  const restartMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await apiRequest("POST", `/api/admin/microservices/${serviceId}/restart`);
      return response.json();
    },
    onSuccess: (data, serviceId) => {
      toast({
        title: "Restart Requested",
        description: data.message || `Restart signal sent for ${serviceId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/microservices"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Restart Failed",
        description: error.message || "Failed to send restart signal",
        variant: "destructive"
      });
    }
  });

  const logsMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await apiRequest("GET", `/api/admin/microservices/${serviceId}/logs?lines=100`);
      return response.json();
    },
    onSuccess: (data, serviceId) => {
      setLogsDialog({
        open: true,
        serviceId,
        containerName: data.containerName || serviceId,
        logs: data.logs || [],
        loading: false
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Log Fetch Failed",
        description: error.message || "Failed to fetch logs",
        variant: "destructive"
      });
      setLogsDialog(prev => ({ ...prev, loading: false }));
    }
  });

  const handleViewLogs = (serviceId: string) => {
    setLogsDialog({
      open: true,
      serviceId,
      containerName: "",
      logs: [],
      loading: true
    });
    logsMutation.mutate(serviceId);
  };

  const handleRestart = (serviceId: string) => {
    restartMutation.mutate(serviceId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading Microservices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failed to fetch microservices status. This may require authentication.
            </p>
            <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.summary || { total: 0, healthy: 0, unhealthy: 0, healthPercentage: 0 };
  const microservices = data?.microservices || [];
  const systemMetrics = data?.systemMetrics || null;
  const categories = data?.categories || [];
  const grafanaUrl = data?.grafanaUrl || "";
  const prometheusUrl = data?.prometheusUrl || "";

  const filteredServices = selectedCategory === "all" 
    ? microservices 
    : microservices.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-8 w-8" />
            Microservices Control Panel
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of Docker microservices and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {prometheusUrl && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
              data-testid="button-prometheus"
            >
              <a href={prometheusUrl} target="_blank" rel="noopener noreferrer">
                <Gauge className="mr-2 h-4 w-4" />
                Prometheus
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          )}
          {grafanaUrl && (
            <Button 
              variant="outline" 
              asChild
              data-testid="button-grafana"
            >
              <a href={grafanaUrl} target="_blank" rel="noopener noreferrer">
                <Activity className="mr-2 h-4 w-4" />
                Grafana
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <SystemMetricsCards metrics={systemMetrics} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-services">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Total Services
            </CardDescription>
            <CardTitle className="text-4xl">{summary.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Docker containers monitored
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-healthy-services">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Healthy
            </CardDescription>
            <CardTitle className="text-4xl text-green-600">{summary.healthy}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summary.healthPercentage} className="h-2 [&>div]:bg-green-500" />
          </CardContent>
        </Card>
        
        <Card data-testid="card-unhealthy-services">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Unhealthy
            </CardDescription>
            <CardTitle className="text-4xl text-red-600">
              {summary.unhealthy}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Needing attention
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-uptime">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              System Uptime
            </CardDescription>
            <CardTitle className="text-2xl">{systemMetrics?.uptime.formatted || "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {summary.healthPercentage}% health score
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-services-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Detailed status of each microservice (auto-refresh every 30s)
              </CardDescription>
            </div>
            {categories.length > 0 && (
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} data-testid={`tab-${cat}`}>
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No services found in this category
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => {
                  const config = statusConfig[service.status] || statusConfig.not_found;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          {service.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{service.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {service.category || "Other"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.className} data-testid={`status-${service.id}`}>
                          <StatusIcon className={`mr-1 h-3 w-3 ${config.iconClass}`} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {service.port !== null ? (
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {service.port}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {service.uptime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {service.uptime}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {service.responseTime !== null ? (
                          <span className={
                            service.responseTime > 200 
                              ? "text-red-600" 
                              : service.responseTime > 100 
                                ? "text-yellow-600" 
                                : "text-green-600"
                          }>
                            {service.responseTime}ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewLogs(service.id)}
                                  disabled={logsMutation.isPending}
                                  data-testid={`button-logs-${service.id}`}
                                >
                                  <FileText className={`h-4 w-4 ${logsMutation.isPending ? "animate-pulse" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Container Logs</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRestart(service.id)}
                                  disabled={restartMutation.isPending}
                                  data-testid={`button-restart-${service.id}`}
                                >
                                  <RotateCcw className={`h-4 w-4 ${restartMutation.isPending ? "animate-spin" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Request Restart</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data?.lastUpdated && (
        <div className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      )}

      <Dialog open={logsDialog.open} onOpenChange={(open) => setLogsDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Container Logs: {logsDialog.containerName || logsDialog.serviceId}
            </DialogTitle>
            <DialogDescription>
              Last 100 log lines from the container
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border bg-muted/50 p-4">
            {logsDialog.loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading logs...</span>
              </div>
            ) : logsDialog.logs.length > 0 ? (
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {logsDialog.logs.map((line, i) => (
                  <div key={i} className="py-0.5 hover:bg-muted/80">
                    {line}
                  </div>
                ))}
              </pre>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No logs available
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">
              {logsDialog.logs.length} lines
            </span>
            {data?.grafanaUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`${data.grafanaUrl}/explore`, "_blank")}
                data-testid="button-open-grafana"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Grafana
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
