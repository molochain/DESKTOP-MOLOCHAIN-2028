import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { CollaborationStatusIndicator } from './CollaborationStatusIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  Minimize2, 
  Maximize2, 
  X, 
  Settings, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface CollaborationFloatingWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultMinimized?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export function CollaborationFloatingWidget({
  position = 'bottom-right',
  defaultMinimized = false,
  showNotifications = true,
  className
}: CollaborationFloatingWidgetProps) {
  const {
    currentSession,
    users,
    stats,
    isConnected,
    leaveSession,
    updateStatus,
    recentSessions
  } = useCollaboration();

  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isVisible, setIsVisible] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUserActivity, setShowUserActivity] = useState(true);

  // Auto-hide when no session is active
  useEffect(() => {
    setIsVisible(!!currentSession || stats.totalUsers > 0);
  }, [currentSession, stats.totalUsers]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Sound notifications for user activity
  useEffect(() => {
    if (!soundEnabled || !showNotifications) return;

    const playSound = (type: 'join' | 'leave' | 'activity') => {
      // Simple beep sounds using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'join':
          oscillator.frequency.value = 800;
          break;
        case 'leave':
          oscillator.frequency.value = 400;
          break;
        case 'activity':
          oscillator.frequency.value = 600;
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    };

    // Monitor user count changes
    const handleUserChange = () => {
      if (stats.totalUsers > users.length) {
        playSound('join');
      } else if (stats.totalUsers < users.length) {
        playSound('leave');
      }
    };

    handleUserChange();
  }, [stats.totalUsers, users.length, soundEnabled, showNotifications]);

  if (!isVisible) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        positionClasses[position],
        className
      )}>
        <Card className={cn(
          "shadow-lg border-border/50 backdrop-blur-sm bg-background/95",
          isMinimized ? "w-16" : "w-80"
        )}>
          <CardContent className="p-3">
            {isMinimized ? (
              // Minimized view
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(false)}
                      className="h-8 w-8 p-0"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="text-xs">
                      <div className="font-medium">Collaboration</div>
                      <div>{stats.onlineUsers} online • {stats.activeUsers} active</div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {stats.onlineUsers > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">{stats.onlineUsers}</span>
                  </div>
                )}
              </div>
            ) : (
              // Expanded view
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Collaboration</span>
                    {isConnected && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowUserActivity(!showUserActivity)}
                          className="h-6 w-6 p-0"
                        >
                          {showUserActivity ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {showUserActivity ? 'Hide activity' : 'Show activity'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className="h-6 w-6 p-0"
                        >
                          {soundEnabled ? (
                            <Volume2 className="h-3 w-3" />
                          ) : (
                            <VolumeX className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Minimize2 className="h-3 w-3" />
                    </Button>

                    {currentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={leaveSession}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      Connecting to collaboration service...
                    </span>
                  </div>
                )}

                {/* Current Session Info */}
                {currentSession && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentSession.type}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {currentSession.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Collaboration Status Indicator */}
                <CollaborationStatusIndicator
                  session={currentSession || undefined}
                  users={users}
                  showUserList={true}
                  showActivity={showUserActivity}
                  className="border-0 p-0"
                />

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                  <span>{stats.totalUsers} collaborators</span>
                  <span>{stats.onlineUsers} online</span>
                  <span>{stats.activeUsers} active</span>
                </div>

                {/* Recent Sessions */}
                {recentSessions.length > 0 && !currentSession && (
                  <div className="border-t pt-2">
                    <div className="text-xs text-muted-foreground mb-1">Recent</div>
                    <div className="space-y-1">
                      {recentSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-2 p-1 rounded text-xs hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            // Could implement rejoin functionality here
                          }}
                        >
                          <Badge variant="outline" className="text-xs">
                            {session.type}
                          </Badge>
                          <span className="truncate flex-1">{session.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default CollaborationFloatingWidget;