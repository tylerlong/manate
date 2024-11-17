import { readEmitter, writeEmitter } from '.';
import { WriteLog } from './events/types';
import { Wrapper } from './wrappers';

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: WriteLog) => boolean] => {
  const [r, readLog] = readEmitter.run(fn);
  const isTrigger = (writeLog: WriteLog) => {
    for (const [target, props] of writeLog) {
      if (readLog.has(target)) {
        const objectLog = readLog.get(target)!;
        for (const prop of props) {
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

        // todo: optimize: writeLog object[prop] = -1/0/1 means delete/change/add prop
        if ('keys' in objectLog) {
          const lastKeys = objectLog.keys!;
          const currentKeys = Reflect.ownKeys(target);
          if (lastKeys.length !== currentKeys.length) {
            return true;
          }
          if (!lastKeys.every((key, i) => key === currentKeys[i])) {
            return true;
          }
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
