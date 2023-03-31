import { manage } from '../src';

describe('Listener count', () => {
  test('default', () => {
    const proxy = manage({
      a: {
        b: {
          c: 'hello',
        },
      },
    });

    expect(proxy.$e.listenerCount('event')).toBe(0);
    expect((proxy.a as any).$e.listenerCount('event')).toBe(1);
    expect((proxy.a.b as any).$e.listenerCount('event')).toBe(1);
    expect((proxy.a.b.c as any).$e).toBe(undefined);
    const temp = proxy.a.b;
    proxy.a.b = temp;
    proxy.a.b = temp;
    proxy.a.b = temp;
    expect(proxy.$e.listenerCount('event')).toBe(0);
    expect((proxy.a as any).$e.listenerCount('event')).toBe(1);
    expect((proxy.a.b as any).$e.listenerCount('event')).toBe(1);
    expect((proxy.a.b.c as any).$e).toBe(undefined);
  });
});
