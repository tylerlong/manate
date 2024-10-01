import { describe, test } from 'vitest';

import { $, manage } from '../src';

describe('typings', () => {
  test('default 1', async () => {
    class Store {
      public count = 0;
      public increase() {
        this.count += 1;
      }
    }
    const store = new Store();
    store.increase();
    const mo = manage(store);
    mo.increase();
  });

  test('default 2', async () => {
    const mo = manage({ a: { b: 1 } });
    $(mo.a).on(() => {
      // does nothing
    });
    mo.a = { b: 2 };
  });

  // test('extend', async () => {
  //   class A {
  //     private p1 = 1;
  //   }
  //   const mo = manage(new A());
  //   const a: A = mo; // doesn't compile.
  //   expect(a).toBeDefined();
  // });
});
