import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, runInAction } from '../src';
import { autoRun } from '../src/utils';

describe('array splice', () => {
  test('default', () => {
    const arr = [1, 2, 3, 4, 5];
    const ma = manage(arr);

    const [, writeLog] = runInAction(() => {
      ma.splice(2, 1);
    });
    expect(inspect(writeLog)).toBe(`Map(1) {
  [ 1, 2, 4, 5 ] => Map(4) { '2' => 0, '3' => 0, '4' => -1, 'length' => 0 }
}`);
  });

  test('autoRun without explicit batch', () => {
    const arr = manage([1, 2, 3, 4, 5]);
    let count = 0;
    const runner = autoRun(() => {
      count++;
      return JSON.stringify(arr);
    });
    runner.start(); // trigger the first run
    arr.splice(2, 1); // there are 4 steps in this operation but it only triggers 1 run, since we have wrapped the splice function
    /*
      there is no need to:
      runInAction(() => {
        arr.splice(2, 1);
      });
     */
    runner.stop();
    expect(count).toBe(2);
    expect(runner.r).toBe('[1,2,4,5]');
  });
});
