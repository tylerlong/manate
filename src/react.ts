import { memo, useEffect, useState, type FunctionComponent } from 'react';

import { ManateEvent, run, setEmitter } from '.';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, refresh] = useState(0);
    const [r, isTrigger] = run(() => Component(props)); // todo: <Component {...props} /> ?
    useEffect(() => {
      const listener = (me: ManateEvent) => {
        if (isTrigger(me)) {
          refresh((n) => n + 1);
        }
      };
      setEmitter.on(listener);
      return () => {
        setEmitter.off(listener);
      };
    }, [isTrigger]);
    return r;
  });
};
