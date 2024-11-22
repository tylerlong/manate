/* eslint-disable @typescript-eslint/no-explicit-any */
import { capture } from './events/read-emitter';
import { ReadLog, WriteLog } from './events/types';
import writeEmitter, { ignore } from './events/write-emitter';
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

export const shouldRecompute = (
  writeLog: WriteLog,
  readLog: ReadLog,
): boolean => {
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

export const run = <T>(
  fn: () => T,
): [r: T, isTrigger: (event: WriteLog) => boolean] => {
  const [r, readLog] = capture(fn);
  const isTrigger = (writeLog: WriteLog) => shouldRecompute(writeLog, readLog);
  return [r, isTrigger];
};

export const autoRun = <T>(fn: () => T, wrapper?: Wrapper) => {
  let isTrigger: (event: WriteLog) => boolean;
  let wrappedRun = () => {
    [runner.r, isTrigger] = ignore(() => run(fn)); // ignore to avoid infinite loop
  };
  if (wrapper) {
    wrappedRun = wrapper(wrappedRun);
  }
  const listener = (e: WriteLog): void => {
    if (isTrigger(e)) {
      wrappedRun();
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

export const computed = <T extends () => any>(fn: T): T => {
  const cache = new WeakMap<object, any>();
  return function (this: object) {
    if (cache.has(this)) {
      return cache.get(this);
    }
    const [r, isTrigger] = run(() => fn.apply(this));
    cache.set(this, r);
    const listener = (writeLog: WriteLog) => {
      if (isTrigger(writeLog)) {
        writeEmitter.off(listener);
        cache.delete(this);
      }
    };
    writeEmitter.on(listener);
    return r;
  } as unknown as T;
};
