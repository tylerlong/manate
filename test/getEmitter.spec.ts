import { describe, expect, test } from "vitest";

import { manage, writeEmitter } from "../src/index.ts";

describe("getter", () => {
  test("getter", () => {
    const obj = { a: 1, b: 2 };
    const managed = manage(obj);
    expect(writeEmitter).toBeDefined();
    expect(JSON.parse(JSON.stringify(managed, null, 2))).toEqual(obj);
  });
});
