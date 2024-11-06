import { describe, expect, test } from 'vitest';

import { $, manage } from '../src';

describe('plain objects', () => {
  test('default', () => {
    class Store {
      public _config = '{}';

      public get config() {
        return JSON.parse(store._config || '{}');
      }
    }
    const store = manage(new Store());
    store._config = JSON.stringify({
      someString: 'sss',
      someArr: [],
    });
    expect(() => $(store.config)).toThrow();
  });

  test('another way', () => {
    class Store {
      public config = {};
    }
    const store = manage(new Store());
    store.config = {
      someString: 'sss',
      someArr: [],
    };
    expect($(store)).toBeDefined();
    expect($(store.config)).toBeDefined();
    const plainObject = JSON.parse(JSON.stringify(store.config));
    expect(() => $(plainObject)).toThrow();
  });
});
