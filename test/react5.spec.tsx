// @vitest-environment jsdom
import { render, screen, cleanup, act } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { auto } from '../src/react';
import { manage } from '../src';

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());

const renderHistory: number[] = [];

describe('React', () => {
  test('transaction', async () => {
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
    act(() => {
      store.$t = true; // transaction start
      store.count += 1;
    });
    act(() => {
      store.count += 1;
    });
    act(() => {
      store.count += 1;
      store.$t = false; // transaction end
    });
    const span = screen.getByRole('count');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 3]);
    cleanup();
  });
});
