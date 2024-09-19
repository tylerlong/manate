import { useState, useRef, useEffect, memo, type FunctionComponent } from 'react';

import { manage, run, disposeSymbol } from '.';
import type { Managed, ManateEvent } from './models';

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
