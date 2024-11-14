import { describe, expect, test } from 'vitest';

import { autoRun, manage, readEmitter, writeEmitter } from '../src';
import { ProxyTrapEvent } from '../src/events';

describe('array splice', () => {
  test('default', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    const events: ProxyTrapEvent[] = [];
    const listener = (mes: ProxyTrapEvent[]) => {
      events.push(...mes);
    };
    readEmitter.on(listener);
    writeEmitter.on(listener);
    arr.splice(2, 1);
    expect(events.length).toBeGreaterThan(10);
  });

  test('autoRun+transaction', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const { start, stop } = autoRun(() => {
      JSON.stringify(arr);
      count++;
    });
    start(); // trigger the first run
    writeEmitter.batch = true;
    arr.splice(2, 1); // trigger the second run
    writeEmitter.batch = false;
    stop();
    expect(count).toBe(2);
  });
});
