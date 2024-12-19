import { describe, expect, test } from 'vitest';

import { isManaged, manage } from '../src';

describe('max depth', () => {
  test('default', () => {
    const newObj = () => ({ b: { c: { d: { e: 1 } } } });

    const m1 = manage(newObj(), 3);
    expect(isManaged(m1)).toBe(true);
    expect(isManaged(m1.b)).toBe(true);
    expect(isManaged(m1.b.c)).toBe(true);
    expect(isManaged(m1.b.c.d)).toBe(false);

    const m2 = manage(newObj(), 2);
    expect(isManaged(m2)).toBe(true);
    expect(isManaged(m2.b)).toBe(true);
    expect(isManaged(m2.b.c)).toBe(false);
    expect(isManaged(m2.b.c.d)).toBe(false);

    const m3 = manage(newObj(), 1);
    expect(isManaged(m3)).toBe(true);
    expect(isManaged(m3.b)).toBe(false);
    expect(isManaged(m3.b.c)).toBe(false);
    expect(isManaged(m3.b.c.d)).toBe(false);
  });
});
