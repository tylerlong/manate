import type { FunctionComponent } from 'react';
import React, { useState, useRef, useEffect, memo } from 'react';

import { manage, run } from '.';
import type { Managed, ManateEvent } from './models';
import { disposeSymbol } from '.';

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
      this.managed.$e.on(this.listener);
      return result;
    };

    // rewrite componentDidMount()
    const componentDidMount = this.componentDidMount ? this.componentDidMount.bind(this) : () => {};
    this.componentDidMount = () => {
      // strict mode re-mount
      if (!this.managed) {
        this.managed = manage(this.props);
        this.managed.$e.on(this.listener);
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
    this.managed?.[disposeSymbol]();
    this.managed = undefined;
  }
}

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    const render = () => Component(props);
    const prev = useRef<() => void>();
    prev.current?.();
    const dispose = () => {
      managed?.[disposeSymbol]();
      managed = undefined;
    };
    prev.current = dispose;
    useEffect(() => {
      if (!managed) {
        // strict mode re-mount
        managed = manage(props);
        managed.$e.on(listener);
      }
      return dispose;
    }, []);
    let managed: Managed<P> | undefined = manage(props);
    const [result, isTrigger] = run(managed, render);
    const [, refresh] = useState(0);
    const listener = (event: ManateEvent) => {
      if (isTrigger(event)) {
        refresh((i) => i + 1);
      }
    };
    managed.$e.on(listener);
    return result;
  });
};
