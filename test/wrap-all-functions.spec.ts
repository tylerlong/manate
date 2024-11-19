import { describe, expect, test } from 'vitest';

import { batchWrites } from '../src';

describe('wrap all functions', () => {
  test('default', () => {
    const logs: string[] = [];

    function wrapAllFunctions(obj) {
      let current = obj;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          const originalFunction = Reflect.get(current, key);
          if (typeof originalFunction === 'function') {
            const wrappedFunction = function (...args) {
              logs.push('start');
              const result = originalFunction.apply(this, args);
              logs.push('end');
              return result;
            };
            Reflect.defineProperty(obj, key, {
              value: wrappedFunction,
              configurable: true,
              writable: true,
            });
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
    }

    const instance = [1, 2, 3, 4, 5];
    wrapAllFunctions(instance);
    expect(instance.splice(2, 1)).toEqual([3]);
    expect(instance).toEqual([1, 2, 4, 5]);
    expect(logs).toEqual(['start', 'end']);
  });

  test('batchWrites', () => {
    function wrapAllFunctions(obj) {
      let current = obj;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          const originalFunction = Reflect.get(current, key);
          if (typeof originalFunction === 'function') {
            const wrappedFunction = function (...args) {
              const [result] = batchWrites(() =>
                originalFunction.apply(this, args),
              );
              return result;
            };
            Reflect.defineProperty(obj, key, {
              value: wrappedFunction,
              configurable: true,
              writable: true,
            });
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
    }

    const instance = [1, 2, 3, 4, 5];
    wrapAllFunctions(instance);
    expect(instance.splice(2, 1)).toEqual([3]);
    expect(instance).toEqual([1, 2, 4, 5]);
  });
});
