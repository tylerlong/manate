import { describe, test } from 'vitest';
import { manage, type Managed } from '../src';

describe('typings', () => {
  test('function should not be Managed<T[K]>', async () => {
    class Store {
      public count = 0;
      public increase() {
        this.count += 1;
      }
    }
    const store = new Store() as unknown as Managed<Store>;
    store.increase(); // is not Managed<T[K]>, so TS compiler doesn't complain
    const mo = manage(store);
    mo.increase(); // is not Managed<T[K]>, so TS compiler will complain
  });

  test('dedault', async () => {
    const mo = manage({ a: { b: 1 } });
    mo.a.$e.on(() => {
      // does nothing
    });
    mo.a = manage({ b: 2 }); // manage it so TS compiler will not complain
  });
});
