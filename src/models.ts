import { EventEmitter } from 'stream';

export class ProxyEvent {
  public name: 'get' | 'set';
  public paths: string[];

  public constructor(name: 'get' | 'set', paths: string[]) {
    this.name = name;
    this.paths = paths;
  }

  public get pathString() {
    return this.paths.join('+');
  }

  public toString() {
    return `${this.name}: ${this.pathString}`;
  }
}

export class Child {
  public emitter: EventEmitter;
  public listener: (event: ProxyEvent) => void;

  public constructor(path: string, emitter: EventEmitter, parentEmitter: EventEmitter) {
    this.emitter = emitter;
    this.listener = (event: ProxyEvent) => {
      parentEmitter.emit('event', new ProxyEvent(event.name, [path, ...event.paths]));
    };
    this.emitter.on('event', this.listener);
  }

  public release() {
    this.emitter.off('event', this.listener);
  }
}

export class Children {
  public children: { [path: string]: Child } = {};

  public addChild(path: string, emitter: EventEmitter, parentEmitter: EventEmitter) {
    this.releaseChild(path);
    const child = new Child(path, emitter, parentEmitter);
    this.children[path] = child;
  }

  public releaseChild(path: string) {
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
