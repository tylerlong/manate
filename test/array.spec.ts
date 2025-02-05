// deno-lint-ignore-file no-explicit-any
import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { manage, runInAction } from "../src/index.js";

describe("array", () => {
  test("managed set length", () => {
    const a: number[] = [];
    const keys: string[] = [];
    const managed = new Proxy<number[]>(a, {
      set: (
        target: object,
        propertyKey: string,
        value: any,
        receiver?: any,
      ) => {
        keys.push(propertyKey);
        Reflect.set(target, propertyKey, value, receiver);
        return true;
      },
    });
    managed.push(1);
    expect(keys).toEqual(["0", "length"]);
  });

  test("manage set length", () => {
    class Store {
      public todos: string[] = [];
    }
    const managed = manage(new Store());
    const [, writeLog] = runInAction(() => {
      managed.todos.push("hello");
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { [ 'hello' ] => Map(2) { '0' => 1, 'length' => 0 } }`,
    );
  });

  test("isArray", () => {
    const ma = manage([]);
    expect(Array.isArray(ma)).toBe(true);
    const mb = new Proxy([], {});
    expect(Array.isArray(mb)).toBe(true);
  });
});
