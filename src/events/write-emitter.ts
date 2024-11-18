import { WriteEvent, WriteLog } from './types';

class WriteEmitter {
  private writeLog: WriteLog = new Map();
  private batchCounter = 0;
  private ignoreCounter = 0;
  private listeners = new Set<(e: WriteLog) => void>();

  batch<T>(f: () => T): T {
    this.batchCounter++;
    try {
      return f();
    } finally {
      this.batchCounter--;
      if (this.batchCounter === 0 && this.writeLog.size > 0) {
        this.listeners.forEach((listener) => listener(this.writeLog));
        this.writeLog = new Map();
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
    if (this.batchCounter === 0) {
      this.listeners.forEach((listener) =>
        listener(new Map([[me.target, new Map([[me.prop, me.value]])]])),
      );
    } else {
      if (!this.writeLog.has(me.target)) {
        this.writeLog.set(me.target, new Map());
      }
      const writeMap = this.writeLog.get(me.target)!;
      writeMap.set(me.prop, me.value + (writeMap.get(me.prop) ?? 0));
    }
  }
}

export default WriteEmitter;
