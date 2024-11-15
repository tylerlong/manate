import {
  ReadEventEmitter,
  WriteCache,
  WriteEvent,
  WriteEventEmitter,
} from './events';

// todo: create a class to hold the code below
export const readEmitter = new ReadEventEmitter();
export const writeEmitter = new WriteEventEmitter();

const proxyMap = new WeakMap<object, object>();
// todo: exludeSet

const canManage = (obj: object) =>
  obj &&
  (Array.isArray(obj) || obj.toString() === '[object Object]') &&
  obj['$$typeof'] !== Symbol.for('react.element');

export const manage = <T extends object>(target: T): T => {
  // return managed if it's already managed
  if (proxyMap.has(target)) {
    return proxyMap.get(target) as T;
  }
  // return target if it cannot be managed
  if (!canManage(target)) {
    return target;
  }

  const managed = new Proxy(target, {
    // read traps
    get: (target: T, prop: PropertyKey, receiver?: T) => {
      const r = Reflect.get(target, prop, receiver);
      readEmitter.emitGet({ target, prop, value: r });
      return r;
    },
    has: (target: T, prop: PropertyKey) => {
      const r = Reflect.has(target, prop);
      readEmitter.emitHas({ target, prop, value: r });
      return r;
    },
    ownKeys: (target: T) => {
      const r = Reflect.ownKeys(target);
      readEmitter.emitKeys({ target, value: r });
      return r;
    },

    // write traps
    defineProperty: (
      target: T,
      prop: PropertyKey,
      descriptor: PropertyDescriptor,
    ): boolean => {
      const r = Reflect.defineProperty(target, prop, {
        ...descriptor,
        value: manage(descriptor.value),
      });
      writeEmitter.emit({ target, prop });
      return r;
    },
    deleteProperty: (target: T, prop: PropertyKey) => {
      const r = Reflect.deleteProperty(target, prop);
      writeEmitter.emit({ target, prop });
      return r;
    },

    // todo: use apply to make all functions batch?
  });
  proxyMap.set(target, managed);

  for (const prop of Reflect.ownKeys(target)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop)!;
    Reflect.defineProperty(target, prop, {
      ...descriptor,
      value: manage(descriptor.value as T),
    });
  }

  return managed;
};

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: WriteEvent | WriteCache) => boolean] => {
  const [r, readCache] = readEmitter.run(fn);
  const isTrigger = (event: WriteEvent | WriteCache) => {
    let writeCache: WriteCache = event as WriteCache;
    if (!(event instanceof Map)) {
      writeCache = new Map([[event.target, new Set([event.prop])]]);
    }
    for (const [target, props] of writeCache) {
      if (readCache.has(target)) {
        const objectCache = readCache.get(target)!;
        for (const prop of props) {
          if (
            prop in objectCache.get &&
            objectCache.get[prop] !== Reflect.get(target, prop)
          ) {
            return true;
          }
          if (
            prop in objectCache.has &&
            objectCache.has[prop] !== Reflect.has(target, prop)
          ) {
            return true;
          }
        }
        if (
          'keys' in objectCache &&
          objectCache.keys !== Reflect.ownKeys(target)
        ) {
          return true;
        }
      }
    }
    return false;
  };
  return [r, isTrigger];
};

export const autoRun = <T>(fn: () => T) => {
  let isTrigger: (event: WriteEvent | WriteCache) => boolean;
  const listener = (e: WriteEvent | WriteCache): void => {
    if (isTrigger(e)) {
      [runner.r, isTrigger] = run(fn);
    }
  };
  const runner = {
    start: () => {
      [runner.r, isTrigger] = run(fn);
      writeEmitter.on(listener);
    },
    stop: () => {
      writeEmitter.off(listener);
    },
    r: undefined as T | undefined,
  };
  return runner;
};
