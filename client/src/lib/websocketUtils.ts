// WebSocket functionality simplified for stability

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  maxAttempts: number;
  isAuthenticated: boolean;
  lastHeartbeat: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private requireAuth: boolean;
  public state: WebSocketState;

  constructor(url: string, config: any, requireAuth: boolean = false) {
    this.url = url;
    this.requireAuth = requireAuth;
    this.state = {
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
      maxAttempts: config.maxAttempts || 5,
      isAuthenticated: !requireAuth, // Set to true if auth not required
      lastHeartbeat: Date.now()
    };
  }

  connect(
    onOpen?: () => void,
    onMessage?: (event: MessageEvent) => void,
    onClose?: () => void,
    onError?: (error: Event) => void
  ): void {
    if (this.state.isConnecting || this.state.isConnected) {
      return;
    }

    this.state.isConnecting = true;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const timestamp = Date.now();
      const separator = this.url.includes('?') ? '&' : '?';
      const wsUrl = `${protocol}//${window.location.host}${this.url}${separator}t=${timestamp}`;

      // WebSocket connection initiated
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.state.isConnected = true;
        this.state.isConnecting = false;
        this.state.reconnectAttempts = 0;
        onOpen?.();
      };

      this.ws.onmessage = onMessage || (() => {});

      this.ws.onclose = (event: CloseEvent) => {
        this.state.isConnected = false;
        this.state.isConnecting = false;
        
        onClose?.();
        
        // Log closure only in development
        // WebSocket connection closed
      };

      this.ws.onerror = (error) => {
        this.state.isConnecting = false;
        
        // Log error only in development
        // WebSocket error occurred
        
        onError?.(error);
      };

    } catch (error) {
      this.state.isConnecting = false;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close(): void {
    this.state.reconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state.isConnected = false;
    this.state.isConnecting = false;
  }
}