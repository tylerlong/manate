class EventEmitter {
  private listeners: Function[] = [];

  public on(listener: Function) {
    this.listeners.push(listener);
  }

  public off(listener: Function) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public emit(...args: any[]) {
    this.listeners.forEach((listener) => listener(...args));
  }

  public removeAllListeners() {
    this.listeners = [];
  }

  public listenerCount() {
    return this.listeners.length;
  }
}

export default EventEmitter;
