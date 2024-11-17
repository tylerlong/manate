import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';

describe('direct update', () => {
  test('default', () => {
    /*
What does this test case tell us?
- After we manage an object `const mo = manage(o)`, its children (like `o.callSessions`) all become managed (unless they cannot be managed, like string)
- So even you update the children directly through `o`instead of `mo`, the event will be triggered
- However, if you update `o`'s string property directly, the event will not be triggered. Because `o` is not managed, `mo` is.
     */
    class WebPhone {
      public status = 'idle';
      public callSessions: CallSession[] = [];
    }

    class CallSession {
      public status = 'idle';
    }
    const original = new WebPhone();
    const webPhone = manage(original);
    expect(webPhone.callSessions).toBeDefined();
    original.callSessions.push(new CallSession());
    expect(webPhone.callSessions[0]).toBeDefined();
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((writeLog: WriteLog) => {
      writeLogs.push(writeLog);
    });
    original.callSessions[0].status = 'calling'; // trigger event
    original.status = 'calling'; // do not trigger event
    console.log(inspect(writeLogs));
    expect(inspect(writeLogs)).toBe(
      "[ Map(1) { CallSession { status: 'calling' } => Set(1) { 'status' } } ]",
    );
  });
});
