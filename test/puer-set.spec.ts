import { describe, expect, test } from 'vitest';

describe('pure set', () => {
  test('autoRun', () => {
    let count = 0;
    const p = new Proxy(new Set<PropertyKey>(), {
      get: (target, prop) => {
        if (prop === 'add') {
          return (key: PropertyKey) => {
            target.has(key); // doesn't trigger count += 1 since target is not a proxy
            const r = target.add(key);
            return r;
          };
        }
        const r = Reflect.get(target, prop, target);
        if (typeof r === 'function') {
          count += 1;
        }
        return r.bind(target); // must bind, otherwise there will be exception
      },
    });
    p.add(1);
    p.add(1);
    expect(count).toBe(0);
  });
});
