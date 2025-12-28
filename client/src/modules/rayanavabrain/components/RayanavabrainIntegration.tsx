import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Cloud, 
  Database, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Link2,
  Activity,
  Settings,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function RayanavabrainIntegration() {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const { toast } = useToast();

  // Check connection status
  const { data: connectionStatus, isLoading } = useQuery({
    queryKey: ['/api/rayanavabrain/status'],
    enabled: isConnected,
    refetchInterval: 30000
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/rayanavabrain/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sync Successful",
        description: "Data synchronized with RAYANAVABRAIN",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rayanavabrain'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with RAYANAVABRAIN",
        variant: "destructive",
      });
    }
  });

  const handleConnect = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your RAYANAVABRAIN API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Successfully connected to RAYANAVABRAIN",
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to RAYANAVABRAIN",
        variant: "destructive",
      });
    }
  };

  const handleSync = () => {
    setSyncStatus('syncing');
    syncMutation.mutate();
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const features = [
    {
      name: 'Real-time Sync',
      description: 'Bidirectional data synchronization',
      status: 'active',
      icon: <RefreshCw className="w-5 h-5" />
    },
    {
      name: 'AI Processing',
      description: 'Advanced AI analytics and insights',
      status: 'active',
      icon: <Brain className="w-5 h-5" />
    },
    {
      name: 'Data Lake',
      description: 'Centralized data storage and retrieval',
      status: 'active',
      icon: <Database className="w-5 h-5" />
    },
    {
      name: 'API Gateway',
      description: 'Secure API access and management',
      status: 'active',
      icon: <Cloud className="w-5 h-5" />
    }
  ];

  const metrics = [
    { label: 'Data Points Synced', value: '1.2M', trend: '+12%' },
    { label: 'API Calls Today', value: '8,456', trend: '+5%' },
    { label: 'Processing Time', value: '0.23s', trend: '-15%' },
    { label: 'Uptime', value: '99.99%', trend: '0%' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            RAYANAVABRAIN Integration Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced AI-powered logistics intelligence platform
          </p>
        </div>
        <Badge className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure your RAYANAVABRAIN connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your RAYANAVABRAIN API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={handleConnect}>
                    {isConnected ? 'Reconnect' : 'Connect'}
                  </Button>
                </div>
              </div>

              {isConnected && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Endpoint</span>
                    <span className="text-sm font-mono">api.rayanavabrain.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version</span>
                    <span className="text-sm">v2.1.0</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>API Gateway</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Data Pipeline</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>AI Engine</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization</CardTitle>
              <CardDescription>Manage bidirectional data sync with RAYANAVABRAIN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Automatic Sync</p>
                  <p className="text-sm text-gray-600">Sync data every 15 minutes</p>
                </div>
                <Button 
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Sync History</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last Sync</span>
                    <span className="text-gray-600">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Records Synced</span>
                    <span className="font-medium">15,234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Next Scheduled</span>
                    <span className="text-gray-600">in 13 minutes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inbound Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Logistics Data</span>
                    <span className="font-medium">8,456 records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Customer Insights</span>
                    <span className="font-medium">3,201 records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Market Analytics</span>
                    <span className="font-medium">1,892 records</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outbound Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Shipment Updates</span>
                    <span className="font-medium">5,123 records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Inventory Status</span>
                    <span className="font-medium">2,456 records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Performance Metrics</span>
                    <span className="font-medium">987 records</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available RAYANAVABRAIN API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-green-600">GET</span> /api/v2/logistics/shipments
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-blue-600">POST</span> /api/v2/analytics/predict
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-orange-600">PUT</span> /api/v2/data/sync
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-purple-600">PATCH</span> /api/v2/config/update
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <span className={`text-sm ${
                        metric.trend.startsWith('+') ? 'text-green-600' : 
                        metric.trend.startsWith('-') ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Latest insights from RAYANAVABRAIN AI engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Optimization Opportunity</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Route optimization can reduce delivery times by 18% on European corridors
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Demand Forecast</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Expected 23% increase in air freight demand for Q2 2025
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Performance Alert</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Maritime transport efficiency improved by 12% this month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}