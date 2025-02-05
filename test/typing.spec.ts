import { describe, expect, test } from "vitest";

import { manage, writeEmitter } from "../src/index.js";

describe("typings", () => {
  test("default 1", () => {
    class Store {
      public count = 0;

      public increase() {
        this.count += 1;
      }
    }
    const store = new Store();
    store.increase();
    const mo = manage(store);
    mo.increase();
  });

  test("default 2", () => {
    const mo = manage({ a: { b: 1 } });
    writeEmitter.on(() => {
      // does nothing
    });
    mo.a = { b: 2 };
  });

  test("extend", () => {
    class A {
      private p1 = 1;
    }
    const mo = manage(new A());
    const a: A = mo; // compiles
    expect(a).toBeDefined();
  });
});
