import { describe, expect, test } from 'vitest';

import { autoRun, manage } from '../src';

describe('keys', () => {
  test('default', () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    const { start } = autoRun(store, () => {
      expect(Object.keys(store.monsters).length).toBe(count);
      count += 1;
    });
    start();
    store.monsters['a'] = 1;
    store.monsters['b'] = 2;
    expect(count).toBe(3);
  });
});
