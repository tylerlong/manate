import { ReadEventEmitter, WriteEventEmitter, WriteLog } from './events';
import { Wrapper } from './wrappers';

// todo: create a class to hold the code below
export const readEmitter = new ReadEventEmitter();
export const writeEmitter = new WriteEventEmitter();

const proxyMap = new WeakMap<object, object>();
// todo: exludeSet

const canManage = (obj: object) =>
  obj &&
  (Array.isArray(obj) || obj.toString() === '[object Object]') &&
  obj['$$typeof'] !== Symbol.for('react.element');

// todo: max depth
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
): [r: T, isTrigger: (event: WriteLog) => boolean] => {
  const [r, readLog] = readEmitter.run(fn);
  const isTrigger = (writeLog: WriteLog) => {
    for (const [target, props] of writeLog) {
      if (readLog.has(target)) {
        const objectLog = readLog.get(target)!;
        for (const prop of props) {
          if (
            prop in objectLog.get &&
            objectLog.get[prop] !== Reflect.get(target, prop)
          ) {
            return true;
          }
          if (
            prop in objectLog.has &&
            objectLog.has[prop] !== Reflect.has(target, prop)
          ) {
            return true;
          }
        }

        // todo: optimize: writeLog object[prop] = -1/0/1 means delete/change/add prop
        if ('keys' in objectLog) {
          const lastKeys = objectLog.keys!;
          const currentKeys = Reflect.ownKeys(target);
          if (lastKeys.length !== currentKeys.length) {
            return true;
          }
          if (!lastKeys.every((key, i) => key === currentKeys[i])) {
            return true;
          }
        }
      }
    }
    return false;
  };
  return [r, isTrigger];
};

export const autoRun = <T>(fn: () => T, wrapper?: Wrapper) => {
  let isTrigger: (event: WriteLog) => boolean;
  let decoratedRun = () => {
    [runner.r, isTrigger] = writeEmitter.ignore(() => run(fn)); // ignore to avoid infinite loop
  };
  if (wrapper) {
    decoratedRun = wrapper(decoratedRun);
  }
  const listener = (e: WriteLog): void => {
    if (isTrigger(e)) {
      decoratedRun();
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
