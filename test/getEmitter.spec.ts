import { describe, expect, test } from 'vitest';

import EventEmitter from '../src/event-emitter';
import { manage, $ } from '../src';

describe('getter', () => {
  test('getter', () => {
    const obj = { a: 1, b: 2 };
    const managed = manage(obj);
    expect($(managed)).toBeDefined();
    expect($(managed) instanceof EventEmitter);
    expect(JSON.parse(JSON.stringify(managed, null, 2))).toEqual(obj);
  });
});
