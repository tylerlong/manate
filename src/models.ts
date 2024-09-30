import type EventEmitter from './event-emitter';

export class ManateEvent {
  public name: 'get' | 'set' | 'delete' | 'keys' | 'has';
  public paths: PropertyKey[];
  public value: number | boolean | undefined; // only save value for number and boolean
  public emitters: WeakSet<EventEmitter>;

  public constructor(options: {
    name: 'get' | 'set' | 'delete' | 'keys' | 'has';
    paths: PropertyKey[];
    emitters?: WeakSet<EventEmitter>;
    value?: number | boolean;
  }) {
    this.name = options.name;
    this.paths = options.paths;
    this.emitters = options.emitters ?? new WeakSet();
    this.value = options.value;
  }

  public get pathString() {
    return this.paths.map((k) => k.toString()).join('+');
  }

  public get parentPathString() {
    return this.paths
      .slice(0, -1)
      .map((k) => k.toString())
      .join('+');
  }

  public toString() {
    return `${this.name}: ${this.pathString}`;
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

class Child {
  public emitter: EventEmitter;
  public listener: (event: ManateEvent) => void;

  public constructor(path: PropertyKey, emitter: EventEmitter, parentEmitter: EventEmitter) {
    this.emitter = emitter;
    this.listener = (event: ManateEvent) => {
      parentEmitter.emit(new ManateEvent({ ...event, paths: [path, ...event.paths] }));
    };
    this.emitter.on(this.listener);
  }

  public release() {
    this.emitter.off(this.listener);
  }
}
