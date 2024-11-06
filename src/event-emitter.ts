import { ManateEvent } from '.';
import { Children } from './models';

class EventEmitter {
  private children = new Children();
  private listeners: ((me: ManateEvent) => void)[] = [];

  public on(listener: (me: ManateEvent) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (me: ManateEvent) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * @internal
   */
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
    this.emit(
      new ManateEvent({ name: 'transaction', paths: [], value: false }),
    );
  }

  public dispose() {
    this.removeAllListeners();
    this.children.releaseAll();
  }

  /**
   * @internal
   */
  public releaseChild(path: PropertyKey) {
    this.children.releaseChild(path);
  }

  /**
   * @internal
   */
  public addChild(path: PropertyKey, emitter: EventEmitter) {
    this.children.addChild(path, emitter, this);
  }
}

export default EventEmitter;
