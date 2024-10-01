import { describe, expect, test } from 'vitest';

import { autoRun, manage, $ } from '../src';

describe('transaction', () => {
  test('default', () => {
    const mo = manage({ a1: { b1: { c1: { d1: 0 } } }, a2: { b2: { c2: { d2: 0 } } } });
    let count = 0;
    const { start, stop } = autoRun(mo, () => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    $(mo).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mo).commit();
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
    const mc = mo.a1.b1.c1;
    $(mc).begin();
    mo.a2.b2.c2.d2 = 1; // changes not covered by transaction
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    $(mc).commit();
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
    $(mo).begin();
    $(mo.a1.b1.c1).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mo).commit();
    // we didn't invoke $(mo.a1.b1.c1).commit();
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
    $(mo).begin();
    const mc = mo.a1.b1.c1;
    $(mc).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mc).commit();
    $(mo).commit();
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
    $(mo).begin();
    const mc = mo.a1.b1.c1;
    $(mc).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mo).commit();
    $(mc).commit();
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
    $(mo).begin();
    const mc = mo.a1.b1.c1;
    $(mc).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mc).commit();
    mo.a2.b2.c2.d2 = 1; // will not trigger more since there is a global transaction
    $(mo).commit();
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
    const mc1 = mo.a1.b1.c1;
    $(mc1).begin();
    mo.a1.b1.c1.d1 = 1;
    mo.a1.b1.c1.d1 = 2;
    mo.a1.b1.c1.d1 = 3;
    $(mc1).commit();
    const mc2 = mo.a2.b2.c2;
    $(mc2).begin();
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 2;
    mo.a2.b2.c2.d2 = 3;
    $(mc2).commit();
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
    const mc1 = mo.a1.b1.c1;
    const mc2 = mo.a2.b2.c2;
    $(mc1).begin();
    $(mc2).begin();
    mc1.d1 = 1;
    mc1.d1 = 2;
    mc1.d1 = 3;
    mc2.d2 = 1;
    mc2.d2 = 2;
    mc2.d2 = 3;
    $(mc1).commit();
    $(mc2).commit(); // will not trigger again because just triggered
    stop();
    expect(count).toBe(2);
  });
});
