import TestRenderer, { act } from 'react-test-renderer';
import React from 'react';

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
            <span>{store.count}</span>
            <button onClick={() => store.increase()}>+</button>
          </div>
        );
      }
    }
    store.count = 0;
    renderHistory.length = 0;
    const renderer = TestRenderer.create(<App store={store} />);
    store.count += 1;
    store.count += 1;
    const span = renderer.root.find((el) => el.type === 'span');
    expect(store.count).toEqual(parseInt(span.children[0] as string, 10));
    expect(store.count).toBe(2);
    expect(renderHistory).toEqual([0, 1, 2]);
  });

  test('functional component', async () => {
    const App = (props: { store: Store }) => {
      const render = () => {
        const { store } = props;
        renderHistory.push(store.count);
        return (
          <div>
            <span>{store.count}</span>
            <button onClick={() => store.increase()}>+</button>
          </div>
        );
      };
      return auto(render, props);
    };
    store.count = 0;
    renderHistory.length = 0;
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(<App store={store} />);
    });
    await act(async () => {
      store.count += 1;
      store.count += 1;
    });
    const span = renderer.root.find((el) => el.type === 'span');
    expect(store.count).toEqual(parseInt(span.children[0] as string, 10));
    expect(store.count).toBe(2);
    expect(renderHistory).toEqual([0, 2, 2]);
  });
});
