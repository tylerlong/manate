import { useState, useRef, useEffect, memo, type FunctionComponent } from 'react';

import type { Managed } from '.';
import { manage, run, disposeSymbol } from '.';
import type { ManateEvent } from './models';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    // dispose
    const disposeFunction = useRef<() => void>();
    disposeFunction.current?.();
    const dispose = () => {
      managed?.[disposeSymbol]();
      managed = undefined;
    };
    disposeFunction.current = dispose;
    useEffect(() => {
      if (!managed) {
        // <StrictMode /> will run useEffect, dispose and re-run useEffect
        managed = manage(props);
        managed.$e.on(listener);
      }
      return dispose;
    }, []);

    // run and refresh
    let managed: Managed<P> | undefined = manage(props);
    const [result, isTrigger] = run(managed, () => Component(props));
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
