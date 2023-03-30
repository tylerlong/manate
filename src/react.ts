import React, { useEffect, useState, useRef } from 'react';

import { useProxy, run, releaseChildren, ProxyType } from '.';
import { ProxyEvent } from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  public propsProxy?: ProxyType<P>;
  public isTrigger!: (event: ProxyEvent) => boolean;

  public constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      this.propsProxy = useProxy(this.props);
      const [result, isTrigger] = run(this.propsProxy, render);
      this.isTrigger = isTrigger;
      this.propsProxy.$e.on('event', this.listener);
      return result;
    };

    // rewrite componentWillUnmount()
    const componentWillUnmount = this.componentWillUnmount ? this.componentWillUnmount.bind(this) : () => {};
    this.componentWillUnmount = () => {
      this.dispose();
      componentWillUnmount();
    };
  }

  public listener = (event: ProxyEvent) => {
    if (this.isTrigger(event)) {
      this.forceUpdate();
    }
  };

  public dispose() {
    if (this.propsProxy) {
      releaseChildren(this.propsProxy);
      this.propsProxy.$e.off('event', this.listener);
      this.propsProxy = undefined;
    }
  }
}

export const auto = (render: () => JSX.Element, props): JSX.Element => {
  const prev = useRef<() => void>();
  if (prev.current) {
    prev.current();
  }
  useEffect(() => {
    prev.current = () => {
      releaseChildren(proxy);
      proxy.$e.off('event', listener);
    };
  });
  const proxy = useProxy(props);
  const [result, isTrigger] = run(proxy, render);
  const [, refresh] = useState(false);
  const listener = (event: ProxyEvent) => {
    if (isTrigger(event)) {
      refresh((r) => !r);
    }
  };
  proxy.$e.on('event', listener);
  return result;
};

// 下面这个实现，在 Icon Builder 中测试，界面经常无法刷新。
// 经过诊断，发现，getPaths 为空。就好像 render 是异步的一样，并没有捕捉到 get 事件。
// export const auto = (render: () => JSX.Element, props): JSX.Element => {
//   const [result, getPaths] = monitor(props, render);
//   const [, refresh] = useState(false);
//   useEffect(() => {
//     const proxies = Object.entries(props as { [v: string]: ProxyType<any> }).filter((entry) => !!entry[1].$e);
//     const cache: { [key: string]: (event: ProxyEvent) => void } = {};
//     for (const [k, v] of proxies) {
//       cache[k] = (event: ProxyEvent) => {
//         if (event.name === 'set') {
//           event.paths.unshift(k);
//           if (getPaths.some((getPath) => getPath.startsWith(event.pathString))) {
//             refresh((r) => !r);
//           }
//         }
//       };
//       v.$e.on('event', cache[k]);
//     }
//     return () => {
//       for (const [k, v] of proxies) {
//         v.$e.off('event', cache[k]);
//       }
//     };
//   }, []);
//   return result;
// };
