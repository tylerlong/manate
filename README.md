# manate

manate is a lightweight, intuitive state management library that keeps things
simple. Pronounced like "many-it" and short for "manage state". manate lets you
handle state with ease across both frontend and backend.

## Why choose manate?

- Effortless to use: No complex syntax – your state is just a JavaScript object.
- Zero dependencies: Clean and minimal, without any baggage.
- Universal: Works seamlessly on both frontend and backend environments.
- Lightweight: Around 500 lines of code. Simplicity without sacrificing power.
- TypeScript-ready: First-class TypeScript support for robust, type-safe
  development.

Start using manate and manage your state effortlessly!

## Version 2.x

This is the branch for version 2.x. It is a complete rewrite of
[1.x](https://github.com/tylerlong/manate/tree/1.x).

### Breaking changes

Compared to version 1.x, the most important breaking change is the `autoRun`
function.

```ts
import { autoRun } from "manage";

const store = manage({ a: 1 });

// version 2.x
autoRun(() => {
  console.log(store.a);
});

// version 1.x
autoRun(store, () => {
  console.log(store.a);
});
```

So you no longer need to pass the managed state as the first argument.

## Installation

```
yarn add manate
```

or

```
deno add npm:manate
```

## Manage the state

```ts
import { manage } from "manate";

class Store {
  count = 0;
  increase() {
    this.count += 1;
  }
}
const store = manage(new Store());
```

## Without class/function

You don't need to declare a class if you don't want to. You don't need to create
a function if you don't want to.

```ts
import { manage } from "manate";

const store = manage({ count: 0 });
store.count += 1; // change data directly without a function
```

## React

```tsx
import { auto } from "manate/react";

const App = auto((props: { store: Store }) => {
  const { store } = props;
  return (
    <Space>
      <Button
        onClick={() => {
          store.count -= 1;
        }}
      >
        -
      </Button>
      {store.count}
      <Button onClick={() => store.increase()}>+</Button>
    </Space>
  );
});
```

In the sample above I showed you two ways to update state:

- update it directly: `store.count -= 1`
- update it through a member function: `store.increase()`

So, basically there is no restrictions. Just read/write as how you read/write a
JavaScript object.

### You don't need to pass managed state as props

In the sample above, we pass the `store` state as a React props. But it is not
necessary. The following code works too:

```tsx
import { auto } from "manate/react";

import store from "./store";

const App = auto(() => {
  return (
    <Space>
      <Button
        onClick={() => {
          store.count -= 1;
        }}
      >
        -
      </Button>
      {store.count}
      <Button onClick={() => store.increase()}>+</Button>
    </Space>
  );
});
```

So the store could be a global variable instead of a React prop. It doesn't
matter where the state is from, as long as it is managed by manate.

## Read events & Write events

From manate's point of view, there are only two kinds of events: read events and
write events.

### Read events

Read events doesn't change data:

```ts
const obj = { prop: 1 };
console.log(obj.prop); // access a property
console.log("prop" in obj); // check a property existence
console.log(Object.keys(obj)); // list all the property keys
```

### Write events

Write events change data:

```ts
const obj = {};
obj.prop = 1; // create a new property
obj.prop = 2; // update a property
delete obj.prop; // delete a property
```

## Actions

All members functions in a managed object will be considered actions. What's the
point of actions? actions batches the changes events.

For example, in an action, you change the state 100 times. But it will not
trigger any reaction until the end of the action. And by the end of the action,
depend on the final state, it will either trigger once or do not trigger.

Let's take React for example, in a method, you change the state 100 times. If
the method is not an action, the react component will re-render 100 times. But
if the method is an action, the react component will re-render at most 1 time.

Please refer to [./test/actions.spec.ts](./test/action.spec.ts).

## Reference but do not track

Sometimes we only want to keep a reference to an object, but we don't want to
track its changes.

You may `exclude` it from being tracked.

```ts
import { exclude, manage } from "manate";

class B {
  public c = 1;
}
class A {
  public b = exclude(new B());
}

const a = new A();
const ma = manage(a);
ma.b.c = 4; // will not trigger a change event because `ma.b` is excluded.
```

You must `exclude` an object **BEFORE** it is managed. For more details, please
refer to the test cases in [./test/exclude.spec.ts](./test/exclude.spec.ts).

## Max Depth

For human-created JavaScript objects, a reasonable maximum depth for recursive
processing, ignoring circular references, typically ranges between 5 to 10
levels.

So this library by set the max depth to 10, if max depeth exceeded, the `manage`
function will return early. Which means, state data deeper than 10 levels are
not managed.

You may override the max depth by specifying the second argument of the `manage`
function:

```ts
const store = manage(new Store(), 20); // explicitly set max depth to 20, if `Store` is by design a deeply nested data structure
```

`maxDepth = 1` means only the current object will be managed, none of its
properties will be managed. For example:

```ts
const o = { a: { b: 1 }, c: 2 };
const mo = manage(o, 1); // maxDepth = 1

o.c = 3; // this will trigger write events since `o` is managed
o.a.b = 4; // this will NOT tigger write events since `o.a` is not managed
```

## autoRun

`autoRun` is an utility method. It allows you to automatically run a code
snippet if relevant state changes.

```ts
const runner = autoRun(() => {
  console.log(store.count);
});
runner.start();
```

`console.log(store.count);` will auto run every time `store.count` is changed.

`runner.start()` will run the code snippet immediately and start watching the
state.

`runner.stop()` will stop watching the state.

`runner.r` give you the latest return of the code snippet. It could be
`undefined` if it doesn't return anything.

## run

`run` is another utility method which powers `autoRun`.

```ts
const [r, isTrigger] = run(() => {
  return store.a + store.b;
});

writeEmitter.on((writeLog) => {
  if (isTrigger(writeLog)) {
    console.log(`run "store.a + store.b" now will generate a different result`);
  }
});
```

So `run` accept a funtion as argument. It returns `[r, isTrigger]`. `r` is the
result of running the function argument. `isTrigger` is a function which check
events emitted by `writeEmitter` to tell if run the function again will generate
a different result.

## Map & Set

`Map` and `Set` work out-of-box, there is nothing special to mention here since
it just works.

Please refer to

- [./test/map-and-set.spec.ts](./test/map-and-set.spec.ts).
- [./test/map.spec.ts](./test/map.spec.ts)
- [./test/set.spec.ts](./test/set.spec.ts)

## Computed

You can turn a function with no arguments or a getter into a computed function.
Computed functions cache their results to avoid unnecessary recalculations.

When to use computed functions:

1. The computation is expensive.
1. The function is called multiple times.
1. The state it depends on changes infrequently.

If any of these conditions aren't true, using computed may slow down your app
instead of speeding it up.

```ts
const f = computed(() => {
  return store.a + store.b;
});
```

Here, if `store.a` and `store.b` don't change, subsequent calls to `f` will
return the cached result.

However, this isn't a great example — `store.a + store.b` is a simple
computation, and using `computed` here likely won't improve performance.

## Built-in objects

Manate doesn't manage built-in objects, such as `new RTCPeerConnection()`.
Because manate is a state management library. You're not supposed to hold your
app state in those built-in objects.

## Circular references

It is fine to have circular references in your state.

Refer to [./test/circular.spec.ts](./test/circular.spec.ts).

## Low level APIs

### `capture`

Run a function and return the result and read log:

```ts
const [r, readLog] = capture(fn);
```

`fn` is the function to run. `r` is the result of running the function.
`readLog` is the read log. `readLog` contains all the read events during the
execution of `fn`.

### `debounce`

Turn a function into a debounced function:

```ts
const numbers: number[] = [];
const df = debounce(1000)((i: number) => {
  numbers.push(i);
});
```

It can be used together with the `autoRun` function:

```ts
const numbers: number[] = [];
const autoRunner = autoRun(() => numbers.push(store.number), debounce(10));
```

## React Class Component

Since React function component is the future, we suggest you to use function
component instead of class component.

With above being said, if you still wants to use React class component with this
library, you will need to import from `"manate/react/class-components"`.

There are two options available:

- Inheirtance
- HOC (High Order Component)

### Inheritance

If you prefer class inheritance:

```tsx
import { Component } from "manate/react/class-components";

class MyComponent extends Component<{ store: Store }> {
  public render() {
    const { store } = this.props;
    return (
      <div>
        <span role="counter">{store.count}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}
```

### HOC (High Order Component)

If you prefer HOC:

```tsx
import { auto } from "manate/react/class-components";

const MyComponent = auto(
  class extends React.Component<{ store: Store }> {
    public render() {
      const { store } = this.props;
      return (
        <div>
          <span role="counter">{store.count}</span>
          <button onClick={() => store.increase()}>+</button>
        </div>
      );
    }
  },
);
```

## Known limitation

Class arrow function changing data will not trigger events. For more details,
please refer to
[./test/class-arrow-function.spec.ts](./test/class-arrow-function.spec.ts).

## Similarity to MobX

Recently I find that manate is very similar to mobx:

- `import { manage } from 'manate'` is like `import { observable } from 'mobx`
- `import { auto } from 'manate/react` is like
  `import { observer } from 'mobx-react-lite'`

If I could realize the similarity 3 years ago, I might just use mobx instead.
For now, since manate is well developed and I am very happy with it, I will
continue to use and maintain manate.

### MobX limitations

MobX doesn't work well with subclassing
https://mobx.js.org/subclassing.html#limitations

manate doesn't have similar issues, since manate by design works with objects
instead of classes.

## Todo

### strict mode

Strict mode: in this mode, you can only modify an object through actions.
Changing an object directly will cause warning or error.

Why? sometimes you want the UI to display data only, it shouldn't make change
data. You may declare methods as private and turn on strict mode. Then UI can
only read but not write.

### private elements

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements

Try to support this feature.
