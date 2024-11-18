import ReadEmitter from './events/read-emitter';
import WriteEmitter from './events/write-emitter';
import { mapGet } from './map-and-set';

// todo: create a class to hold the code below
export const readEmitter = new ReadEmitter();
export const writeEmitter = new WriteEmitter();

const proxyMap = new WeakMap<object, object>();
const excludeSet = new WeakSet<object>();

export const exclude = <T extends object>(target: T): T => {
  excludeSet.add(target);
  return target;
};

const canManage = (obj: object) =>
  obj &&
  (Array.isArray(obj) ||
    obj.toString() === '[object Object]' ||
    obj.toString() === '[object Map]') &&
  !excludeSet.has(obj);

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
      if (target instanceof Map) {
        return mapGet(target, prop);
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
        value: manage(descriptor.value),
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

    // todo: use apply to make all functions batch?
  });
  proxyMap.set(target, managed);
  proxyMap.set(managed, managed);

  // recursively manage all properties
  for (const prop of Reflect.ownKeys(target)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop)!;
    if (descriptor.value && canManage(descriptor.value)) {
      Reflect.defineProperty(target, prop, {
        ...descriptor,
        value: manage(descriptor.value as T),
      });
    }
  }

  return managed;
};
