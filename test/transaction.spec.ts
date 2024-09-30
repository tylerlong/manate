import { describe, expect, test } from 'vitest';

import { autoRun, manage } from '../src';
import type { Managed } from '../src/models';

describe('transaction', () => {
  test('default', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    mo.$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    mo.$t = false;
    stop();
    expect(count).toBe(2);
  });

  test('transaction not cover', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a2.b2.c2.d2 = 1; // changes not covered by transaction
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    mo.$t = false;
    stop();
    expect(count).toBe(4);
  });

  test('two transactions', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    mo.$t = true;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true; // we never end this transaction
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    mo.$t = false;
    stop();
    expect(count).toBe(1);
  });

  test('two transactions 2', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    mo.$t = true;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = false;
    mo.$t = false;
    stop();
    expect(count).toBe(2);
  });

  test('two transactions 3', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    mo.$t = true;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    mo.$t = false;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = false;
    stop();
    expect(count).toBe(2);
  });

  test('two transactions 4', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    mo.$t = true;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = false;
    mo.a2.b2.c2.d2 = 1; // will not trigger more since there is a global transaction
    mo.$t = false;
    stop();
    expect(count).toBe(2);
  });

  test('two transactions 5', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = false;
    (mo.a2.b2.c2 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    (mo.a2.b2.c2 as unknown as Managed<{ $t: boolean }>).$t = false;
    stop();
    expect(count).toBe(3);
  });

  test('two transactions 6', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = true;
    (mo.a2.b2.c2 as unknown as Managed<{ $t: boolean }>).$t = true;
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    (mo.a1.b1.c1 as unknown as Managed<{ $t: boolean }>).$t = false;
    (mo.a2.b2.c2 as unknown as Managed<{ $t: boolean }>).$t = false; // will not trigger since it is just triggered
    stop();
    expect(count).toBe(2);
  });
});
