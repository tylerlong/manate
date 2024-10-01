import { describe, expect, test } from 'vitest';

import { autoRun, manage, Transaction, type Managed } from '../src';

describe('transaction', () => {
  test('default', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    const t = new Transaction(mo);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t.commit();
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
    const t = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    mo.a2.b2.c2.d2 = 1; // changes not covered by transaction
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    t.commit();
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
    const t1 = new Transaction(mo);
    const t2 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    expect(t2).toBeDefined();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t1.commit();
    // we didn't commit t2
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
    const t1 = new Transaction(mo);
    const t2 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t2.commit();
    t1.commit();
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
    const t1 = new Transaction(mo);
    const t2 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t1.commit();
    t2.commit();
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
    const t1 = new Transaction(mo);
    const t2 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t2.commit();
    mo.a2.b2.c2.d2 = 1; // will not trigger more since there is a global transaction
    t1.commit();
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
    const t1 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    t1.commit();
    const t2 = new Transaction(mo.a2.b2.c2 as Managed<{ d2: number }>);
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    t2.commit();
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
    const t1 = new Transaction(mo.a1.b1.c1 as Managed<{ d1: number }>);
    const t2 = new Transaction(mo.a2.b2.c2 as Managed<{ d2: number }>);
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    t1.commit();
    t2.commit(); // will not trigger since it is just triggered
    stop();
    expect(count).toBe(2);
  });
});
