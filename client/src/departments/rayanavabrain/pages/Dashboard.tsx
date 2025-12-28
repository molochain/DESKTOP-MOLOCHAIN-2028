import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Network, 
  Zap, 
  Activity, 
  Database, 
  RefreshCw,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Code,
  FileJson
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RayanavabrainDashboard() {
  const { toast } = useToast();

  // Fetch API key info
  const { data: apiKeys = [], isLoading: loadingKeys } = useQuery<any[]>({
    queryKey: ['/api/api-keys'],
  });

  // Fetch sync status
  const { data: activities = [], isLoading: loadingActivities } = useQuery<any[]>({
    queryKey: ['/api/activity?limit=20'],
  });

  // Find RAYANAVABRAIN API key
  const rayanavabrainKey = apiKeys?.find((key: any) => 
    key.projectName === 'RAYANAVABRAINCENTER' || 
    key.name?.includes('RAYANAVA')
  );

  // Filter RAYANAVABRAIN-related activities
  const rayanavaActivities = activities?.filter((activity: any) => 
    activity.action?.includes('sync') || 
    activity.metadata?.projectId === 'RAYANAVABRAIN'
  ) || [];

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/sync/status', {
        headers: {
          'Authorization': `Bearer ${rayanavabrainKey?.keyId}`,
        }
      });
      
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "RAYANAVABRAIN is connected and ready for sync",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Please check your API key configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to test connection",
        variant: "destructive",
      });
    }
  };

  const handleManualSync = async () => {
    try {
      const response = await fetch('/api/sync/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rayanavabrainKey?.keyId}`,
        },
        body: JSON.stringify({
          projectId: 'RAYANAVABRAIN',
          syncType: 'manual',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Sync Initiated",
          description: "Manual sync with RAYANAVABRAIN started",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      } else {
        toast({
          title: "Sync Failed",
          description: "Failed to initiate sync",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "An error occurred during sync",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            RAYANAVABRAIN Integration
          </h2>
          <p className="text-muted-foreground">
            Dedicated dashboard for MOLOCHAIN-RAYANAVABRAIN-V ecosystem integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            <Zap className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
          <Button onClick={handleManualSync} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Manual Sync
          </Button>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className="border-purple-600/20 bg-purple-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-purple-600" />
              <CardTitle>Connection Status</CardTitle>
            </div>
            {rayanavabrainKey ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">API Key</p>
              <p className="text-sm font-mono">
                {rayanavabrainKey ? `${rayanavabrainKey.keyId.substring(0, 20)}...` : 'Not configured'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{rayanavabrainKey?.usageCount || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Used</p>
              <p className="text-sm">
                {rayanavabrainKey?.lastUsedAt 
                  ? new Date(rayanavabrainKey.lastUsedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Project Link</p>
              <a 
                href="https://replit.com/t/molochain/repls/MOLOCHAIN-RAYANAVABRAIN-V" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
              >
                View Project <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
          <TabsTrigger value="api-test">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Auto-sync every 5 minutes
                </p>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Synced</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Departments synchronized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Sync</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3:45</div>
                <p className="text-xs text-muted-foreground">
                  Minutes remaining
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Features</CardTitle>
              <CardDescription>
                Available capabilities for RAYANAVABRAIN integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Bidirectional Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Two-way data synchronization between ecosystems
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">
                      WebSocket connection for instant notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Webhook Events</p>
                    <p className="text-sm text-muted-foreground">
                      Subscribe to department and metric updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">API Access</p>
                    <p className="text-sm text-muted-foreground">
                      Full REST API with authentication
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Activity</CardTitle>
              <CardDescription>
                Last 20 synchronization events with RAYANAVABRAIN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loadingActivities ? (
                  <p className="text-muted-foreground">Loading sync history...</p>
                ) : rayanavaActivities.length > 0 ? (
                  rayanavaActivities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.details || 'Completed'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No sync history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                Quick start guide for RAYANAVABRAIN integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. API Key Configuration</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <code className="text-sm text-gray-700 dark:text-gray-300">
                    const API_KEY = '{rayanavabrainKey?.keyId || 'YOUR_API_KEY'}';
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Test Connection</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <pre className="text-sm text-gray-700 dark:text-gray-300">{`fetch('${window.location.origin}/api/public/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer ' + API_KEY
  }
})`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Request Sync</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <pre className="text-sm text-gray-700 dark:text-gray-300">{`fetch('${window.location.origin}/api/sync/request', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'RAYANAVABRAIN',
    syncType: 'full'
  })
})`}</pre>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Link2 className="h-4 w-4" />
                <a 
                  href="/documentation/RAYANAVABRAIN_SYNC_TEST.md" 
                  className="text-sm text-purple-600 hover:underline"
                >
                  View complete test script
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Testing Console</CardTitle>
              <CardDescription>
                Test RAYANAVABRAIN API endpoints directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      fetch('/api/public/dashboard/stats', {
                        headers: { 'Authorization': `Bearer ${rayanavabrainKey?.keyId}` }
                      })
                      .then(res => res.json())
                      .then(data => {
                        toast({
                          title: "Dashboard Stats",
                          description: `Departments: ${data.totalDepartments}, Divisions: ${data.totalDivisions}`,
                        });
                      })
                      .catch(() => {
                        toast({
                          title: "Request Failed",
                          variant: "destructive",
                        });
                      });
                    }}
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    Get Dashboard Stats
                  </Button>

                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      fetch('/api/sync/status', {
                        headers: { 'Authorization': `Bearer ${rayanavabrainKey?.keyId}` }
                      })
                      .then(res => res.json())
                      .then(data => {
                        toast({
                          title: "Sync Status",
                          description: `Last sync: ${new Date(data.lastSync).toLocaleString()}`,
                        });
                      })
                      .catch(() => {
                        toast({
                          title: "Request Failed",
                          variant: "destructive",
                        });
                      });
                    }}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Check Sync Status
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">API Response:</p>
                  <code className="text-sm text-gray-700 dark:text-gray-300">
                    Click a button above to test the API endpoints
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}