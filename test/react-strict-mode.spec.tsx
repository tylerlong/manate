// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import { auto } from '../src/react';

describe('React strict mode', () => {
  test('Update children props', async () => {
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
      return bullet.speed;
    });

    let appCount = 0;
    const App = auto((props: { store: Store }) => {
      appCount += 1;
      const { store } = props;
      return Object.values(store.bullets).map((bullet) => (
        <BulletComponent key={bullet.id} bullet={bullet} />
      ));
    });

    const store = manage(new Store());
    store.bullets[0] = new Bullet();

    render(
      <StrictMode>
        <App store={store} />
      </StrictMode>,
    );
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(2);
    act(() => {
      store.bullets[0].speed = 20;
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(4);
    act(() => {
      store.bullets[0].speed = 30;
    });
    expect(appCount).toBe(2);
    expect(bulletCount).toBe(6);
    act(() => {
      store.bullets[1] = new Bullet();
    });
    expect(appCount).toBe(4);
    expect(bulletCount).toBe(8);
    cleanup();

    // compare to test/react-re-render.spec.tsx
    // this tese all count are doubled because of strict mode
  });
});
