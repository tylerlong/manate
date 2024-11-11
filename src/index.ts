/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from './event-emitter';
import { ManateEvent } from './models';
import TransactionsManager from './transactions';

export { ManateEvent };

const emitterSymbol = Symbol('emitter');
export const isManaged = (t: any): boolean => !!t?.[emitterSymbol];
const reactElementSymbol = Symbol.for('react.element');

export const $ = <T>(t: T): EventEmitter => {
  if (!isManaged(t)) {
    throw new Error('Not a manate managed object.');
  }
  return t[emitterSymbol];
};

const excludeSet = new WeakSet<object>();
const canManage = (obj: object) =>
  obj &&
  (Array.isArray(obj) || obj.toString() === '[object Object]') &&
  obj?.['$$typeof'] !== reactElementSymbol &&
  !excludeSet.has(obj);
export const exclude = <T extends object>(obj: T): T => {
  excludeSet.add(obj);
  return obj;
};

export function manage<T extends object>(
  target: T,
  maxDepth = 10,
  seenMap = new WeakMap<T, T>(),
): T {
  if (maxDepth < 0) {
    throw new Error('Max depth reached.');
  }

  // circular reference
  if (seenMap.has(target)) {
    return seenMap.get(target)!;
  }

  // return if the object is already managed
  if (isManaged(target)) {
    return target;
  }

  // throw if the object can't be managed
  if (!canManage(target)) {
    throw new Error('Not a manate managable object.');
  }

  // this variable belongs to the scope of the managed
  const emitter = new EventEmitter();

  // manage a child and add it to children list
  const manageChild = (path: PropertyKey, value: any) => {
    if (!canManage(value)) {
      return value;
    }
    const child = manage(value, maxDepth - 1, seenMap);
    // todo: child will always be managed, because circular reference will return previously managed object
    if (child[emitterSymbol]) {
      emitter.addChild(path, $(child));
      // otherwise there was a circular reference and we didn't manage child
    }
    return child;
  };

  const managed = new Proxy(target, {
    get: (target: T, path: PropertyKey, receiver?: T) => {
      if (path === emitterSymbol) {
        return emitter;
      }
      const value = Reflect.get(target, path, receiver);
      if (
        typeof value !== 'function' &&
        !excludeSet.has(target) &&
        !excludeSet.has(managed)
      ) {
        emitter.emit(new ManateEvent({ name: 'get', paths: [path] }));
      }
      return value;
    },

    set: (target: T, path: PropertyKey, value: any, receiver?: T): boolean => {
      // do not trigger if assign the same value
      // array length is a special case, it is always the same value
      if (path !== 'length' && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      emitter.releaseChild(path);
      Reflect.set(target, path, manageChild(path, value), receiver);
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(
          new ManateEvent({
            name: 'set',
            paths: [path],
            value:
              typeof value === 'number' || typeof value === 'boolean'
                ? value
                : undefined,
          }),
        );
      }
      return true;
    },
    deleteProperty: (target: T, path: PropertyKey) => {
      // remove old child in case there is one
      emitter.releaseChild(path);
      delete target[path];
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent({ name: 'delete', paths: [path] }));
      }
      return true;
    },
    ownKeys: (target: T) => {
      const value = Object.getOwnPropertyNames(target);
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent({ name: 'keys', paths: [] }));
      }
      return value;
    },
    has: (target: T, path: PropertyKey) => {
      const value = path in target;
      if (!excludeSet.has(target) && !excludeSet.has(managed)) {
        emitter.emit(new ManateEvent({ name: 'has', paths: [path] }));
      }
      return value;
    },
  });
  seenMap.set(target, managed);

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, manageChild(path, value), target);
  }

  return managed;
}

export function run<T, K>(
  managed: T,
  func: () => K,
): [result: K, isTrigger: (event: ManateEvent) => boolean] {
  const caches = {
    get: new Set<string>(),
    keys: new Set<string>(),
    has: new Set<string>(),
  };
  const listener = (event: ManateEvent) => {
    if (event.name in caches) {
      caches[event.name].add(event.pathString);
    }
  };
  $(managed).on(listener);
  const result = func();
  $(managed).off(listener);
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
  managed: T,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void } {
  const transactionsManager = new TransactionsManager();
  const listener = (event: ManateEvent) => {
    if (transactionsManager.shouldRun(event)) {
      $(managed).off(listener);
      runOnce();
      transactionsManager.reset();
      $(managed).on(listener);
    }
  };
  let runOnce = () => {
    [, transactionsManager.isTrigger] = run(managed, func);
  };
  if (decorator) {
    runOnce = decorator(runOnce);
  }
  return {
    start: () => {
      runOnce();
      $(managed).on(listener);
    },
    stop: () => $(managed).off(listener),
  };
}
