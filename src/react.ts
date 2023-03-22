import React, { useEffect, useState } from 'react';

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

export const auto = (render: () => JSX.Element | string, props): JSX.Element => {
  const proxy = useProxy(props);
  const [result, isTrigger] = run(proxy, render);
  const [_, refresh] = useState(false);
  useEffect(() => {
    const listener = (event) => {
      if (isTrigger(event)) {
        proxy.__emitter__.off('event', listener);
        releaseChildren(proxy);
        refresh(!_);
      }
    };
    proxy.__emitter__.on('event', listener);
  });
  return result;
};
