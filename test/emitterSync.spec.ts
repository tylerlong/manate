import EventEmitter from '../src/event-emitter';

describe('emitter sync', () => {
  test('default', async () => {
    const emitter = new EventEmitter();
    const list: number[] = [];
    emitter.on((number: number) => {
      list.push(number);
    });
    emitter.emit(0);
    emitter.emit(1);
    emitter.emit(2);
    list.push(100);
    emitter.emit(3);
    emitter.emit(4);
    emitter.emit(5);
    expect(list).toEqual([0, 1, 2, 100, 3, 4, 5]);
  });
});
