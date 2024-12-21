import { GetEvent, HasEvent, KeysEvent, ReadLog } from "./types.ts";

class ReadEmitter {
  private readLogs = new Set<ReadLog>();

  capture<T>(f: () => T): [T, ReadLog] {
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
        readLog.set(ge.target, {});
      }
      const readObj = readLog.get(ge.target)!;
      if (!readObj.get) {
        readObj.get = new Map<any, any>();
      }
      readObj.get.set(ge.prop, ge.value);
    }
  }

  emitHas(he: HasEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(he.target)) {
        readLog.set(he.target, {});
      }
      const readObj = readLog.get(he.target)!;
      if (!readObj.has) {
        readObj.has = new Map<any, boolean>();
      }
      readObj.has.set(he.prop, he.value);
    }
  }

  emitKeys(ke: KeysEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(ke.target)) {
        readLog.set(ke.target, {});
      }
      readLog.get(ke.target)!.keys = true;
    }
  }
}

const readEmitter = new ReadEmitter();
export const capture = readEmitter.capture.bind(readEmitter);

export default readEmitter;
