class WebSocketManager {
  private static instances: Record<string, WebSocketManager> = {};
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_INTERVAL = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Record<string, ((data: any) => void)[]> = {};

  private constructor(url: string) {
    this.url = url;
    this.connect();
  }

  static getInstance(url: string): WebSocketManager {
    if (!this.instances[url]) {
      this.instances[url] = new WebSocketManager(url);
    }
    return this.instances[url];
  }

  private connect() {
    if (this.ws) {
      this.ws.close();
    }

    console.log("Connecting to WebSocket:", this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connected:", this.url);
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", this.url, event.code, event.reason);
      if (!event.wasClean && this.reconnectAttempts < WebSocketManager.MAX_RECONNECT_ATTEMPTS) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", this.url, error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyHandlers(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    console.log(`Reconnecting attempt ${this.reconnectAttempts}/${WebSocketManager.MAX_RECONNECT_ATTEMPTS}`);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, WebSocketManager.RECONNECT_INTERVAL);
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent:", message);
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  addEventListener(eventType: string, callback: (data: any) => void) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(callback);
  }

  removeEventListener(eventType: string, callback: (data: any) => void) {
    if (this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = this.eventHandlers[eventType].filter((cb) => cb !== callback);
    }
  }

  private notifyHandlers(data: any) {
    if (data.type && this.eventHandlers[data.type]) {
      this.eventHandlers[data.type].forEach((callback) => callback(data.payload));
    }
  }
}

export default WebSocketManager;
