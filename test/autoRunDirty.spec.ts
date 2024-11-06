import { describe, expect, test } from 'vitest';

import { autoRun, manage } from '../src';

describe('autoRunDirty', () => {
  test('default', () => {
    class Store {
      public greeting = 'Hello';
    }
    const store = manage(new Store());
    const greetings: string[] = [];
    let count = 0;
    const autoRunner = autoRun(store, () => {
      // this method auto runs when `store.greeting` changes
      greetings.push(store.greeting);
      // change data in the monitored function
      store.greeting = (count++).toString();
    });
    autoRunner.start();
    store.greeting = 'Hi';
    autoRunner.stop();
    expect(greetings).toEqual(['Hello', 'Hi']);
  });
});
