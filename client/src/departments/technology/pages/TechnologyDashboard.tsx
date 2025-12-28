import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TechnologyOrchestrator } from '../components/TechnologyOrchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Server, Database, Shield, Cpu } from 'lucide-react';

export const TechnologyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
            <Code className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Technology & Innovation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Enterprise technology orchestration and advanced innovation management</p>
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
            <TechnologyOrchestrator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-400" />
                    System Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">99.97%</div>
                  <p className="text-gray-600 dark:text-gray-400">Enterprise grade</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-400" />
                    Data Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">50TB</div>
                  <p className="text-gray-600 dark:text-gray-400">Daily throughput</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Security Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">98.5%</div>
                  <p className="text-gray-600 dark:text-gray-400">Zero breaches</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-yellow-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">147ms</div>
                  <p className="text-gray-600 dark:text-gray-400">Response time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="core">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Infrastructure Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Kubernetes Clusters</span>
                    <span className="text-green-400 font-medium">12 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Microservices</span>
                    <span className="text-green-400 font-medium">48 Running</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Load Balancers</span>
                    <span className="text-green-400 font-medium">Optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Development Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CI/CD Pipelines</span>
                    <span className="text-gray-900 dark:text-white font-medium">24 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deployment Success</span>
                    <span className="text-gray-900 dark:text-white font-medium">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Code Quality</span>
                    <span className="text-gray-900 dark:text-white font-medium">A+ Grade</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Technology Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <Code className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Full-Stack Development</div>
                  <p className="text-gray-600 dark:text-gray-400">React, Node.js, TypeScript</p>
                </div>
                <div className="text-center p-4">
                  <Database className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Data Engineering</div>
                  <p className="text-gray-600 dark:text-gray-400">PostgreSQL, Analytics</p>
                </div>
                <div className="text-center p-4">
                  <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Security & Compliance</div>
                  <p className="text-gray-600 dark:text-gray-400">Enterprise security</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentation">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Technology Interfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Developer Dashboard</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Monitoring Console</span>
                  <span className="text-green-400">Live</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">API Documentation</span>
                  <span className="text-green-400">Updated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Technology Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Cloud Providers</span>
                  <span className="text-green-400">Multi-cloud</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Third-party APIs</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Enterprise Systems</span>
                  <span className="text-green-400">Integrated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnologyDashboard;