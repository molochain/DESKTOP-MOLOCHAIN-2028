import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import AgentProfileWidget from './AgentProfileWidget';

export interface AgentProfileModalProps {
  agent: AgentStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageAgent?: (agent: AgentStatus) => void;
  onScheduleMeeting?: (agent: AgentStatus) => void;
  onViewPerformance?: (agent: AgentStatus) => void;
}

const AgentProfileModal: React.FC<AgentProfileModalProps> = ({
  agent,
  isOpen,
  onClose,
  onMessageAgent,
  onScheduleMeeting,
  onViewPerformance,
}) => {
  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Agent Profile: {agent.name}</DialogTitle>
          <DialogDescription>
            View detailed information and contact options for {agent.name}, {agent.role} in {agent.country}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <AgentProfileWidget 
            agent={agent} 
            isEditable={true} 
            onMessageAgent={onMessageAgent}
            onScheduleMeeting={onScheduleMeeting}
            onViewPerformance={onViewPerformance}
          />
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentProfileModal;