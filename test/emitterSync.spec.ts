import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';

describe('emitter sync', () => {
  test('default', async () => {
    const obj = {};
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((writeLog: WriteLog) => {
      writeLogs.push(writeLog);
    });
    writeEmitter.batch(() => {
      writeEmitter.emit({ target: obj, prop: '0', value: 1 });
      writeEmitter.emit({ target: obj, prop: '1', value: 1 });
      writeEmitter.emit({ target: obj, prop: '2', value: 1 });
      writeEmitter.emit({ target: obj, prop: '100', value: 1 });
      writeEmitter.emit({ target: obj, prop: '3', value: 1 });
      writeEmitter.emit({ target: obj, prop: '4', value: 1 });
      writeEmitter.emit({ target: obj, prop: '5', value: 1 });
    });
    expect(inspect(writeLogs)).toBe(
      `[
  Map(1) {
    {} => { '0': 1, '1': 1, '2': 1, '3': 1, '4': 1, '5': 1, '100': 1 }
  }
]`,
    );
  });
});
