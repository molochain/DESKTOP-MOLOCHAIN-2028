import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  UserCheck,
  UserMinus,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  FileText,
  Map
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomProgress } from '@/components/ui/custom-progress';
import { Button } from '@/components/ui/button';
// Agent Status interface for visualization
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number;
  rating?: number;
  projects?: number;
  customFields?: Record<string, any>;
}
import { Badge } from '@/components/ui/badge';
import { PulseIndicator } from '@/components/ui/pulse-indicator';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { exportAsCSV, exportAsPDF } from '@/utils/exportUtils';

interface AgentStatusVisualizationProps {
  agentStatuses: AgentStatus[];
  isConnected: boolean;
  error: string | null;
  onAgentClick?: (agent: AgentStatus) => void;
}

const AgentStatusVisualization: React.FC<AgentStatusVisualizationProps> = ({ 
  agentStatuses, 
  isConnected,
  error,
  onAgentClick
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Count of agents by status
  const statusCounts = {
    online: agentStatuses.filter(agent => agent.status === 'online').length,
    busy: agentStatuses.filter(agent => agent.status === 'busy').length,
    offline: agentStatuses.filter(agent => agent.status === 'offline').length,
    total: agentStatuses.length
  };
  
  // Calculate percentages
  const availabilityPercentage = 
    statusCounts.total > 0 
      ? Math.round(((statusCounts.online + statusCounts.busy) / statusCounts.total) * 100) 
      : 0;
  
  // Set connection status based on WebSocket state
  useEffect(() => {
    if (error) {
      setConnectionStatus('disconnected');
    } else if (isConnected) {
      setConnectionStatus('connected');
      setLastUpdateTime(new Date());
    } else {
      setConnectionStatus('connecting');
    }
  }, [isConnected, error]);
  
  // Update last update time when agent statuses change
  useEffect(() => {
    if (agentStatuses.length > 0) {
      setLastUpdateTime(new Date());
    }
  }, [agentStatuses]);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Agent Status Dashboard
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            {connectionStatus === 'connected' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
                <PulseIndicator color="green" size="sm" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'connecting' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 text-xs">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Connecting
              </Badge>
            )}
            {connectionStatus === 'disconnected' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 text-xs">
                <XCircle className="h-3 w-3" />
                Disconnected
              </Badge>
            )}
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => exportAsCSV(agentStatuses, 'agent-status-report')}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportAsPDF(agentStatuses, 'MoloChain Logistics', 'agent-status-report')}
                  className="cursor-pointer"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Real-time availability of global network agents
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Connection errors are shown in the page banner, not here to avoid duplicate messages */}
        
        <div className="space-y-4">
          {/* Overall Availability Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Network Availability</span>
              <span className="font-medium">{availabilityPercentage}%</span>
            </div>
            <CustomProgress
              value={availabilityPercentage}
              className="h-2 bg-gray-100"
              indicatorClassName={cn(
                availabilityPercentage > 70 ? "bg-green-600" : 
                availabilityPercentage > 30 ? "bg-yellow-500" : 
                "bg-red-600"
              )}
            />
          </div>
          
          {/* Status Counts - Responsive grid */}
          <div className="grid grid-cols-3 gap-1 xs:gap-2 pt-2">
            <div className="flex flex-col items-center p-1 sm:p-2 bg-green-50 rounded-md">
              <UserCheck className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 mb-0 sm:mb-1" />
              <span className="text-xs sm:text-sm font-medium text-green-800">Online</span>
              <span className="text-lg sm:text-2xl font-bold text-green-700">{statusCounts.online}</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 bg-yellow-50 rounded-md">
              <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600 mb-0 sm:mb-1" />
              <span className="text-xs sm:text-sm font-medium text-yellow-800">Busy</span>
              <span className="text-lg sm:text-2xl font-bold text-yellow-700">{statusCounts.busy}</span>
            </div>
            <div className="flex flex-col items-center p-1 sm:p-2 bg-gray-50 rounded-md">
              <UserMinus className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 mb-0 sm:mb-1" />
              <span className="text-xs sm:text-sm font-medium text-gray-800">Offline</span>
              <span className="text-lg sm:text-2xl font-bold text-gray-700">{statusCounts.offline}</span>
            </div>
          </div>
          
          {/* Toggle Details Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex justify-between items-center border mt-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {/* Detailed Stats */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-gray-500">Total Agents:</span>
                      <span className="font-medium">{statusCounts.total}</span>
                      
                      <span className="text-gray-500">Available Agents:</span>
                      <span className="font-medium">{statusCounts.online}</span>
                      
                      <span className="text-gray-500">Busy Agents:</span>
                      <span className="font-medium">{statusCounts.busy}</span>
                      
                      <span className="text-gray-500">Offline Agents:</span>
                      <span className="font-medium">{statusCounts.offline}</span>
                      
                      <span className="text-gray-500">Availability Ratio:</span>
                      <span className="font-medium">
                        {statusCounts.online} : {statusCounts.busy} : {statusCounts.offline}
                      </span>
                      
                      <span className="text-gray-500">Last Update:</span>
                      <span className="font-medium">
                        {lastUpdateTime.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Detailed Agent Information - Top Agents */}
                  <div className="border-t pt-2">
                    <h4 className="text-sm font-medium mb-2">Key Agent Details</h4>
                    <div className="space-y-2 sm:space-y-3 text-xs">
                      {agentStatuses.slice(0, 3).map(agent => (
                        <div 
                          key={agent.id} 
                          className="p-1.5 sm:p-2 bg-gray-50 rounded space-y-1 sm:space-y-2 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => onAgentClick && onAgentClick(agent)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <div className="flex items-center gap-2">
                              <span 
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  agent.status === 'online' ? "bg-green-500" : 
                                  agent.status === 'busy' ? "bg-yellow-500" : 
                                  "bg-gray-500"
                                )}
                              />
                              <span className="font-medium">{agent.name}</span>
                            </div>
                            <div className="text-gray-500 text-[10px] sm:text-xs pl-4 sm:pl-0">
                              {agent.region || "Global"} | {agent.country}
                            </div>
                          </div>
                          
                          {/* Connection Metrics */}
                          {agent.status !== 'offline' && (
                            <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-1">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>Quality</span>
                                  <span>{agent.connectionQuality || '0'}%</span>
                                </div>
                                <CustomProgress
                                  value={Number(agent.connectionQuality || 0)}
                                  className="h-1 bg-gray-100"
                                  indicatorClassName={
                                    Number(agent.connectionQuality || 0) > 80 ? "bg-green-500" : 
                                    Number(agent.connectionQuality || 0) > 60 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>Network</span>
                                  <span>{agent.networkAvailability || '0'}%</span>
                                </div>
                                <CustomProgress
                                  value={Number(agent.networkAvailability || 0)}
                                  className="h-1 bg-gray-100"
                                  indicatorClassName={
                                    Number(agent.networkAvailability || 0) > 80 ? "bg-green-500" : 
                                    Number(agent.networkAvailability || 0) > 60 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>Response</span>
                                  <span>{agent.responseTime || '0'}ms</span>
                                </div>
                                <CustomProgress
                                  value={Math.min(100, (Number(agent.responseTime || 0) / 500) * 100)}
                                  className="h-1 bg-gray-100"
                                  indicatorClassName={
                                    Number(agent.responseTime || 0) < 200 ? "bg-green-500" : 
                                    Number(agent.responseTime || 0) < 350 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Additional Info */}
                          <div className="flex flex-col xs:flex-row xs:justify-between text-gray-500 text-[10px] sm:text-xs pt-1 gap-1">
                            <div>
                              <span>Role: {agent.role}</span>
                              {agent.specialty && agent.specialty.length > 0 && (
                                <span className="ml-2 hidden sm:inline">
                                  Specialties: {agent.specialty.join(', ')}
                                </span>
                              )}
                            </div>
                            <div>
                              Last active: {new Date(agent.lastActive).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* All Agents Table */}
                  {agentStatuses.length > 3 && (
                    <div className="border-t pt-2 mt-3">
                      <h4 className="text-sm font-medium mb-2" id="all-agents-section">All Network Agents</h4>
                      
                      {/* Mobile Agent Cards (visible only on small screens) */}
                      <div className="space-y-2 sm:hidden">
                        {agentStatuses.map((agent, index) => (
                          <div 
                            key={agent.id} 
                            className={cn(
                              "p-2 rounded-md border text-xs space-y-1 cursor-pointer hover:bg-gray-100 transition-colors",
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            )}
                            onClick={() => onAgentClick && onAgentClick(agent)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{agent.name}</span>
                              <span className="flex items-center gap-1">
                                <span 
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    agent.status === 'online' ? "bg-green-500" : 
                                    agent.status === 'busy' ? "bg-yellow-500" : 
                                    "bg-gray-500"
                                  )}
                                />
                                <span className={cn(
                                  "text-[10px]",
                                  agent.status === 'online' ? "text-green-700" : 
                                  agent.status === 'busy' ? "text-yellow-700" : 
                                  "text-gray-700"
                                )}>
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[10px]">
                              <span className="text-gray-500">Region:</span>
                              <span>{agent.region || "Global"}</span>
                              
                              <span className="text-gray-500">Country:</span>
                              <span>{agent.country}</span>
                              
                              <span className="text-gray-500">Role:</span>
                              <span>{agent.role}</span>
                              
                              {agent.status !== 'offline' && (
                                <>
                                  <span className="text-gray-500">Quality:</span>
                                  <span className="text-blue-600">{agent.connectionQuality || '0'}%</span>
                                  
                                  <span className="text-gray-500">Network:</span>
                                  <span className="text-green-600">{agent.networkAvailability || '0'}%</span>
                                  
                                  <span className="text-gray-500">Response:</span>
                                  <span className="text-purple-600">{agent.responseTime || '0'}ms</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop Table (hidden on small screens) */}
                      <div className="hidden sm:block overflow-x-auto rounded border">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-700">
                            <tr>
                              <th className="py-2 px-3 font-medium">Name</th>
                              <th className="py-2 px-3 font-medium">Status</th>
                              <th className="py-2 px-3 font-medium">Region</th>
                              <th className="py-2 px-3 font-medium">Country</th>
                              <th className="py-2 px-3 font-medium">Role</th>
                              <th className="py-2 px-3 font-medium text-right">Metrics</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {agentStatuses.map((agent, index) => (
                              <tr 
                                key={agent.id} 
                                className={cn(
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50",
                                  "cursor-pointer hover:bg-gray-100 transition-colors"
                                )}
                                onClick={() => onAgentClick && onAgentClick(agent)}
                              >
                                <td className="py-2 px-3 font-medium">{agent.name}</td>
                                <td className="py-2 px-3">
                                  <span className="flex items-center gap-1">
                                    <span 
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        agent.status === 'online' ? "bg-green-500" : 
                                        agent.status === 'busy' ? "bg-yellow-500" : 
                                        "bg-gray-500"
                                      )}
                                    />
                                    <span className={cn(
                                      agent.status === 'online' ? "text-green-700" : 
                                      agent.status === 'busy' ? "text-yellow-700" : 
                                      "text-gray-700"
                                    )}>
                                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                    </span>
                                  </span>
                                </td>
                                <td className="py-2 px-3">{agent.region || "Global"}</td>
                                <td className="py-2 px-3">{agent.country}</td>
                                <td className="py-2 px-3">{agent.role}</td>
                                <td className="py-2 px-3 text-right">
                                  {agent.status !== 'offline' ? (
                                    <span className="text-xs flex gap-2 justify-end">
                                      <span title="Connection Quality" className="text-blue-600">
                                        {agent.connectionQuality || '0'}%
                                      </span>
                                      <span title="Network Availability" className="text-green-600">
                                        {agent.networkAvailability || '0'}%
                                      </span>
                                      <span title="Response Time" className="text-purple-600">
                                        {agent.responseTime || '0'}ms
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">Offline</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* View All Agents Button */}
          {agentStatuses.length > 3 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => {
                // Open a dialog or modal with all agents here
                if (showDetails) {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                  });
                } else {
                  setShowDetails(true);
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 300);
                }
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              View All Agents ({agentStatuses.length})
            </Button>
          )}
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            {isConnected 
              ? "Live updates enabled - status changes will appear in real-time" 
              : "Waiting for connection - status may not be current"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentStatusVisualization;