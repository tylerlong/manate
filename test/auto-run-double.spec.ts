import { describe, expect, test } from 'vitest';

import { manage, writeEmitter } from '../src';
import { autoRun } from '../src/utils';

describe('autoRun double', () => {
  test('assign same value emit event', () => {
    class Store {
      public canvasSize = { width: 0, height: 0 };
      public worldSize = { width: 0, height: 0 };
    }
    const store = manage(new Store());
    let count = 0;
    writeEmitter.on(() => {
      count++;
    });
    let id = 1;
    store.canvasSize.width = 0; // assign the same value still emit the event
    store.canvasSize.height = ++id;
    expect(count).toBe(2);
  });

  test('assign same value wont trigger', () => {
    class Store {
      public canvasSize = { width: 0, height: 0 };
      public worldSize = { width: 0, height: 0 };
    }
    const store = manage(new Store());
    let count = 0;
    const runner = autoRun(() => {
      count += 1;
      return JSON.stringify(store);
    });
    runner.start();
    store.canvasSize.width = 0;
    store.canvasSize.width = 0;
    runner.stop();
    expect(count).toBe(1);
  });
});
