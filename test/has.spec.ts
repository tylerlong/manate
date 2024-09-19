import { describe, expect, test } from 'vitest';

import { autoRun, manage } from '../src';

describe('has', () => {
  test('default', () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    let result = false;
    const { start } = autoRun(store, () => {
      result = 'a' in store.monsters;
      count += 1;
    });
    start();
    store.monsters['a'] = 1;
    delete store.monsters['a'];
    store.monsters['a'] = 2;
    expect(count).toBe(4);
    expect(result).toBeTruthy();
  });
});
