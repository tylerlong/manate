# useProxy

The name `useProxy` was inspired by React [useState](https://reactjs.org/docs/hooks-intro.html).

Just like `useState`, it is mainly designed to work with React applications.

`useProxy` is the successor of [SubX](https://github.com/tylerlong/subx), which is similar to MobX.

## What's the value of `useProxy`?

It allows you to maintain your app state in OOP style.  
I am not saying that OOP style is the best practice for React development.  
But if do want to code your React app in OOP style, you should give this library a try.

It supports TypeScript very well.

## Demo application

[TodoMVC powered by UseProxy](https://chuntaoliu.com/use-proxy-demo-todomvc/)

[Source Code](https://github.com/tylerlong/use-proxy-demo-todomvc)

## Installation

```
yarn add @tylerlong/use-proxy
```

## Usage

```ts
import { useProxy } from '@tylerlong/use-proxy';
import { Component } from '@tylerlong/use-proxy/lib/react';

class Store {
  count = 0;
  increase() {
    this.count += 1;
  }
}
const store = useProxy(new Store());

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

### Functional React Component & React Hooks

```ts
import { auto } from '@tylerlong/use-proxy/lib/react';

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
A fully working demo is [here](https://github.com/tylerlong/use-proxy-demo-counter).

## Event Emitter

```ts
import { useProxy } from '@tylerlong/use-proxy';
import { ProxyEvent } from '@tylerlong/use-proxy/lib/models';

class Store {}
const store = useProxy(new Store());
```

`store.__emitter__` is an `EventEmitter` which will emit events about read/write to store. You can subscribe to events:

```ts
store.__emitter__.on('event', (event: ProxyEvent) => {
  // do something with event
});
```

## Utility methods

### `run`

The signature of `run` is

```ts
function run<T>(proxy: ProxyType<T>, func: Function): [result: any, isTrigger: (event: ProxyEvent) => boolean];
```

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `func` is a function which reads `proxy`.
- `result` is the result of `func()`.
- `isTrigger` is a function which returns `true` if an `event` will "trigger" `func()` to have a different result.
  - when it returns true, most likely it's time to run `func()` again(because you will get a different result from last time).

When you invoke `run(proxy, func)`, `func()` is invoked immediately.
You can subscribe to `proxy.__emitter__` and filter the events using `isTrigger` to get the trigger events (to run `func()` again).

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

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `func` is a function which reads `proxy`.
- `decorator` is a method to change run schedule of `func`, for example: `func => _.debounce(func, 10, {leading: true, trailing: true})`
- `start` and `stop` is to start and stop `autoRun`.

When you invoke `start()`, `func()` is invoked immediately.
`func()` will be invoked automatically afterwards if there are trigger events from `proxy` which change the result of `func()`.
Invoke `stop` to stop `autoRun`.

For sample usages of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).

### monitor

This one was originally designed to support React hooks.
In theory, you may also use it in a context without React.

The signature of `monitor` is:

```ts
function monitor(
  props: { [key: string]: ProxyType<any> }, 
  func: Function
): [result: any, getPaths: string[]];
```

- `props` is the props that a React component receives, it could also be any object.
- `func` is a function to monitor. In context of React, `func` should return `JSX.Element`.
- `result` is the result of `func()`
- `getPaths` is the paths that were read (a.k.a get) during the execution of `func()`.

When is it useful? It's kind of low-level compared to `autoRun` and `run`.
You may monitor the events of `props`, whenever there is a `set` event,you can check `getPaths` to see if they are affected. 
If yes, then you may take some actions, such as call the `func` again.

For a sample usage of `monitor`, please check the implemetation of `auto` in `./src/react.ts` file.

#### Question #1: why not use `autoRun` to support React hooks? 

Well, React decides when to invoke the component function, we cannot "autoRun" it. 
If we autoRun it, we don't have a way to tell React to render the result.

#### Question #1: why not use `run` to support React hooks? 

`run` requires a `ProxyType<T>` object as the first parameter. React `props` is not a `ProxyType<T>`.
We need to turn `props` into `ProxyType<T>` by `useProxy(props)`.

Run requires a 

## Known issue

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- You cannot proxy some built-in objects, such as `Set` & `Map`.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.

## Todo

- cache data for getter functions to make it faster, just like what I did in SubX project
- When is `typeof path === 'symbol'`?
- Support React Hooks https://reactjs.org/docs/hooks-intro.html
  - I think I mean function style react components
- Native objects 会报错，比如说 `window.speechSynthesis.getVoices()`
- `autoRun` 逻辑上有漏洞。比如说我想保存一个对象。一开始这个对象的 property 不全。后来全了。但是新增的 props 并不被 monitor。
  - 一个 workaround 是把 property 的值设为 null。
    - 不设为 undefined，因为 json 不支持，持久化会有问题。 不过这个问题和本项目无关
- 如果有循环引用的结构，会报错 `Uncaught RangeError: Maximum call stack size exceeded`

## Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
    - check the source code of `autoRun`.
- rewrite some emitter.on to promise.
  - the idea is great, but it will turn the library from sync to async, which will cause unexpected consequences.
  - `React.render`, `EventEmitter.on`, `rxjs.observable.next` are all sync, there must be a good reason to stay with sync.
