/* eslint-disable @typescript-eslint/no-explicit-any */
export type WriteEvent = {
  target: object;
  prop: PropertyKey;
  value: number;
};
export type GetEvent = {
  target: object;
  prop: PropertyKey;
  value: any;
};
export type HasEvent = {
  target: object;
  prop: PropertyKey;
  value: boolean;
};
export type KeysEvent = {
  target: object;
};

export type WriteLog = Map<object, { [prop: PropertyKey]: number }>;

export type ReadLog = Map<
  object,
  {
    get: { [prop: PropertyKey]: any };
    has: { [prop: PropertyKey]: boolean };
    keys?: boolean;
  }
>;
