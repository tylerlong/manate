import { describe, expect, test } from 'vitest';

import { computed, manage } from '../src';

describe('computed', () => {
  test('default', () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(3);
  });

  test('computed', () => {
    let count = 0;

    class A {
      a = 1;
      b = 2;

      // eslint-disable-next-line prettier/prettier
      @computed
      c() {
        count += 1;
        return this.a + this.b;
      }
    }

    const a = manage(new A());
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(a.c()).toBe(3);
    expect(count).toBe(1);
  });
});
