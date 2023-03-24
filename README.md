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

`store.$e` is an `EventEmitter` which will emit events about read/write to store. You can subscribe to events:

```ts
store.$e.on('event', (event: ProxyEvent) => {
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

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `func` is a function which reads `proxy`.
- `decorator` is a method to change run schedule of `func`, for example: `func => _.debounce(func, 10, {leading: true, trailing: true})`
- `start` and `stop` is to start and stop `autoRun`.

When you invoke `start()`, `func()` is invoked immediately.
`func()` will be invoked automatically afterwards if there are trigger events from `proxy` which change the result of `func()`.
Invoke `stop` to stop `autoRun`.

For sample usages of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).

### `monitor`

This one was originally designed to support React hooks.
In theory, you may also use it in a context without React.

The signature of `monitor` is:

```ts
function monitor(props: { [key: string]: ProxyType<any> }, func: Function): [result: any, getPaths: string[]];
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

Well, actually it is possible and implementation is even shorter and simpler:

```ts
const auto = (render, props): JSX.Element | null => {
  const [r, refresh] = useState(null);
  useEffect(() => {
    const proxy = useProxy(props);
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

**大的问题**是这个：https://github.com/tylerlong/use-proxy-react-demo/blob/03ca533592a78a446d3688274c7b47059644dda3/src/index.tsx。
也就是上游 component 是没办法调用`render`的，因为`render`隐藏在了 `useEffect` 里面。于是上游的 `useState` 就彻底废掉了。

就算整个项目都不用 useState，也还是有下面这个问题：
But there is an issue: React `StrictMode` doesn't works for us any more.
Because StrictMode will try to do double rendering. However, we only invoke `render` in `useEffect`.
So double rendering will not invoke `render` at all, thus it cannot help us to detect non-pure function issues.

那么能不能在`useEffect`之外执行`autoRun`呢？不行，因为`autoRun` by design 应该是一个 long running 的东西，有副作用。每次`render`都执行`autoRun`不合适。
其实 `run` 比它更合适。下面具体分析

#### Question #2: why not use `run` to support React hooks?

参考上面对 `autoRun` 的分析，如果我们想要支持上游 component 的 `useState` 以及 `strictMode`, 那么必须要在`useEffect`之外执行`render`。
但是`run`要求有一个`proxy`对象。构建这样一个`proxy`对象有副作用。并且什么时候 dispose 副作用呢？这个问题回答不好就不能用`run`。
可不可以不构建`proxy`就执行`render`呢？ 可以，用 `monitor` 方法。也就是当前实现采用的方法。

## Todo

- cache data for getter functions to make it faster, just like what I did in SubX project
  - computed property?
- Native objects 会报错，比如说 `window.speechSynthesis.getVoices()`
- `autoRun` 逻辑上有漏洞。比如说我想保存一个对象。一开始这个对象的 property 不全。后来全了。但是新增的 props 并不被 monitor。
  - 一个 workaround 是把 property 的值设为 null。
    - 不设为 undefined，因为 json 不支持，持久化会有问题。 不过这个问题和本项目无关
- 如果有循环引用的结构，会报错 `Uncaught RangeError: Maximum call stack size exceeded`
- Rename to "manate": manage + state
- allow to `import {auto} from 'manate/react'` instead of `import {auto} from '@tylerlong/use-proxy/lib/react'`
  - pretty hard
- optimize path checking code
  - use set to check prefix.
  - `getPaths.some((getPath) => getPath.startsWith(setPath))` is slow. Put all prefixes in a set
- rename `mnitor` to `supervise`
- support symbols as prop keys, since you can convert symbols to strings by `toString()`.
- use symbol for children key.

## Development Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.
- rewrite some emitter.on to promise.
  - the idea is great, but it will turn the library from sync to async, which will cause unexpected consequences.
  - `React.render`, `EventEmitter.on`, `rxjs.observable.next` are all sync, there must be a good reason to stay with sync.

## Known limitations

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- It doesn't work with some built-in objects, such as `Set` & `Map`.
