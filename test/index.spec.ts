import { describe, expect, test } from 'vitest';

import { $, manage, type ManateEvent } from '../src';

describe('index', () => {
  test('default', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(managed).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
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
    const emitter = $(managed.b);
    const events: { name: string; paths: PropertyKey[] }[] = [];
    emitter.on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
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
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(managed).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
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
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(managed).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
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
