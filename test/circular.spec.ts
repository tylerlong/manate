import { describe, expect, test } from 'vitest';

import { $, manage } from '../src';

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
  test('manage after circular', () => {
    class A {
      constructor(public b?: B) {}
    }

    class B {
      constructor(public a: A) {}
    }

    const a = new A();
    const b = new B(a);
    a.b = b;

    const ma = manage(a); // will not trigger "RangeError: Maximum call stack size exceeded"
    expect($(ma)).toBeDefined();
    expect($(ma.b)).toBeDefined();
    expect($(ma.b?.a)).toBeDefined();
    expect($(ma.b?.a.b)).toBeDefined();
  });
});
