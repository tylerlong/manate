import { describe, test } from 'vitest';

import { ManateEvent } from '../src';
import EventEmitter from '../src/event-emitter';

describe('index', () => {
  test('event emitter on and off', () => {
    const eventEmitter = new EventEmitter();
    const callback = (me: ManateEvent) => {
      console.log(me);
    };
    eventEmitter.on(callback);
    eventEmitter.removeAllListeners();
    eventEmitter.emit(new ManateEvent({ name: 'set', paths: [] }));
  });
});
