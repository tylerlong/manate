import type EventEmitter from './event-emitter';

export type Managed<T> = T & { $e: EventEmitter; _dispose: () => void };

export class ManateEvent {
  public name: 'get' | 'set';
  public paths: PropertyKey[];

  public constructor(name: 'get' | 'set', paths: PropertyKey[]) {
    this.name = name;
    this.paths = paths;
  }

  public get pathString() {
    return this.paths.map((k) => k.toString()).join('+');
  }

  public toString() {
    return `${this.name}: ${this.pathString}`;
  }
}

export class Child {
  public emitter: EventEmitter;
  public listener: (event: ManateEvent) => void;

  public constructor(path: PropertyKey, emitter: EventEmitter, parentEmitter: EventEmitter) {
    this.emitter = emitter;
    this.listener = (event: ManateEvent) => {
      parentEmitter.emit(new ManateEvent(event.name, [path, ...event.paths]));
    };
    this.emitter.on(this.listener);
  }

  public release() {
    this.emitter.off(this.listener);
  }
}

export class Children {
  public children: { [path: PropertyKey]: Child } = {};

  public addChild(path: PropertyKey, emitter: EventEmitter, parentEmitter: EventEmitter) {
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

  public releasesAll() {
    for (const path of Object.keys(this.children)) {
      this.releaseChild(path);
    }
  }
}
