// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { manage } from "../src";
import { auto } from "../src/react";

describe("React re-render", () => {
  test("Update children props", () => {
    let id = 0;

    class Bullet {
      public id: number;
      public speed = 10;

      public constructor() {
        this.id = id++;
      }
    }

    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }

    let bulletCount = 0;
    const BulletComponent = auto((props: { bullet: Bullet }) => {
      bulletCount += 1;
      const { bullet } = props;
      return bullet.speed;
    });

    let appCount = 0;
    const App = auto((props: { store: Store }) => {
      appCount += 1;
      const { store } = props;
      return Object.values(store.bullets).map((bullet) => (
        <BulletComponent key={bullet.id} bullet={bullet} />
      ));
    });

    const store = manage(new Store());
    store.bullets[0] = new Bullet();

    render(<App store={store} />);
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(1);
    act(() => {
      store.bullets[0].speed = 20;
    });
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(2);
    act(() => {
      store.bullets[0].speed = 30;
    });
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(3);
    act(() => {
      store.bullets[1] = new Bullet();
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(4);
    cleanup();

    // why this test case works? because React is async, refer to mutiple-parent.spec.tsx
  });

  test("Add new child", () => {
    let id = 0;

    class Bullet {
      public id: number;
      public speed = 10;

      public constructor() {
        this.id = id++;
      }
    }

    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }

    let bulletCount = 0;
    const BulletComponent = auto((props: { bullet: Bullet }) => {
      bulletCount += 1;
      const { bullet } = props;
      return bullet.speed;
    });

    let appCount = 0;
    const App = auto((props: { store: Store }) => {
      appCount += 1;
      const { store } = props;
      return Object.values(store.bullets).map((bullet) => (
        <BulletComponent key={bullet.id} bullet={bullet} />
      ));
    });

    const store = manage(new Store());
    store.bullets[0] = new Bullet();
    render(<App store={store} />);
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(1);

    act(() => {
      store.bullets[1] = new Bullet();
    });
    // re-render
    // this is inevitable in my opinion, because we have to re-render the parent to add new child
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(2);

    act(() => {
      store.bullets[2] = new Bullet();
    });
    // re-render
    // this is inevitable in my opinion, because we have to re-render the parent to add new child
    expect(appCount).toBe(3);
    expect(bulletCount).toBe(3);
    cleanup();
  });
});
