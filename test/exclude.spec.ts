import { describe, expect, test } from "vitest";

import { exclude, manage, writeEmitter } from "../src/index.ts";

describe("exclude", () => {
  test("exclude beforewards", () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const ma = manage(a);
    const b = new A();
    exclude(b);
    ma.parent = b;

    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.parent.b = 4;
    expect(r).toBeFalsy();
  });

  test("exclude in class constructor", () => {
    class B {
      constructor() {
        exclude(this);
      }
      public c = 1;
    }

    class A {
      public b = new B();
    }

    const a = new A();
    const ma = manage(a);
    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.b.c = 4;
    expect(r).toBeFalsy();
  });

  test("exclude in init state", () => {
    const initState = {
      b: exclude([{ x: 1 }]),
      c: [{ y: 1 }]
    }
    const ma = manage(initState);
    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.b[0].x = 4;
    expect(r).toBeFalsy();
    ma.c[0].y = 4;
    expect(r).toBeTruthy();
  });

  test("without exclude", () => {
    class B {
      public c = 1;
    }

    class A {
      public b = new B();
    }

    const a = new A();
    const ma = manage(a);
    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.b.c = 4;
    expect(r).toBeTruthy();
  });

  test("default-1", () => {
    class A {
      public b?: B;
    }

    class B {
      public c = 1;
    }

    const a = new A();
    const b = new B();
    a.b = exclude(b);
    const ma = manage(a);
    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.b!.c = 4;
    expect(r).toBeFalsy();
  });

  test("default-2", () => {
    class B {
      public c = 1;
    }

    class A {
      public b = exclude(new B());
    }

    const a = new A();
    const ma = manage(a);
    let r = false;
    writeEmitter.on(() => {
      r = true;
    });
    ma.b.c = 4;
    expect(r).toBeFalsy();
  });
});
