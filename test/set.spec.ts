import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import { autoRun } from '../src/utils';

describe('set', () => {
  test('autoRun', () => {
    class A {
      public s = new Set<number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.s.add(1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.s.has(1)).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.s.delete(1);
    expect(count).toBe(2);
  });

  test('autoRun-unchanged', () => {
    class A {
      public s = new Set<number>();
    }
    const a = new A();
    const ma = manage(a);
    ma.s.add(1);
    let count = 0;
    const runner = autoRun(() => {
      expect(ma.s.has(1)).toBeDefined();
      count += 1;
    });
    runner.start();
    ma.s.add(1);
    ma.s.add(2);
    ma.s.delete(2);
    expect(count).toBe(1);
  });
});
