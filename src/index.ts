import { EventEmitter } from 'events';

import { ProxyEvent, Children } from './models';

export type ProxyType<T> = T & { $e: EventEmitter; $c: Children };

export const canProxy = (obj: object) => typeof obj === 'object' && obj !== null;

// release all children
export const releaseChildren = <T>(obj: ProxyType<T>): void => {
  obj.$c.releasesAll();
};

export function useProxy<T extends object>(target: T): ProxyType<T> {
  // return if the object is already a proxy
  if ((target as ProxyType<T>).$e) {
    return target as ProxyType<T>;
  }

  // two variables belongs to the scope of useProxy (the proxy)
  const emitter = new EventEmitter();
  const children = new Children();

  // make child a proxy and add it to children
  const proxyChild = (path: string, value: any) => {
    if (!canProxy(value)) {
      return value;
    }
    const childProxy = useProxy(value);
    children.addChild(path, childProxy.$e, emitter);
    return childProxy;
  };

  const proxy = new Proxy(target, {
    get: (target: T, path: string, receiver?: T) => {
      if (path === '$e') {
        return emitter;
      }
      if (path === '$c') {
        return children;
      }
      const value = Reflect.get(target, path, receiver);
      if (typeof value !== 'function' && typeof path !== 'symbol') {
        emitter.emit('event', new ProxyEvent('get', [path]));
      }
      return value;
    },
    // eslint-disable-next-line max-params
    set: (target: T, path: string, value: any, receiver?: T): boolean => {
      // no assign object to itself, doesn't make sense
      // array.length assign oldValue === value, strange
      if (canProxy(value) && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      children.releaseChild(path);
      Reflect.set(target, path, proxyChild(path, value), receiver);
      if (typeof path !== 'symbol') {
        emitter.emit('event', new ProxyEvent('set', [path]));
      }
      return true;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, proxyChild(path, value), target);
  }

  return proxy as ProxyType<T>;
}

export function run<T>(proxy: ProxyType<T>, func: Function): [result: any, isTrigger: (event: ProxyEvent) => boolean] {
  const cache = new Set<string>();
  const listener = (event: ProxyEvent) => cache.add(event.pathString);
  proxy.$e.on('event', listener);
  const result = func();
  proxy.$e.off('event', listener);
  const isTrigger = (event: ProxyEvent): boolean => {
    return event.name === 'set' && cache.has(event.pathString);
  };
  return [result, isTrigger];
}

export function autoRun<T>(
  proxy: ProxyType<T>,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void } {
  let isTrigger: (event: ProxyEvent) => boolean = () => true;
  const listener = (event: ProxyEvent) => {
    if (isTrigger(event)) {
      proxy.$e.off('event', listener);
      runOnce();
      proxy.$e.on('event', listener);
    }
  };
  let runOnce = () => {
    [, isTrigger] = run(proxy, func);
  };
  if (decorator) {
    runOnce = decorator(runOnce);
  }
  return {
    start: () => {
      runOnce();
      proxy.$e.on('event', listener);
    },
    stop: () => proxy.$e.off('event', listener),
  };
}
