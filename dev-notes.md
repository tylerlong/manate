## Development Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.

## No complex logic for `isTrigger`

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

## Todo

- Reference https://github.com/pmndrs/valtio
  - This one is very similar to manate
- It doesn't monitor built-in objects, such as `Set`, `Map` and `RTCPeerConnection`.
  - we could support `Set` and `Map`, to be done.
- React `useManate`?
  - refer to https://jotai.org/
