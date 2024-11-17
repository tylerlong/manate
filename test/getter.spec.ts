import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, readEmitter } from '../src';

describe('getter', () => {
  test('getter', () => {
    const managed = manage({
      visibility: false,
      get visibleTodos() {
        return !this.visibility;
      },
    });
    const [r, readLogs] = readEmitter.run(() => {
      return managed.visibleTodos;
    });
    expect(r).toBe(true);
    expect(inspect(readLogs)).toBe(`Map(1) {
  { visibility: false, visibleTodos: [Getter] } => { get: { visibility: false, visibleTodos: true }, has: {} }
}`);
  });

  test('normal method', () => {
    const managed = manage({
      visibility: false,
      visibleTodos() {
        return !this.visibility;
      },
    });
    const [r, readLogs] = readEmitter.run(() => {
      return managed.visibleTodos();
    });
    expect(r).toBe(true);
    expect(inspect(readLogs)).toBe(`Map(1) {
  { visibility: false, visibleTodos: [Function: visibleTodos] } => { get: { visibility: false }, has: {} }
}`);
  });

  test('JS managed normal method', () => {
    class Store {
      public hidden = false;

      public visible() {
        return !this.hidden;
      }
    }
    const accessList: PropertyKey[] = [];
    const managed = new Proxy<Store>(new Store(), {
      get: (target: object, propertyKey: PropertyKey, receiver: object) => {
        accessList.push(propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
    });
    expect(managed.visible()).toBe(true);
    expect(accessList).toEqual(['visible', 'hidden']);
  });

  test('JS managed getter method', () => {
    class Store {
      public hidden = false;

      public get visible() {
        return !this.hidden;
      }
    }
    const accessList: PropertyKey[] = [];
    const managed = new Proxy<Store>(new Store(), {
      get: (target: object, propertyKey: PropertyKey, receiver: object) => {
        accessList.push(propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
    });
    expect(managed.visible).toBe(true);
    expect(accessList).toEqual(['visible', 'hidden']);
  });
});
