import TestRenderer, {act} from 'react-test-renderer';
import React from 'react';

import {Component, autoUpdate} from '../src/react';
import {useProxy} from '../src';

class Store {
  hanzi: Hanzi;
  hanzis = [new Hanzi('刘'), new Hanzi('春'), new Hanzi('涛')];

  constructor() {
    this.hanzi = this.hanzis[0];
  }

  index = 0;
  changeHanzi() {
    this.index += 1;
    if (this.index > 2) {
      this.index = 0;
    }
    this.hanzi = this.hanzis[this.index];
  }
}

class Hanzi {
  hanzi: string;
  constructor(hanzi: string) {
    this.hanzi = hanzi;
  }
}

const store = useProxy(new Store());

class App extends Component<{store: Store}> {
  render() {
    const store = this.props.store;
    return (
      <>
        <button onClick={() => store.changeHanzi()}>Change Hanzi</button>
        <HanziComponent hanzi={store.hanzi} />
      </>
    );
  }
}

const renderHistory: string[] = [];

const HanziComponent = autoUpdate((props: {hanzi: Hanzi}) => {
  const {hanzi} = props;
  renderHistory.push(hanzi.hanzi);
  return <>{hanzi.hanzi}</>;
});

describe('React', () => {
  test('default', async () => {
    const renderer = TestRenderer.create(<App store={store} />);
    const changeButton = renderer.root.find(
      el =>
        el.type === 'button' && el.children && el.children[0] === 'Change Hanzi'
    );

    expect(renderHistory).toEqual(['刘']);
    await act(() => {
      store.hanzi.hanzi = '劉';
    });
    expect(renderHistory).toEqual(['刘', '劉']);
    await act(() => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '劉', '春']);
    await act(() => {
      store.hanzi.hanzi = '耀';
    });
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀']);
    await act(() => {
      changeButton.props.onClick();
    });
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀', '涛']);
    await act(() => {
      store.hanzi.hanzi = '阳';
    });
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀', '涛', '阳']);
  });
});
