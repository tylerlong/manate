import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { runInAction, writeEmitter } from '../src';

describe('emitter sync', () => {
  test('default', async () => {
    const obj = {};
    const [, writeLog] = runInAction(() => {
      writeEmitter.emit({ target: obj, prop: '0', value: 1 });
      writeEmitter.emit({ target: obj, prop: '1', value: 1 });
      writeEmitter.emit({ target: obj, prop: '2', value: 1 });
      writeEmitter.emit({ target: obj, prop: '100', value: 1 });
      writeEmitter.emit({ target: obj, prop: '3', value: 1 });
      writeEmitter.emit({ target: obj, prop: '4', value: 1 });
      writeEmitter.emit({ target: obj, prop: '5', value: 1 });
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) {
  {} => Map(7) {
    '0' => 1,
    '1' => 1,
    '2' => 1,
    '100' => 1,
    '3' => 1,
    '4' => 1,
    '5' => 1
  }
}`,
    );
  });
});
