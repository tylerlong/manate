import { ManateEvent } from '.';

class EventEmitter {
  private children = new Children();
  private listeners: ((me: ManateEvent) => void)[] = [];

  public on(listener: (me: ManateEvent) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (me: ManateEvent) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * @internal
   */
  public emit(me: ManateEvent) {
    if (me.emitters.has(this)) {
      return; // prevent infinite loop
    }
    me.emitters.add(this);
    this.listeners.forEach((listener) => listener(me));
  }

  public removeAllListeners() {
    this.listeners = [];
  }

  public listenerCount() {
    return this.listeners.length;
  }

  public begin() {
    this.emit(new ManateEvent({ name: 'transaction', paths: [], value: true }));
  }

  public commit() {
    this.emit(
      new ManateEvent({ name: 'transaction', paths: [], value: false }),
    );
  }

  public dispose() {
    this.removeAllListeners();
    this.children.releaseAll();
  }

  /**
   * @internal
   */
  public releaseChild(path: PropertyKey) {
    this.children.releaseChild(path);
  }

  /**
   * @internal
   */
  public addChild(path: PropertyKey, emitter: EventEmitter) {
    this.children.addChild(path, emitter, this);
  }
}

export default EventEmitter;

export class Children {
  public children: { [path: PropertyKey]: Child } = {};

  public addChild(
    path: PropertyKey,
    emitter: EventEmitter,
    parentEmitter: EventEmitter,
  ) {
    this.releaseChild(path);
    const child = new Child(path, emitter, parentEmitter);
    this.children[path] = child;
  }

  public releaseChild(path: PropertyKey) {
    const child = this.children[path];
    if (child) {
      child.release();
      delete this.children[path];
    }
  }

  public releaseAll() {
    for (const path of Object.keys(this.children)) {
      this.releaseChild(path);
    }
  }
}

class Child {
  public emitter: EventEmitter;
  public listener: (event: ManateEvent) => void;

  public constructor(
    path: PropertyKey,
    emitter: EventEmitter,
    parentEmitter: EventEmitter,
  ) {
    this.emitter = emitter;
    this.listener = (event: ManateEvent) => {
      parentEmitter.emit(
        new ManateEvent({ ...event, paths: [path, ...event.paths] }),
      );
    };
    this.emitter.on(this.listener);
  }

  public release() {
    this.emitter.off(this.listener);
  }
}
