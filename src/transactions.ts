import type { Managed } from '.';
import type { ManateEvent } from './models';

class TransactionsManager<T> {
  public isTrigger: (event: ManateEvent) => boolean;
  public transactions = new Map<string, boolean>();
  private managed: Managed<T>;

  public constructor(managed: Managed<T>, isTrigger: (event: ManateEvent) => boolean = () => false) {
    this.managed = managed;
    this.isTrigger = isTrigger;
  }

  public shouldRun(event: ManateEvent) {
    let r = false;
    // start/end transaction
    if (event.name === 'set' && event.paths[event.paths.length - 1] === '$t') {
      const value = event.paths.reduce((acc, key) => acc[key], this.managed) as unknown as boolean;
      if (value === true) {
        // start transaction
        this.transactions.set(event.parentPathString, false);
      } else {
        // end transaction
        const parentKeys = Array.from(this.transactions.keys()).filter((key) => event.parentPathString.startsWith(key));
        if (parentKeys.length === 1) {
          r = this.transactions.get(parentKeys[0]) || false;
        } else {
          // from long to short
          parentKeys.sort((k1, k2) => k2.length - k1.length);
          this.transactions.set(
            parentKeys[1],
            this.transactions.get(parentKeys[1]) || this.transactions.get(parentKeys[0]) || false,
          );
        }
        this.transactions.delete(parentKeys[0]);
      }
    } else {
      const triggered = this.isTrigger(event);
      if (!triggered) {
        return;
      }
      const transactionKeys = Array.from(this.transactions.keys()).filter((key) =>
        event.parentPathString.startsWith(key),
      );
      if (transactionKeys.length === 0) {
        r = true;
      } else {
        // only update the longest key
        const longestKey = transactionKeys.reduce((shortest, current) =>
          current.length > shortest.length ? current : shortest,
        );
        this.transactions.set(longestKey, true);
      }
    }
    return r;
  }

  public reset() {
    this.transactions.forEach((_, key) => this.transactions.set(key, false));
  }
}

export default TransactionsManager;
