import TestRenderer, { act } from 'react-test-renderer';
import React from 'react';

import { auto } from '../src/react';
import { useProxy } from '../src';

class Store {
  public hanzi: Hanzi;
  public hanzis = [new Hanzi('刘'), new Hanzi('春'), new Hanzi('涛')];
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

const store = useProxy(new Store());

const App = (props: { store: Store }) => {
  const render = () => {
    const store = props.store;
    return (
      <>
        <button onClick={() => store.changeHanzi()}>Change Hanzi</button>
        <HanziComponent hanzi={store.hanzi} />
      </>
    );
  };
  return auto(render, props);
};

const renderHistory: string[] = [];
const HanziComponent = (props: { hanzi: Hanzi }) => {
  const render = () => {
    const { hanzi } = props;
    renderHistory.push(hanzi.hanzi);
    return <>{hanzi.hanzi}</>;
  };
  return auto(render, props);
};

describe('React', () => {
  test('default', async () => {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(<App store={store} />);
    });
    const changeButton = renderer.root.find(
      (el) => el.type === 'button' && el.children && el.children[0] === 'Change Hanzi',
    );
    expect(renderHistory).toEqual(['刘']);
    await act(async () => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '春']);
    await act(async () => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '春', '涛']);
    await act(async () => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘']);
    await act(async () => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘', '春']);
    await act(async () => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘', '春', '涛']);
  });
});
