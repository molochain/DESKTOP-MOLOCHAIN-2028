// Simplified WebSocket implementation for stability
export class NoWebSocket {
  private endpoint: string;
  private connected: boolean = false;
  private messageHandlers: Set<(data: any) => void> = new Set();

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async connect(): Promise<void> {
    // Simulate connection
    this.connected = true;
    return Promise.resolve();
  }

  send(data: any): boolean {
    // No-op send for stability
    return true;
  }

  close(): void {
    this.connected = false;
    this.messageHandlers.clear();
  }

  onMessage(handler: (data: any) => void): void {
    this.messageHandlers.add(handler);
  }

  get isConnected(): boolean {
    return this.connected;
  }
}

export function useWebSocket(url: string) {
  return {
    isConnected: false,
    lastMessage: null,
    send: () => {},
    disconnect: () => {}
  };
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// Fallback collaboration socket for components that need it
export const collaborationSocket = {
  emit: () => {},
  on: () => {},
  off: () => {},
  disconnect: () => {},
  connect: () => {},
  isConnected: false,
  joinSession: () => {},
  leaveSession: () => {},
  sendSessionMessage: () => {},
  sendTypingIndicator: () => {}
};