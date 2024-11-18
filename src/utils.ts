import { readEmitter, writeEmitter } from '.';
import { WriteLog } from './events/types';
import { Wrapper } from './wrappers';

const getValue = (target: object, prop: PropertyKey) => {
  if (target instanceof Map) {
    return target.get(prop);
  }
  return Reflect.get(target, prop);
};

const hasValue = (target: object, prop: PropertyKey) => {
  if (target instanceof Map || target instanceof Set) {
    return target.has(prop);
  }
  return Reflect.has(target, prop);
};

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: WriteLog) => boolean] => {
  const [r, readLog] = readEmitter.run(fn);
  const isTrigger = (writeLog: WriteLog) => {
    for (const [target, writeMap] of writeLog) {
      if (readLog.has(target)) {
        const readObj = readLog.get(target)!;
        for (const prop of writeMap.keys()) {
          if (
            readObj.get &&
            readObj.get.has(prop) &&
            readObj.get.get(prop) !== getValue(target, prop)
          ) {
            return true;
          }
          if (
            readObj.has &&
            readObj.has.has(prop) &&
            readObj.has.get(prop) !== hasValue(target, prop)
          ) {
            return true;
          }
        }
        if (
          'keys' in readObj &&
          Array.from(writeMap.values()).some((i) => i !== 0)
        ) {
          return true;
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
