type EventListener = (data?: unknown) => void;

class EventEmitter {
  private events: { [key: string]: EventListener[] } = {};

  on(event: string, listener: EventListener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  emit(event: string, data?: unknown) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(data));
    }
  }
}

export const eventBus = new EventEmitter();
