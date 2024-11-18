/* eslint-disable @typescript-eslint/no-explicit-any */
import { readEmitter, writeEmitter } from '.';

export const mapGet = <V>(target: Map<PropertyKey, V>, prop: PropertyKey) => {
  const r = Reflect.get(target, prop, target);
  if (typeof r === 'function') {
    switch (prop) {
      case 'get': {
        return (key: PropertyKey) => {
          const r = target.get(key);
          readEmitter.emitGet({ target, prop: key, value: r });
          return r;
        };
      }
      case 'set': {
        return (key: PropertyKey, value: any) => {
          const has = target.has(key);
          target.set(key, value);
          writeEmitter.emit({ target, prop: key, value: has ? 0 : 1 });
        };
      }
      case 'has': {
        return (key: PropertyKey) => {
          const r = target.has(key);
          readEmitter.emitHas({ target, prop: key, value: r });
          return r;
        };
      }
      case 'delete': {
        return (key: PropertyKey) => {
          const has = target.has(key);
          target.delete(key);
          writeEmitter.emit({ target, prop: key, value: has ? -1 : 0 });
        };
      }
      case 'keys': {
        return () => {
          const r = target.keys();
          readEmitter.emitKeys({ target });
          return r;
        };
      }
      case 'values':
      case 'entries':
      case Symbol.iterator:
      case 'forEach': {
        return (...args) => {
          const r = target[prop](...args);
          readEmitter.emitKeys({ target });
          for (const key of target.keys()) {
            readEmitter.emitGet({
              target,
              prop: key,
              value: target.get(key),
            });
          }
          return r;
        };
      }
      case 'clear': {
        return () => {
          for (const key of target.keys()) {
            writeEmitter.emit({ target, prop: key, value: -1 });
          }
          target.clear();
        };
      }
    }
  }
  return r;
};
