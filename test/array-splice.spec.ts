import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';
import { autoRun } from '../src/utils';

describe('array splice', () => {
  test('default', () => {
    const arr = [1, 2, 3, 4, 5];
    const ma = manage(arr);
    const writeLogs: WriteLog[] = [];
    const listener = (e) => {
      writeLogs.push(e);
    };
    writeEmitter.on(listener);
    writeEmitter.batch(() => {
      ma.splice(2, 1);
    });
    writeEmitter.off(listener);
    expect(writeLogs.length).toBe(1);
    const writeCache = writeLogs[0];
    expect(writeCache.size).toBe(1);
    expect(writeCache.has(arr)).toBeTruthy();
    const map = writeCache.get(arr)!;
    expect(inspect(map)).toEqual(
      `Map(4) { '2' => 0, '3' => 0, '4' => -1, 'length' => 0 }`,
    );
  });

  test('autoRun without batch', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const runner = autoRun(() => {
      count++;
      return JSON.stringify(arr);
    });
    runner.start(); // trigger the first run
    arr.splice(2, 1); // trigger 4 more runs
    runner.stop();
    expect(count).toBe(5);
    expect(runner.r).toBe('[1,2,4,5]');
  });

  test('autoRun with batch', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const runner = autoRun(() => {
      count++;
      return JSON.stringify(arr);
    });
    runner.start(); // trigger the first run

    // batch only triggers 1 run
    writeEmitter.batch(() => {
      arr.splice(2, 1);
    });

    runner.stop();
    expect(count).toBe(2);
    expect(runner.r).toBe('[1,2,4,5]');
  });
});
