import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

// MarketplaceEvent type definition
type MarketplaceEvent = {
  type: string;
  data: any;
  timestamp?: string;
};

type MarketplaceEventCallback = (event: MarketplaceEvent) => void;

export function useMarketplaceWebSocket() {
  const { isConnected, sendMessage, subscribe } = useWebSocket();
  
  const addMarketplaceListener = useCallback((callback: MarketplaceEventCallback) => {
    // Create a wrapper that filters for marketplace events
    const marketplaceWrapper = (event: any) => {
      // Check if this is a marketplace event from the server
      if (event && typeof event === 'object' && 'type' in event && 
          (event as any).type === 'marketplace_event' && 'data' in event) {
        callback((event as any).data as MarketplaceEvent);
      }
    };
    
    // Subscribe to marketplace channel
    return subscribe('marketplace', marketplaceWrapper);
  }, [subscribe]);
  
  return {
    isConnected,
    sendMessage,
    addMarketplaceListener
  };
}