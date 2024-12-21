import { describe, expect, test } from "vitest";

import { autoRun, manage, runInAction } from "../src/index.ts";

describe("transaction", () => {
  test("default", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    runInAction(() => {
      mo.a1.b1.c1.d1 = 1;
      mo.a1.b1.c1.d1 = 2;
      mo.a1.b1.c1.d1 = 3;
    });
    stop();
    expect(count).toBe(2);
  });

  test("two transactions", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    runInAction(() => {
      runInAction(() => {
        mo.a1.b1.c1.d1 = 1;
        mo.a1.b1.c1.d1 = 2;
        mo.a1.b1.c1.d1 = 3;
      });
      stop();
      expect(count).toBe(1); // still in the first batch
    });
  });

  test("two transactions 2", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    runInAction(() => {
      runInAction(() => {
        mo.a1.b1.c1.d1 = 1;
        mo.a1.b1.c1.d1 = 2;
        mo.a1.b1.c1.d1 = 3;
      });
    });
    stop();
    expect(count).toBe(2);
  });

  test("two transactions 3", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    runInAction(() => {
      runInAction(() => {
        mo.a1.b1.c1.d1 = 1;
        mo.a1.b1.c1.d1 = 2;
        mo.a1.b1.c1.d1 = 3;
      });
      mo.a2.b2.c2.d2 = 1; // will not trigger more since there is a global transaction
    });
    stop();
    expect(count).toBe(2);
  });

  test("two transactions 4", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    runInAction(() => {
      mo.a1.b1.c1.d1 = 1;
      mo.a1.b1.c1.d1 = 2;
      mo.a1.b1.c1.d1 = 3;
    });
    runInAction(() => {
      mo.a2.b2.c2.d2 = 1;
      mo.a2.b2.c2.d2 = 2;
      mo.a2.b2.c2.d2 = 3;
    });
    stop();
    expect(count).toBe(3);
  });

  test("two transactions 5", () => {
    const mo = manage({
      a1: { b1: { c1: { d1: 0 } } },
      a2: { b2: { c2: { d2: 0 } } },
    });
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(mo);
      count++;
    });
    start(); // trigger the first run
    const mc1 = mo.a1.b1.c1;
    const mc2 = mo.a2.b2.c2;
    runInAction(() => {
      runInAction(() => {
        mc1.d1 = 1;
        mc1.d1 = 2;
        mc1.d1 = 3;
        mc2.d2 = 1;
        mc2.d2 = 2;
        mc2.d2 = 3;
      });
    });
    stop();
    expect(count).toBe(2);
  });
});
