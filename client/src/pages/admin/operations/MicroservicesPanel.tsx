import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Server, RefreshCw, Activity, CheckCircle, XCircle, 
  AlertTriangle, ExternalLink, FileText, RotateCcw, Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Microservice {
  id: string;
  name: string;
  status: "healthy" | "unhealthy" | "not_found";
  port: number | null;
  containerId: string | null;
  uptime: string | null;
  responseTime: number | null;
  lastCheck: string;
}

interface MicroservicesResponse {
  microservices: Microservice[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  grafanaUrl: string;
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
  }
};

export default function MicroservicesPanel() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleViewLogs = (serviceId: string) => {
    toast({
      title: "View Logs",
      description: `Opening logs for ${serviceId}...`
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
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
            <p className="text-muted-foreground">Failed to fetch microservices status. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.summary || { total: 0, healthy: 0, unhealthy: 0 };
  const microservices = data?.microservices || [];
  const grafanaUrl = data?.grafanaUrl || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-8 w-8" />
            Microservices Control Panel
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time status monitoring of all Docker microservices
          </p>
        </div>
        <div className="flex items-center gap-2">
          {grafanaUrl && (
            <Button 
              variant="outline" 
              asChild
              data-testid="button-grafana"
            >
              <a href={grafanaUrl} target="_blank" rel="noopener noreferrer">
                <Activity className="mr-2 h-4 w-4" />
                Grafana Dashboard
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-services">
          <CardHeader className="pb-2">
            <CardDescription>Total Services</CardDescription>
            <CardTitle className="text-4xl">{summary.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Docker microservices monitored
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
            <div className="text-sm text-muted-foreground">
              Services running normally
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-unhealthy-services">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Unhealthy / Not Found
            </CardDescription>
            <CardTitle className="text-4xl text-red-600">
              {summary.unhealthy}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Services needing attention
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-services-table">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Detailed status of each microservice with health checks every 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Container ID</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {microservices.map((service) => {
                const config = statusConfig[service.status];
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
                      {service.containerId ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <code className="px-2 py-1 bg-muted rounded text-sm cursor-help">
                                {service.containerId.substring(0, 12)}...
                              </code>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{service.containerId}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                        <span className={service.responseTime > 100 ? "text-yellow-600" : "text-green-600"}>
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
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewLogs(service.id)}
                                data-testid={`button-logs-${service.id}`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Logs</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled
                                data-testid={`button-restart-${service.id}`}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restart (Coming Soon)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
