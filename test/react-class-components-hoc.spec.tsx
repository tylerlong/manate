// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { StrictMode } from "react";
import { describe, expect, test } from "vitest";

import { manage, writeEmitter } from "../src/index.js";
import { auto } from "../src/react/class-components.js";

describe("React", () => {
  test("simple", async () => {
    class Store {
      public count = 0;

      public increase() {
        this.count += 1;
      }
    }
    const store = manage(new Store());
    const renderHistory: number[] = [];
    const App = auto(
      class extends React.Component<{ store: Store }> {
        public render() {
          const { store } = this.props;
          renderHistory.push(store.count);
          return (
            <div>
              <span role="counter">{store.count}</span>
              <button onClick={() => store.increase()}>+</button>
            </div>
          );
        }
      },
    );
    const listenerCount = () => writeEmitter["listeners"].size;
    expect(listenerCount()).toBe(0);
    render(<App store={store} />);
    expect(listenerCount()).toBe(1);
    const minusButton = screen.getByText("+");
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    const span = await screen.findByRole("counter");
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 1, 2, 3]);
    cleanup();
    expect(listenerCount()).toBe(0);
  });

  test("simple-2", async () => {
    class Store {
      public count = 0;

      public increase() {
        this.count += 1;
      }
    }
    const store = manage(new Store());
    const renderHistory: number[] = [];
    class _App extends React.Component<{ store: Store }> {
      public render() {
        const { store } = this.props;
        renderHistory.push(store.count);
        return (
          <div>
            <span role="counter">{store.count}</span>
            <button onClick={() => store.increase()}>+</button>
          </div>
        );
      }
    }
    const App = auto(_App);
    const listenerCount = () => writeEmitter["listeners"].size;
    expect(listenerCount()).toBe(0);
    render(<App store={store} />);
    expect(listenerCount()).toBe(1);
    const minusButton = screen.getByText("+");
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(listenerCount()).toBe(1);
    const span = await screen.findByRole("counter");
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 1, 2, 3]);
    cleanup();
    expect(listenerCount()).toBe(0);
  });

  test("complicated", async () => {
    class Store {
      public hanzi: Hanzi;
      public hanzis = [new Hanzi("刘"), new Hanzi("春"), new Hanzi("涛")];
      public index = 0;

      public constructor() {
        this.hanzi = this.hanzis[0];
      }

      public changeHanzi() {
        this.index += 1;
        if (this.index > 2) {
          this.index = 0;
        }
        this.hanzi = this.hanzis[this.index];
      }
    }

    class Hanzi {
      public hanzi: string;

      public constructor(hanzi: string) {
        this.hanzi = hanzi;
      }
    }

    const store = manage(new Store());

    const App = auto(
      class extends React.Component<{ store: Store }> {
        public render() {
          const { store } = this.props;
          return (
            <>
              <button onClick={() => store.changeHanzi()}>Change Hanzi</button>
              <HanziComponent hanzi={store.hanzi} />
            </>
          );
        }
      },
    );

    const renderHistory: string[] = [];

    const HanziComponent = auto(
      class extends React.Component<{ hanzi: Hanzi }> {
        public render() {
          const { hanzi } = this.props;
          renderHistory.push(hanzi.hanzi);
          return hanzi.hanzi;
        }
      },
    );

    render(<App store={store} />);
    const changeButton = screen.getByText("Change Hanzi");
    expect(renderHistory).toEqual(["刘"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘", "春"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘", "春", "涛"]);
    cleanup();
  });

  test("game", async () => {
    let id = 0;

    class Bullet {
      public id: number;

      public constructor() {
        this.id = id++;
      }
    }

    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }

    let count = 0;
    const BulletComponent = auto(
      class extends React.Component<{
        bullet: Bullet;
        position: [number, number, number];
      }> {
        public render() {
          count += 1;
          const { bullet, position } = this.props;
          return String(bullet.id) + position.join("-");
        }
      },
    );

    const position: [number, number, number] = [0, 0, 0];
    const App = auto(
      class extends React.Component<{ store: Store }> {
        public render() {
          const { store } = this.props;
          return Object.values(store.bullets).map((bullet) => (
            <BulletComponent
              key={bullet.id}
              bullet={bullet}
              position={position}
            />
            // <BulletComponent key={bullet.id} bullet={bullet} position={[0, 0, 0]} /> // this will cause the test to fail, it will cause lots of re-renders
          ));
        }
      },
    );

    const store = manage(new Store());

    render(<App store={store} />);
    expect(count).toBe(0);
    act(() => {
      store.bullets[0] = new Bullet();
    });
    expect(count).toBe(1);
    act(() => {
      store.bullets[1] = new Bullet();
    });
    expect(count).toBe(2);
    act(() => {
      store.bullets[2] = new Bullet();
    });
    expect(count).toBe(3);
    act(() => {
      store.bullets[3] = new Bullet();
    });
    expect(count).toBe(4);
    cleanup();
  });

  test("strict mode", async () => {
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
    const BulletComponent = auto(
      class extends React.Component<{ bullet: Bullet }> {
        public render() {
          bulletCount += 1;
          const { bullet } = this.props;
          return bullet.speed;
        }
      },
    );

    let appCount = 0;
    const App = auto(
      class extends React.Component<{ store: Store }> {
        public render() {
          appCount += 1;
          const { store } = this.props;
          return Object.values(store.bullets).map((bullet) => (
            <BulletComponent key={bullet.id} bullet={bullet} />
          ));
        }
      },
    );

    const store = manage(new Store());
    store.bullets[0] = new Bullet();

    render(
      <StrictMode>
        <App store={store} />
      </StrictMode>,
    );
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(2);
    act(() => {
      store.bullets[0].speed = 20;
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(4);
    act(() => {
      store.bullets[0].speed = 30;
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(6);
    act(() => {
      store.bullets[1] = new Bullet();
    });
    expect(appCount).toBe(4);
    expect(bulletCount).toBe(8);
    cleanup();

    // compares to test/react-re-render.spec.tsx
    // this test all count are doubled because of strict mode
  });
});
