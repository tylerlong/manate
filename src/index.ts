/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ManateEvent {
  type: 'get' | 'set' | 'delete' | 'has';
  target: object;
  prop: PropertyKey;
}

class EventEmitter {
  private _batch = false;

  private cache: ManateEvent[] = [];

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
  listeners = new Set<(mes: ManateEvent[]) => void>();

  on(listener: (mes: ManateEvent[]) => void) {
    this.listeners.add(listener);
  }

  off(listener: (mes: ManateEvent[]) => void) {
    this.listeners.delete(listener);
  }

  /**
   * @internal
   */
  emit(me: ManateEvent) {
    if (this._batch) {
      this.cache.push(me);
    } else {
      this.listeners.forEach((listener) => listener([me]));
    }
  }
}

export const readEmitter = new EventEmitter();
export const writeEmitter = new EventEmitter();

export const manage = <T extends object>(target: T): T => {
  const managed = new Proxy(target, {
    get: (target: T, prop: PropertyKey, receiver?: T) => {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') {
        readEmitter.emit({ type: 'get', target, prop });
      }
      return value;
    },
    set: (target: T, prop: PropertyKey, value: any, receiver?: T): boolean => {
      Reflect.set(target, prop, value, receiver);
      writeEmitter.emit({ type: 'set', target, prop });
      return true;
    },
    deleteProperty: (target: T, prop: PropertyKey) => {
      delete target[prop];
      writeEmitter.emit({ type: 'delete', target, prop });
      return true;
    },
    has: (target: T, prop: PropertyKey) => {
      const value = prop in target;
      readEmitter.emit({ type: 'has', target, prop });
      return value;
    },
    // todo: ownKeys: (target: T) => {
  });
  // todo: recursively manage
  return managed;
};

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: ManateEvent) => boolean] => {
  const reads = new Map<object, Set<PropertyKey>>();
  const listener = (mes: ManateEvent[]) => {
    for (const me of mes) {
      if (!reads.has(me.target)) {
        reads.set(me.target, new Set());
      }
      reads.get(me.target)!.add(me.prop);
    }
  };
  readEmitter.on(listener);
  const r = fn();
  readEmitter.off(listener);
  const isTrigger = (me: ManateEvent) => {
    return reads.get(me.target)?.has(me.prop) ?? false;
  };
  return [r, isTrigger];
};

export const autoRun = (fn: () => void) => {
  let isTrigger: (event: ManateEvent) => boolean;
  const listener = (mes: ManateEvent[]): void => {
    for (const me of mes) {
      if (isTrigger(me)) {
        [, isTrigger] = run(fn);
        return;
      }
    }
  };
  const start = () => {
    [, isTrigger] = run(fn);
    writeEmitter.on(listener);
  };
  const stop = () => {
    writeEmitter.off(listener);
  };
  return { start, stop };
};
