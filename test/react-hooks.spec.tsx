// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import { auto } from '../src/react';

describe('React hooks', () => {
  test('default', () => {
    let id = 0;

    class Bullet {
      public id: number;
      public speed = 10;

      public constructor() {
        this.id = id++;
      }
    }

    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }

    let bulletCount = 0;
    const BulletComponent = auto((props: { bullet: Bullet }) => {
      bulletCount += 1;
      const { bullet } = props;
      const r = useRef(null); // this will throw error if we use useEffect + autoRun to implement auto
      return <span ref={r}>{bullet.speed}</span>;
    });

    let appCount = 0;
    const App = auto((props: { store: Store }) => {
      appCount += 1;
      const { store } = props;
      const r = useRef(null); // this will throw error if we use useEffect + autoRun to implement auto
      return (
        <>
          <span ref={r}>hello</span>
          {Object.values(store.bullets).map((bullet) => (
            <BulletComponent key={bullet.id} bullet={bullet} />
          ))}
        </>
      );
    });

    const store = manage(new Store());
    store.bullets[0] = new Bullet();

    render(<App store={store} />);
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(1);
    act(() => {
      store.bullets[0].speed = 20;
    });
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(2);
    act(() => {
      store.bullets[0].speed = 30;
    });
    expect(appCount).toBe(1);
    expect(bulletCount).toBe(3);
    act(() => {
      store.bullets[1] = new Bullet();
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(4);
    cleanup();
  });

  test('should not break useState', async () => {
    class Store {
      count = 0;
    }
    const store = manage(new Store());
    let count = 0;
    const App = auto((props: { store: Store }) => {
      count += 1;
      const { store } = props;
      const [counter, setCounter] = React.useState(0);
      return (
        <>
          {store.count}: {counter}
          <button onClick={() => setCounter((i) => i + 1)}>Click</button>
        </>
      );
    });
    render(<App store={store} />);
    expect(count).toBe(1);
    const minusButton = screen.getByText('Click');
    await userEvent.click(minusButton);
    expect(count).toBe(2);
    await userEvent.click(minusButton);
    await userEvent.click(minusButton);
    expect(count).toBe(4);
    act(() => {
      store.count += 1;
    });
    expect(count).toBe(5);
  });
});
