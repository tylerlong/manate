import { describe, expect, test, vi } from 'vitest';

import { writeEmitter } from '../src';

describe('index', () => {
  test('event emitter on and off', () => {
    const eventEmitter = writeEmitter;
    const callback = vi.fn();
    eventEmitter.on(callback);
    eventEmitter.off(callback);
    eventEmitter.emit({ target: { a: 1 }, prop: 'a', value: 1 });
    expect(callback).not.toHaveBeenCalled();
  });
});
