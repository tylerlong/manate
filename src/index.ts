/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter, ProxyTrapEvent } from './events';

// todo: create a class to hold the code below
export const readEmitter = new EventEmitter();
export const writeEmitter = new EventEmitter();

const proxyMap = new WeakMap<object, object>();
// todo: exludeSet

const allPropsSymbol = Symbol('allProps');
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
    get: (target: T, prop: PropertyKey, receiver?: T) => {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') {
        readEmitter.emit({ type: 'get', target, prop });
      }
      return value;
    },
    set: (target: T, prop: PropertyKey, value: any, receiver?: T): boolean => {
      Reflect.set(target, prop, manage(value), receiver);
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
    ownKeys: (target: T) => {
      const value = Reflect.ownKeys(target);
      readEmitter.emit({ type: 'keys', target, prop: allPropsSymbol });
      return value;
    },
  });
  proxyMap.set(target, managed);

  for (const prop of Reflect.ownKeys(target)) {
    const value = Reflect.get(target, prop);
    Reflect.set(target, prop, manage(value as T), target);
  }

  return managed;
};

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: ProxyTrapEvent) => boolean] => {
  const reads = new Map<object, Set<PropertyKey>>();
  const listener = (mes: ProxyTrapEvent[]) => {
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
  const isTrigger = (me: ProxyTrapEvent) => {
    if (!reads.has(me.target)) {
      return false;
    }
    const read = reads.get(me.target)!;
    return read.has(me.prop) || read.has(allPropsSymbol);
  };
  return [r, isTrigger];
};

export const autoRun = (fn: () => void) => {
  let isTrigger: (event: ProxyTrapEvent) => boolean;
  const listener = (mes: ProxyTrapEvent[]): void => {
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
