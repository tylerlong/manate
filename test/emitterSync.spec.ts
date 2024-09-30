import { describe, expect, test } from 'vitest';

import EventEmitter from '../src/event-emitter';
import { ManateEvent } from '../src';

describe('emitter sync', () => {
  test('default', async () => {
    const emitter = new EventEmitter();
    const list: ManateEvent[] = [];
    emitter.on((me: ManateEvent) => {
      list.push(me);
    });
    emitter.emit(new ManateEvent('set', [0]));
    emitter.emit(new ManateEvent('set', [1]));
    emitter.emit(new ManateEvent('set', [2]));
    list.push(new ManateEvent('set', [100]));
    emitter.emit(new ManateEvent('set', [3]));
    emitter.emit(new ManateEvent('set', [4]));
    emitter.emit(new ManateEvent('set', [5]));
    expect(list.map((me) => me.paths[0])).toEqual([0, 1, 2, 100, 3, 4, 5]);
  });
});
