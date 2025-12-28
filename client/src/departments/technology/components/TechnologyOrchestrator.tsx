import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Server, Cpu, Zap } from 'lucide-react';

export const TechnologyOrchestrator = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Code className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Enterprise Technology Orchestrator</CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              Advanced Technology
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Server className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Infrastructure Management</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Cloud orchestration</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Cpu className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Performance Optimization</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">AI-driven scaling</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Innovation Engine</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Rapid deployment</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};