// test/react-class.spec.tsx

// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { manage } from '../src';
import { Component } from '../src/react';

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());
const renderHistory: number[] = [];

class App extends Component<{ store: Store }> {
  render() {
    const { store } = this.props;
    renderHistory.push(store.count);
    return (
      <div>
        <span role="counter">
          {store.count}
        </span>
        <button onClick={() => store.increase()}>
        +
        </button>
      </div>
    );
  }
}

describe('React Class Component', () => {
  test('default', async () => {
    render(
      <App store={store} />
    );
    expect(renderHistory).toEqual([0]);

    const plusButton = screen.getByText('+');
    await userEvent.click(plusButton);
    expect(renderHistory).toEqual([0, 1]);

    await userEvent.click(plusButton);
    expect(renderHistory).toEqual([0, 1, 2]);

    act(() => {
      store.count += 1;
    });
    expect(renderHistory).toEqual([0, 1, 2, 3]);

    const span = screen.getByRole('counter');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 1, 2, 3]);

    cleanup();
  });
});