/* eslint-disable @typescript-eslint/no-explicit-any */
export type WriteEvent = {
  target: object;
  prop: PropertyKey;
};
export type GetEvent = WriteEvent & {
  value: any;
};
export type HasEvent = WriteEvent & {
  value: boolean;
};
export type KeysEvent = {
  target: object;
  value: PropertyKey[];
};

export type WriteLog = Map<object, Set<PropertyKey>>;

export type ReadLog = Map<
  object,
  {
    get: { [prop: PropertyKey]: any };
    has: { [prop: PropertyKey]: boolean };
    keys?: PropertyKey[];
  }
>;
