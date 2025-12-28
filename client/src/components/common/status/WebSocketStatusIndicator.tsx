import { useWebSocket } from "@/contexts/WebSocketContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff, RotateCcw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebSocketStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  variant?: "minimal" | "detailed" | "badge";
}

export function WebSocketStatusIndicator({ 
  className,
  showLabel = true,
  variant = "detailed" 
}: WebSocketStatusIndicatorProps) {
  const { isConnected, connectionState, reconnect } = useWebSocket();

  const getStatusIcon = () => {
    if (connectionState.isConnecting) {
      return <Clock className="h-4 w-4 animate-pulse" data-testid="status-connecting" />;
    }
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" data-testid="status-connected" />;
    }
    if (connectionState.lastError) {
      return <AlertCircle className="h-4 w-4 text-red-500" data-testid="status-error" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" data-testid="status-disconnected" />;
  };

  const getStatusText = () => {
    if (connectionState.isConnecting) {
      return "Connecting...";
    }
    if (isConnected) {
      return "Connected";
    }
    if (connectionState.lastError) {
      return `Error: ${connectionState.lastError}`;
    }
    return "Disconnected";
  };

  const getStatusColor = () => {
    if (connectionState.isConnecting) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (isConnected) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (connectionState.lastError) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getHeartbeatStatus = () => {
    if (!connectionState.lastHeartbeat) return null;
    
    const timeSinceLastHeartbeat = Date.now() - connectionState.lastHeartbeat;
    const seconds = Math.floor(timeSinceLastHeartbeat / 1000);
    
    if (seconds < 10) {
      return <span className="text-xs text-green-600">● Active</span>;
    } else if (seconds < 60) {
      return <span className="text-xs text-yellow-600">● {seconds}s ago</span>;
    } else {
      return <span className="text-xs text-red-600">● Stale</span>;
    }
  };

  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn("flex items-center", className)}
              data-testid="websocket-status-minimal"
            >
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{getStatusText()}</div>
              {connectionState.reconnectAttempts > 0 && (
                <div className="text-xs text-muted-foreground">
                  Reconnect attempts: {connectionState.reconnectAttempts}
                </div>
              )}
              {getHeartbeatStatus()}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "badge") {
    return (
      <Badge 
        className={cn(getStatusColor(), className)}
        data-testid="websocket-status-badge"
      >
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          {showLabel && getStatusText()}
        </div>
      </Badge>
    );
  }

  // Detailed variant
  return (
    <div 
      className={cn("flex items-center gap-3 p-3 border rounded-lg bg-card", className)}
      data-testid="websocket-status-detailed"
    >
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        {showLabel && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{getStatusText()}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {connectionState.reconnectAttempts > 0 && (
                <span>Attempts: {connectionState.reconnectAttempts}/{connectionState.maxAttempts}</span>
              )}
              {getHeartbeatStatus()}
            </div>
          </div>
        )}
      </div>

      {(!isConnected && !connectionState.isConnecting) && (
        <Button
          variant="outline"
          size="sm"
          onClick={reconnect}
          className="ml-auto"
          data-testid="button-reconnect"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      )}

      {connectionState.isAuthenticated && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          Authenticated
        </div>
      )}
    </div>
  );
}

// Compact floating indicator for global use
export function WebSocketFloatingIndicator() {
  const { isConnected, connectionState } = useWebSocket();

  // Only show when there are connection issues
  if (isConnected && !connectionState.isConnecting) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      data-testid="websocket-floating-indicator"
    >
      <WebSocketStatusIndicator
        variant="badge"
        className="shadow-lg animate-in slide-in-from-bottom-2"
      />
    </div>
  );
}

// Header indicator for navigation bars
export function WebSocketHeaderIndicator() {
  return (
    <WebSocketStatusIndicator
      variant="minimal"
      className="mr-2"
      showLabel={false}
      data-testid="websocket-header-indicator"
    />
  );
}