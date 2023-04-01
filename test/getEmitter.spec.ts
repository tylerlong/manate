import { EventEmitter } from 'events';
import { manage } from '../src';

describe('getter', () => {
  test('getter', () => {
    const obj = { a: 1, b: 2 };
    const managed = manage(obj);
    expect(managed.$e).toBeDefined();
    expect(managed.$e instanceof EventEmitter);
    expect(JSON.parse(JSON.stringify(managed, null, 2))).toEqual(obj);
  });
});
