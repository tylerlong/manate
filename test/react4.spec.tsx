import { render, screen } from '@testing-library/react';
import React, { act } from 'react';

import { Component, auto } from '../src/react';
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
  test('class component', async () => {
    class App extends Component<{ store: Store }> {
      public render() {
        const store = this.props.store;
        renderHistory.push(store.count);
        return (
          <div>
            <span role="count">{store.count}</span>
            <button onClick={() => store.increase()}>+</button>
          </div>
        );
      }
    }
    store.count = 0;
    renderHistory.length = 0;
    render(<App store={store} />);
    act(() => {
      store.count += 1;
    });
    act(() => {
      store.count += 1;
    });
    const span = screen.getByRole('count');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(2);
    expect(renderHistory).toEqual([0, 1, 2]);
  });

  test('functional component', async () => {
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
      store.count += 1;
    });
    act(() => {
      store.count += 1;
    });
    const span = screen.getByRole('count');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
    expect(store.count).toBe(2);
    expect(renderHistory).toEqual([0, 1, 2]);
  });
});
