/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';

import { $, manage, type ManateEvent } from '../src';

describe('getter', () => {
  test('getter', () => {
    const managed = manage({
      visibility: false,
      get visibleTodos() {
        return !this.visibility;
      },
    });
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(managed).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
    });
    if (managed.visibleTodos) {
      expect(events).toEqual([
        { name: 'get', paths: ['visibility'] },
        { name: 'get', paths: ['visibleTodos'] },
      ]);
    }
  });

  test('normal method', () => {
    const managed = manage({
      visibility: false,
      visibleTodos() {
        return !this.visibility;
      },
    });
    const events: { name: string; paths: PropertyKey[] }[] = [];
    $(managed).on((event: ManateEvent) => {
      events.push({ name: event.name, paths: event.paths });
    });
    if (managed.visibleTodos()) {
      expect(events).toEqual([{ name: 'get', paths: ['visibility'] }]);
    }
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
      get: (target: any, propertyKey: PropertyKey, receiver: any) => {
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
      get: (target: any, propertyKey: PropertyKey, receiver: any) => {
        accessList.push(propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
    });
    expect(managed.visible).toBe(true);
    expect(accessList).toEqual(['visible', 'hidden']);
  });
});
