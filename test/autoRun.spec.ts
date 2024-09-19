import { debounce } from 'lodash';
import waitFor from 'wait-for-async';
import { describe, expect, test } from 'vitest';

import { manage, autoRun } from '../src';

describe('autoRun', () => {
  test('default', () => {
    class Store {
      public greeting = 'Hello';
    }
    const store = manage(new Store());
    const greetings: string[] = [];
    const autoRunner = autoRun(store, () => {
      // this method auto runs when `store.greeting` changes
      greetings.push(store.greeting);
    });
    autoRunner.start();
    store.greeting = 'Hi';
    autoRunner.stop();
    expect(greetings).toEqual(['Hello', 'Hi']);
  });

  test('debounce', async () => {
    class Store {
      public number = 0;
    }
    const store = manage(new Store());
    const numbers: number[] = [];
    const autoRunner = autoRun(
      store,
      () => numbers.push(store.number),
      (func: () => void) => debounce(func, 10, { leading: true, trailing: true }),
    );
    autoRunner.start();
    store.number = 1;
    store.number = 2;
    store.number = 3;
    store.number = 4;
    expect(numbers).toEqual([0]);
    await waitFor({ interval: 20 });
    expect(numbers).toEqual([0, 4]);
  });

  test('unknown property', async () => {
    class Store {
      public number = 0;
    }
    const store = manage(new Store());
    const numbers: number[] = [];
    const { start, stop } = autoRun(store, () => {
      numbers.push((store as any).number2); // number2 is an unknown property
    });
    start();
    (store as any).number2 = 1;
    stop();
    expect(numbers).toEqual([undefined, 1]);
  });
});
