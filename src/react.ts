import React, { useState, useRef, useEffect } from 'react';

import { manage, run } from '.';
import { Managed, ManateEvent } from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  public managed?: Managed<P>;
  public isTrigger!: (event: ManateEvent) => boolean;

  public constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      this.managed = manage(this.props);
      const [result, isTrigger] = run(this.managed, render);
      this.isTrigger = isTrigger;
      this.managed.$e.on('event', this.listener);
      return result;
    };

    // rewrite componentDidMount()
    const componentDidMount = this.componentDidMount ? this.componentDidMount.bind(this) : () => {};
    this.componentDidMount = () => {
      // strict mode re-mount
      if (!this.managed) {
        this.managed = manage(this.props);
        this.managed.$e.on('event', this.listener);
      }
      componentDidMount();
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
    this.managed?.dispose();
    this.managed = undefined;
  }
}

export const auto = (render: () => JSX.Element, props): JSX.Element => {
  const prev = useRef<() => void>();
  prev.current?.();
  const dispose = () => {
    managed?.dispose();
    managed = undefined;
  };
  prev.current = dispose;
  useEffect(() => {
    if (!managed) {
      // strict mode re-mount
      managed = manage(props);
      managed.$e.on('event', listener);
    }
    return dispose;
  }, []);
  let managed = manage(props);
  const [result, isTrigger] = run(managed, render);
  const [, refresh] = useState(false);
  const listener = (event: ManateEvent) => {
    if (isTrigger(event)) {
      refresh((r) => !r);
    }
  };
  managed.$e.on('event', listener);
  return result;
};
