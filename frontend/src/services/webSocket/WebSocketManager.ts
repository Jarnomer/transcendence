class WebSocketManager {
  private static instances: Record<string, WebSocketManager> = {};
  private queue: any[] = [];

  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private params: URLSearchParams = new URLSearchParams();
  private authParams: URLSearchParams = new URLSearchParams();
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_INTERVAL = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Record<string, ((data: any) => void)[]> = {};
  private manualClose = false;

  private constructor(type: string) {
    this.url = `wss://${window.location.host}/ws/${type}/`;
    this.authParams.set('user_id', localStorage.getItem('userID') || '');
    this.authParams.set('token', localStorage.getItem('token') || '');
  }

  static getInstance(type: string): WebSocketManager {
    if (!this.instances[type]) {
      this.instances[type] = new WebSocketManager(type);
    }
    return this.instances[type];
  }

  setAuthParams(authParams: URLSearchParams) {
    authParams.forEach((value, key) => {
      this.authParams.set(key, value);
    });
  }

  connect(params: URLSearchParams = new URLSearchParams()) {
    if (this.ws) {
      console.log('Closing existing WebSocket:', this.url);
      this.ws.close();
    }
    this.params = params;
    console.log(`params before connection: ${params.toString()}`);
    console.log('Connecting to WebSocket:', this.url + `?${params.toString()}`);
    this.ws = new WebSocket(`${this.url}?${this.authParams}&${params.toString()}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected:', this.url);
      this.flushQueue();
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
      } else if (
        this.manualClose ||
        this.reconnectAttempts >= WebSocketManager.MAX_RECONNECT_ATTEMPTS
      ) {
        console.log('WebSocket closed:', this.url);
        this.reset();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', this.url, error);
      this.notifyHandlers('error', error);
    };

    this.ws.onping = () => {
      console.log('WebSocket ping received:', this.url);
      this.ws?.pong();
      this.notifyHandlers('pong', null);
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
          this.queue.push(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  flushQueue() {
    if (this.queue.length > 0) {
      console.log('Flushing WebSocket queue:', this.queue);
      this.queue.forEach((data) => {
        this.notifyHandlers(data.type, data.state);
      });
      this.queue = [];
    }
  }

  reset() {
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.ws = null;
    this.manualClose = false;
    this.params = new URLSearchParams();
  }

  deleteInstance() {
    if (WebSocketManager.instances[this.url]) {
      WebSocketManager.instances[this.url].close();
      delete WebSocketManager.instances[this.url];
    }
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
      alert(`WebSocket not connected, message not sent: ${message}`);
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
