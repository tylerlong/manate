import { manage } from '../src';
import type { ManateEvent } from '../src/models';

describe('array', () => {
  test('managed set length', () => {
    const a: number[] = [];
    const keys: string[] = [];
    const managed = new Proxy<number[]>(a, {
      // eslint-disable-next-line max-params
      set: (target: object, propertyKey: string, value: any, receiver?: any) => {
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
    const events: ManateEvent[] = [];
    managed.$e.on('event', (event: ManateEvent) => {
      if (event.name === 'set') {
        events.push(event);
      }
    });
    managed.todos.push('hello');
    expect(events.map((e) => e.pathString)).toEqual(['todos+0', 'todos+length']);
  });
});
