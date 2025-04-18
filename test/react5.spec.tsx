// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { manage, runInAction } from "../src";
import { auto } from "../src/react";

class Store {
  public count = 0;

  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());

const renderHistory: number[] = [];

describe("React", () => {
  test("transaction", () => {
    const App = auto((props: { store: Store }) => {
      const { store } = props;
      renderHistory.push(store.count);
      return (
        <div>
          <span role="count">{store.count}</span>
          <button onClick={() => store.increase()}>+</button>
        </div>
      );
    });
    store.count = 0;
    renderHistory.length = 0;
    render(<App store={store} />);

    // only one re-render for batch
    act(() => {
      runInAction(() => {
        act(() => {
          store.count += 1;
        });
        act(() => {
          store.count += 1;
        });
        act(() => {
          store.count += 1;
        });
      });
    });
    // note: this cannot be tested precisely, because React may batch re-renders

    // 3 re-renders without batch
    act(() => {
      store.count += 1;
    });
    act(() => {
      store.count += 1;
    });
    act(() => {
      store.count += 1;
    });

    const span = screen.getByRole("count");
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(6);
    expect(renderHistory).toEqual([0, 3, 4, 5, 6]);
    cleanup();
  });
});
