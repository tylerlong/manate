import { describe, expect, test } from "vitest";

import { action, autoRun, manage } from "../src/index.ts";

describe("action", () => {
  test("default", () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const runner = autoRun(() => {
      count++;
      return JSON.stringify(arr);
    });
    runner.start(); // trigger the first run

    function f() {
      arr.push(6);
      arr.push(7);
      arr.push(8);
    }
    const f2 = action(f);
    f2();
    runner.stop();
    expect(count).toBe(2);
  });

  test("decorator", () => {
    const arr = manage([1, 2, 3, 4, 5]);

    class A {
      public temp = 1;

      @action
      f() {
        expect(this.temp).toBe(1);
        arr.push(6);
        arr.push(7);
        arr.push(8);
      }
    }
    let count = 0;
    const runner = autoRun(() => {
      count++;
      return JSON.stringify(arr);
    });
    runner.start(); // trigger the first run
    new A().f();
    runner.stop();
    expect(count).toBe(2);
  });
});
