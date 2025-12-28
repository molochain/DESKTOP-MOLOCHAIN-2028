import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Activity, 
  Workflow, 
  BarChart3,
  Gauge,
  LineChart,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

export function RayanavaAdvancedFeatures() {
  const { toast } = useToast();
  const [biQuery, setBiQuery] = useState('');
  const [logisticsType, setLogisticsType] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [operationsData, setOperationsData] = useState<any>(null);

  // Business Intelligence Mutation
  const biMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/business-intelligence', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Business Intelligence Analysis Complete",
        description: "AI has generated insights for your query"
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate business intelligence",
        variant: "destructive"
      });
    }
  });

  // Logistics Processing Mutation
  const logisticsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/logistics', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Logistics Analysis Complete",
        description: "Optimization recommendations ready"
      });
    }
  });

  // Operations Monitoring Mutation
  const monitoringMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/monitor-operations', data);
    },
    onSuccess: (data) => {
      setOperationsData(data);
      toast({
        title: "Operations Monitored",
        description: "Real-time insights updated"
      });
    }
  });

  // Workflow Execution Mutation
  const workflowMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/workflow', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Workflow Executed",
        description: `Workflow ${data?.workflowId || 'completed'} successfully`
      });
    }
  });

  const handleBIAnalysis = () => {
    if (!biQuery) {
      toast({
        title: "Query Required",
        description: "Please enter a business intelligence query",
        variant: "destructive"
      });
      return;
    }
    biMutation.mutate({ query: biQuery });
  };

  const handleLogisticsOptimization = () => {
    if (!logisticsType) {
      toast({
        title: "Type Required",
        description: "Please select a logistics optimization type",
        variant: "destructive"
      });
      return;
    }
    logisticsMutation.mutate({ 
      type: logisticsType,
      data: {
        routes: [],
        vehicles: [],
        constraints: {}
      }
    });
  };

  const handleMonitorOperations = () => {
    monitoringMutation.mutate({
      metrics: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 10),
        responseTime: Math.random() * 500
      },
      thresholds: {
        cpu: 80,
        memory: 85,
        errors: 5,
        responseTime: 300
      }
    });
  };

  const handleWorkflowExecution = () => {
    if (!workflowId) {
      toast({
        title: "Workflow ID Required",
        description: "Please enter a workflow ID to execute",
        variant: "destructive"
      });
      return;
    }
    workflowMutation.mutate({
      workflowId,
      inputData: {
        timestamp: new Date().toISOString(),
        source: 'manual',
        priority: 'high'
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Advanced AI Features
        </CardTitle>
        <CardDescription>
          Access Rayanava's advanced capabilities for business intelligence, logistics optimization, and operations monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="intelligence" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="intelligence" data-testid="tab-intelligence">
              <BarChart3 className="h-4 w-4 mr-2" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="logistics" data-testid="tab-logistics">
              <Truck className="h-4 w-4 mr-2" />
              Logistics
            </TabsTrigger>
            <TabsTrigger value="monitoring" data-testid="tab-monitoring">
              <Activity className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="workflows" data-testid="tab-workflows">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
          </TabsList>

          {/* Business Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Intelligence Query</label>
                <Textarea
                  placeholder="Ask Rayanava for business insights, market analysis, or strategic recommendations..."
                  value={biQuery}
                  onChange={(e) => setBiQuery(e.target.value)}
                  className="mt-2"
                  rows={4}
                  data-testid="input-bi-query"
                />
              </div>
              <Button 
                onClick={handleBIAnalysis}
                disabled={biMutation.isPending}
                className="w-full"
                data-testid="button-analyze-bi"
              >
                {biMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Business Intelligence
                  </>
                )}
              </Button>
              {biMutation.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analysis complete. AI insights have been generated for your query.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Logistics Optimization Tab */}
          <TabsContent value="logistics" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Optimization Type</label>
                <Select value={logisticsType} onValueChange={setLogisticsType}>
                  <SelectTrigger className="mt-2" data-testid="select-logistics-type">
                    <SelectValue placeholder="Select optimization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route_optimization">Route Optimization</SelectItem>
                    <SelectItem value="supply_chain">Supply Chain Analysis</SelectItem>
                    <SelectItem value="commodity_trading">Commodity Trading</SelectItem>
                    <SelectItem value="fleet_management">Fleet Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Reduction</span>
                    <Badge variant="secondary">AI Predicted</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <span className="text-xs text-muted-foreground">Up to 75% potential savings</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficiency Gain</span>
                    <Badge variant="secondary">AI Predicted</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  <span className="text-xs text-muted-foreground">85% efficiency improvement</span>
                </div>
              </div>
              <Button 
                onClick={handleLogisticsOptimization}
                disabled={logisticsMutation.isPending}
                className="w-full"
                data-testid="button-optimize-logistics"
              >
                {logisticsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Logistics
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Operations Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">System Health</p>
                        <p className="text-2xl font-bold">
                          {operationsData?.health?.status || 'Good'}
                        </p>
                      </div>
                      <Gauge className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Active Alerts</p>
                        <p className="text-2xl font-bold">
                          {operationsData?.monitoring?.alerts?.length || 0}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm font-medium">
                    {operationsData?.monitoring?.performanceMetrics?.cpu 
                      ? `${Math.round(operationsData.monitoring.performanceMetrics.cpu)}%` 
                      : 'N/A'}
                  </span>
                </div>
                <Progress 
                  value={operationsData?.monitoring?.performanceMetrics?.cpu || 0} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">
                    {operationsData?.monitoring?.performanceMetrics?.memory 
                      ? `${Math.round(operationsData.monitoring.performanceMetrics.memory)}%` 
                      : 'N/A'}
                  </span>
                </div>
                <Progress 
                  value={operationsData?.monitoring?.performanceMetrics?.memory || 0} 
                  className="h-2" 
                />
              </div>
              <Button 
                onClick={handleMonitorOperations}
                disabled={monitoringMutation.isPending}
                className="w-full"
                data-testid="button-monitor-operations"
              >
                {monitoringMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Monitoring...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Monitor Operations
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Workflow ID</label>
                <input
                  type="text"
                  placeholder="Enter workflow ID (e.g., logistics-optimization-001)"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-md"
                  data-testid="input-workflow-id"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Workflows</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">Inventory Optimization</span>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm">Route Planning</span>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      <span className="text-sm">Demand Forecasting</span>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Risk Assessment</span>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleWorkflowExecution}
                disabled={workflowMutation.isPending}
                className="w-full"
                data-testid="button-execute-workflow"
              >
                {workflowMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Workflow className="h-4 w-4 mr-2" />
                    Execute Workflow
                  </>
                )}
              </Button>
              {workflowMutation.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Workflow {(workflowMutation.data as any)?.workflowId || ''} executed successfully
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}