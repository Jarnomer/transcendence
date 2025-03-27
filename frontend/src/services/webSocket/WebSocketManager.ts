class WebSocketManager {
  private static instances: Record<string, WebSocketManager> = {};
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private params: URLSearchParams = new URLSearchParams();
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_INTERVAL = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Record<string, ((data: any) => void)[]> = {};
  private manualClose = false;

  private constructor(type: string) {
    this.url = `wss://${window.location.host}/ws/${type}/`;
  }

  static getInstance(type: string): WebSocketManager {
    if (!this.instances[type]) {
      this.instances[type] = new WebSocketManager(type);
    }
    return this.instances[type];
  }

  connect(params: URLSearchParams) {
    if (this.ws) {
      this.ws.close();
    }
    this.params = params;
    console.log('Connecting to WebSocket:', this.url + `?${params.toString()}`);
    this.ws = new WebSocket(this.url + `?${params.toString()}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected:', this.url);
      this.reconnectAttempts = 0;
      this.notifyHandlers('open', null);
    };

    this.ws.onclose = (event) => {
      this.notifyHandlers('close', event);
      if (
        !this.manualClose &&
        !event.wasClean &&
        this.reconnectAttempts < WebSocketManager.MAX_RECONNECT_ATTEMPTS
      ) {
        this.scheduleReconnect();
      } else {
        console.log('WebSocket closed and deleted:', this.url);
        delete WebSocketManager.instances[this.url];
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', this.url, error);
      this.notifyHandlers('error', error);
    };

    /**
     * This function is called whenever a message is received from the WebSocket server.
     * It parses the message and notifies the event handlers.
     * If the message is not a valid JSON object, it logs a warning.
     * @param event - The message event from the WebSocket server.
     * @data - The parsed JSON object from the message.
     * @example - { type: 'game', state: 'data' }
     */
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.state) {
          this.notifyHandlers(data.type, data.state);
        } else {
          console.warn('Received invalid WebSocket message:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    console.log(
      `Reconnecting attempt ${this.reconnectAttempts}/${WebSocketManager.MAX_RECONNECT_ATTEMPTS}`
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.params);
    }, WebSocketManager.RECONNECT_INTERVAL);
  }

  getSocket() {
    return this.ws;
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  close() {
    console.log('Closing WebSocket:', this.url);
    this.manualClose = true;
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

  private notifyHandlers(eventType: string, data: any) {
    if (this.eventHandlers[eventType]) {
      this.eventHandlers[eventType].forEach((callback) => callback(data));
    }
  }
}

export default WebSocketManager;
