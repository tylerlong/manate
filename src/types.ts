import type { disposeSymbol } from '.';
import type EventEmitter from './event-emitter';

export type Managed<T> = {
  [K in keyof T]: T[K] extends object ? Managed<T[K]> : T[K];
} & {
  $e: EventEmitter;
  $t: boolean; // for transaction
  [disposeSymbol]: () => void;
};
