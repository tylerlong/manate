import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { autoRun, capture, manage } from "../src/index.js";

describe("keys", () => {
  test("default", () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    const { start } = autoRun(() => {
      expect(Object.keys(store.monsters).length).toBe(count);
      count += 1;
    });
    start();
    store.monsters["a"] = 1;
    store.monsters["b"] = 2;
    expect(count).toBe(3);
  });

  test("values", () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    const { start } = autoRun(() => {
      expect(Object.values(store.monsters).length).toBe(count); // this line is different from previous test
      count += 1;
    });
    start();
    store.monsters["a"] = 1;
    store.monsters["b"] = 2;
    expect(count).toBe(3);
  });

  test("values low level", () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    const [r, readLogs] = capture(() => {
      return Object.values(store.monsters);
    });
    expect(r).toEqual([]);
    expect(inspect(readLogs)).toBe(`Map(2) {
  Store { monsters: {} } => { get: Map(1) { 'monsters' => {} } },
  {} => { keys: true }
}`);
  });
});
