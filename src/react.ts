import { memo, useEffect, useState, type FunctionComponent } from 'react';

import { run, writeEmitter } from '.';
import { ProxyTrapEvent } from './events';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, refresh] = useState(0);
    const [r, isTrigger] = run(() => Component(props)); // todo: <Component {...props} /> ?
    useEffect(() => {
      const listener = (mes: ProxyTrapEvent[]) => {
        for (const me of mes) {
          if (isTrigger(me)) {
            refresh((n) => n + 1);
            return;
          }
        }
      };
      writeEmitter.on(listener);
      return () => {
        writeEmitter.off(listener);
      };
    }, [isTrigger]);
    return r;
  });
};
