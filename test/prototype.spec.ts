import { describe, expect, test } from 'vitest';

describe('prototype', () => {
  test('default', () => {
    class A {
      c() {
        return 1;
      }
    }
    const a = new A();
    a.c = () => {
      return 2;
    };
    expect(a.c()).toBe(2);
    expect(Object.getPrototypeOf(a).c()).toBe(1);
  });

  test('iterate', () => {
    class A {
      c() {
        return 1;
      }
    }
    const a = new A();
    a.c = () => {
      return 2;
    };
    const arr: PropertyKey[] = [];
    for (
      let current = a as object | null;
      current && current !== Object.prototype;
      current = Reflect.getPrototypeOf(current)
    ) {
      for (const key of Reflect.ownKeys(current)) {
        arr.push(key);
      }
    }
    expect(arr.filter((k) => k === 'c').length).toBe(2);
  });
});
