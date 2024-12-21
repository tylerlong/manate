import { inspect } from "node:util";

import { describe, expect, test } from "vitest";

import { capture, manage, runInAction } from "../src/index.ts";

describe("OOP", () => {
  test("todo list", () => {
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
    const todoList = new TodoList("Work");
    store.todoLists.push(todoList);
    const todoItem = new TodoItem("Daily meeting");
    todoList.todoItems.push(todoItem);

    const managed = manage(store);

    const [, writeLog] = runInAction(() => {
      const [, readLog] = capture(() => {
        managed.todoLists[0].todoItems[0].complete = true;
      });
      expect(inspect(readLog)).toEqual(`Map(4) {
  Store { todoLists: [ [TodoList] ] } => { get: Map(1) { 'todoLists' => [Array] } },
  [ TodoList { todoItems: [Array], name: 'Work' } ] => { get: Map(1) { '0' => [TodoList] } },
  TodoList { todoItems: [ [TodoItem] ], name: 'Work' } => { get: Map(1) { 'todoItems' => [Array] } },
  [ TodoItem { complete: true, description: 'Daily meeting' } ] => { get: Map(1) { '0' => [TodoItem] } }
}`);
    });
    expect(inspect(writeLog)).toEqual(`Map(1) {
  TodoItem { complete: true, description: 'Daily meeting' } => Map(1) { 'complete' => 0 }
}`);
  });
});
