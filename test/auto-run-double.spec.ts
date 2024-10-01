import { describe, expect, test } from 'vitest';

import { manage, $ } from '../src';

describe('autoRun double', () => {
  test('default', () => {
    class Store {
      public canvasSize = { width: 0, height: 0 };
      public worldSize = { width: 0, height: 0 };
    }
    const store = manage(new Store());
    let count = 0;
    $(store).on((event) => {
      if (event.name === 'set') {
        count++;
      }
    });
    let id = 1;
    store.canvasSize.width = 0; // assign the same value doesn't trigger
    store.canvasSize.height = ++id;
    expect(count).toBe(1);
  });
});
