import { GetEvent, HasEvent, KeysEvent, ReadLog } from './types';

class ReadEmitter {
  private readLogs = new Set<ReadLog>();

  run<T>(f: () => T): [T, ReadLog] {
    const readLog = new Map();
    this.readLogs.add(readLog);
    try {
      const r = f();
      return [r, readLog];
    } finally {
      this.readLogs.delete(readLog);
    }
  }

  emitGet(ge: GetEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(ge.target)) {
        readLog.set(ge.target, { get: {}, has: {} });
      }
      readLog.get(ge.target)!.get[ge.prop] = ge.value;
    }
  }

  emitHas(he: HasEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(he.target)) {
        readLog.set(he.target, { get: {}, has: {} });
      }
      readLog.get(he.target)!.has[he.prop] = he.value;
    }
  }

  emitKeys(ke: KeysEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(ke.target)) {
        readLog.set(ke.target, { get: {}, has: {} });
      }
      readLog.get(ke.target)!.keys = ke.value;
    }
  }
}

export default ReadEmitter;
