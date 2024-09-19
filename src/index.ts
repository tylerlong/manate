import EventEmitter from './event-emitter';
import type { Managed } from './models';
import { ManateEvent, Children } from './models';

export const disposeSymbol = Symbol('dispose');

const excludeSet = new WeakSet<object>();
export const exclude = <T extends object>(obj: T): T => {
  excludeSet.add(obj);
  return obj;
};

const canManage = (obj: object) =>
  obj && (Array.isArray(obj) || obj.toString() === '[object Object]') && !excludeSet.has(obj);

const childrenKey = Symbol('children');

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
      if (path === childrenKey) {
        return children;
      }
      if (path === disposeSymbol) {
        return () => {
          children.releasesAll();
          emitter.removeAllListeners();
        };
      }
      const value = Reflect.get(target, path, receiver);
      if (typeof path !== 'symbol' && typeof value !== 'function') {
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
    deleteProperty: (target: T, path: string) => {
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
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, manageChild(path, value), target);
  }

  return managed as Managed<T>;
}

export function run<T>(managed: Managed<T>, func: Function): [result: any, isTrigger: (event: ManateEvent) => boolean] {
  const caches = { get: new Set<string>(), keys: new Set<string>() };
  const listener = (event: ManateEvent) => {
    if (event.name === 'keys' || event.name === 'get') {
      caches[event.name].add(event.pathString);
    }
  };
  managed.$e.on(listener);
  const result = func();
  managed.$e.off(listener);
  const isTrigger = (event: ManateEvent) => {
    switch (event.name) {
      case 'set': {
        if (caches.get.has(event.pathString) || caches.keys.has(event.parentPathString)) {
          return true;
        }
        break;
      }
      case 'delete': {
        if (caches.get.has(event.pathString) || caches.keys.has(event.parentPathString)) {
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
  const listener = (event: ManateEvent) => {
    if (isTrigger(event)) {
      managed.$e.off(listener);
      runOnce();
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
