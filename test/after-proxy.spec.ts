import { describe, expect, test } from 'vitest';

import { manage } from '../src';

describe('after proxy', () => {
  test('default', () => {
    class A {
      public b = { c: 0 };
    }

    const a = new A();
    expect(a.b).toBeDefined();
    const ma = manage(a);
    expect(ma.b).toBeDefined();
    expect(ma.$e).toBeDefined();
    expect((a as any).$e).toBeUndefined();
    expect(ma.b.$e).toBeDefined();

    // This one is special, although a is not managed, but a.b is managed
    expect((a.b as any).$e).toBeDefined();
  });
});
