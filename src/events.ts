class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  public on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  public off(event: string, listener: Function) {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  public emit(event: string, ...args: any[]) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((listener) => listener(...args));
  }

  public removeAllListeners() {
    this.events = {};
  }

  public listenerCount(event: string) {
    if (!this.events[event]) {
      return 0;
    }
    return this.events[event].length;
  }
}

export default EventEmitter;
