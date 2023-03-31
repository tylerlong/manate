# manate

manate is short for "manage state". It is the most straightforward way to manage global state in React.

## What's the value of manate?

It supports TypeScript very well.

It is very straightforward to use. You don't need to learn any new concepts.

It allows you to maintain your app state in OOP style.  
I am not saying that OOP style is the best practice for state management.
But if do want to code your state in OOP style, you should give this library a try.

Merely 200+ lines of code. There is no rocket science in this library.

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

### React class Component

```ts
import { Component } from 'manate/react';

class App extends Component<{ store: Store }> {
  render() {
    const store = this.props.store;
    return (
      <div>
        <span>{store.count}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}
```

### React functional Component

```ts
import { auto } from 'manate/react';

const App = (props: { store: Store }) => {
  const { store } = props;
  const render = () => (
    <Space>
      <Button onClick={() => store.decrease()}>-</Button>
      {store.count}
      <Button onClick={() => store.increase()}>+</Button>
    </Space>
  );
  return auto(render, props);
};
```

It's fully compatible with `useState` and `useEffect`.

## Demo Applications

- [Counter](https://github.com/tylerlong/manate-demo-counter)
- [TodoMVC](https://github.com/tylerlong/manate-demo-todomvc)

## Event Emitter

```ts
import { manage } from 'manate';
import { ManateEvent } from 'manate/models';

class Store {}
const store = manage(new Store());
```

`store.$e` is an `EventEmitter` which will emit events about read/write to store. You can subscribe to events:

```ts
store.$e.on('event', (event: ManateEvent) => {
  // do something with event
});
```

## Utility methods

### `run`

The signature of `run` is

```ts
function run<T>(proxy: ProxyType<T>, func: Function): [result: any, isTrigger: (event: ManateEvent) => boolean];
```

- `proxy` is generated from `manage` method: `const proxy = manage(store)`.
- `func` is a function which reads `proxy`.
- `result` is the result of `func()`.
- `isTrigger` is a function which returns `true` if an `event` will "trigger" `func()` to have a different result.
  - when it returns true, most likely it's time to run `func()` again(because you will get a different result from last time).

When you invoke `run(proxy, func)`, `func()` is invoked immediately.
You can subscribe to `proxy.$e` and filter the events using `isTrigger` to get the trigger events (to run `func()` again).

For a sample usage of `run`, please check [./src/react.ts](./src/react.ts).

Another example is the implementation of the `autoRun` utility method. You may find it in [./src/index.ts](./src/index.ts).

### `autoRun`

The signature of `autoRun` is

```ts
function autoRun<T>(
  proxy: ProxyType<T>,
  func: () => void,
  decorator?: (func: () => void) => () => void,
): { start: () => void; stop: () => void };
```

- `proxy` is generated from `manage` method: `const proxy = manage(store)`.
- `func` is a function which reads `proxy`.
- `decorator` is a method to change run schedule of `func`, for example: `func => _.debounce(func, 10, {leading: true, trailing: true})`
- `start` and `stop` is to start and stop `autoRun`.

When you invoke `start()`, `func()` is invoked immediately.
`func()` will be invoked automatically afterwards if there are trigger events from `proxy` which change the result of `func()`.
Invoke `stop` to stop `autoRun`.

For sample usages of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).

#### Question #1: why not use `autoRun` to support React hooks?

Well, actually it is possible and implementation is even shorter and simpler:

```ts
const auto = (render, props): JSX.Element | null => {
  const [r, refresh] = useState(null);
  useEffect(() => {
    const proxy = manage(props);
    const { start, stop } = autoRun(proxy, () => {
      refresh(render());
    });
    start();
    return () => {
      stop();
      releaseChildren(proxy);
    };
  }, []);
  return r;
};
```

**Big problem** is：upstream components cannot invoke `render`, because `render` is inside `useEffect`. So upstream `useState` becomes useless。

Another minor issue：
But there is an issue: React `StrictMode` doesn't works for us any more.
Because StrictMode will try to do double rendering. However, we only invoke `render` in `useEffect`.
So double rendering will not invoke `render` at all, thus it cannot help us to detect non-pure function issues.

So is there a way to run `autoRun` out of `useEffect`? Nope, because `autoRun` by design is long running process and has side effects.
It's not a good idea to run `autoRun` for every `render`. `run` is more suitable for this case.

#### Question #2: why use `run` to support React hooks?

According to the analysis above, if we want to support upstream component's `useState` and `strictMode`, we must run `render` outside `useEffect`.
However, `run` requires a `proxy` object. Building such a `proxy` object has side effects. And when to dispose side effects? If we cannot answer this question, we cannot use `run`.
After investigation, I found that `useRef` can be used to dispose the side effects created in last render.

## Development Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.
- rewrite some emitter.on to promise.
  - the idea is great, but it will turn the library from sync to async, which will cause unexpected consequences.
  - `React.render`, `EventEmitter.on`, `rxjs.observable.next` are all sync, there must be a good reason to stay with sync.

## Known limitations

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`.
  - Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- It doesn't work with some built-in objects, such as `Set` & `Map`.
- It desn't work with native objects, such as `window.speechSynthesis.getVoices()`.
- `autoRun` doesn't monitor brand new properties. It only monitors existing properties.
  - workaround: pre-define all properties in the object. Event it doesn't have value yet, set it to `null`. `null` is better than `undefined` because `undefined` is not a valid value for JSON string.
- no circular references, otherwise `Uncaught RangeError: Maximum call stack size exceeded`
