import { describe, expect, test } from "vitest";

import { autoRun, manage } from "../src/index.ts";

describe("has", () => {
  test("default", () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    let result = false;
    const runner = autoRun(() => {
      result = "a" in store.monsters;
      count += 1;
    });
    runner.start(); // 1
    store.monsters["a"] = 1; // 2
    delete store.monsters["a"]; // 3
    store.monsters["a"] = 2; // 4
    runner.stop();
    expect(count).toBe(4);
    expect(result).toBeTruthy();
  });
});
