// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import { auto } from '../src/react';

class Store {
  public count = 0;

  public increase() {
    this.count += 1;
  }
}

const store = manage(new Store());

const renderHistory: number[] = [];

describe('React', () => {
  test('ReactElement as props', async () => {
    const App = auto((props: { toolBarItems: (string | ReactElement)[] }) => {
      const { toolBarItems } = props;
      return (
        <div>
          <span role="count">{toolBarItems.length}</span>
        </div>
      );
    });
    store.count = 0;
    renderHistory.length = 0;
    render(
      <App
        toolBarItems={[
          'about',
          '|',
          'print',
          '|',
          <i
            key="preferences-toolbar-item"
            title="Preferences"
            className="fa fa-cog"
          ></i>,
        ]}
      />,
    );
    const span = await screen.findByRole('count');
    expect(parseInt(span.textContent!.trim(), 10)).toBe(5);
    cleanup();
  });
});
