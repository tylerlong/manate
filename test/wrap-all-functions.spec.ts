// deno-lint-ignore-file no-explicit-any
import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { runInAction } from "../src/index.js";

const wrapAllFunctions = (obj: any) => {
  let current = obj;
  while (current && current !== Object.prototype) {
    Reflect.ownKeys(current).forEach((key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(current, key);
      if (!descriptor || typeof descriptor.value !== "function") return;
      const originalFunction = descriptor.value;
      const wrappedFunction = function (this: any, ...args: any[]) {
        const [result] = runInAction(() => originalFunction.apply(this, args));
        return result;
      };
      // Set the name of the wrapped function to match the original
      Object.defineProperty(wrappedFunction, "name", {
        value: originalFunction.name,
        configurable: true,
      });
      Reflect.defineProperty(obj, key, {
        value: wrappedFunction,
        configurable: true,
        writable: true,
      });
    });
    current = Reflect.getPrototypeOf(current);
  }
};

describe("wrap all functions", () => {
  test("default", () => {
    const logs: string[] = [];

    function wrapAllFunctions(obj: any) {
      let current = obj;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          const originalFunction = Reflect.get(current, key);
          if (typeof originalFunction === "function") {
            const wrappedFunction = function (this: any, ...args: any[]) {
              logs.push("start");
              const result = originalFunction.apply(this, args);
              logs.push("end");
              return result;
            };
            Reflect.defineProperty(obj, key, {
              value: wrappedFunction,
              configurable: true,
              writable: true,
            });
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
    }

    const instance = [1, 2, 3, 4, 5];
    wrapAllFunctions(instance);
    expect(instance.splice(2, 1)).toEqual([3]);
    expect(instance).toEqual([1, 2, 4, 5]);
    expect(logs).toEqual(["start", "end"]);
  });

  test("getters", () => {
    const logs: string[] = [];

    function wrapAllFunctions(obj: any) {
      let current = obj;
      while (current && current !== Object.prototype) {
        Reflect.ownKeys(current).forEach((key) => {
          const originalFunction = Reflect.get(current, key);
          if (typeof originalFunction === "function") {
            const wrappedFunction = function (this: any, ...args: any[]) {
              logs.push("start");
              const result = originalFunction.apply(this, args);
              logs.push("end");
              return result;
            };
            Reflect.defineProperty(obj, key, {
              value: wrappedFunction,
              configurable: true,
              writable: true,
            });
          }
        });
        current = Reflect.getPrototypeOf(current);
      }
    }

    class A {
      get a() {
        return 1;
      }
    }

    const instance = new A();
    wrapAllFunctions(instance);
    expect(instance.a).toBe(1);
    expect(logs).toEqual([]); // because target.a is a number instead of a function
  });

  test("runInAction", () => {
    const instance = [1, 2, 3, 4, 5];
    wrapAllFunctions(instance);
    expect(instance.splice(2, 1)).toEqual([3]);
    expect(instance).toEqual([1, 2, 4, 5]);
  });

  test("Set", () => {
    const instance = new Set<number>();
    wrapAllFunctions(instance);
    instance.add(1);
    expect(instance.size).toEqual(1);
  });

  test("inspect", () => {
    const o = { f: () => 1 };
    expect(inspect(o)).toBe("{ f: [Function: f] }");
    wrapAllFunctions(o);
    expect(inspect(o)).toBe("{ f: [Function: f] }"); // should not change the function name
  });
});
