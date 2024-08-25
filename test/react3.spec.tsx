// @vitest-environment jsdom
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { auto } from '../src/react';
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

const App = auto((props: { store: Store }) => {
  const store = props.store;
  return (
    <>
      <button onClick={() => store.changeHanzi()}>Change Hanzi</button>
      <HanziComponent hanzi={store.hanzi} />
    </>
  );
});

const renderHistory: string[] = [];
const HanziComponent = auto((props: { hanzi: Hanzi }) => {
  const { hanzi } = props;
  renderHistory.push(hanzi.hanzi);
  return hanzi.hanzi;
});

describe('React', () => {
  test('default', async () => {
    render(<App store={store} />);
    const changeButton = screen.getByText('Change Hanzi');
    expect(renderHistory).toEqual(['刘']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '春']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '春', '涛']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘', '春']);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(['刘', '春', '涛', '刘', '春', '涛']);
    cleanup();
  });
});
