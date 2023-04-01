import { EventEmitter } from 'events';

import { ManateEvent, Children } from './models';

export type Manate<T> = T & { $e: EventEmitter };

export const canManage = (obj: object) => typeof obj === 'object' && obj !== null;

const childrenKey = Symbol('children');

// release all children
export const releaseChildren = <T>(obj: Manate<T>): void => {
  obj[childrenKey].releasesAll();
};

export function manage<T extends object>(target: T): Manate<T> {
  // return if the object is already a managed
  if ((target as Manate<T>).$e) {
    return target as Manate<T>;
  }

  // two variables belongs to the scope of manage (the managed)
  const emitter = new EventEmitter();
  const children = new Children();

  // manage a child and add it to children
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
      const value = Reflect.get(target, path, receiver);
      if (typeof value !== 'function') {
        emitter.emit('event', new ManateEvent('get', [path]));
      }
      return value;
    },
    // eslint-disable-next-line max-params
    set: (target: T, path: PropertyKey, value: any, receiver?: T): boolean => {
      // no assign object to itself, doesn't make sense
      // array.length assign oldValue === value, strange
      if (canManage(value) && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      children.releaseChild(path);
      Reflect.set(target, path, manageChild(path, value), receiver);
      emitter.emit('event', new ManateEvent('set', [path]));
      return true;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, manageChild(path, value), target);
  }

  return managed as Manate<T>;
}

export function run<T>(managed: Manate<T>, func: Function): [result: any, isTrigger: (event: ManateEvent) => boolean] {
  const cache = new Set<string>();
  const listener = (event: ManateEvent) => {
    if (event.name === 'get') {
      cache.add(event.pathString);
    }
  };
  managed.$e.on('event', listener);
  const result = func();
  managed.$e.off('event', listener);
  const isTrigger = (event: ManateEvent) => event.name === 'set' && cache.has(event.pathString);
  return [result, isTrigger];
}

export function autoRun<T>(
  managed: Manate<T>,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void } {
  let isTrigger: (event: ManateEvent) => boolean = () => true;
  const listener = (event: ManateEvent) => {
    if (isTrigger(event)) {
      managed.$e.off('event', listener);
      runOnce();
      managed.$e.on('event', listener);
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
      managed.$e.on('event', listener);
    },
    stop: () => managed.$e.off('event', listener),
  };
}
