import { memo, useEffect, useState, type FunctionComponent } from 'react';

import { writeEmitter } from '.';
import { WriteLog } from './events/types';
import { run } from './utils';

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, reRender] = useState(0);
    const [r, isTrigger] = run(() => Component(props));
    useEffect(() => {
      const listener = (writeLog: WriteLog) => {
        if (isTrigger(writeLog)) {
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
