type EventHandler = (...args: any[]) => void;

export class CollaborationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  public isConnected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('open');
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('close');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch {
          this.emit('message', { data: event.data });
        }
      };

      this.ws.onerror = (error) => {
        this.emit('error', error);
      };
    } catch (error) {
      // Handle connection error silently
      this.emit('error', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  joinSession(sessionId: string): void {
    this.send({ type: 'JOIN_SESSION', sessionId });
  }

  leaveSession(sessionId: string): void {
    this.send({ type: 'LEAVE_SESSION', sessionId });
  }

  sendSessionMessage(sessionId: string, content: string, contentType: string = 'text'): void {
    this.send({
      type: 'SESSION_MESSAGE',
      sessionId,
      content,
      contentType,
      timestamp: new Date().toISOString()
    });
  }

  sendTypingIndicator(sessionId: string): void {
    this.send({ type: 'TYPING_INDICATOR', sessionId });
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
}

export const collaborationSocket = new CollaborationWebSocket(
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/collaboration`
);