import { describe, expect, test } from "vitest";

import { manage, writeEmitter } from "../src/index.js";

describe("Listener count", () => {
  test("default", () => {
    const managed = manage({
      a: {
        b: {
          c: "hello",
        },
      },
    });

    expect(writeEmitter["listeners"].size).toBe(0);
    const listener = () => {};
    writeEmitter.on(listener);
    expect(writeEmitter["listeners"].size).toBe(1);
    const temp = managed.a.b;
    managed.a.b = temp;
    managed.a.b = temp;
    managed.a.b = temp;
    expect(writeEmitter["listeners"].size).toBe(1);
    writeEmitter.off(listener);
    expect(writeEmitter["listeners"].size).toBe(0);
  });
});
