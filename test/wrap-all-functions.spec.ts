import { describe, expect, test } from 'vitest';

function wrapAllFunctions(obj) {
  const wrappedFunctions = new WeakMap();

  // Traverse the prototype chain
  let current = obj;
  while (current && current !== Object.prototype) {
    Reflect.ownKeys(current).forEach((key) => {
      const originalFunction = Reflect.get(current, key);
      if (
        typeof originalFunction === 'function' &&
        !wrappedFunctions.has(originalFunction)
      ) {
        // Use a Proxy to wrap the function for this instance only
        const wrappedFunction = function (...args) {
          console.log('start');
          const result = originalFunction.apply(this, args); // Call the original function
          console.log('end');
          return result;
        };
        wrappedFunctions.set(originalFunction, wrappedFunction);

        // Redefine the function on the instance only
        Reflect.defineProperty(obj, key, {
          value: wrappedFunction,
          configurable: true,
          writable: true,
        });
      }
    });
    current = Reflect.getPrototypeOf(current); // Move up the prototype chain
  }
}

// Example Usage with Array
describe('after proxy', () => {
  test('default', () => {
    const instance = [1, 2, 3, 4, 5];
    wrapAllFunctions(instance);

    // Test wrapped function behavior
    expect(instance.splice(2, 1)).toEqual([3]);
    expect(instance).toEqual([1, 2, 4, 5]); // Ensure the array is modified correctly
    console.log(instance);
  });
});
