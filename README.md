# manate

manate is a lightweight, intuitive state management library that keeps things simple. Pronounced like "many-it" and short for "manage state," manate lets you handle state with ease across both frontend and backend.

## Why choose manate?

- Effortless to use: No complex syntax – your state is just a JavaScript object.
- Zero dependencies: Clean and minimal, without any baggage.
- Universal: Works seamlessly on both frontend and backend environments.
- Lightweight: Only 300 lines of code. Simplicity without sacrificing power.
- TypeScript-ready: First-class TypeScript support for robust, type-safe development.

Start using manate and manage your state effortlessly!

## Installation

```
yarn add manate
```

## Usage

### Create the state

```ts
import { manage } from 'manate';

class Store {
  count = 0;
  increase() {
    this.count += 1;
  }
}
const store = manage(new Store());
```

### Without class/function

You don't need to declare a class if you don't want to.

You don't need to create a function if you don't want to.

```ts
import { manage } from 'manate';

const store = manage({ count: 0 });

store.count += 1; // change data directly without a function
```

### React

```tsx
import { auto } from 'manate/react';

const App = auto((props: { store: Store }) => {
  const { store } = props;
  return (
    <Space>
      <Button onClick={() => store.decrease()}>-</Button>
      {store.count}
      <Button onClick={() => store.increase()}>+</Button>
    </Space>
  );
});
```

It's fully compatible with React hooks.

## Without React

You may use it without React.

```ts
import { $, manage, type ManateEvent } from 'manate';

class Store {}
const store = manage(new Store());
```

`$(store)` is an [EventEmitter](./src/events.ts) which will emit events about read/write to store. You can subscribe to events:

```ts
$(store).on((event: ManateEvent) => {
  // do something with event
});
```

Please note that, this `EventEmitter` is not the same as `EventEmitter` in Node.js. It's a custom implementation.

## Reference but do not track

Sometimes we only want to keep a reference to an object, but we don't want to track its changes.

You may `exclude` it from being tracked.

```ts
import { exclude, manage } from 'manate';

class B {
  public c = 1;
}
class A {
  public b = exclude(new B());
}

const a = new A();
const ma = manage(a);
ma.b.c = 4; // will not trigger a set event because `ma.b` is excluded.
```

You may invoke the `exclude` method at any time:

```ts
class B {
  public c = 1;
}
class A {
  public b;
}

const a = new A();
const b = new B();
exclude(b);
a.b = b;
const ma = manage(a);
```

You may invoke the exlcude method before or after you manage the object:

```ts
class B {
  public c = 1;
}
class A {
  public b;
}

const a = new A();
const b = new B();
a.b = b;
const ma = manage(a);
exclude(ma.b);
```

For more details, please refer to the test cases in [./test/exclude.spec.ts](./test/exclude.spec.ts).

## Utility methods

### `run`

The signature of `run` is

```ts
function run<T>(
  managed: T,
  func: Function,
): [result: any, isTrigger: (event: ManateEvent) => boolean];
```

- `managed` is generated from `manage` method: `const managed = manage(store)`.
- `func` is a function which reads `managed`.
- `result` is the result of `func()`.
- `isTrigger` is a function which returns `true` if an `event` will "trigger" `func()` to have a different result.
  - when it returns true, most likely it's time to run `func()` again(because you will get a different result from last time).

When you invoke `run(managed, func)`, `func()` is invoked immediately.
You can subscribe to `$(managed)` and filter the events using `isTrigger` to get the trigger events (to run `func()` again).

For a sample usage of `run`, please check [./src/react.ts](./src/react.ts).

Another example is the implementation of the `autoRun` utility method. You may find it in [./src/index.ts](./src/index.ts).

### `autoRun`

The signature of `autoRun` is

```ts
function autoRun<T>(
  managed: T,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void };
```

- `managed` is generated from `manage` method: `const managed = manage(store)`.
- `func` is a function which reads `managed`.
- `decorator` is a method to change run schedule of `func`, for example: `func => _.debounce(func, 10, {leading: true, trailing: true})`
- `start` and `stop` is to start and stop `autoRun`.

When you invoke `start()`, `func()` is invoked immediately.
`func()` will be invoked automatically afterwards if there are trigger events from `managed` which change the result of `func()`.
Invoke `stop` to stop `autoRun`.

For sample usages of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).

## Transactions

Transactions are used together with `autoRun`. When you put an object in transaction, changes to the object will not trigger `autoRun` until the transaction ends.

```ts
import { $ } from 'manate';

const { start } = autoRun(managed, () => {
  console.log(JSON.stringify(managed));
});
start(); // trigger `console.log`
$(managed).begin(); // start transaction
// perform changes to managed
// no matter how many changes you make, `console.log` will not be triggered
$(managed).commit(); // end transaction
// `console.log` will be triggered if there were changes
```

There could be multiple transactions at the same time.
Transactions could be nested. An change will not trigger run until all enclosing transactions end.

```ts
const { start } = autoRun(managed, () => {
  console.log(JSON.stringify(managed));
});
start(); // trigger `console.log`
$(managed).begin();
$(managed.a).begin();
// changes to `managed.a` will not trigger console.log until both transactions end
$(managed.a).commit();
$(managed).commit();
// `console.log` will be triggered if there were changes
```

## Max Depth

For human-created plain objects, a reasonable maximum depth for recursive processing, ignoring circular references, typically ranges between 5 to 10 levels.

So this library by set the max depth to 10, if max depeth exceeded, an error will be thrown.
In such case, you need to review the data to be managed, why is it so deeply nested, is it reasonable?
Think about it: is the deelpy nested structure relevant to your business logic? should you manage it at all?

A real example is you try to manage a `ReactElement`. React component instances contain deep, complex internal structures that reference other objects, functions, and potentially even themselves.
And you should not manage it at all. Instead, you should mange the state data used by the React component.

You may override the max depth by specify the second argument of the `manage` function:

```ts
const store = manage(new Store(), 20); // explicitly set max depth to 20, if `Store` is by design a deeply nested data structure
```
