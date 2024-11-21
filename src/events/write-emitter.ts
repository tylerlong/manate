/* eslint-disable @typescript-eslint/no-explicit-any */
import { WriteEvent, WriteLog } from './types';

class WriteEmitter {
  private writeLogs = new Set<WriteLog>();
  private ignoreCounter = 0;
  private listeners = new Set<(e: WriteLog) => void>();

  action<T extends (...args: any[]) => any>(fn: T): T {
    const runInAction = this.runInAction.bind(this);
    return function (this: object, ...args) {
      return runInAction(() => fn.apply(this, args))[0];
    } as unknown as T;
  }

  runInAction<T>(f: () => T): [T, WriteLog] {
    const writeLog = new Map();
    this.writeLogs.add(writeLog);
    try {
      return [f(), writeLog];
    } finally {
      this.writeLogs.delete(writeLog);
      if (this.writeLogs.size === 0 && writeLog.size > 0) {
        this.listeners.forEach((listener) => listener(writeLog));
      }
    }
  }

  ignore<T>(f: () => T): T {
    this.ignoreCounter++;
    try {
      return f();
    } finally {
      this.ignoreCounter--;
    }
  }

  on(listener: (e: WriteLog) => void) {
    this.listeners.add(listener);
  }

  off(listener: (e: WriteLog) => void) {
    this.listeners.delete(listener);
  }

  emit(me: WriteEvent) {
    if (this.ignoreCounter > 0) {
      return;
    }
    if (this.writeLogs.size === 0) {
      this.listeners.forEach((listener) =>
        listener(new Map([[me.target, new Map([[me.prop, me.value]])]])),
      );
    } else {
      for (const writeLog of this.writeLogs.values()) {
        if (!writeLog.has(me.target)) {
          writeLog.set(me.target, new Map());
        }
        const writeMap = writeLog.get(me.target)!;
        writeMap.set(me.prop, me.value + (writeMap.get(me.prop) ?? 0));
      }
    }
  }
}

export default WriteEmitter;
