// WebSocket wrapper for MOLOLINK module
import { useState, useEffect } from 'react';

let ws: WebSocket | null = null;
let statusListeners: Set<(status: WebSocketStatus) => void> = new Set();
let currentStatus: WebSocketStatus = 'disconnected';

type WebSocketStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';

function updateStatus(status: WebSocketStatus) {
  currentStatus = status;
  statusListeners.forEach(listener => listener(status));
}

export function connectWebSocket() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return ws;
  }

  updateStatus('connecting');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  ws = new WebSocket(`${protocol}//${host}/ws/mololink`);
  
  ws.onopen = () => {
    updateStatus('connected');
  };
  
  ws.onerror = () => {
    updateStatus('error');
  };
  
  ws.onclose = () => {
    updateStatus('disconnected');
    // Auto-reconnect after 3 seconds
    setTimeout(() => {
      updateStatus('reconnecting');
      connectWebSocket();
    }, 3000);
  };
  
  return ws;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!ws) {
      ws = connectWebSocket();
    }
    
    const checkConnection = () => {
      setIsConnected(ws?.readyState === WebSocket.OPEN);
    };
    
    const interval = setInterval(checkConnection, 1000);
    checkConnection();
    
    return () => clearInterval(interval);
  }, []);
  
  return { ws, isConnected };
}

export function useWebSocketStatus(): WebSocketStatus {
  const [status, setStatus] = useState<WebSocketStatus>(currentStatus);
  
  useEffect(() => {
    // Set initial status
    setStatus(currentStatus);
    
    // Add listener
    statusListeners.add(setStatus);
    
    // Initialize websocket if not connected
    if (!ws) {
      connectWebSocket();
    }
    
    return () => {
      statusListeners.delete(setStatus);
    };
  }, []);
  
  return status;
}