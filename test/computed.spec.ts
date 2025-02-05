import { describe, expect, test } from "vitest";

import { computed, manage } from "../src/index.js";

describe("computed", () => {
  test("default", () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(3);
  });

  test("computed", () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      @computed
      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(1);
  });

  test("getter", () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      @computed
      get c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    expect(a.c).toBe(3);
    expect(a.c).toBe(3);
    expect(a.c).toBe(3);
    expect(count).toBe(1);
  });

  test("non-decorator", () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    a.c = computed(a.c);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(1);
  });

  test("before manage", () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a0 = new A();
    a0.c = computed(a0.c);
    const a = manage(a0);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(1);
  });
});
