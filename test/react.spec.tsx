// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test } from "vitest";

import { manage, writeEmitter } from "../src";
import { auto } from "../src/react";

class Store {
  public count = 0;

  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());

const renderHistory: number[] = [];

const App = auto((props: { store: Store }) => {
  const { store } = props;
  renderHistory.push(store.count);
  return (
    <div>
      <span role="counter">{store.count}</span>
      <button onClick={() => store.increase()}>+</button>
    </div>
  );
});

describe("React", () => {
  test("default", async () => {
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
});
