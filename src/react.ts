import { useState, useEffect, memo, type FunctionComponent, type ReactNode } from 'react';

import { manage, disposeSymbol, autoRun } from '.';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    const [r, setR] = useState<ReactNode>(null);
    useEffect(() => {
      const managed = manage(props);
      const { start, stop } = autoRun(managed, () => {
        setR(Component(managed));
      });
      start();
      return () => {
        stop();
        managed?.[disposeSymbol]();
      };
    }, [props]);
    return r;
  });
};
