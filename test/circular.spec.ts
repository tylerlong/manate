import { describe, test } from 'vitest';

import { manage } from '../src';

describe('circular', () => {
  test('direct', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const ma = manage(a);
    ma.parent = ma;
  });
  test('indirect', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const b = new A();
    const ma = manage(a);
    const mb = manage(b);
    ma.parent = mb;
    mb.parent = ma;
  });
  test('3-steps away', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const b = new A();
    const c = new A();
    const ma = manage(a);
    const mb = manage(b);
    const mc = manage(c);
    ma.parent = mb;
    mb.parent = mc;
    mc.parent = ma;
  });
});
