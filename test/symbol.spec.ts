import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { manage, runInAction } from "../src/index.js";

describe("symbol", () => {
  test("default", () => {
    // deno-lint-ignore no-explicit-any
    const mo = manage({}) as any;
    mo["a"] = {};
    mo["a"]["b"] = {};
    const mySymbol = Symbol("mySymbol");
    const [, writeLog] = runInAction(() => {
      mo["a"]["b"][mySymbol] = "myValue";
    });
    expect(mo["a"]["b"][mySymbol]).toBe("myValue");
    expect(inspect(writeLog)).toBe(`Map(1) {
  { [Symbol(mySymbol)]: 'myValue' } => Map(1) { Symbol(mySymbol) => 1 }
}`);
    expect(writeLog.values().next().value!.keys().next().value).toBe(mySymbol);
  });
});
