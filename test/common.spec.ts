import EventEmitter from '../src/event-emitter';
import { ManateEvent } from '../src/models';

describe('index', () => {
  test('event emitter on and off', () => {
    const eventEmitter = new EventEmitter();
    const callback = (message: string) => {
      console.log(message);
    };
    eventEmitter.on(callback);
    eventEmitter.removeAllListeners();
    eventEmitter.emit(new ManateEvent('set', []));
  });
});
