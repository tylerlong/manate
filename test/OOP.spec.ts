import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import type { ManateEvent } from '../src/models';

describe('OOP', () => {
  test('todo list', () => {
    class Store {
      public todoLists: TodoList[] = [];
    }

    class TodoList {
      public name: string;
      public todoItems: TodoItem[] = [];
      public constructor(name: string) {
        this.name = name;
      }
    }

    class TodoItem {
      public description: string;
      public complete = false;
      public constructor(description: string) {
        this.description = description;
      }
    }

    const store = new Store();
    const todoList = new TodoList('Work');
    store.todoLists.push(todoList);
    const todoItem = new TodoItem('Daily meeting');
    todoList.todoItems.push(todoItem);

    const managed = manage(store);
    const events: ManateEvent[] = [];
    const listener = (event: ManateEvent) => events.push(event);
    managed.$e.on(listener);
    managed.todoLists[0].todoItems[0].complete = true;
    managed.$e.off(listener);
    expect(events.map((event) => event.toString())).toEqual([
      'get: todoLists',
      'get: todoLists+0',
      'get: todoLists+0+todoItems',
      'get: todoLists+0+todoItems+0',
      'set: todoLists+0+todoItems+0+complete',
    ]);
  });
});
