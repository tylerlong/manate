import { manage } from '../src';
import { ManateEvent } from '../src/models';

describe('index', () => {
  test('default', () => {
    const proxy = manage({ a: 'hello', b: { c: 'world' } });
    const events: ManateEvent[] = [];
    proxy.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    expect(events).toEqual([
      { name: 'set', paths: ['a'] },
      { name: 'get', paths: ['b'] },
      { name: 'set', paths: ['b', 'c'] },
    ]);
  });

  test('subscribe to sub prop', () => {
    const proxy = manage({ a: 'hello', b: { c: 'world' } });
    const emitter = (proxy.b as any).$e;
    const events: ManateEvent[] = [];
    emitter.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    expect(events).toEqual([{ name: 'set', paths: ['c'] }]);
  });

  test('new obj as prop', () => {
    interface A {
      b?: { c: string };
    }
    const proxy = manage<A>({});
    const events: ManateEvent[] = [];
    proxy.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    proxy.b = { c: 'hello' };
    proxy.b.c = 'world';
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
    const proxy = manage<A>({});
    const events: ManateEvent[] = [];
    proxy.$e.on('event', (event: ManateEvent) => {
      events.push(event);
    });
    proxy.b = { c: 'hello' };
    const temp = proxy.b;
    proxy.b = temp;
    proxy.b = temp;
    proxy.b.c = 'world';
    expect(events).toEqual([
      { name: 'set', paths: ['b'] },
      { name: 'get', paths: ['b'] },
      { name: 'get', paths: ['b'] },
      { name: 'set', paths: ['b', 'c'] },
    ]);
  });

  test('to JSON', () => {
    const proxy = manage({ a: 'hello', b: { c: 'world' } });
    expect(JSON.stringify(proxy)).toBe('{"a":"hello","b":{"c":"world"}}');
  });
});
