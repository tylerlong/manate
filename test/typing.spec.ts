import { describe, test } from 'vitest';
import type { Managed } from '../src';

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
  });
});
