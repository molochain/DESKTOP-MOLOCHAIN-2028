import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Eye, MessageSquare, ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollaboratorInfo {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
}

interface WorkspaceCollaborationWidgetProps {
  currentPage?: string;
  className?: string;
}

export function WorkspaceCollaborationWidget({
  currentPage = '',
  className
}: WorkspaceCollaborationWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // Mock data for demonstration - in production, this would come from WebSocket/real-time connection
  useEffect(() => {
    // Simulate collaborators
    const mockCollaborators: CollaboratorInfo[] = [
      {
        id: '1',
        name: 'John Doe',
        color: '#3B82F6',
        isActive: true,
      },
      {
        id: '2',
        name: 'Jane Smith',
        color: '#10B981',
        isActive: true,
      },
    ];
    
    setCollaborators(mockCollaborators);
    setViewerCount(mockCollaborators.length);
    setMessageCount(0);
  }, [currentPage]);

  // Don't render if minimized and closed
  if (isMinimized && !isExpanded) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg"
                onClick={() => setIsExpanded(true)}
                data-testid="button-collaboration-expand"
              >
                <Users className="h-4 w-4" />
                {viewerCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {viewerCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Workspace Collaboration</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Card className="w-80 shadow-lg" data-testid="collaboration-widget">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Collaboration</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-collaboration-toggle"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(true)}
              data-testid="button-collaboration-close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <CardContent className="p-3 space-y-3">
            {/* Active Collaborators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Now</span>
                <Badge variant="secondary" className="text-xs" data-testid="badge-viewer-count">
                  <Eye className="h-3 w-3 mr-1" />
                  {viewerCount}
                </Badge>
              </div>
              
              {collaborators.length > 0 ? (
                <div className="space-y-1">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center space-x-2 p-1.5 rounded hover:bg-accent"
                      data-testid={`collaborator-${collaborator.id}`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: collaborator.color }}
                      >
                        {collaborator.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm flex-1">{collaborator.name}</span>
                      {collaborator.isActive && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No active collaborators
                </div>
              )}
            </div>

            {/* Page Info */}
            {currentPage && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Page</span>
                  <span className="font-medium truncate max-w-[150px]" data-testid="text-current-page">
                    {currentPage}
                  </span>
                </div>
              </div>
            )}

            {/* Messages Indicator */}
            {messageCount > 0 && (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  data-testid="button-view-messages"
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  <span className="text-xs">{messageCount} new messages</span>
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Cursor component for showing other users' cursors
export function CollaborativeCursor({ 
  x, 
  y, 
  color, 
  name 
}: { 
  x: number; 
  y: number; 
  color: string; 
  name: string;
}) {
  return (
    <div
      className="fixed pointer-events-none z-[100] transition-all duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5.65376 12.3673L5.29537 12.0248L5.29537 12.0247L5.65376 12.3673L9.03638 15.5886C9.61655 16.1392 10.5371 16.1362 11.1135 15.5821L15.0623 11.8589L15.4185 12.2013L15.0623 11.8589C15.7407 11.2076 16.8128 11.2593 17.4248 11.9673L21.1642 16.0154L21.5081 15.6656L21.1642 16.0154C21.7003 16.6344 21.6368 17.5682 21.0218 18.1076L16.9892 21.6577C16.3739 22.1971 15.4442 22.1336 14.9081 21.5146L11.1687 17.4663C10.5901 16.8989 9.69582 16.8481 9.05643 17.3554L5.29537 20.3891L5.65376 20.7317L5.29537 20.3891C4.68404 20.9048 3.7506 20.8405 3.21919 20.2457L0.170104 16.9163C-0.361391 16.3213 -0.298274 15.3879 0.296948 14.8726L4.05806 11.8388C4.65329 11.3236 5.58689 11.3805 6.11824 11.9755L5.65376 12.3673Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="absolute top-5 left-2 px-1.5 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}

// Presence indicator for showing who's viewing a specific element
export function PresenceIndicator({ 
  viewers, 
  className 
}: { 
  viewers: string[]; 
  className?: string;
}) {
  if (viewers.length === 0) return null;

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex -space-x-2">
        {viewers.slice(0, 3).map((viewer, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
            data-testid={`presence-viewer-${index}`}
          >
            {viewer.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {viewers.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{viewers.length - 3}
        </span>
      )}
    </div>
  );
}