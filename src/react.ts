import { memo, useEffect, useState, type FunctionComponent } from 'react';

import { run, writeEmitter } from '.';
import { WriteCache, WriteEvent } from './events';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, reRender] = useState(0);
    const [r, isTrigger] = run(() => Component(props));
    useEffect(() => {
      const listener = (event: WriteEvent | WriteCache) => {
        if (isTrigger(event)) {
          reRender((n) => n + 1);
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
