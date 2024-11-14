export interface ProxyTrapEvent {
  target: object;
  prop: PropertyKey;
}

export class EventEmitter {
  private _batch = false;
  private cache: ProxyTrapEvent[] = [];

  public set batch(value: boolean) {
    this._batch = value;
    if (!value && this.cache.length > 0) {
      this.listeners.forEach((listener) => listener(this.cache));
      this.cache = [];
    }
  }

  /**
   * @internal
   */
  listeners = new Set<(mes: ProxyTrapEvent[]) => void>();

  on(listener: (mes: ProxyTrapEvent[]) => void) {
    this.listeners.add(listener);
  }

  off(listener: (mes: ProxyTrapEvent[]) => void) {
    this.listeners.delete(listener);
  }

  /**
   * @internal
   */
  emit(me: ProxyTrapEvent) {
    if (this._batch) {
      this.cache.push(me);
    } else {
      this.listeners.forEach((listener) => listener([me]));
    }
  }
}
