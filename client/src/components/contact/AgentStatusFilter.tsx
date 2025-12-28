import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MinusCircle } from 'lucide-react';
// Agent Status interface
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

interface AgentStatusFilterProps {
  selectedStatus: 'all' | 'online' | 'busy' | 'offline';
  onStatusChange: (status: 'all' | 'online' | 'busy' | 'offline') => void;
  agentStatuses: AgentStatus[];
}

const AgentStatusFilter: React.FC<AgentStatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
  agentStatuses
}) => {
  // Count agents by status
  const getCounts = () => {
    const counts = {
      online: 0,
      busy: 0,
      offline: 0
    };
    
    agentStatuses.forEach(agent => {
      counts[agent.status]++;
    });
    
    return counts;
  };
  
  const counts = getCounts();
  const totalAgents = agentStatuses.length;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge 
        variant={selectedStatus === 'all' ? 'default' : 'outline'}
        className="cursor-pointer hover:bg-primary/20 transition-colors"
        onClick={() => onStatusChange('all')}
      >
        All ({totalAgents})
      </Badge>
      
      <Badge 
        variant={selectedStatus === 'online' ? 'default' : 'outline'}
        className="cursor-pointer hover:bg-green-100 transition-colors flex items-center gap-1"
        onClick={() => onStatusChange('online')}
      >
        <CheckCircle className="h-3 w-3" />
        <span>Online ({counts.online})</span>
      </Badge>
      
      <Badge 
        variant={selectedStatus === 'busy' ? 'default' : 'outline'}
        className="cursor-pointer hover:bg-amber-100 transition-colors flex items-center gap-1"
        onClick={() => onStatusChange('busy')}
      >
        <Clock className="h-3 w-3" />
        <span>Busy ({counts.busy})</span>
      </Badge>
      
      <Badge 
        variant={selectedStatus === 'offline' ? 'default' : 'outline'}
        className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1"
        onClick={() => onStatusChange('offline')}
      >
        <MinusCircle className="h-3 w-3" />
        <span>Offline ({counts.offline})</span>
      </Badge>
    </div>
  );
};

export default AgentStatusFilter;