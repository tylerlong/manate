import { useState, useRef, useEffect, memo, type FunctionComponent } from 'react';

import { manage, run, disposeSymbol, type Managed, type ManateEvent } from '.';

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

    const transactions = new Map<string, boolean>();
    const listener = (event: ManateEvent) => {
      let shouldRun = false;
      // start/end transaction
      if (event.name === 'set' && event.paths[event.paths.length - 1] === '$t') {
        const value = event.paths.reduce((acc, key) => acc[key], managed!) as unknown as boolean;
        if (value === true) {
          // start transaction
          transactions.set(event.parentPathString, false);
        } else {
          // end transaction
          const parentKeys = Array.from(transactions.keys()).filter((key) => event.parentPathString.startsWith(key));
          if (parentKeys.length === 1) {
            shouldRun = transactions.get(parentKeys[0]) || false;
          } else {
            // from long to short
            parentKeys.sort((k1, k2) => k2.length - k1.length);
            transactions.set(
              parentKeys[1],
              transactions.get(parentKeys[1]) || transactions.get(parentKeys[0]) || false,
            );
          }
          transactions.delete(parentKeys[0]);
        }
      } else {
        const triggered = isTrigger(event);
        if (!triggered) {
          return;
        }
        const transactionKeys = Array.from(transactions.keys()).filter((key) => event.parentPathString.startsWith(key));
        if (transactionKeys.length === 0) {
          shouldRun = true;
        } else {
          // only update the longest key
          const longestKey = transactionKeys.reduce((shortest, current) =>
            current.length > shortest.length ? current : shortest,
          );
          transactions.set(longestKey, true);
        }
      }
      if (shouldRun) {
        refresh((i) => i + 1);
      }
    };
    managed.$e.on(listener);
    return result;
  });
};
