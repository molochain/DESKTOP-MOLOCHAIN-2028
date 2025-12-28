import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  Award, 
  Clock, 
  Signal, 
  BarChart, 
  Settings,
  X,
  Plus,
  ArrowUpDown,
  Maximize,
  MessageCircle,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CustomProgress } from '@/components/ui/custom-progress';
import { Button } from '@/components/ui/button';
import { PulseIndicator } from '@/components/ui/pulse-indicator';
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
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface WidgetSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

export interface AgentProfileWidgetProps {
  agent: AgentStatus;
  isEditable?: boolean;
  className?: string;
  onClose?: () => void;
  onMaximize?: () => void;
  onMessageAgent?: (agent: AgentStatus) => void;
  onScheduleMeeting?: (agent: AgentStatus) => void;
  onViewPerformance?: (agent: AgentStatus) => void;
}

const defaultSections: WidgetSection[] = [
  { id: 'basic', title: 'Basic Information', enabled: true, order: 1 },
  { id: 'status', title: 'Connection Status', enabled: true, order: 2 },
  { id: 'metrics', title: 'Performance Metrics', enabled: true, order: 3 },
  { id: 'specialties', title: 'Specialties & Expertise', enabled: true, order: 4 },
  { id: 'contact', title: 'Contact Information', enabled: true, order: 5 },
  { id: 'history', title: 'Activity History', enabled: false, order: 6 },
];

const AgentProfileWidget: React.FC<AgentProfileWidgetProps> = ({ 
  agent, 
  isEditable = false,
  className = '',
  onClose,
  onMaximize,
  onMessageAgent,
  onScheduleMeeting,
  onViewPerformance
}) => {
  const [sections, setSections] = useState<WidgetSection[]>(defaultSections);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const getStatusColor = (status: string) => {
    return status === 'online' 
      ? 'text-green-600' 
      : status === 'busy' 
        ? 'text-yellow-600' 
        : 'text-gray-600';
  };

  const getStatusBg = (status: string) => {
    return status === 'online' 
      ? 'bg-green-50' 
      : status === 'busy' 
        ? 'bg-yellow-50' 
        : 'bg-gray-50';
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSections.findIndex(section => section.id === sectionId);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sortedSections.length - 1)
    ) {
      return; // Can't move further in that direction
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetSection = sortedSections[targetIndex];
    
    // Swap orders
    const currentOrder = sortedSections[currentIndex].order;
    sortedSections[currentIndex].order = targetSection.order;
    sortedSections[targetIndex].order = currentOrder;
    
    setSections(sortedSections);
  };

  const resetWidgetLayout = () => {
    setSections(defaultSections);
  };

  return (
    <Card className={cn("shadow-md w-full max-w-md", className)}>
      <CardHeader className="pb-2 relative">
        {(onClose || onMaximize) && (
          <div className="absolute right-4 top-4 flex gap-1">
            {onMaximize && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMaximize}>
                <Maximize className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg",
            agent.status === 'online' ? 'bg-green-500' : 
            agent.status === 'busy' ? 'bg-yellow-500' : 
            'bg-gray-400'
          )}>
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {agent.name}
              <Badge variant="outline" className={cn(
                "ml-2 text-xs font-normal",
                agent.status === 'online' ? "bg-green-50 text-green-700 border-green-200" :
                agent.status === 'busy' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-gray-50 text-gray-700 border-gray-200"
              )}>
                {agent.status === 'online' && (
                  <PulseIndicator color="green" size="sm" className="mr-1" />
                )}
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </CardTitle>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {agent.role || 'Logistics Agent'}
              {agent.region && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3" />
                  {agent.region}
                </>
              )}
            </div>
          </div>
        </div>
        
        {isEditable && (
          <div className="mt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              <Settings className="h-3 w-3 mr-1" />
              {isCustomizing ? 'Done' : 'Customize Widget'}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="border rounded-md p-3 bg-slate-50 space-y-3">
                <div className="text-sm font-medium">Customize Widget Layout</div>
                <div className="space-y-2">
                  {[...sections].sort((a, b) => a.order - b.order).map(section => (
                    <div key={section.id} className="flex items-center justify-between bg-white rounded-md p-2 border">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`section-${section.id}`}
                          checked={section.enabled}
                          onChange={() => toggleSection(section.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`section-${section.id}`} className="text-sm">{section.title}</label>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={section.order === 1}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={resetWidgetLayout}
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-4">
          {/* Basic Information */}
          {sections.find(s => s.id === 'basic')?.enabled && (
            <div>
              <h3 className="text-sm font-medium mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-gray-500">Country:</div>
                <div>{agent.country || 'Global'}</div>
                
                <div className="text-gray-500">Region:</div>
                <div>{agent.region || 'All Regions'}</div>
                
                <div className="text-gray-500">Position:</div>
                <div>{agent.role || 'Logistics Agent'}</div>
                
                <div className="text-gray-500">Last Active:</div>
                <div>{new Date(agent.lastActive).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          {/* Connection Status */}
          {sections.find(s => s.id === 'status')?.enabled && (
            <div>
              <h3 className="text-sm font-medium mb-2">Connection Status</h3>
              <div className={cn(
                "p-3 rounded-md flex items-center justify-between",
                getStatusBg(agent.status)
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    agent.status === 'online' ? "bg-green-500" : 
                    agent.status === 'busy' ? "bg-yellow-500" : 
                    "bg-gray-500"
                  )}></div>
                  <span className={cn(
                    "font-medium",
                    getStatusColor(agent.status)
                  )}>
                    {agent.status === 'online' 
                      ? 'Available' 
                      : agent.status === 'busy' 
                        ? 'Busy (In Session)'
                        : 'Offline'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {agent.status !== 'offline' 
                    ? 'Online since ' + new Date(agent.lastActive).toLocaleTimeString()
                    : 'Last seen ' + new Date(agent.lastActive).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          {sections.find(s => s.id === 'metrics')?.enabled && agent.status !== 'offline' && (
            <div>
              <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Connection Quality</span>
                    <span className={
                      Number(agent.connectionQuality || 0) > 80 ? "text-green-600" : 
                      Number(agent.connectionQuality || 0) > 60 ? "text-yellow-600" : 
                      "text-red-600"
                    }>
                      {agent.connectionQuality || '0'}%
                    </span>
                  </div>
                  <CustomProgress
                    value={Number(agent.connectionQuality || 0)}
                    className="h-2 bg-gray-100 mt-1"
                    indicatorClassName={
                      Number(agent.connectionQuality || 0) > 80 ? "bg-green-500" : 
                      Number(agent.connectionQuality || 0) > 60 ? "bg-yellow-500" : 
                      "bg-red-500"
                    }
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Network Availability</span>
                    <span className={
                      Number(agent.networkAvailability || 0) > 80 ? "text-green-600" : 
                      Number(agent.networkAvailability || 0) > 60 ? "text-yellow-600" : 
                      "text-red-600"
                    }>
                      {agent.networkAvailability || '0'}%
                    </span>
                  </div>
                  <CustomProgress
                    value={Number(agent.networkAvailability || 0)}
                    className="h-2 bg-gray-100 mt-1"
                    indicatorClassName={
                      Number(agent.networkAvailability || 0) > 80 ? "bg-green-500" : 
                      Number(agent.networkAvailability || 0) > 60 ? "bg-yellow-500" : 
                      "bg-red-500"
                    }
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span className={
                      Number(agent.responseTime || 0) < 200 ? "text-green-600" : 
                      Number(agent.responseTime || 0) < 350 ? "text-yellow-600" : 
                      "text-red-600"
                    }>
                      {agent.responseTime || '0'} ms
                    </span>
                  </div>
                  <CustomProgress
                    value={Math.min(100, (Number(agent.responseTime || 0) / 500) * 100)}
                    className="h-2 bg-gray-100 mt-1"
                    indicatorClassName={
                      Number(agent.responseTime || 0) < 200 ? "bg-green-500" : 
                      Number(agent.responseTime || 0) < 350 ? "bg-yellow-500" : 
                      "bg-red-500"
                    }
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Specialties & Expertise */}
          {sections.find(s => s.id === 'specialties')?.enabled && agent.specialty && agent.specialty.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Specialties & Expertise</h3>
              <div className="flex flex-wrap gap-1">
                {agent.specialty.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          {sections.find(s => s.id === 'contact')?.enabled && (
            <div>
              <h3 className="text-sm font-medium mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{agent.email || `${agent.name.toLowerCase().replace(/\s+/g, '.')}@molochain.com`}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{agent.timezone || 'UTC+0'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity History */}
          {sections.find(s => s.id === 'history')?.enabled && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex justify-between">
                <span>Activity History</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">View All</Button>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <div>Completed shipment tracking for SHIP-235</div>
                    <div className="text-xs text-gray-500">Today, 10:32 AM</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <div>Assisted 3 customers with route planning</div>
                    <div className="text-xs text-gray-500">Yesterday, 4:15 PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex flex-wrap gap-2">
        {onMessageAgent ? (
          <Button 
            variant={agent.status === 'online' ? 'default' : 'outline'} 
            size="sm"
            className="text-xs flex-1"
            onClick={() => onMessageAgent(agent)}
            disabled={agent.status === 'offline'}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Message Agent
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="text-xs flex-1">
            <Mail className="h-3 w-3 mr-1" />
            Message
          </Button>
        )}
        
        {onScheduleMeeting ? (
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs flex-1"
            onClick={() => onScheduleMeeting(agent)}
            disabled={agent.status === 'offline'}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Schedule Meeting
          </Button>
        ) : (
          <Button variant="default" size="sm" className="text-xs flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Contact Now
          </Button>
        )}
        
        {onViewPerformance && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs w-full mt-1"
            onClick={() => onViewPerformance(agent)}
          >
            <BarChart className="h-3 w-3 mr-1" />
            View Performance Metrics
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AgentProfileWidget;