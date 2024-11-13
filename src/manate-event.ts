import type EventEmitter from './event-emitter';

export class ManateEvent {
  public name: 'get' | 'set' | 'delete' | 'keys' | 'has' | 'transaction';
  public paths: PropertyKey[];
  public value: number | boolean | undefined; // only save value for number and boolean
  public emitters: WeakSet<EventEmitter>;

  public constructor(options: {
    name: 'get' | 'set' | 'delete' | 'keys' | 'has' | 'transaction';
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
