import { describe, expect, test } from 'vitest';

import { manage, type ManateEvent } from '../src';

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
    expect(webPhone.callSessions.$e).toBeDefined();
    original.callSessions.push(new CallSession());
    expect(webPhone.callSessions[0].$e).toBeDefined();
    const events: string[] = [];
    webPhone.$e.on((event: ManateEvent) => {
      events.push(event.toString());
    });
    original.callSessions[0].status = 'calling'; // trigger event
    original.status = 'calling'; // do not trigger event
    expect(events).toEqual(['get: callSessions+0', 'set: callSessions+0+status']);
  });
});
