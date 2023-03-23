import { useProxy } from '../src';

describe('plain objects', () => {
  test('default', () => {
    class Store {
      public _config = '{}';
      public get config() {
        return JSON.parse(store._config || '{}');
      }
    }
    const store = useProxy(new Store());
    store._config = JSON.stringify({
      someString: 'sss',
      someArr: [],
    });
    expect(store.config.$e).toBeUndefined();
  });

  test('another way', () => {
    class Store {
      public config = {};
    }
    const store = useProxy(new Store());
    store.config = {
      someString: 'sss',
      someArr: [],
    };
    expect(store.$e).toBeDefined();
    expect((store.config as any).$e).toBeDefined();
    const plainObject = JSON.parse(JSON.stringify(store.config));
    expect(plainObject.$e).toBeUndefined();
  });
});
