import { describe, expect, test } from 'vitest';

import { manage } from '../src';

describe('max depth', () => {
  test('default', () => {
    const a = { b: { c: { d: { e: 1 } } } };
    expect(() => manage(a, 2)).toThrow();
    expect(() => manage(a, 3)).not.toThrow();
  });
});
