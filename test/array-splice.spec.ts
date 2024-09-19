import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import type { ManateEvent } from '../src/models';

describe('array splice', () => {
  test('default', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    const events: string[] = [];
    arr.$e.on((event: ManateEvent) => {
      events.push(event.toString());
    });
    arr.splice(2, 1);
    expect(events).toEqual([
      'get: length',
      'get: 2',
      'get: 3',
      'set: 2',
      'get: 4',
      'set: 3',
      'delete: 4',
      'set: length',
    ]);
  });
});
