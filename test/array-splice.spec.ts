import { describe, expect, test } from 'vitest';

import { $, autoRun, manage, type ManateEvent } from '../src';

describe('array splice', () => {
  test('default', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    const events: string[] = [];
    $(arr).on((event: ManateEvent) => {
      events.push(event.toString());
    });
    arr.splice(2, 1);
    expect(events).toEqual([
      'get: length',
      'has: 2',
      'get: 2',
      'has: 3',
      'get: 3',
      'set: 2',
      'has: 4',
      'get: 4',
      'set: 3',
      'delete: 4',
      'set: length',
    ]);
  });

  test('autoRun+transaction', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const { start, stop } = autoRun(arr, () => {
      JSON.stringify(arr);
      count++;
    });
    start(); // trigger the first run
    $(arr).begin();
    arr.splice(2, 1); // trigger the second run
    $(arr).commit();
    stop();
    expect(count).toBe(2);
  });
});
