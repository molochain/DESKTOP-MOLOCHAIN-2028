import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Activity } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastSync?: string;
  totalRequests: number;
  nextSync?: string;
}

export function ConnectionStatus({ isConnected, lastSync, totalRequests, nextSync }: ConnectionStatusProps) {
  return (
    <Card className="border-purple-600/20 bg-purple-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">RAYANAVABRAIN Connection</CardTitle>
          {isConnected ? (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Total Requests</p>
              <p className="text-2xl font-bold">{totalRequests}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">
                {lastSync || 'Never'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Next Sync</p>
              <p className="text-sm text-muted-foreground">
                {nextSync || 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}