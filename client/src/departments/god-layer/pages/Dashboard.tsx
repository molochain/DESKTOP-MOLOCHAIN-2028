import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DivineOrchestrator } from '../components/DivineOrchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, Activity, TrendingUp, Users } from 'lucide-react';

export const GodLayerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Crown className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              GOD Layer Control Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Supreme oversight and divine intelligence for the entire ecosystem</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="governance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="core">Core Systems</TabsTrigger>
          <TabsTrigger value="application">Applications</TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="governance">
          <div className="space-y-6">
            <DivineOrchestrator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Strategic Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">180+</div>
                  <p className="text-gray-600 dark:text-gray-400">Countries Managed</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">99.97%</div>
                  <p className="text-gray-600 dark:text-gray-400">Uptime</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">147ms</div>
                  <p className="text-gray-600 dark:text-gray-400">Response Time</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-400">15,240</div>
                  <p className="text-gray-600 dark:text-gray-400">Global Staff</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="core">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Core Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database Instances</span>
                    <span className="text-gray-900 dark:text-white font-medium">36 Tables</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">API Endpoints</span>
                    <span className="text-gray-900 dark:text-white font-medium">14/14 Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">WebSocket Connections</span>
                    <span className="text-gray-900 dark:text-white font-medium">Stable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
                    <span className="text-gray-900 dark:text-white font-medium">25.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-gray-900 dark:text-white font-medium">45.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Network Latency</span>
                    <span className="text-gray-900 dark:text-white font-medium">120ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Application Layer Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">128</div>
                  <p className="text-gray-600 dark:text-gray-400">Frontend Components</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">41</div>
                  <p className="text-gray-600 dark:text-gray-400">Active Routes</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <p className="text-gray-600 dark:text-gray-400">Department Dashboards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentation">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Presentation Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">React Frontend</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Tailwind CSS</span>
                  <span className="text-green-400">Compiled</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">shadcn/ui Components</span>
                  <span className="text-green-400">Loaded</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Integration Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">PostgreSQL Database</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Replit Authentication</span>
                  <span className="text-green-400">Verified</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">WebSocket Real-time</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GodLayerDashboard;