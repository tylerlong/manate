import { manage } from '../src';

describe('Listener count', () => {
  test('default', () => {
    const managed = manage({
      a: {
        b: {
          c: 'hello',
        },
      },
    });

    expect(managed.$e.listenerCount('event')).toBe(0);
    expect((managed.a as any).$e.listenerCount('event')).toBe(1);
    expect((managed.a.b as any).$e.listenerCount('event')).toBe(1);
    expect((managed.a.b.c as any).$e).toBe(undefined);
    const temp = managed.a.b;
    managed.a.b = temp;
    managed.a.b = temp;
    managed.a.b = temp;
    expect(managed.$e.listenerCount('event')).toBe(0);
    expect((managed.a as any).$e.listenerCount('event')).toBe(1);
    expect((managed.a.b as any).$e.listenerCount('event')).toBe(1);
    expect((managed.a.b.c as any).$e).toBe(undefined);
  });
});
