import { manage } from '../src';
import { ManateEvent } from '../src/models';

describe('index', () => {
  test('default', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    const events: ManateEvent[] = [];
    managed.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    managed.a = 'world';
    managed.b.c = 'yes!';
    expect(events).toEqual([
      { name: 'set', paths: ['a'] },
      { name: 'get', paths: ['b'] },
      { name: 'set', paths: ['b', 'c'] },
    ]);
  });

  test('subscribe to sub prop', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    const emitter = (managed.b as any).$e;
    const events: ManateEvent[] = [];
    emitter.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    managed.a = 'world';
    managed.b.c = 'yes!';
    expect(events).toEqual([{ name: 'set', paths: ['c'] }]);
  });

  test('new obj as prop', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});
    const events: ManateEvent[] = [];
    managed.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    managed.b = { c: 'hello' };
    managed.b.c = 'world';
    expect(events).toEqual([
      { name: 'set', paths: ['b'] },
      { name: 'get', paths: ['b'] },
      { name: 'set', paths: ['b', 'c'] },
    ]);
  });

  test('set same obj multiple times', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});
    const events: ManateEvent[] = [];
    managed.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    managed.b = { c: 'hello' };
    const temp = managed.b;
    managed.b = temp;
    managed.b = temp;
    managed.b.c = 'world';
    expect(events).toEqual([
      { name: 'set', paths: ['b'] },
      { name: 'get', paths: ['b'] },
      { name: 'get', paths: ['b'] },
      { name: 'set', paths: ['b', 'c'] },
    ]);
  });

  test('to JSON', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    expect(JSON.stringify(managed)).toBe('{"a":"hello","b":{"c":"world"}}');
  });
});
