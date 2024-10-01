import { describe, expect, test } from 'vitest';

import { manage, $ } from '../src';

describe('Listener count', () => {
  test('default', () => {
    const managed = manage({
      a: {
        b: {
          c: 'hello',
        },
      },
    });

    expect($(managed).listenerCount()).toBe(0);
    expect($(managed.a).listenerCount()).toBe(1);
    expect($(managed.a.b).listenerCount()).toBe(1);
    expect(() => $(managed.a.b.c)).toThrow();
    const temp = managed.a.b;
    managed.a.b = temp;
    managed.a.b = temp;
    managed.a.b = temp;
    expect($(managed).listenerCount()).toBe(0);
    expect($(managed.a).listenerCount()).toBe(1);
    expect($(managed.a.b).listenerCount()).toBe(1);
    expect(() => $(managed.a.b.c)).toThrow();
  });
});
