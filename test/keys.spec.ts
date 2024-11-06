import { describe, expect, test } from 'vitest';

import { $, autoRun, manage, type ManateEvent } from '../src';

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

  test('values', () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    let count = 0;
    const { start } = autoRun(store, () => {
      expect(Object.values(store.monsters).length).toBe(count);
      count += 1;
    });
    start();
    store.monsters['a'] = 1;
    store.monsters['b'] = 2;
    expect(count).toBe(3);
  });

  test('values low level', () => {
    class Store {
      public monsters: { [key: string]: number } = {};
    }
    const store = manage(new Store());
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(store).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
    });
    expect(Object.values(store.monsters)).toEqual([]); // trigger events
    expect(events).toEqual([
      { name: 'get', paths: ['monsters'] },
      { name: 'keys', paths: ['monsters'] },
    ]);
  });
});
