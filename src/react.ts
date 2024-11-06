import {
  memo,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
} from 'react';

import { $, manage, run, type ManateEvent } from '.';
import TransactionsManager from './transactions';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    // dispose
    const disposeFunction = useRef<() => void>();
    disposeFunction.current?.();
    const dispose = () => {
      if (managed) $(managed).dispose();
      managed = undefined;
    };
    disposeFunction.current = dispose;
    useEffect(() => {
      if (!managed) {
        // <StrictMode /> will run useEffect, dispose and re-run useEffect
        // eslint-disable-next-line react-hooks/exhaustive-deps
        managed = manage(props);
        $(managed).on(listener);
      }
      return dispose;
    }, []);

    // run and refresh
    let managed: P | undefined = manage(props);
    const [result, isTrigger] = run(managed, () => Component(props));
    const [, refresh] = useState(0);
    const transactionsManager = new TransactionsManager(isTrigger);
    const listener = (event: ManateEvent) => {
      if (transactionsManager.shouldRun(event)) {
        refresh((i) => i + 1);
      }
    };
    $(managed).on(listener);
    return result;
  });
};
