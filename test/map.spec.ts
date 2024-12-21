import { describe, expect, test } from "vitest";

import { autoRun, manage } from "../src/index.ts";

describe("map", () => {
  test("autoRun", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.m.get("a")).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.m.set("a", 2);
    expect(count).toBe(2);
  });

  test("autoRun-set to same value", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.m.get("a")).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.m.set("a", 1); // save value should not trigger autoRun
    expect(count).toBe(1);
  });

  test("autoRun-has", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.m.has("a")).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.m.delete("a");
    expect(count).toBe(2);
  });

  test("autoRun-has-unchanged", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.m.has("a")).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.m.set("a", 2);
    ma.m.delete("b");
    expect(count).toBe(1);
  });
});
