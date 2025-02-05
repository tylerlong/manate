import { describe, expect, test } from "vitest";

import { writeEmitter } from "../src/index.js";

describe("EventEmitter Limit", () => {
  test("default", () => {
    for (let i = 0; i < 10; i++) {
      writeEmitter.on(() => {});
    }
    expect(writeEmitter["listeners"].size).toBe(10);
  });
});
