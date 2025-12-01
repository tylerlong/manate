import { describe, expect, test } from "vitest";

import { autoRun, manage } from "../src/index.js";

describe("autoRun", () => {
  test("default", () => {
    class Store {
      pendingAnimation?: { a: number; resolve: () => void };
    }
    const store = manage(new Store());
    const greetings: number[] = [];
    const autoRunner = autoRun(() => {
      if (store.pendingAnimation !== undefined) {
        greetings.push(store.pendingAnimation.a);
        store.pendingAnimation.resolve();
      }
    });
    autoRunner.start();
    for (let i = 0; i < 8; i++) {
      new Promise<void>((resolve) => {
        store.pendingAnimation = { a: i, resolve };
      });
    }
    autoRunner.stop();
    expect(greetings).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  // manage batch events happened in managed methods
  test("default 2", () => {
    class Store {
      pendingAnimation?: { a: number; resolve: () => void };
      start() {
        for (let i = 0; i < 8; i++) {
          new Promise<void>((resolve) => {
            this.pendingAnimation = { a: i, resolve };
          });
        }
      }
    }
    const store = manage(new Store());
    const greetings: number[] = [];
    const autoRunner = autoRun(() => {
      if (store.pendingAnimation !== undefined) {
        greetings.push(store.pendingAnimation.a);
        store.pendingAnimation.resolve();
      }
    });
    autoRunner.start();
    store.start();
    autoRunner.stop();
    expect(greetings).toEqual([7]);
  });

  test("default 3", () => {
    class Store {
      pendingAnimation?: { a: number; resolve: () => void };
    }
    const store = manage(new Store());

    const start = () => {
      for (let i = 0; i < 8; i++) {
        new Promise<void>((resolve) => {
          store.pendingAnimation = { a: i, resolve };
        });
      }
    };

    const greetings: number[] = [];
    const autoRunner = autoRun(() => {
      if (store.pendingAnimation !== undefined) {
        greetings.push(store.pendingAnimation.a);
        store.pendingAnimation.resolve();
      }
    });
    autoRunner.start();
    start();
    autoRunner.stop();
    expect(greetings).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test("default 4", () => {
    class Store {
      pendingAnimation?: { a: number; resolve: () => void };
      async start() {
        for (let i = 0; i < 8; i++) {
          await new Promise<void>((resolve) => {
            this.pendingAnimation = { a: i, resolve };
          });
        }
      }
    }
    const store = manage(new Store());
    const greetings: number[] = [];
    const autoRunner = autoRun(() => {
      if (store.pendingAnimation !== undefined) {
        greetings.push(store.pendingAnimation.a);
        store.pendingAnimation.resolve();
      }
    });
    autoRunner.start();
    store.start();
    autoRunner.stop();
    expect(greetings).toEqual([0]);
  });

  test("default 5", async () => {
    class Store {
      pendingAnimation?: { a: number; resolve: () => void };
      async start() {
        for (let i = 0; i < 8; i++) {
          await new Promise<void>((resolve) => {
            this.pendingAnimation = { a: i, resolve };
          });
        }
      }
    }
    const store = manage(new Store());
    const greetings: number[] = [];
    const autoRunner = autoRun(() => {
      if (store.pendingAnimation !== undefined) {
        greetings.push(store.pendingAnimation.a);
        store.pendingAnimation.resolve();
      }
    });
    autoRunner.start();
    await store.start();
    autoRunner.stop();
    expect(greetings).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});
