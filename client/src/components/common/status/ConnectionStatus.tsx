import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface ConnectionInfo {
  api: 'connected' | 'disconnected' | 'checking';
  realtime: 'connected' | 'disconnected' | 'checking';
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionInfo>({
    api: 'checking',
    realtime: 'checking'
  });

  useEffect(() => {
    const checkConnections = async () => {
      // Check API health
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setStatus(prev => ({ ...prev, api: 'connected' }));
        } else {
          setStatus(prev => ({ ...prev, api: 'disconnected' }));
        }
      } catch (error) {
        setStatus(prev => ({ ...prev, api: 'disconnected' }));
      }

      // Real-time connections are managed separately - for now show as connected
      setStatus(prev => ({ ...prev, realtime: 'connected' }));
    };

    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getVariant = (state: string) => {
    switch (state) {
      case 'connected': return 'default';
      case 'disconnected': return 'destructive';
      case 'checking': return 'secondary';
      default: return 'secondary';
    }
  };

  const getLabel = (state: string) => {
    switch (state) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant={getVariant(status.api)} className="text-xs">
        API: {getLabel(status.api)}
      </Badge>
      <Badge variant={getVariant(status.realtime)} className="text-xs">
        Real-time: {getLabel(status.realtime)}
      </Badge>
    </div>
  );
}