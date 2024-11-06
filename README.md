# manate

manate is short for "manage state". (pronunciation is close to "many-it")
It is the most straightforward way to manage global state in React.

## What's the value of manate?

It allows you to maintain your app state in OOP style, although OOP is optional to use this library.

It supports TypeScript very well.

It is very straightforward to use. You don't need to learn any new concepts.

Merely 300 lines of code. There is no rocket science in this library.

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

## Event Emitter

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

## `useState(boolean)` to re-render

It's a bad idea. Because boolean has only two values.
If you want to trigger even number of re-render, the result is no re-render at all.
Because `b === !!b`.

So we use `useState(integer)` to re-render.

## Best Practices

Avoid using non-managed React props. Because it may cause lots of re-renders.

For example:

```tsx
<Monster monster={monster} position={[0,0,0]}>
```

Above will re-render every time its parent re-renders. Because `[0,0,0]` is a new array every time.

Instead, we could make `position` a property of `monster`.

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

## Development Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.

### No complex logic for `isTrigger`

Most events will be triggered by `set-get` and `delete-get` pairs.
In real apps, we will have `get` events for all parent paths. So we don't need to check parent paths for events triggering at all.

`set-keys` is just a complementary to `set-get`. No need to check parent paths since `set-get` will be tiggered anyway.
`delete-keys` is just a complementary to `delete-get`. No need to check parent paths since `delete-get` will be tiggered anyway.

Same applies to `set-has` and `delete-has`.

## React support details

I tried to use `autoRun` to implement `auto`. The code is short and it passes most tests:

```ts
import {
  memo,
  useEffect,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';

import { autoRun, manage } from '.';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    const [r, setR] = useState<ReactNode>(null);
    useEffect(() => {
      const managed = manage(props);
      const { start, stop } = autoRun(managed, () => {
        setR(Component(managed));
      });
      start();
      return () => {
        stop();
        $(managed).dispose();
      };
    }, [props]);
    return r;
  });
};
```

However, there are two major issues:

1. React components are considered synchronous. We use `useEffect` to invoke `autoRun` to invoke `render` function, which is asynchronous.

- It will cause all kinds of issues if we change from sync to async.

2. We cannot use hooks at all. For example, `useRef` will cause "Error: Invalid hook call. Hooks can only be called inside of the body of a function component."

- I think it is because we run the render method in `useEffect`, which is not "the body of a function component".

Since `autoRun` is not a pure function, it has to be in `useEffect`. So we cannot use `autoRun`. We need to use `run` instead.
And we must have the render function run in the body of the function component. And we use `useRef` and `useEffect` to dispose.
For more information, please refer to [./src/react.ts](./src/react.ts).

## React async

As I tested, if a react component has several children components. The react component will render first, then the children components will render.
Which means, the render function will finish before children render functions start.
Which means, component will not get those "get" events triggered by children components.
Which means, change in children components will not trigger the parent component to re-render.

This is very unexpected. But it may not be a bad thing at all. Since we don't want to re-render the parent component if the change in children components doesn't affect the parent component.

## Todo

- Reference https://github.com/pmndrs/valtio
  - This one is very similar to manate
- It doesn't monitor built-in objects, such as `Set`, `Map` and `RTCPeerConnection`.
  - we could support `Set` and `Map`, to be done.
