import TestRenderer from 'react-test-renderer';
import React from 'react';

import { Component } from '../src/react';
import { useProxy } from '../src';

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

const store = useProxy(new Store());

const renderHistory: number[] = [];

class App extends Component<{ store: Store }> {
  public render() {
    const store = this.props.store;
    renderHistory.push(store.count);
    return (
      <div>
        <span>{store.count}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}

describe('React', () => {
  test('default', async () => {
    expect(store.__emitter__.listenerCount('event')).toBe(0);
    const renderer = TestRenderer.create(<App store={store} />);
    expect(store.__emitter__.listenerCount('event')).toBe(1);
    const minusButton = renderer.root.find((el) => el.type === 'button' && el.children && el.children[0] === '+');
    minusButton.props.onClick();
    expect(store.__emitter__.listenerCount('event')).toBe(1);
    minusButton.props.onClick();
    expect(store.__emitter__.listenerCount('event')).toBe(1);
    minusButton.props.onClick();
    expect(store.__emitter__.listenerCount('event')).toBe(1);
    const span = renderer.root.find((el) => el.type === 'span');
    expect(store.count).toEqual(parseInt(span.children[0] as string, 10));
    expect(store.count).toBe(3);
    expect(renderHistory).toEqual([0, 1, 2, 3]);
  });
});
