import { EventEmitter } from 'events';
import { manage } from '../src';

describe('getter', () => {
  test('getter', () => {
    const obj = { a: 1, b: 2 };
    const proxy = manage(obj);
    expect(proxy.$e).toBeDefined();
    expect(proxy.$e instanceof EventEmitter);
    expect(JSON.parse(JSON.stringify(proxy, null, 2))).toEqual(obj);
  });
});
