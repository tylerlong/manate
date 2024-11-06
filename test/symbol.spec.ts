import { describe, expect, test } from 'vitest';

import { $, manage } from '../src';

describe('symbol', () => {
  test('default', () => {
    const mo = manage({});
    mo['a'] = {};
    mo['a']['b'] = {};
    let checked = false;
    $(mo).on((e) => {
      if (e.name === 'set') {
        checked = true;
        expect(e.pathString).toBe('a+b+Symbol(mySymbol)');
      }
    });
    const mySymbol = Symbol('mySymbol');
    mo['a']['b'][mySymbol] = 'myValue';
    expect(mo['a']['b'][mySymbol]).toBe('myValue');
    expect(checked).toBeTruthy();
  });
});
