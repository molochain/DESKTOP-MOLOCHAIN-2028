import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Activity, Zap, Globe } from 'lucide-react';

export const DivineOrchestrator = () => {
  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Divine Orchestrator
            </span>
            <p className="text-sm text-gray-400 font-normal">System-wide coordination and oversight</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <div className="text-lg font-bold text-white">All Systems</div>
              <div className="text-sm text-green-400">Operational</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
            <Zap className="h-8 w-8 text-yellow-400" />
            <div>
              <div className="text-lg font-bold text-white">12 Services</div>
              <div className="text-sm text-yellow-400">Active</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
            <Globe className="h-8 w-8 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white">6 Regions</div>
              <div className="text-sm text-blue-400">Connected</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DivineOrchestrator;
