import { describe, test } from 'vitest';

import { writeEmitter } from '../src';

describe('index', () => {
  test('event emitter on and off', () => {
    const eventEmitter = writeEmitter;
    const callback = (me) => {
      console.log(me);
    };
    eventEmitter.on(callback);
    eventEmitter.off(callback);
    eventEmitter.emit({ target: { a: 1 }, prop: 'a' });
  });
});
