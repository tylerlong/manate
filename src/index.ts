import EventEmitter from './event-emitter';
import { ManateEvent, Children } from './models';

export { ManateEvent };

export type Managed<T> = {
  [K in keyof T]: T[K] extends object ? Managed<T[K]> : T[K];
} & {
  $e: EventEmitter;
  $t: boolean; // for transaction
  [disposeSymbol]: () => void;
};

export const disposeSymbol = Symbol('dispose');

const excludeSet = new WeakSet<object>();
const canManage = (obj: object) =>
  obj && (Array.isArray(obj) || obj.toString() === '[object Object]') && !excludeSet.has(obj);

export const exclude = <T extends object>(obj: T): T => {
  excludeSet.add(obj);
  return obj;
};

export function manage<T extends object>(target: T): Managed<T> {
  // return if the object is already managed
  if ((target as Managed<T>).$e) {
    return target as Managed<T>;
  }

  // two variables belongs to the scope of the managed
  const emitter = new EventEmitter();
  const children = new Children();

  // manage a child and add it to children list
  const manageChild = (path: PropertyKey, value: any) => {
    if (!canManage(value)) {
      return value;
    }
    const child = manage(value);
    children.addChild(path, child.$e, emitter);
    return child;
  };

  const managed = new Proxy(target, {
    get: (target: T, path: PropertyKey, receiver?: T) => {
      if (path === '$e') {
        return emitter;
      }
      if (path === disposeSymbol) {
        return () => {
          children.releasesAll();
          emitter.removeAllListeners();
        };
      }
      const value = Reflect.get(target, path, receiver);
      if (path !== '$t' && typeof path !== 'symbol' && typeof value !== 'function') {
        if (!excludeSet.has(target) && !excludeSet.has(managed)) {
          emitter.emit(new ManateEvent('get', [path]));
        }
      }
      return value;
    },
    // eslint-disable-next-line max-params
    set: (target: T, path: PropertyKey, value: any, receiver?: T): boolean => {
      // do not trigger if assign the same value
      // array length is a special case, it is always the same value
      if (path !== 'length' && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      children.releaseChild(path);
      Reflect.set(target, path, manageChild(path, value), receiver);
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent('set', [path]));
      }
      return true;
    },
    deleteProperty: (target: T, path: PropertyKey) => {
      // remove old child in case there is one
      children.releaseChild(path);
      delete target[path];
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent('delete', [path]));
      }
      return true;
    },
    ownKeys: (target: T) => {
      const value = Object.getOwnPropertyNames(target);
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent('keys', []));
      }
      return value;
    },
    has: (target: T, path: PropertyKey) => {
      const value = path in target;
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent('has', [path]));
      }
      return value;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, manageChild(path, value), target);
  }

  return managed as Managed<T>;
}

export function run<T>(managed: Managed<T>, func: Function): [result: any, isTrigger: (event: ManateEvent) => boolean] {
  const caches = { get: new Set<string>(), keys: new Set<string>(), has: new Set<string>() };
  const listener = (event: ManateEvent) => {
    if (event.name in caches) {
      caches[event.name].add(event.pathString);
    }
  };
  managed.$e.on(listener);
  const result = func();
  managed.$e.off(listener);
  const isTrigger = (event: ManateEvent) => {
    switch (event.name) {
      case 'set': {
        if (
          caches.get.has(event.pathString) ||
          caches.keys.has(event.parentPathString) ||
          caches.has.has(event.pathString)
        ) {
          return true;
        }
        break;
      }
      case 'delete': {
        if (
          caches.get.has(event.pathString) ||
          caches.keys.has(event.parentPathString) ||
          caches.has.has(event.pathString)
        ) {
          return true;
        }
        break;
      }
    }
    return false;
  };
  return [result, isTrigger];
}

export function autoRun<T>(
  managed: Managed<T>,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void } {
  let isTrigger: (event: ManateEvent) => boolean = () => true;
  const transactions = new Map<string, boolean>();
  const listener = (event: ManateEvent) => {
    let shouldRun = false;
    // start/end transaction
    if (event.name === 'set' && event.paths[event.paths.length - 1] === '$t') {
      const value = event.paths.reduce((acc, key) => acc[key], managed) as unknown as boolean;
      if (value === true) {
        // start transaction
        transactions.set(event.parentPathString, false);
      } else {
        // end transaction
        const parentKeys = Array.from(transactions.keys()).filter((key) => event.parentPathString.startsWith(key));
        if (parentKeys.length === 1) {
          shouldRun = transactions.get(parentKeys[0]) || false;
        } else {
          // from long to short
          parentKeys.sort((k1, k2) => k2.length - k1.length);
          transactions.set(parentKeys[1], transactions.get(parentKeys[1]) || transactions.get(parentKeys[0]) || false);
        }
        transactions.delete(parentKeys[0]);
      }
    } else {
      const triggered = isTrigger(event);
      if (!triggered) {
        return;
      }
      const transactionKeys = Array.from(transactions.keys()).filter((key) => event.parentPathString.startsWith(key));
      if (transactionKeys.length === 0) {
        shouldRun = true;
      } else {
        // only update the longest key
        const longestKey = transactionKeys.reduce((shortest, current) =>
          current.length > shortest.length ? current : shortest,
        );
        transactions.set(longestKey, true);
      }
    }
    if (shouldRun) {
      managed.$e.off(listener);
      runOnce();
      transactions.forEach((_, key) => transactions.set(key, false));
      managed.$e.on(listener);
    }
  };
  let runOnce = () => {
    [, isTrigger] = run(managed, func);
  };
  if (decorator) {
    runOnce = decorator(runOnce);
  }
  return {
    start: () => {
      runOnce();
      managed.$e.on(listener);
    },
    stop: () => managed.$e.off(listener),
  };
}
