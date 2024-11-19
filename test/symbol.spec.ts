import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { batch, manage, writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';

describe('symbol', () => {
  test('default', () => {
    const mo = manage({});
    mo['a'] = {};
    mo['a']['b'] = {};

    const writeLogs: WriteLog[] = [];
    writeEmitter.on((e) => {
      writeLogs.push(e);
    });

    const mySymbol = Symbol('mySymbol');
    batch(() => {
      mo['a']['b'][mySymbol] = 'myValue';
    });
    expect(mo['a']['b'][mySymbol]).toBe('myValue');
    expect(inspect(writeLogs)).toBe(`[
  Map(1) {
    { [Symbol(mySymbol)]: 'myValue' } => Map(1) { Symbol(mySymbol) => 1 }
  }
]`);
    expect(writeLogs[0].values().next().value.keys().next().value).toBe(
      mySymbol,
    );
  });
});
