import React from 'react';
import { describe, expect, test } from 'vitest';

import { manage } from '../src';

describe('manage React element', () => {
  test('default', async () => {
    const Ele = <i></i>;
    expect(Ele).toBeDefined();
    // cannot manage React element
    expect(() => manage(Ele)).toThrowError();
  });
  test('default 2', async () => {
    const o = {
      toolbarItems: [
        'about',
        '|',
        <i
          key="preferences-toolbar-item"
          title="Preferences"
          className="fa fa-cog"
        ></i>,
      ],
    };
    const m = manage(o);
    expect(m).toBeDefined();
  });
});
