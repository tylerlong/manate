/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';
import waitFor from 'wait-for-async';

import { autoRun, debounce, manage } from '../src';

describe('autoRun', () => {
  test('default', () => {
    class Store {
      public greeting = 'Hello';
    }
    const store = manage(new Store());
    const greetings: string[] = [];
    const autoRunner = autoRun(() => {
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
    const autoRunner = autoRun(() => numbers.push(store.number), debounce(10));
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
    const { start, stop } = autoRun(() => {
      numbers.push((store as any).number2); // number2 is an unknown property
    });
    start();
    (store as any).number2 = 1;
    stop();
    expect(numbers).toEqual([undefined, 1]);
  });
});
