import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import { autoRun } from '../src/utils';

describe('autoRunDirty', () => {
  test('default', () => {
    class Store {
      public greeting = 'Hello';
    }
    const store = manage(new Store());
    const greetings: string[] = [];
    let count = 0;
    const autoRunner = autoRun(() => {
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
