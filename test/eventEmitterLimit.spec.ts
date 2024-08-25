import { describe, expect, test } from 'vitest';

import EventEmitter from '../src/event-emitter';

describe('EventEmitter Limit', () => {
  test('default', () => {
    const eventEmitter = new EventEmitter();
    for (let i = 0; i < 10; i++) {
      eventEmitter.on(() => {});
    }
    expect(eventEmitter.listenerCount()).toBe(10);
  });
});
