import { readEmitter, writeEmitter } from '.';
import { WriteLog } from './events/types';
import { Wrapper } from './wrappers';

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: WriteLog) => boolean] => {
  const [r, readLog] = readEmitter.run(fn);
  const isTrigger = (writeLog: WriteLog) => {
    for (const [target, obj] of writeLog) {
      if (readLog.has(target)) {
        const objectLog = readLog.get(target)!;
        for (const prop of Object.keys(obj)) {
          if (
            prop in objectLog.get &&
            objectLog.get[prop] !== Reflect.get(target, prop)
          ) {
            return true;
          }
          if (
            prop in objectLog.has &&
            objectLog.has[prop] !== Reflect.has(target, prop)
          ) {
            return true;
          }
        }

        if ('keys' in objectLog) {
          return Object.values(obj).some((i) => i !== 0);
        }
      }
    }
    return false;
  };
  return [r, isTrigger];
};

export const autoRun = <T>(fn: () => T, wrapper?: Wrapper) => {
  let isTrigger: (event: WriteLog) => boolean;
  let decoratedRun = () => {
    [runner.r, isTrigger] = writeEmitter.ignore(() => run(fn)); // ignore to avoid infinite loop
  };
  if (wrapper) {
    decoratedRun = wrapper(decoratedRun);
  }
  const listener = (e: WriteLog): void => {
    if (isTrigger(e)) {
      decoratedRun();
    }
  };
  const runner = {
    start: () => {
      [runner.r, isTrigger] = run(fn);
      writeEmitter.on(listener);
    },
    stop: () => {
      writeEmitter.off(listener);
    },
    r: undefined as T | undefined,
  };
  return runner;
};
