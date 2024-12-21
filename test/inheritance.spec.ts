import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { manage, runInAction } from "../src/index.ts";

describe("inheritance", () => {
  test("default", () => {
    class A {
      public b = { c: 0 };
    }

    class B extends A {
      public d = { e: 0 };
    }
    const b = manage(new B());
    const [, writeLog] = runInAction(() => {
      b.b.c = 1;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 1 } => Map(1) { 'c' => 0 } }`,
    );
  });

  test("field", () => {
    class A {
      b = 1;
    }

    class B extends A {}
    expect(Reflect.ownKeys(new A())).toEqual(["b"]);
    expect(Reflect.ownKeys(new B())).toEqual(["b"]);
  });

  test("getter", () => {
    class A {
      get b() {
        return 1;
      }
    }

    class B extends A {}
    expect(Reflect.ownKeys(new A())).toEqual([]);
    expect(Reflect.ownKeys(new B())).toEqual([]);
  });

  test("getter without class", () => {
    const a = {
      get b() {
        return 1;
      },
    };

    expect(Reflect.ownKeys(a)).toEqual(["b"]);
  });

  test("function", () => {
    class A {
      b() {
        return 1;
      }
    }

    class B extends A {}
    expect(Reflect.ownKeys(new A())).toEqual([]);
    expect(Reflect.ownKeys(new B())).toEqual([]);
  });

  test("function without class", () => {
    const a = {
      b() {
        return 1;
      },
    };
    expect(Reflect.ownKeys(a)).toEqual(["b"]);
  });

  test("prototype", () => {
    class A {}

    // deno-lint-ignore no-explicit-any
    (A.prototype as any).b = 1;

    class B extends A {}

    expect(Reflect.ownKeys(new A())).toEqual([]);
    expect(Reflect.ownKeys(new B())).toEqual([]);
  });

  test("list function names", () => {
    class A {
      b() {
        return 1;
      }
    }
    const a = new A();
    const getFunctionNames = (o: object) => {
      const functionNames: PropertyKey[] = [];
      let current: object | null = o;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          if (typeof Reflect.get(current!, key) === "function") {
            functionNames.push(key); // Add function name
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
      return functionNames;
    };
    const functionNames = getFunctionNames(a);
    expect(functionNames).toEqual(["constructor", "b"]);
  });

  test("list function names except constructor", () => {
    class A {
      b() {
        return 1;
      }
    }
    const a = new A();
    const getFunctionNames = (o: object) => {
      const functionNames: PropertyKey[] = [];
      let current: object | null = o;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          if (
            typeof Reflect.get(current!, key) === "function" &&
            key !== "constructor"
          ) {
            functionNames.push(key); // Add function name
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
      return functionNames;
    };
    const functionNames = getFunctionNames(a);
    expect(functionNames).toEqual(["b"]);
  });

  test("list function names without class", () => {
    const a = {
      b() {
        return 1;
      },
    };
    const getFunctionNames = (o: object) => {
      const functionNames: PropertyKey[] = [];
      let current: object | null = o;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          if (typeof Reflect.get(current!, key) === "function") {
            functionNames.push(key); // Add function name
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
      return functionNames;
    };
    const functionNames = getFunctionNames(a);
    expect(functionNames).toEqual(["b"]);
  });
});
