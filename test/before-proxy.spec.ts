import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { manage, runInAction } from "../src/index.ts";

describe("before proxy", () => {
  test("Update an object before it's proxied", () => {
    class A {
      public b?: B;
    }

    class B {
      public c = 0;
    }
    const a = new A();
    const ma = manage(a);
    const b = new B();
    const [, writeLog] = runInAction(() => {
      ma.b = b;
      b.c = 1; // does not trigger write
    });
    expect(inspect(writeLog)).toEqual(
      `Map(1) { A { b: B { c: 1 } } => Map(1) { 'b' => 1 } }`,
    );
  });

  test("Update an object after it's proxied", () => {
    class A {
      public b?: B;
    }

    class B {
      public c = 0;
    }
    const a = new A();
    const ma = manage(a);
    const b = new B();
    const [, writeLog] = runInAction(() => {
      ma.b = b;
      ma.b.c = 1;
    });
    expect(inspect(writeLog)).toEqual(
      `Map(2) {
  A { b: B { c: 1 } } => Map(1) { 'b' => 1 },
  B { c: 1 } => Map(1) { 'c' => 0 }
}`,
    );
  });

  test("Update an object after it's proxied - 2", () => {
    class A {
      public b?: B;
    }

    class B {
      public c = 0;
    }
    const a = new A();
    const ma = manage(a);
    const b = new B();
    const [, writeLog] = runInAction(() => {
      ma.b = b;
      const mb = ma.b;
      mb.c = 1;
    });
    expect(inspect(writeLog)).toEqual(
      `Map(2) {
  A { b: B { c: 1 } } => Map(1) { 'b' => 1 },
  B { c: 1 } => Map(1) { 'c' => 0 }
}`,
    );
  });
});
