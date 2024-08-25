// @vitest-environment jsdom
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Component } from '../src/react';
import { manage } from '../src';

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

const store = manage(new Store());

class App extends Component<{ store: Store }> {
  public render() {
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
class HanziComponent extends Component<{ hanzi: Hanzi }> {
  public render() {
    const { hanzi } = this.props;
    renderHistory.push(hanzi.hanzi);
    return hanzi.hanzi;
  }
}

describe('React', () => {
  test('default', async () => {
    render(<App store={store} />);
    const changeButton = screen.getByText('Change Hanzi');
    expect(renderHistory).toEqual(['刘']);
    act(() => {
      store.hanzi.hanzi = '劉';
    });
    expect(renderHistory).toEqual(['刘', '劉']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '劉', '春']);
    act(() => {
      store.hanzi.hanzi = '耀';
    });
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀', '涛']);
    act(() => {
      store.hanzi.hanzi = '阳';
    });
    expect(renderHistory).toEqual(['刘', '劉', '春', '耀', '涛', '阳']);
    cleanup();
  });
});
