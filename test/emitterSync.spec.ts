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
      writeEmitter.emit({ target: obj, prop: '0' });
      writeEmitter.emit({ target: obj, prop: '1' });
      writeEmitter.emit({ target: obj, prop: '2' });
      writeEmitter.emit({ target: obj, prop: '100' });
      writeEmitter.emit({ target: obj, prop: '3' });
      writeEmitter.emit({ target: obj, prop: '4' });
      writeEmitter.emit({ target: obj, prop: '5' });
    });
    expect(inspect(writeLogs)).toBe(
      "[ Map(1) { {} => Set(7) { '0', '1', '2', '100', '3', '4', '5' } } ]",
    );
  });
});
