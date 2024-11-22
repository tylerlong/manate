import { describe, expect, test, vi } from 'vitest';

import { manage } from '../src';

describe('max depth', () => {
  test('default', () => {
    const newObj = () => ({ b: { c: { d: { e: 1 } } } });
    const messages: string[] = [];
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation((message) => messages.push(message));
    manage(newObj(), 3);
    expect(messages).toEqual([]);
    manage(newObj(), 2);
    expect(messages).toEqual(['Max depth exceeded.']);
    warnSpy.mockRestore();
  });
});
