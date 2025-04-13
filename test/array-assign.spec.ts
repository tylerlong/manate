import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { autoRun, manage, runInAction } from "../src/index.js";

describe("array assign", () => {
  test("default", () => {
    class Store {
      public arr: any[];
      constructor() {
        this.arr = [1, 2, { s: 9 }];
      }
    }
    const store = manage(new Store());
    let count = 0;
    const autoRunner = autoRun(() => {
      count += 1;
      return store.arr;
    });
    autoRunner.start();
    expect(count).toEqual(1); // it will run once immediately

    store.arr[2].s = 10;
    store.arr.splice(1, 1);
    expect(count).toEqual(1); // change content of arr will not trigger rerun

    store.arr = [];
    expect(count).toEqual(2); // assign a new array will trigger rerun

    autoRunner.stop();
  });
});
