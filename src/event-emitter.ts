import { ManateEvent } from '.';

class EventEmitter {
  private listeners: Function[] = [];

  public on(listener: Function) {
    this.listeners.push(listener);
  }

  public off(listener: Function) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public emit(me: ManateEvent) {
    if (me.emitters.has(this)) {
      return; // prevent infinite loop
    }
    me.emitters.add(this);
    this.listeners.forEach((listener) => listener(me));
  }

  public removeAllListeners() {
    this.listeners = [];
  }

  public listenerCount() {
    return this.listeners.length;
  }

  public begin() {
    this.emit(new ManateEvent({ name: 'transaction', paths: [], value: true }));
  }
  public commit() {
    this.emit(new ManateEvent({ name: 'transaction', paths: [], value: false }));
  }
}

export default EventEmitter;
