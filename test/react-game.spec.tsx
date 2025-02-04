// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { manage } from "../src";
import { auto } from "../src/react";

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
  (props: { bullet: Bullet; position: [number, number, number] }) => {
    count += 1;
    const { bullet, position } = props;
    return String(bullet.id) + position.join("-");
  },
);

const position: [number, number, number] = [0, 0, 0];
const App = auto((props: { store: Store }) => {
  const { store } = props;
  return Object.values(store.bullets).map((bullet) => (
    <BulletComponent key={bullet.id} bullet={bullet} position={position} />
    // <BulletComponent key={bullet.id} bullet={bullet} position={[0, 0, 0]} /> // this will cause the test to fail, it will cause lots of re-renders
  ));
});

const store = manage(new Store());

describe("React Game", () => {
  test("default", () => {
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
});
