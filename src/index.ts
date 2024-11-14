/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ManateEvent {
  target: object;
  prop: PropertyKey;
  value: any;
}

class EventEmitter {
  /**
   * @internal
   */
  listeners = new Set<(me: ManateEvent) => void>();

  on(listener: (me: ManateEvent) => void) {
    this.listeners.add(listener);
  }

  off(listener: (me: ManateEvent) => void) {
    this.listeners.delete(listener);
  }

  /**
   * @internal
   */
  emit(me: ManateEvent) {
    for (const listener of this.listeners) {
      listener(me);
    }
  }
}

const getEmitter = new EventEmitter();
export const setEmitter = new EventEmitter();

export const manage = <T extends object>(target: T): T => {
  const proxy = new Proxy(target, {
    get: (target: T, prop: PropertyKey, receiver?: T) => {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') {
        getEmitter.emit({ target, prop, value });
      }
      return value;
    },
    set: (target: T, prop: PropertyKey, value: any, receiver?: T): boolean => {
      Reflect.set(target, prop, value, receiver);
      setEmitter.emit({ target, prop, value });
      return true;
    },
  });
  return proxy;
};

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: ManateEvent) => boolean] => {
  const gets = new Map<object, Set<PropertyKey>>();
  const listener = (me: ManateEvent) => {
    if (!gets.has(me.target)) {
      gets.set(me.target, new Set());
    }
    gets.get(me.target)!.add(me.prop);
  };
  getEmitter.on(listener);
  const r = fn();
  getEmitter.off(listener);
  const isTrigger = (me: ManateEvent) => {
    return gets.get(me.target)?.has(me.prop) ?? false;
  };
  return [r, isTrigger];
};

export const autoRun = (fn: () => void) => {
  let isTrigger: (event: ManateEvent) => boolean;
  const listener = (me: ManateEvent) => {
    if (isTrigger(me)) {
      [, isTrigger] = run(fn);
    }
  };
  const start = () => {
    [, isTrigger] = run(fn);
    setEmitter.on(listener);
  };
  const stop = () => {
    setEmitter.off(listener);
  };
  return { start, stop };
};
