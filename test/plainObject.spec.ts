import { describe, expect, test } from "vitest";

import { isManaged, manage } from "../src/index.js";

describe("plain objects", () => {
  test("default", () => {
    class Store {
      public _config = "{}";

      public get config() {
        return JSON.parse(store._config || "{}");
      }
    }
    const store = manage(new Store());
    store._config = JSON.stringify({
      someString: "sss",
      someArr: [],
    });
    expect(isManaged(store.config)).toBeFalsy();
    expect(isManaged(store)).toBeTruthy();
  });

  test("another way", () => {
    class Store {
      public config = {};
    }
    const store = manage(new Store());
    store.config = {
      someString: "sss",
      someArr: [],
    };
    expect(isManaged(store)).toBeTruthy();
    expect(isManaged(store.config)).toBeTruthy();
    const plainObject = JSON.parse(JSON.stringify(store.config));
    expect(isManaged(plainObject)).toBeFalsy();
  });
});
