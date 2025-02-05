import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { capture, manage } from "../src/index.js";

describe("map and set", () => {
  test("map", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    expect(ma.m.get("a")).toBe(1);
    expect(ma.m.has("a")).toBe(true);
  });
  test("set", () => {
    class A {
      public s = new Set<string>();
    }
    const a = new A();
    const ma = manage(a);
    ma.s.add("a");
    expect(ma.s.has("a")).toBe(true);
  });
  test("traps", () => {
    class A {
      public m = new Map<string, number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.m.set("a", 1);
    const [, readLogs] = capture(() => {
      expect(ma.m.get("a")).toBe(1);
      expect(ma.m.has("a")).toBe(true);
    });
    expect(inspect(readLogs)).toBe(`Map(2) {
  A { m: Map(1) { 'a' => 1 } } => { get: Map(1) { 'm' => [Map] } },
  Map(1) { 'a' => 1 } => { get: Map(1) { 'a' => 1 }, has: Map(1) { 'a' => true } }
}`);
  });
});
