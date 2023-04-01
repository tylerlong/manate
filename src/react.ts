import React, { useState, useRef, useEffect } from 'react';

import { manage, run, releaseChildren, ProxyType } from '.';
import { ManateEvent } from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  public propsProxy?: ProxyType<P>;
  public isTrigger!: (event: ManateEvent) => boolean;

  public constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      this.propsProxy = manage(this.props);
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

  public listener = (event: ManateEvent) => {
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
  prev.current?.();
  const dispose = () => {
    releaseChildren(proxy);
    proxy.$e.off('event', listener);
    proxy = undefined;
  };
  prev.current = dispose;
  useEffect(() => {
    if (!proxy) {
      // strict mode re-mount
      proxy = manage(props);
      proxy.$e.on('event', listener);
    }
    return dispose;
  }, []);
  let proxy = manage(props);
  const [result, isTrigger] = run(proxy, render);
  const [, refresh] = useState(false);
  const listener = (event: ManateEvent) => {
    if (isTrigger(event)) {
      refresh((r) => !r);
    }
  };
  proxy.$e.on('event', listener);
  return result;
};
