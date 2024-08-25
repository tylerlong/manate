// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Component } from '../src/react';
import { manage } from '../src';

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());

const renderHistory: number[] = [];

class App extends Component<{ store: Store }> {
  public render() {
    const store = this.props.store;
    renderHistory.push(store.count);
    return (
      <div>
        <span role="counter">{store.count}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}

describe('React', () => {
  test('default', async () => {
    expect(store.$e.listenerCount()).toBe(0);
    render(<App store={store} />);
    expect(store.$e.listenerCount()).toBe(1);
    const minusButton = screen.getByText('+');
    await userEvent.click(minusButton);
    expect(store.$e.listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(store.$e.listenerCount()).toBe(1);
    await userEvent.click(minusButton);
    expect(store.$e.listenerCount()).toBe(1);
    const span = await screen.findByRole('counter');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 1, 2, 3]);
    cleanup();
  });
});
