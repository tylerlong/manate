import ReadEmitter from './events/read-emitter';
import WriteEmitter from './events/write-emitter';
import { mapGet, setGet } from './map-and-set';

export const readEmitter = new ReadEmitter();
export const writeEmitter = new WriteEmitter();
export const runInAction: typeof writeEmitter.runInAction =
  writeEmitter.runInAction.bind(writeEmitter);
export const action: typeof writeEmitter.action =
  writeEmitter.action.bind(writeEmitter);
export const captureReads: typeof readEmitter.captureReads =
  readEmitter.captureReads.bind(readEmitter);

const proxyMap = new WeakMap<object, object>();
export const isManaged = (target: object) => proxyMap.has(target);

const excludeSet = new WeakSet<object>();
export const exclude = <T extends object>(target: T): T => {
  excludeSet.add(target);
  return target;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canManage = (obj: any) =>
  obj &&
  (Array.isArray(obj) ||
    obj.toString() === '[object Object]' ||
    obj.toString() === '[object Map]' ||
    obj.toString() === '[object Set]') &&
  !excludeSet.has(obj);

export const manage = <T extends object>(target: T, maxDepth = 10): T => {
  if (maxDepth < 0) {
    throw new Error('Max depth exceeded.');
  }
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
      if (target instanceof Map) {
        return mapGet(target, prop);
      } else if (target instanceof Set) {
        return setGet(target, prop);
      }
      const r = Reflect.get(target, prop, receiver);
      if (typeof r !== 'function') {
        readEmitter.emitGet({ target, prop, value: r });
      }
      return r;
    },
    has: (target: T, prop: PropertyKey) => {
      const r = Reflect.has(target, prop);
      readEmitter.emitHas({ target, prop, value: r });
      return r;
    },
    ownKeys: (target: T) => {
      readEmitter.emitKeys({ target });
      return Reflect.ownKeys(target);
    },

    // write traps
    defineProperty: (
      target: T,
      prop: PropertyKey,
      descriptor: PropertyDescriptor,
    ): boolean => {
      const has = Reflect.has(target, prop);
      const r = Reflect.defineProperty(target, prop, {
        ...descriptor,
        value: manage(descriptor.value, maxDepth - 1),
      });
      writeEmitter.emit({ target, prop, value: !has && r ? 1 : 0 });
      return r;
    },
    deleteProperty: (target: T, prop: PropertyKey) => {
      const has = Reflect.has(target, prop);
      const r = Reflect.deleteProperty(target, prop);
      writeEmitter.emit({ target, prop, value: has && r ? -1 : 0 });
      return r;
    },
  });
  proxyMap.set(target, managed);
  proxyMap.set(managed, managed);

  // recursively manage all properties
  for (const prop of Reflect.ownKeys(target)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop)!;
    if (descriptor.value && canManage(descriptor.value)) {
      Reflect.defineProperty(target, prop, {
        ...descriptor,
        value: manage(descriptor.value as T, maxDepth - 1),
      });
    }
  }

  // make all functions batched
  for (
    let current = target as object | null;
    current && current !== Object.prototype;
    current = Reflect.getPrototypeOf(current)
  ) {
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Reflect.getOwnPropertyDescriptor(current, key)!;
      if (typeof descriptor.value !== 'function') continue;
      Reflect.defineProperty(target, key, {
        ...descriptor,
        value: Object.defineProperty(
          function (...args) {
            return runInAction(() => descriptor.value.apply(this, args))[0];
          },
          'name',
          { value: descriptor.value.name },
        ),
      });
    }
  }

  return managed;
};
