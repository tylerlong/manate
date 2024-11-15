import { describe, expect, test } from 'vitest';

import { autoRun, manage, writeEmitter } from '../src';
import { WriteCache } from '../src/events';

describe('array splice', () => {
  test('default', () => {
    const arr = [1, 2, 3, 4, 5];
    const ma = manage(arr);
    const writeCaches: WriteCache[] = [];
    const listener = (e) => {
      writeCaches.push(e);
    };
    writeEmitter.on(listener);
    writeEmitter.batch(() => {
      ma.splice(2, 1);
    });
    writeEmitter.off(listener);
    expect(writeCaches.length).toBe(1);
    const writeCache = writeCaches[0];
    expect(writeCache.size).toBe(1);
    expect(writeCache.has(arr)).toBeTruthy();
    const props = writeCache.get(arr)!;
    expect(Array.from(props).sort()).toEqual(['2', '3', '4', 'length']);
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
