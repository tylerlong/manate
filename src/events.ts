const EVENT = 'event';

class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  public on(event: string, listener: Function) {
    if (!this.events[EVENT]) {
      this.events[EVENT] = [];
    }
    this.events[EVENT].push(listener);
  }

  public off(event: string, listener: Function) {
    if (!this.events[EVENT]) {
      return;
    }
    this.events[EVENT] = this.events[EVENT].filter((l) => l !== listener);
  }

  public emit(event: string, ...args: any[]) {
    if (!this.events[EVENT]) {
      return;
    }
    this.events[EVENT].forEach((listener) => listener(...args));
  }

  public removeAllListeners() {
    this.events = {};
  }

  public listenerCount(event: string) {
    if (!this.events[EVENT]) {
      return 0;
    }
    return this.events[EVENT].length;
  }
}

export default EventEmitter;
