import { describe, expect, test } from "vitest";

import { manage } from "../src/index.js";

describe("after proxy", () => {
  test("default", () => {
    class A {
      public b = { c: 0 };
    }

    const a = new A();
    expect(a.b).toBeDefined();
    const ma = manage(a);
    expect(ma.b).toBeDefined();
  });
});
