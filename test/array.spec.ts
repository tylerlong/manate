/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';

import { manage, writeEmitter } from '../src';
import { WriteEvent } from '../src/events';

describe('array', () => {
  test('managed set length', () => {
    const a: number[] = [];
    const keys: string[] = [];
    const managed = new Proxy<number[]>(a, {
      set: (
        target: object,
        propertyKey: string,
        value: any,
        receiver?: any,
      ) => {
        keys.push(propertyKey);
        Reflect.set(target, propertyKey, value, receiver);
        return true;
      },
    });
    managed.push(1);
    expect(keys).toEqual(['0', 'length']);
  });

  test('manage set length', () => {
    class Store {
      public todos: string[] = [];
    }
    const managed = manage(new Store());
    const events: WriteEvent[] = [];
    writeEmitter.on((we) => {
      events.push(we as WriteEvent);
    });
    managed.todos.push('hello');
    expect(events.map((e) => e.prop)).toEqual(['0', 'length']);
  });

  test('isArray', () => {
    const ma = manage([]);
    expect(Array.isArray(ma)).toBe(true);
    const mb = new Proxy([], {});
    expect(Array.isArray(mb)).toBe(true);
  });
});
