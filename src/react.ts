import React, { useEffect, useState } from 'react';

import { useProxy, run, releaseChildren, ProxyType, monitor } from '.';
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
      this.propsProxy.__emitter__.on('event', this.listener);
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
      this.propsProxy.__emitter__.off('event', this.listener);
      this.propsProxy = undefined;
    }
  }
}

export const auto = (render: () => JSX.Element, props): JSX.Element => {
  const [result, getPaths] = monitor(render, props);
  const [_, refresh] = useState(false);
  useEffect(() => {
    const proxies = Object.entries(props as { [v: string]: ProxyType<any> }).filter(
      (entry) => '__emitter__' in entry[1],
    );
    const cache: { [key: string]: (event: ProxyEvent) => void } = {};
    for (const [k, v] of proxies) {
      cache[k] = (event: ProxyEvent) => {
        event.paths.unshift(k);
        if (getPaths.some((getPath) => getPath.startsWith(event.pathString))) {
          refresh(!_);
        }
      };
      v.__emitter__.on('event', cache[k]);
    }
    return () => {
      for (const [k, v] of proxies) {
        v.__emitter__.off('event', cache[k]);
      }
    };
  }, []);
  return result;
};
