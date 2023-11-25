class EventEmitter {
  private events: Function[] = [];

  public on(listener: Function) {
    this.events.push(listener);
  }

  public off(listener: Function) {
    this.events = this.events.filter((l) => l !== listener);
  }

  public emit(...args: any[]) {
    this.events.forEach((listener) => listener(...args));
  }

  public removeAllListeners() {
    this.events = [];
  }

  public listenerCount() {
    return this.events.length;
  }
}

export default EventEmitter;
